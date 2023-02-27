# h5-web3-wallet-vue3-webpack-js-v1.1 (V1)

[English](README.md) | [简体中文](README.ZH.md) | [日本語](README.JA.md)

* **Author**: Vincent
* **Version**: V1 (v1.1.0)

---

## Overview

This is an H5 digital wallet integrator application built with **Vue 3 + Webpack 5 + Web3Modal 1.x + JS/TS**. It is designed to act as a bridge inside mobile games (embedded via plugins like Unity's **UniWebView**) to connect external cryptocurrency wallets, obtain user wallet addresses, request cryptographic signatures, and manage NFT workflows (minting, locking, and unlocking).

This branch (**V1**) represents the original baseline version before dependency modernization.

---

## Technical Stack & Dependencies (V1 Baseline)

* **Framework & UI**: Vue v3.2.47 & Vant v4.1.0
* **Bundler**: Webpack v5.76.3
* **Web3 Integrations**: 
  * `web3modal`: ^1.9.8
  * `web3`: ^1.9.0
  * `ethers`: ^5.6.8
  * `@walletconnect/web3-provider`: ^1.8.0
  * `@coinbase/wallet-sdk`: ^3.4.0

---

## Key Features

1. **Wallet Connection**: Connect to wallets such as MetaMask, Coinbase Wallet, and WalletConnect using Web3Modal 1.x.
2. **Unity WebView Bridge**: Once authorized, the H5 page redirects back to Unity using the custom URL scheme:
   `uniwebview://getWalletAddress?userWalletAddress=...&userWalletSignature=...`
3. **NFT Workflows**:
   * **Mint Flow**: Minting game assets.
   * **Lock NFT / Role**: Staking or locking NFTs to synchronize them with in-game characters.
   * **Unlock Flow**: Unstaking/unlocking assets.

---

## Getting Started

### Installation
```bash
npm install
```

### Run Locally
```bash
npm run dev
```

### Production Build
```bash
npm run build-prod
```
