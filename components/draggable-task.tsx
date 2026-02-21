"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Task } from "@prisma/client";
import { getPriorityLabel, getPriorityColor } from "@/lib/priority";
import { isTaskOverdue, formatDueDate } from "@/lib/date-utils";

interface DraggableTaskProps {
  task: Task;
}

export function DraggableTask({ task }: DraggableTaskProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: "task",
      task,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const isOverdue = task.dueDate && isTaskOverdue(new Date(task.dueDate));

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`
        bg-background rounded-md p-3 shadow-sm cursor-grab
        ${isDragging ? "opacity-50 rotate-5 scale-105" : ""}
        ${isOverdue ? "border-2 border-red-500 dark:border-red-400" : "border"}
        hover:shadow-md transition-all duration-200
      `}
    >
      <div className="flex items-start justify-between">
        <h4 className="font-medium">{task.title}</h4>
        {isOverdue && (
          <span className="text-red-500 dark:text-red-400 text-sm">⚠️</span>
        )}
      </div>
      {task.description && (
        <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
      )}
      <div className="flex items-center justify-between mt-2">
        <span
          className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(task.priority)}`}
        >
          {getPriorityLabel(task.priority)}
        </span>
        {task.dueDate && (
          <span
            className={`text-xs ${
              isOverdue
                ? "text-red-600 dark:text-red-400 font-medium"
                : "text-muted-foreground"
            }`}
          >
            {formatDueDate(new Date(task.dueDate))}
          </span>
        )}
      </div>
    </div>
  );
}
