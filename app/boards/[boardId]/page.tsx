import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { TaskCreationDialog } from "@/components/task-creation-dialog"
import { ColumnCreationForm } from "@/components/column-creation-form"
import { getPriorityLabel, getPriorityColor } from "@/lib/priority"

interface BoardPageProps {
  params: Promise<{
    boardId: string
  }>
}

export default async function BoardPage({ params }: BoardPageProps) {
  const { boardId } = await params
  
  const board = await prisma.board.findUnique({
    where: {
      id: boardId,
    },
    include: {
      columns: {
        orderBy: {
          position: 'asc',
        },
        include: {
          tasks: {
            orderBy: {
              position: 'asc',
            },
          },
        },
      },
    },
  })

  if (!board) {
    notFound()
  }

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
        <div className="flex gap-6 overflow-x-auto pb-4">
          {board.columns.map((column) => (
            <div
              key={column.id}
              className="flex-shrink-0 w-80 bg-muted/50 rounded-lg p-4 space-y-4"
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: column.color }}
                />
                <h3 className="font-semibold">{column.title}</h3>
                <span className="text-sm text-muted-foreground">
                  {column.tasks.length}
                </span>
              </div>
              
              <div className="space-y-2">
                {column.tasks.map((task) => (
                  <div
                    key={task.id}
                    className="bg-background rounded-md p-3 border shadow-sm"
                  >
                    <h4 className="font-medium">{task.title}</h4>
                    {task.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {task.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between mt-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(task.priority)}`}>
                        {getPriorityLabel(task.priority)}
                      </span>
                      {task.dueDate && (
                        <span className="text-xs text-muted-foreground">
                          {new Date(task.dueDate).toLocaleDateString('ja-JP')}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
                
                {column.tasks.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    タスクがありません
                  </div>
                )}
              </div>
              
              <TaskCreationDialog columnId={column.id} />
            </div>
          ))}
          
          <ColumnCreationForm boardId={board.id} />
        </div>
      </main>
    </div>
  )
}