"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { Priority } from "@prisma/client";

export async function createTask(formData: FormData) {
  const columnId = formData.get("columnId") as string;
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const priority = formData.get("priority") as Priority;
  const dueDate = formData.get("dueDate") as string;

  if (!columnId || !title) {
    throw new Error("Column ID and title are required");
  }

  // Get the next position for the task in this column
  const lastTask = await prisma.task.findFirst({
    where: { columnId },
    orderBy: { position: "desc" },
  });

  const nextPosition = (lastTask?.position ?? -1) + 1;

  await prisma.task.create({
    data: {
      title: title.trim(),
      description: description?.trim() || null,
      priority: priority || Priority.MEDIUM,
      dueDate: dueDate ? new Date(dueDate) : null,
      position: nextPosition,
      columnId,
    },
  });

  // Get the board ID for revalidation
  const column = await prisma.column.findUnique({
    where: { id: columnId },
    select: { boardId: true },
  });

  if (column) {
    revalidatePath(`/boards/${column.boardId}`);
  }
}

export async function updateTaskPosition(
  taskId: string,
  newPosition: number,
  columnId: string
) {
  await prisma.$transaction(async (tx) => {
    // Get all tasks in the target column, ordered by position
    const tasksInColumn = await tx.task.findMany({
      where: { columnId },
      orderBy: { position: "asc" },
    });

    // Update positions to maintain order
    const otherTasks = tasksInColumn.filter(task => task.id !== taskId);
    const reorderedTaskIds = [
      ...otherTasks.slice(0, newPosition).map(t => t.id),
      taskId,
      ...otherTasks.slice(newPosition).map(t => t.id)
    ];
    
    // Generate unique temporary positions using task ID hash to avoid conflicts
    const generateTempPosition = (id: string) => {
      // Create a hash-like number from the task ID
      let hash = 0;
      for (let i = 0; i < id.length; i++) {
        const char = id.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
      }
      return -(Math.abs(hash) + 1000000); // Ensure it's negative and large
    };

    // First, set all tasks to unique temporary positions
    for (const id of reorderedTaskIds) {
      await tx.task.update({
        where: { id },
        data: { position: generateTempPosition(id) },
      });
    }

    // Then, set them to their final positions
    for (let i = 0; i < reorderedTaskIds.length; i++) {
      await tx.task.update({
        where: { id: reorderedTaskIds[i] },
        data: { position: i },
      });
    }
  });

  // Get the board ID for revalidation
  const column = await prisma.column.findUnique({
    where: { id: columnId },
    select: { boardId: true },
  });

  if (column) {
    revalidatePath(`/boards/${column.boardId}`);
  }
}

export async function moveTaskBetweenColumns(
  taskId: string,
  sourceColumnId: string,
  targetColumnId: string,
  newPosition: number
) {
  await prisma.$transaction(async (tx) => {
    // Get all tasks from both columns
    const [sourceColumnTasks, targetColumnTasks] = await Promise.all([
      tx.task.findMany({
        where: { columnId: sourceColumnId },
        orderBy: { position: "asc" },
      }),
      tx.task.findMany({
        where: { columnId: targetColumnId },
        orderBy: { position: "asc" },
      }),
    ]);

    // Remove the moved task from source column and reorder
    const updatedSourceTasks = sourceColumnTasks
      .filter(task => task.id !== taskId)
      .map((task, index) => ({
        id: task.id,
        position: index,
        columnId: sourceColumnId,
      }));

    // Add the moved task to target column at the new position and reorder
    const movedTask = sourceColumnTasks.find(task => task.id === taskId);
    if (!movedTask) {
      throw new Error("Task not found");
    }

    const updatedTargetTasks = targetColumnTasks
      .slice(0, newPosition)
      .concat(
        { ...movedTask, columnId: targetColumnId },
        targetColumnTasks.slice(newPosition)
      )
      .map((task, index) => ({
        id: task.id,
        position: index,
        columnId: task.id === taskId ? targetColumnId : task.columnId,
      }));

    // Generate unique temporary positions using task ID hash
    const generateTempPosition = (id: string) => {
      let hash = 0;
      for (let i = 0; i < id.length; i++) {
        const char = id.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
      }
      return -(Math.abs(hash) + 1000000);
    };

    // First, set all affected tasks to unique temporary positions
    const allTasks = [...updatedSourceTasks, ...updatedTargetTasks];
    for (const { id } of allTasks) {
      await tx.task.update({
        where: { id },
        data: { position: generateTempPosition(id) },
      });
    }

    // Then, update source column tasks to their final positions
    for (const { id, position } of updatedSourceTasks) {
      await tx.task.update({
        where: { id },
        data: { position },
      });
    }

    // Finally, update target column tasks to their final positions and column
    for (const { id, position, columnId } of updatedTargetTasks) {
      await tx.task.update({
        where: { id },
        data: { position, columnId },
      });
    }
  });

  // Get the board ID for revalidation
  const column = await prisma.column.findUnique({
    where: { id: targetColumnId },
    select: { boardId: true },
  });

  if (column) {
    revalidatePath(`/boards/${column.boardId}`);
  }
}