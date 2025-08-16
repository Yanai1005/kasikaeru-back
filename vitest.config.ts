import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'miniflare',
    environmentOptions: {
      bindings: {
        // テスト用の環境変数
        ALLOWED_ORIGINS: 'http://localhost:3000',
      },
      kvNamespaces: ['TEST_KV'],
      d1Databases: ['DB'],
    },
  },
});
