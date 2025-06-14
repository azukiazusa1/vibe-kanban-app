"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Column, Task } from "@prisma/client";
import { DraggableTask } from "./draggable-task";
import { TaskCreationDialog } from "./task-creation-dialog";
import { isTaskOverdue } from "@/lib/date-utils";

interface DroppableColumnProps {
  column: Column & {
    tasks: Task[];
  };
}

export function DroppableColumn({ column }: DroppableColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
    data: {
      type: "column",
      column,
    },
  });

  return (
    <div
      ref={setNodeRef}
      className={`
        bg-muted/50 rounded-lg p-4 space-y-4 min-h-[200px] transition-colors duration-200
        ${isOver ? "bg-muted/80 ring-2 ring-primary/50" : ""}
      `}
    >
      <div className="flex items-center gap-2">
        <div
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: column.color }}
        />
        <h3 className="font-semibold">{column.title}</h3>
        <span className="text-sm text-muted-foreground">
          {column.tasks.length}
        </span>
        {(() => {
          const overdueCount = column.tasks.filter(task => 
            task.dueDate && isTaskOverdue(new Date(task.dueDate))
          ).length;
          return overdueCount > 0 && (
            <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
              期限切れ {overdueCount}
            </span>
          );
        })()}
      </div>
      
      <div className="space-y-2">
        <SortableContext
          items={column.tasks.map(task => task.id)}
          strategy={verticalListSortingStrategy}
        >
          {column.tasks.map((task) => (
            <DraggableTask key={task.id} task={task} />
          ))}
        </SortableContext>
        
        {column.tasks.length === 0 && (
          <div className="text-center py-8 text-muted-foreground text-sm">
            タスクがありません
          </div>
        )}
      </div>
      
      <TaskCreationDialog columnId={column.id} />
    </div>
  );
}