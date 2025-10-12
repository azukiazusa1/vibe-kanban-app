"use client";

import { useState } from "react";
import { Board, Column, Task } from "@prisma/client";
import { DragDropBoard } from "@/components/drag-drop-board";
import { TaskFilter } from "@/components/task-filter";
import { ColumnCreationForm } from "@/components/column-creation-form";

type BoardData = Board & {
  columns: (Column & {
    tasks: Task[];
  })[];
};

interface BoardWithFilterProps {
  board: BoardData;
}

export function BoardWithFilter({ board }: BoardWithFilterProps) {
  const [filterText, setFilterText] = useState("");

  // TODO(human): Filter the board data based on the filterText
  // The filtering should check if task.title includes the filterText (case-insensitive)
  // Return a new board object with filtered tasks in each column
  const filteredBoard = board;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <TaskFilter value={filterText} onChange={setFilterText} />
      </div>

      <div className="flex gap-6 overflow-x-auto pb-4">
        <DragDropBoard board={filteredBoard} />
        <ColumnCreationForm boardId={board.id} />
      </div>
    </div>
  );
}
