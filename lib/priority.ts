import { Priority } from "@prisma/client";

export function getPriorityLabel(priority: Priority): string {
  switch (priority) {
    case Priority.LOW:
      return "低";
    case Priority.MEDIUM:
      return "中";
    case Priority.HIGH:
      return "高";
    case Priority.URGENT:
      return "緊急";
    default:
      return "中";
  }
}

export function getPriorityColor(priority: Priority): string {
  switch (priority) {
    case Priority.LOW:
      return "bg-blue-100 text-blue-800";
    case Priority.MEDIUM:
      return "bg-green-100 text-green-800";
    case Priority.HIGH:
      return "bg-yellow-100 text-yellow-800";
    case Priority.URGENT:
      return "bg-red-100 text-red-800";
    default:
      return "bg-green-100 text-green-800";
  }
}