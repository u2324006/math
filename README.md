# 一次方程式ジェネレーター（KaTeX）

- KaTeX を **npm install** して **node_modules** から読み込む方式です。
- 整数問題・分数問題の両方をランダム生成します。

## セットアップ

```bash
npm install
```

## 実行（ローカルサーバ）

```bash
npx http-server . -p 8080
# または
npm start
```

ブラウザで `http://localhost:8080/` を開いてください。

## ファイル構成

- `index.html` … 画面本体（KaTeXは `node_modules/katex/dist` から読み込み）
- `styles.css` … スタイル
- `script.js` … 問題生成ロジック
- `package.json` … 依存定義（katex/http-server）
