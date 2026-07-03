# h5-web3-wallet-vue3-webpack-js-ts (V3)

[English](README.md) | [简体中文](README.ZH.md) | [日本語](README.JA.md)

* **作成者**: Vincent
* **バージョン**: V3 (v3.0.0)

---

## 概要

本プロジェクトは、**Vue 3 + Webpack 5 + Reown AppKit + Ethers v6 + Web3.js v4 + TS** をベースに開発されたモバイル向け H5 ウォレットブリッジ統合アプリケーションです。主にモバイルゲーム内（Unity の **UniWebView** プラグインなどを通じてロードされる環境）に組み込まれ、外部の暗号資産ウォレットへの接続、ウォレットアドレスおよび署名の取得、NFT のミント・ロック・アンロックなどのコアビジネスインタラクションを実現するために使用されます。

現在のブランチ (**V3**) は、**フルスケールのメジャーリファクタリングバージョン**を表しています。プロジェクト全体のベースとなるスキャッフォールディング、設定ファイル、およびビルドツールチェーンを `vue3-webpack5-js-ts-ton-connect` の Vue 3.5 モダンエンジニアリングテンプレートと完全に統合し、非推奨となり機能しなくなった旧バージョンの Web3Modal v1 接続レイヤーを **Reown AppKit** に置き換えました。

---

## V3 バージョンの変更点説明

1. **ベーススキャッフォールディングおよびビルドチェーンのアップグレード**:
   * `vue3-webpack5-js-ts-ton-connect` の設定ファイル（Babel、ESLint、Prettier、PostCSS、Webpack 5 のコア設定、および TypeScript 6.0.3）を完全に移植しました。
   * **Vue** を `^3.5.39` に、**Vue Router** を `^5.1.0` にアップグレードしました。
   * 新しい `package.json` の `dependencies` に、プロジェクトに必要なモバイル UI ライブラリ **Vant (v4.9.15)** を再追加し、ビルド構成に `VantResolver` を統合することで、コンポーネントとスタイルのオンデマンド非同期読み込みを完全に自動化しました。
2. **ウォレット接続レイヤーのリファクタリング (Reown AppKit の導入)**:
   * 古く、使用できなくなった `web3modal` v1 および `@walletconnect/web3-provider` v1 を完全に削除しました。
   * `@reown/appkit` (v1.8.21) および `@reown/appkit-adapter-ethers` (v1.8.21) を導入しました。
   * [web3.extend.js](/public/web3/web3.extend.js) の初期化とイベントリスナーを完全にリファクタリングし、新しい AppKit インターフェースを使用してウォレット接続ポップアップ、接続状態のサブスクライブ、および Provider の取得を実装しました。また、チェーンの切り替えや自動追加ロジックは AppKit によってネイティブに接管されます。
3. **Ethers v6 スマートコントラクトインタラクションの適合**:
   * **Ethers** を `^6.17.0` (v6) にアップグレードしました。
   * スマートコントラクトインタラクションレイヤー（[game.ts](/m4m/game.ts)）の Ethers v5 構文を Ethers v6 構文へ全面的にアップグレードしました：
     * `ethers.providers.Web3Provider` を `ethers.BrowserProvider` に書き換えました。
     * `ethers.providers.JsonRpcProvider` を `ethers.JsonRpcProvider` に書き換えました。
     * 非同期の `getSigner()` 呼び出しに対して await 処理を追加しました。
     * 古い Solidity ハッシュおよびパッキング API（`solidityKeccak256` や `solidityPack` など）を、最新の `solidityPackedKeccak256` および `solidityPacked` に置き換えました。
     * 署名ユーティリティ API（`ethers.utils.SigningKey` および `joinSignature`）を、`ethers.SigningKey` とその `.serialized` に変更しました。
     * 大数型出力の互換性問題を処理するため、`res.toNumber()` を `Number(res)` に変更しました。
4. **ウォレット通信リンクの徹底的な簡素化とクリーンアップ**:
   * `m4m/providers/`、`m4m/utils/getProvider.ts`、`m4m/index.ts`、`m4m/nft.ts`、`public/web3/nodes/contract.js`、`abi/abis.js` など、10個以上の古い不要なファイルを完全に削除しました。
   * [game.ts](/m4m/game.ts) から injected フォールバックロジックを完全に排除しました。AppKit からのプロバイダーが明示的に渡されない場合、エラーを直接スローするようにし、トランザクションの安全性を向上させました。
   * `web3` および `@coinbase/wallet-sdk` パッケージへの直接的な依存関係を完全に削除し、37個の不要な依存関係パッケージを削除して、ビルド時の製品バンドルのサイズを大幅に削減しました。

---

## 技術スタックと依存関係バージョン (V3)

* **基本フレームワークとUI**: Vue v3.5.39 および Vant v4.9.15
* **ビルドツール**: Webpack v5.108.3
* **Web3 ライブラリとプロトコル**:
  * `@reown/appkit`: ^1.8.21
  * `@reown/appkit-adapter-ethers`: ^1.8.21
  * `ethers`: ^6.17.0

---

## ローカル実行方法

### 依存関係のインストール
```bash
npm install --legacy-peer-deps
```

### ローカル実行 (dungeondual モジュール)
```bash
npm run dev-dungeondual
```

### 本番ビルド (dungeondual モジュール)
```bash
npm run build-dungeondual-prod
```
