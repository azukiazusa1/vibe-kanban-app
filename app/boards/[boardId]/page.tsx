import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { DragDropBoard } from "@/components/drag-drop-board";
import { ColumnCreationForm } from "@/components/column-creation-form";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

interface BoardPageProps {
  params: Promise<{
    boardId: string;
  }>;
}

export default async function BoardPage({ params }: BoardPageProps) {
  const { boardId } = await params;

  const board = await prisma.board.findUnique({
    where: {
      id: boardId,
    },
    include: {
      columns: {
        orderBy: {
          position: "asc",
        },
        include: {
          tasks: {
            orderBy: {
              position: "asc",
            },
          },
        },
      },
    },
  });

  if (!board) {
    notFound();
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" asChild>
                <Link href="/" aria-label="ホームに戻る">
                  <ArrowLeft />
                </Link>
              </Button>
              <div className="space-y-1">
                <h1 className="text-2xl font-bold">{board.title}</h1>
                {board.description && (
                  <p className="text-muted-foreground">{board.description}</p>
                )}
              </div>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex gap-6 overflow-x-auto pb-4">
          <DragDropBoard board={board} />
          <ColumnCreationForm boardId={board.id} />
        </div>
      </main>
    </div>
  );
}
