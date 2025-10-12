import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright設定ファイル
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: "./tests",
  testMatch: "**/*.spec.ts",
  /* テストを並列実行しない（データベース操作のため） */
  fullyParallel: false,
  /* CI環境でのみ失敗したテストに対してのみforbidOnly */
  forbidOnly: !!process.env.CI,
  /* CI環境では失敗したテストを2回まで再試行 */
  retries: process.env.CI ? 2 : 0,
  /* ワーカー数を1に設定（データベース操作の競合を防ぐ） */
  workers: 1,
  /* レポーター設定 */
  reporter: "html",
  /* 共通の設定 */
  use: {
    /* ベースURL */
    baseURL: "http://localhost:3000",
    /* トレースを最初の再試行時に記録 */
    trace: "on-first-retry",
    /* 失敗時のみスクリーンショットを撮影 */
    screenshot: "only-on-failure",
  },

  /* プロジェクト設定 */
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],

  /* 開発サーバー設定 */
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
