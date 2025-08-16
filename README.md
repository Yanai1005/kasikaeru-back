# kasikaeru-back
## 開発環境

```txt
npm install
npm run dev
```

## テスト

```txt
# テスト実行
npm test

# カバレッジ付きテスト
npm run test:coverage

# テスト一回実行
npm run test:run
```

## デプロイ

```txt
npm run deploy
```

[For generating/synchronizing types based on your Worker configuration run](https://developers.cloudflare.com/workers/wrangler/commands/#types):

```txt
npm run cf-typegen
```

Pass the `CloudflareBindings` as generics when instantiation `Hono`:

```ts
// src/index.ts
const app = new Hono<{ Bindings: CloudflareBindings }>()
```
