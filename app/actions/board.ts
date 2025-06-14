"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export async function createBoard(formData: FormData) {
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;

  console.log(
    "Creating board with title:",
    title,
    "and description:",
    description
  );

  if (!title) {
    throw new Error("Title is required");
  }

  const board = await prisma.board
    .create({
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        columns: {
          create: [
            {
              title: "To Do",
              position: 0,
              color: "#ef4444", // red-500
            },
            {
              title: "In Progress",
              position: 1,
              color: "#f59e0b", // amber-500
            },
            {
              title: "Done",
              position: 2,
              color: "#10b981", // emerald-500
            },
          ],
        },
      },
    })
    .catch((error) => {
      console.error("Error creating board:", error);
      throw new Error("Failed to create board");
    });

  redirect(`/boards/${board.id}`);
}

export async function createColumn(boardId: string, title: string, color: string) {
  if (!title?.trim()) {
    throw new Error("Column title is required");
  }

  const lastColumn = await prisma.column.findFirst({
    where: { boardId },
    orderBy: { position: 'desc' },
  });

  const nextPosition = (lastColumn?.position ?? -1) + 1;

  const column = await prisma.column.create({
    data: {
      title: title.trim(),
      color,
      position: nextPosition,
      boardId,
    },
  });

  return column;
}
