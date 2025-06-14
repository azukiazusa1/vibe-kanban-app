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