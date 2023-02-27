# h5-web3-wallet-vue3-webpack-js-v1.1 (V1)

[English](README.md) | [简体中文](README.ZH.md) | [日本語](README.JA.md)

* **著者**: Vincent
* **バージョン**: V1 (v1.1.0)

---

## 概要

本プロジェクトは、**Vue 3 + Webpack 5 + Web3Modal 1.x + JS/TS** をベースに開発されたモバイル H5 ウォレット統合ゲートウェイアプリケーションです。主にモバイルゲーム（Unity の **UniWebView** プラグインなどを通じてロード）内に組み込まれ、外部暗号資産ウォレットの接続、ウォレットアドレスと署名の取得、および NFT 鋳造・ロック・ロック解除などのコアビジネス操作を仲介するために設計されています。

このブランチ (**V1**) は、依存関係のアップグレードを行う前のオリジナルのベースラインバージョンを表しています。

---

## 技術スタックと依存関係 (V1 初期バージョン)

* **フレームワーク & UI**: Vue v3.2.47 & Vant v4.1.0
* **バンドラー**: Webpack v5.76.3
* **Web3 統合**:
  * `web3modal`: ^1.9.8
  * `web3`: ^1.9.0
  * `ethers`: ^5.6.8
  * `@walletconnect/web3-provider`: ^1.8.0
  * `@coinbase/wallet-sdk`: ^3.4.0

---

## 主な機能

1. **ウォレット接続**: Web3Modal 1.x を使用して、MetaMask、Coinbase Wallet、WalletConnect などのウォレットに接続します。
2. **Unity WebView ブリッジ**: 認証と署名が完了すると、H5 ページはカスタム URL スキームを使用して Unity 側にリダイレクトします：
   `uniwebview://getWalletAddress?userWalletAddress=...&userWalletSignature=...`
3. **NFT 関連ワークフロー**:
   * **Mint フロー**: ゲーム内アセットの鋳造。
   * **NFT / ロールのロック**: ゲーム内のキャラクターやアセットの同期とステーキング。
   * **ロック解除フロー**: アセットの引き出しとアンロック。

---

## クイックスタート

### 依存関係のインストール
```bash
npm install
```

### ローカルでの実行
```bash
npm run dev
```

### 本番ビルド
```bash
npm run build-prod
```
