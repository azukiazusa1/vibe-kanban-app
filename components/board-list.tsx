import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";

export default async function BoardList() {
  const boards = await prisma.board.findMany({
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      title: true,
      description: true,
      createdAt: true,
    },
  });

  if (boards.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground text-lg">ボードがありません</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {boards.map((board) => (
        <Link key={board.id} href={`/boards/${board.id}`}>
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="line-clamp-1">{board.title}</CardTitle>
              {board.description && (
                <CardDescription className="line-clamp-2">
                  {board.description}
                </CardDescription>
              )}
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                作成日: {board.createdAt.toLocaleDateString("ja-JP")}
              </p>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}