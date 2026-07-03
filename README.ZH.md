# h5-web3-wallet-vue3-webpack-js-v1.1 (V3)

[English](README.md) | [简体中文](README.ZH.md) | [日本語](README.JA.md)

* **作者**: Vincent
* **版本**: V3 (v3.0.0)

---

## 概述

本项目是一个基于 **Vue 3 + Webpack 5 + Reown AppKit + Ethers v6 + Web3.js v4 + TS** 开发的移动端 H5 钱包桥接集成应用。主要用于内嵌在移动端游戏（例如通过 Unity 的 **UniWebView** 插件加载）中，实现连接外部加密钱包、获取钱包地址与签名、以及进行 NFT 铸造、锁定与解锁等核心业务交互。

当前分支 (**V3**) 代表了**全量大版本重构版本**（方案 B）。我们将整个项目的基础脚手架、配置文件及打包工具链完全与 `vue3-webpack5-js-ts-ton-connect` 的 Vue 3.5 现代工程模板融合，并使用 **Reown AppKit** 替换了已废弃且失效的旧版 Web3Modal v1 连接层。

---

## V3 版本改动说明

1. **底层脚手架及构建链升级**:
   * 完全移植了 `vue3-webpack5-js-ts-ton-connect` 的配置文件（Babel、ESLint、Prettier、PostCSS、Webpack 5 核心配置以及 TypeScript 6.0.3）。
   * 升级 **Vue** 至 `^3.5.39`，**Vue Router** 至 `^5.1.0`。
   * 在新的 `package.json` 的 `dependencies` 中重新加回了项目所需的移动端 UI 库 **Vant (v4.9.15)**，并在构建配置中整合了 `VantResolver` 以实现组件和样式的完美异步按需引入。
2. **钱包连接层重构 (接入 Reown AppKit)**:
   * 彻底移除了老旧且不再可用的 `web3modal` v1 和 `@walletconnect/web3-provider` v1。
   * 引入了 `@reown/appkit` (v1.8.21) 与 `@reown/appkit-adapter-ethers` (v1.8.21)。
   * 完全重构了 [web3.extend.js](/public/web3/web3.extend.js) 的初始化与监听事件，使用全新的 AppKit 接口实现钱包连接弹出、订阅连接状态及获取 Provider，由 AppKit 内置接管加链与切链逻辑。
3. **Ethers v6 智能合约交互适配**:
   * 升级 **Ethers** 到 `^6.17.0` (v6)。
   * 对智能合约交互层（[game.ts](/m4m/game.ts)）中的 Ethers v5 语法进行了全面的 Ethers v6 语法升级：
     * 将 `ethers.providers.Web3Provider` 改写为 `ethers.BrowserProvider`；
     * 将 `ethers.providers.JsonRpcProvider` 改写为 `ethers.JsonRpcProvider`；
     * 对异步的 `getSigner()` 调用进行了 await 处理；
     * 替换了旧的 Solidity 哈希包装工具 API（如 `solidityKeccak256` 和 `solidityPack` 均更换为最新的 `solidityPackedKeccak256` 和 `solidityPacked`）；
     * 替换签名工具 API（`ethers.utils.SigningKey` 与 `joinSignature` 变更为 `ethers.SigningKey` 及其 `.serialized`）；
     * 处理了大数类型输出兼容性问题，将 `res.toNumber()` 改为 `Number(res)`。
4. **钱包通信链路彻底精简与净化**:
   * 删除了 `m4m/providers/`、`m4m/utils/getProvider.ts`、`m4m/index.ts`、`m4m/nft.ts`、`public/web3/nodes/contract.js`、`abi/abis.js` 等十余个历史残留死代码文件。
   * 在 [game.ts](/m4m/game.ts) 中彻底移除了 injected 降级 fallback 逻辑，必须显式传入 AppKit 拥有的 provider，否则直接 throw 错误，使交易流安全受控。
   * 完全去除了对 `web3` 以及 `@coinbase/wallet-sdk` 包的直接依赖，清理了 37 个冗余 npm 包，大幅度缩减了构建打包的体积。

---

## 技术栈与依赖版本 (V3)

* **基础框架与UI**: Vue v3.5.39 与 Vant v4.9.15
* **打包工具**: Webpack v5.108.3
* **Web3 库与协议**:
  * `@reown/appkit`: ^1.8.21
  * `@reown/appkit-adapter-ethers`: ^1.8.21
  * `ethers`: ^6.17.0

---

## 本地运行

### 安装依赖
```bash
npm install --legacy-peer-deps
```

### 本地运行 (dungeondual 模块)
```bash
npm run dev-dungeondual
```

### 生产打包 (dungeondual 模块)
```bash
npm run build-dungeondual-prod
```
