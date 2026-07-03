# h5-web3-wallet-vue3-webpack-js-ts (V3)

[English](README.md) | [简体中文](README.ZH.md) | [日本語](README.JA.md)

* **Author**: Vincent
* **Version**: V3 (v3.0.0)

---

## Overview

This project is a mobile H5 wallet bridge integration application developed based on **Vue 3 + Webpack 5 + Reown AppKit + Ethers v6 + Web3.js v4 + TS**. It is mainly designed to be embedded in mobile games (for example, loaded via Unity's **UniWebView** plugin) to connect to external crypto wallets, obtain wallet addresses and signatures, and perform core business interactions such as NFT minting, locking, and unlocking.

The current branch (**V3**) represents a **complete major refactoring version**. We have fully integrated the project's scaffolding, configuration files, and packaging build toolchain with the modern project template of `vue3-webpack5-js-ts-ton-connect` (Vue 3.5), and replaced the obsolete and disabled old Web3Modal v1 connection layer with **Reown AppKit**.

---

## V3 Version Changes

1. **Underlying Scaffolding & Build Chain Upgrade**:
   * Completely migrated the configuration files of `vue3-webpack5-js-ts-ton-connect` (including core configurations for Babel, ESLint, Prettier, PostCSS, Webpack 5, and TypeScript 6.0.3).
   * Upgraded **Vue** to `^3.5.39` and **Vue Router** to `^5.1.0`.
   * Re-added the mobile UI library **Vant (v4.9.15)** to the dependencies and integrated `VantResolver` into the build configuration to implement perfect on-demand loading of components and styles.
2. **Wallet Connection Layer Refactoring (Reown AppKit Integration)**:
   * Completely removed the obsolete and no longer functional `web3modal` v1 and `@walletconnect/web3-provider` v1.
   * Introduced `@reown/appkit` (v1.8.21) and `@reown/appkit-adapter-ethers` (v1.8.21).
   * Rebuilt the initialization and event listening in [web3.extend.js](/public/web3/web3.extend.js) using the new AppKit APIs to trigger wallet connection popups, subscribe to connection state changes, and fetch providers. Added network switches and automatic chain registration handled natively by AppKit.
3. **Ethers v6 Smart Contract Integration**:
   * Upgraded **Ethers** to `^6.17.0` (v6).
   * Fully upgraded Ethers v5 syntax to Ethers v6 across the smart contract interaction layers (such as [game.ts](/m4m/game.ts)):
     * Rewrote `ethers.providers.Web3Provider` as `ethers.BrowserProvider`;
     * Rewrote `ethers.providers.JsonRpcProvider` as `ethers.JsonRpcProvider`;
     * Handled asynchronous `getSigner()` calls with proper `await`;
     * Replaced obsolete Solidity hashing utility APIs (both `solidityKeccak256` and `solidityPack` are replaced by the latest `solidityPackedKeccak256` and `solidityPacked`);
     * Replaced signing utility APIs (`ethers.utils.SigningKey` and `joinSignature` are changed to `ethers.SigningKey` and its `.serialized`);
     * Handled compatibility of big number outputs by converting `res.toNumber()` to `Number(res)`.
4. **Wallet Communication Link Cleanup & Pruning**:
   * Deleted more than 10 legacy files, including `m4m/providers/`, `m4m/utils/getProvider.ts`, `m4m/index.ts`, `m4m/nft.ts`, `public/web3/nodes/contract.js`, and `abi/abis.js`.
   * Removed injected fallback logic from [game.ts](/m4m/game.ts); it now strictly throws an error if no provider from AppKit is supplied.
   * Eliminated direct dependencies on `web3` and `@coinbase/wallet-sdk` npm packages, stripping 37 unused sub-packages to optimize production build bundles.

---

## Tech Stack & Dependency Versions (V3)

* **Framework & UI**: Vue v3.5.39 and Vant v4.9.15
* **Bundler**: Webpack v5.108.3
* **Web3 Libraries & Protocols**:
  * `@reown/appkit`: ^1.8.21
  * `@reown/appkit-adapter-ethers`: ^1.8.21
  * `ethers`: ^6.17.0

---

## Local Run

### Install Dependencies
```bash
npm install --legacy-peer-deps
```

### Dev Run (dungeondual module)
```bash
npm run dev-dungeondual
```

### Production Build (dungeondual module)
```bash
npm run build-dungeondual-prod
```
