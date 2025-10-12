import { test, expect } from "@playwright/test";
import { resetDatabase, disconnectDatabase } from "./helpers/db-reset";

test.describe("Board Creation and Management", () => {
  // 各テストの前にデータベースをリセット
  test.beforeEach(async ({ page }) => {
    await resetDatabase();
    await page.goto("/");
  });

  test.afterAll(async () => {
    await disconnectDatabase();
  });

  test("TC-BC-001: タイトルと説明を含む有効なボード作成", async ({ page }) => {
    // 1. トップページに移動（beforeEachで実行済み）

    // 2. "新規ボード作成" ボタンをクリック
    await page.getByRole("button", { name: "新規ボード作成" }).click();

    // 3. タイトルに "プロジェクトA" と入力
    await page.getByLabel("タイトル *").fill("プロジェクトA");

    // 4. 説明に "これは最初のカンバンボードです" と入力
    await page.getByLabel("説明").fill("これは最初のカンバンボードです");

    // 5. "作成" ボタンをクリック
    await page.getByRole("button", { name: "作成" }).click();

    // 6. ボード詳細ページにリダイレクトされることを確認
    await expect(page).toHaveURL(/\/boards\/[a-zA-Z0-9-]+/);

    // トップページに戻る
    await page.goto("/");
    await page.reload();

    // 7. ボードがグリッドに表示されることを確認
    await expect(
      page.getByRole("heading", { name: "プロジェクトA" }),
    ).toBeVisible();

    // 8. 説明が表示されることを確認
    await expect(
      page.getByText("これは最初のカンバンボードです"),
    ).toBeVisible();
  });

  test("TC-BC-002: タイトルのみでボード作成", async ({ page }) => {
    // 1. トップページに移動（beforeEachで実行済み）

    // 2. "新規ボード作成" ボタンをクリック
    await page.getByRole("button", { name: "新規ボード作成" }).click();

    // 3. タイトルに "シンプルなボード" と入力
    await page.getByLabel("タイトル *").fill("シンプルなボード");

    // 4. 説明は空のまま（何もしない）

    // 5. "作成" ボタンをクリック
    await page.getByRole("button", { name: "作成" }).click();

    // 6. ボード詳細ページにリダイレクトされることを確認
    await expect(page).toHaveURL(/\/boards\/[a-zA-Z0-9-]+/);

    // トップページに戻る
    await page.goto("/");
    await page.reload();

    // 7. ボードが正常に作成されることを確認
    await expect(
      page.getByRole("heading", { name: "シンプルなボード" }),
    ).toBeVisible();
  });

  test("TC-BC-003: 検証 - 空のタイトル", async ({ page }) => {
    // 1. トップページに移動（beforeEachで実行済み）

    // 2. "新規ボード作成" ボタンをクリック
    await page.getByRole("button", { name: "新規ボード作成" }).click();

    // 3. タイトルを空のまま

    // 4. "作成" ボタンをクリック
    await page.getByRole("button", { name: "作成" }).click();

    // 5. ダイアログが開いたままであることを確認（HTML5バリデーションによりフォーム送信が阻止される）
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "新規ボード作成" }),
    ).toBeVisible();

    // 6. ダイアログを閉じる
    await page.getByRole("button", { name: "キャンセル" }).click();

    // 7. ボードが作成されないことを確認
    await expect(page.getByText("ボードがありません")).toBeVisible();
  });

  test("TC-BC-004: 長いタイトルと説明の処理", async ({ page }) => {
    // 1. トップページに移動（beforeEachで実行済み）

    // 2. "新規ボード作成" ボタンをクリック
    await page.getByRole("button", { name: "新規ボード作成" }).click();

    // 3. 100文字以上のタイトルを入力
    const longTitle = "あ".repeat(100) + "テスト長いタイトル";
    await page.getByLabel("タイトル *").fill(longTitle);

    // 4. 500文字以上の説明を入力
    const longDescription =
      "い".repeat(500) +
      "テスト長い説明文です。この説明は非常に長く、複数行にわたって表示される可能性があります。";
    await page.getByLabel("説明").fill(longDescription);

    // 5. "作成" ボタンをクリック
    await page.getByRole("button", { name: "作成" }).click();

    // 6. ボード詳細ページにリダイレクトされることを確認
    await expect(page).toHaveURL(/\/boards\/[a-zA-Z0-9-]+/);

    // トップページに戻る
    await page.goto("/");
    await page.reload();

    // 7. 長いテキストが受け入れられることを確認
    await expect(page.getByRole("heading", { name: longTitle })).toBeVisible();
  });

  test("TC-BC-005: ボード名の特殊文字", async ({ page }) => {
    // 1. トップページに移動（beforeEachで実行済み）

    // 2. "新規ボード作成" ボタンをクリック
    await page.getByRole("button", { name: "新規ボード作成" }).click();

    // 3. タイトルに特殊文字を含む文字列を入力
    const specialTitle = "テスト!@#$%^&*()_+-={}[]|:;<>?,.";
    await page.getByLabel("タイトル *").fill(specialTitle);

    // 4. "作成" ボタンをクリック
    await page.getByRole("button", { name: "作成" }).click();

    // 5. ボード詳細ページにリダイレクトされることを確認
    await expect(page).toHaveURL(/\/boards\/[a-zA-Z0-9-]+/);

    // トップページに戻る
    await page.goto("/");
    await page.reload();

    // 6. 特殊文字が正しく処理され表示されることを確認
    await expect(
      page.getByRole("heading", { name: specialTitle }),
    ).toBeVisible();
  });

  test("TC-BC-006: グリッドでの複数ボード表示", async ({ page }) => {
    // 1. トップページに移動（beforeEachで実行済み）

    const boards = [
      { title: "第一ボード", description: "最初のボードの説明" },
      { title: "第二ボード", description: "二番目のボードの説明" },
      { title: "第三ボード", description: "三番目のボードの説明" },
    ];

    // 2. 3つの異なるボードを作成
    for (const board of boards) {
      await page.getByRole("button", { name: "新規ボード作成" }).click();
      await page.getByLabel("タイトル *").fill(board.title);
      await page.getByLabel("説明").fill(board.description);
      await page.getByRole("button", { name: "作成" }).click();

      // ボード詳細ページから戻る
      await page.goto("/");
      await page.reload();
    }

    // 3. すべてのボードがグリッドレイアウトで表示されることを確認
    for (const board of boards) {
      await expect(
        page.getByRole("heading", { name: board.title }),
      ).toBeVisible();
    }

    // 4. 各ボードに正しいタイトルと説明が表示されることを確認
    for (const board of boards) {
      await expect(page.getByText(board.description)).toBeVisible();
    }

    // グリッドが存在することを確認
    const boardCards = page.locator('a[href^="/boards/"]');
    await expect(boardCards).toHaveCount(3);
  });

  test("TC-BC-007: ボード作成のキャンセル", async ({ page }) => {
    // 1. トップページに移動（beforeEachで実行済み）

    // 2. "新規ボード作成" ボタンをクリック
    await page.getByRole("button", { name: "新規ボード作成" }).click();

    // 3. データを入力
    await page.getByLabel("タイトル *").fill("キャンセルするボード");
    await page.getByLabel("説明").fill("このボードはキャンセルされます");

    // 4. "キャンセル" ボタンをクリック
    await page.getByRole("button", { name: "キャンセル" }).click();

    // 5. ダイアログが閉じることを確認
    await expect(page.getByRole("dialog")).not.toBeVisible();

    // 6. ボードが作成されないことを確認
    await expect(page.getByText("ボードがありません")).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "キャンセルするボード" }),
    ).not.toBeVisible();
  });

  test("TC-BC-008: 空の状態の表示", async ({ page }) => {
    // 1. ボードが作成される前の状態（beforeEachでリセット済み）

    // 2. 適切な空の状態メッセージが表示されることを確認
    await expect(page.getByText("ボードがありません")).toBeVisible();

    // 他の要素も確認
    await expect(
      page.getByRole("heading", { name: "マイボード" }),
    ).toBeVisible();
    await expect(
      page.getByText("作成したKanbanボードから選択してください"),
    ).toBeVisible();
  });

  test("TC-BC-009: 新しいボードがトップに表示", async ({ page }) => {
    // 1. トップページに移動（beforeEachで実行済み）

    // 最初のボードを作成
    await page.getByRole("button", { name: "新規ボード作成" }).click();
    await page.getByLabel("タイトル *").fill("古いボード");
    await page.getByRole("button", { name: "作成" }).click();
    await page.goto("/");
    await page.reload();

    // 少し待機（作成時刻を確実に異なるものにするため）
    await page.waitForTimeout(1000);

    // 2. 新しいボードを作成
    await page.getByRole("button", { name: "新規ボード作成" }).click();
    await page.getByLabel("タイトル *").fill("新しいボード");
    await page.getByRole("button", { name: "作成" }).click();
    await page.goto("/");
    await page.reload();

    // 3. 新しいボードがリストの最初に表示されることを確認
    const boardLinks = page.locator('a[href^="/boards/"]');
    const firstBoard = boardLinks.first();

    await expect(
      firstBoard.getByRole("heading", { name: "新しいボード" }),
    ).toBeVisible();

    // 古いボードは2番目に表示される
    const secondBoard = boardLinks.nth(1);
    await expect(
      secondBoard.getByRole("heading", { name: "古いボード" }),
    ).toBeVisible();
  });
});
