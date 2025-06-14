"use client";

import { useState, useOptimistic, startTransition } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { Board, Column, Task } from "@prisma/client";
import { DroppableColumn } from "./droppable-column";
import { DraggableTask } from "./draggable-task";
import { updateTaskPosition, moveTaskBetweenColumns } from "@/app/actions/task";

type BoardData = Board & {
  columns: (Column & {
    tasks: Task[];
  })[];
};

interface DragDropBoardProps {
  board: BoardData;
}

export function DragDropBoard({ board: initialBoard }: DragDropBoardProps) {
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  
  // Optimistic updates for immediate UI feedback
  const [board, updateBoard] = useOptimistic(
    initialBoard,
    (state: BoardData, action: { 
      type: string; 
      payload: {
        columnId?: string;
        taskId?: string;
        newPosition?: number;
        sourceColumnId?: string;
        targetColumnId?: string;
      };
    }) => {
      switch (action.type) {
        case "MOVE_TASK_WITHIN_COLUMN": {
          const { columnId, taskId, newPosition } = action.payload;
          if (!columnId || !taskId || newPosition === undefined) return state;
          
          return {
            ...state,
            columns: state.columns.map(column => {
              if (column.id !== columnId) return column;
              
              const taskIndex = column.tasks.findIndex(t => t.id === taskId);
              if (taskIndex === -1) return column;
              
              const newTasks = arrayMove(column.tasks, taskIndex, newPosition);
              return { ...column, tasks: newTasks };
            }),
          };
        }
        case "MOVE_TASK_BETWEEN_COLUMNS": {
          const { sourceColumnId, targetColumnId, taskId, newPosition } = action.payload;
          if (!sourceColumnId || !targetColumnId || !taskId || newPosition === undefined) return state;
          
          const sourceColumn = state.columns.find(c => c.id === sourceColumnId);
          const targetColumn = state.columns.find(c => c.id === targetColumnId);
          const movedTask = sourceColumn?.tasks.find(t => t.id === taskId);
          
          if (!sourceColumn || !targetColumn || !movedTask) return state;
          
          return {
            ...state,
            columns: state.columns.map(column => {
              if (column.id === sourceColumnId) {
                return {
                  ...column,
                  tasks: column.tasks.filter(t => t.id !== taskId),
                };
              }
              if (column.id === targetColumnId) {
                const newTasks = [...column.tasks];
                newTasks.splice(newPosition, 0, { ...movedTask, columnId: targetColumnId });
                return { ...column, tasks: newTasks };
              }
              return column;
            }),
          };
        }
        default:
          return state;
      }
    }
  );

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3, // 3px movement required to start drag
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    
    if (active.data.current?.type === "task") {
      setDraggedTask(active.data.current.task);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    
    if (!over) return;
    
    const activeType = active.data.current?.type;
    const overType = over.data.current?.type;
    
    // Only handle task over column
    if (activeType === "task" && overType === "column") {
      const activeTask = active.data.current?.task;
      const overColumn = over.data.current?.column;
      
      if (!activeTask || !overColumn) return;
      
      // If task is already in the target column, do nothing here
      if (activeTask.columnId === overColumn.id) return;
      
      // Move task between columns (optimistic update)
      startTransition(() => {
        updateBoard({
          type: "MOVE_TASK_BETWEEN_COLUMNS",
          payload: {
            sourceColumnId: activeTask.columnId,
            targetColumnId: overColumn.id,
            taskId: activeTask.id,
            newPosition: overColumn.tasks.length,
          },
        });
      });
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    setDraggedTask(null);
    
    if (!over) return;
    
    const activeType = active.data.current?.type;
    const activeTask = active.data.current?.task;
    
    if (activeType !== "task" || !activeTask) return;
    
    const overType = over.data.current?.type;
    
    if (overType === "task") {
      // Task dropped on another task - reorder within same column
      const overTask = over.data.current?.task;
      if (!overTask || activeTask.columnId !== overTask.columnId) return;
      
      const column = board.columns.find(c => c.id === activeTask.columnId);
      if (!column) return;
      
      const activeIndex = column.tasks.findIndex(t => t.id === activeTask.id);
      const overIndex = column.tasks.findIndex(t => t.id === overTask.id);
      
      if (activeIndex !== overIndex) {
        // Optimistic update
        startTransition(() => {
          updateBoard({
            type: "MOVE_TASK_WITHIN_COLUMN",
            payload: {
              columnId: activeTask.columnId,
              taskId: activeTask.id,
              newPosition: overIndex,
            },
          });
        });
        
        // Server update
        try {
          await updateTaskPosition(activeTask.id, overIndex, activeTask.columnId);
        } catch (error) {
          console.error("Failed to update task position:", error);
          // TODO: Add error handling/rollback
        }
      }
    } else if (overType === "column") {
      // Task dropped on column
      const overColumn = over.data.current?.column;
      if (!overColumn) return;
      
      if (activeTask.columnId !== overColumn.id) {
        // Move between columns
        const newPosition = overColumn.tasks.length;
        
        try {
          await moveTaskBetweenColumns(
            activeTask.id,
            activeTask.columnId,
            overColumn.id,
            newPosition
          );
        } catch (error) {
          console.error("Failed to move task between columns:", error);
          // TODO: Add error handling/rollback
        }
      }
    }
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {board.columns.map((column) => (
          <DroppableColumn key={column.id} column={column} />
        ))}
      </div>
      
      <DragOverlay>
        {draggedTask ? (
          <div className="rotate-3 scale-105">
            <DraggableTask task={draggedTask} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}