import { Suspense } from "react";
import { BoardCreationDialog } from "@/components/board-creation-dialog";
import BoardList from "@/components/board-list";
import { ThemeToggle } from "@/components/theme-toggle";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b">
        <div className="container mx-auto px-4 py-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Kanban Board</h1>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <BoardCreationDialog />
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">マイボード</h2>
            <p className="text-muted-foreground text-lg">
              作成したKanbanボードから選択してください
            </p>
          </div>

          <Suspense fallback={<div className="text-center">読み込み中...</div>}>
            <BoardList />
          </Suspense>
        </div>
      </main>
    </div>
  );
}
