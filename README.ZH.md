# h5-web3-wallet-vue3-webpack-js-v1.1 (V1)

[English](README.md) | [简体中文](README.ZH.md) | [日本語](README.JA.md)

* **作者**: Vincent
* **版本**: V1 (v1.1.0)

---

## 概述

本项目是一个基于 **Vue 3 + Webpack 5 + Web3Modal 1.x + JS/TS** 开发的移动端 H5 钱包桥接集成应用。主要用于内嵌在移动端游戏（例如通过 Unity 的 **UniWebView** 插件加载）中，实现连接外部加密钱包、获取钱包地址与签名、以及进行 NFT 铸造、锁定与解锁等核心业务交互。

当前分支 (**V1**) 代表了未进行依赖升级重构的原始基线版本。

---

## 技术栈与依赖版本 (V1 原始版本)

* **基础框架与UI**: Vue v3.2.47 与 Vant v4.1.0
* **打包工具**: Webpack v5.76.3
* **Web3 库与协议**:
  * `web3modal`: ^1.9.8
  * `web3`: ^1.9.0
  * `ethers`: ^5.6.8
  * `@walletconnect/web3-provider`: ^1.8.0
  * `@coinbase/wallet-sdk`: ^3.4.0

---

## 核心功能

1. **钱包连接与授权**：支持通过 Web3Modal 唤起 MetaMask、Coinbase Wallet、WalletConnect 等主流钱包。
2. **Unity 桥接机制**：当签名认证完成后，H5 页面会通过重定向触发 Unity UniWebView 的自定义 Scheme 协议：
   `uniwebview://getWalletAddress?userWalletAddress=...&userWalletSignature=...`
3. **NFT 与资产操作**：
   * **Mint 流程**：铸造游戏内的 NFT 资产。
   * **锁定 NFT 与角色**：将 NFT 资产与游戏角色锁定进行同步。
   * **解锁流程**：解锁并将资产提取至外部钱包。

---

## 本地运行

### 安装依赖
```bash
npm install
```

### 启动开发环境
```bash
npm run dev
```

### 生产环境打包
```bash
npm run build-prod
```
