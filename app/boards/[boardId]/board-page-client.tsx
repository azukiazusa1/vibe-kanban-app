"use client";

import { useState, useMemo } from "react";
import { Board, Column, Task } from "@prisma/client";
import { DragDropBoard } from "@/components/drag-drop-board";
import { ColumnCreationForm } from "@/components/column-creation-form";
import { TaskFilter } from "@/components/task-filter";

type BoardData = Board & {
  columns: (Column & {
    tasks: Task[];
  })[];
};

interface BoardPageClientProps {
  board: BoardData;
}

export function BoardPageClient({ board }: BoardPageClientProps) {
  const [filterText, setFilterText] = useState("");

  const filteredBoard = useMemo(() => {
    if (!filterText.trim()) {
      return board;
    }

    const lowerCaseFilter = filterText.toLowerCase();

    return {
      ...board,
      columns: board.columns.map((column) => ({
        ...column,
        tasks: column.tasks.filter((task) =>
          task.title.toLowerCase().includes(lowerCaseFilter),
        ),
      })),
    };
  }, [board, filterText]);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold">{board.title}</h1>
            {board.description && (
              <p className="text-muted-foreground">{board.description}</p>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8">
        <TaskFilter onFilterChange={setFilterText} />

        <div className="flex gap-6 overflow-x-auto pb-4">
          <DragDropBoard board={filteredBoard} />
          <ColumnCreationForm boardId={board.id} />
        </div>
      </main>
    </div>
  );
}
