"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Task } from "@prisma/client";
import { getPriorityLabel, getPriorityColor } from "@/lib/priority";

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

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`
        bg-background rounded-md p-3 border shadow-sm cursor-grab
        ${isDragging ? "opacity-50 rotate-5 scale-105" : ""}
        hover:shadow-md transition-all duration-200
      `}
    >
      <h4 className="font-medium">{task.title}</h4>
      {task.description && (
        <p className="text-sm text-muted-foreground mt-1">
          {task.description}
        </p>
      )}
      <div className="flex items-center justify-between mt-2">
        <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(task.priority)}`}>
          {getPriorityLabel(task.priority)}
        </span>
        {task.dueDate && (
          <span className="text-xs text-muted-foreground">
            {new Date(task.dueDate).toLocaleDateString('ja-JP')}
          </span>
        )}
      </div>
    </div>
  );
}