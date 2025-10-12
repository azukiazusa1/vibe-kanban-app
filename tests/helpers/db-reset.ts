import { PrismaClient } from "@prisma/client";

let prisma: PrismaClient | null = null;

function getPrismaClient() {
  if (!prisma) {
    prisma = new PrismaClient();
  }
  return prisma;
}

/**
 * データベースをリセットする
 * テストの前に実行して、クリーンな状態を保証する
 */
export async function resetDatabase() {
  const client = getPrismaClient();
  // 外部キー制約を考慮して、子から親の順に削除
  await client.task.deleteMany();
  await client.column.deleteMany();
  await client.board.deleteMany();
}

/**
 * データベース接続を切断する
 * テスト終了時に実行する
 */
export async function disconnectDatabase() {
  if (prisma) {
    await prisma.$disconnect();
    prisma = null;
  }
}
