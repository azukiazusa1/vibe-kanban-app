import { formatDistanceToNow } from "date-fns";
import { ja } from "date-fns/locale";

export function isTaskOverdue(dueDate: Date | null): boolean {
  if (!dueDate) return false;
  return new Date() > new Date(dueDate);
}

export function getOverdueDuration(dueDate: Date): string {
  const now = new Date();
  const due = new Date(dueDate);
  
  if (now <= due) return "";
  
  return formatDistanceToNow(due, { 
    locale: ja,
    addSuffix: false 
  }) + "前に期限切れ";
}

export function formatDueDate(dueDate: Date | null): string {
  if (!dueDate) return "";
  
  const due = new Date(dueDate);
  
  if (isTaskOverdue(due)) {
    return getOverdueDuration(due);
  }
  
  return due.toLocaleDateString('ja-JP');
}