import { test, expect } from "@playwright/test";
import { resetDatabase, disconnectDatabase } from "./helpers/db-reset";

test.describe("Seed", () => {
  test("seed - reset database", async ({ page }) => {
    // データベースをリセット
    await resetDatabase();

    // トップページに移動
    await page.goto("/");

    // 空の状態メッセージが表示されることを確認
    await expect(page.getByText("ボードがありません")).toBeVisible();
  });
});

test.afterAll(async () => {
  await disconnectDatabase();
});
