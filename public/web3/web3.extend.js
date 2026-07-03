import { createAppKit } from '@reown/appkit';
import { EthersAdapter } from '@reown/appkit-adapter-ethers';
import { mainnet, polygon, polygonMumbai } from '@reown/appkit/networks';
import { ethers } from 'ethers';
import $$ from '@App/$$';

// Get available Project ID, using the ID validated in lineApp
const projectId = 'e83898f364c32ae1e296300d347b304c';

// Initialize Reown AppKit Modal
const networks = [mainnet, polygon, polygonMumbai];
const ethersAdapter = new EthersAdapter();

const modal = createAppKit({
  adapters: [ethersAdapter],
  networks,
  projectId,
  features: {
    analytics: false,
    email: false,
    socials: [],
    emailShowWallets: false,
    allWallets: 'SHOW',
  },
});

export default {
  provider: null,
  hasConnected: false,

  async init(type, userWalletAddress, callback) {
    this.resetApp();
    
    const checkAndTriggerCallback = async () => {
      this.provider = modal.getWalletProvider();
      
      const accountState = modal.getAccount();
      const userAddress = accountState.address;
      
      // Check if network matches the targetChain requirements
      await this.checkNetwork({
        targetChain: $$.apiURLS.targetChain,
        callback: callback,
        userWalletAddress,
        type,
        userAddress
      });
    };

    const accountState = modal.getAccount();
    if (accountState && accountState.isConnected) {
      console.log('AppKit already connected. Triggering callback directly.');
      await checkAndTriggerCallback();
    } else {
      console.log('AppKit not connected. Opening modal.');
      modal.open();
      
      // Subscribe to one-time state change to respond to successful connection
      const unsubscribe = modal.subscribeAccount(async (newVal) => {
        if (newVal.isConnected) {
          unsubscribe();
          unsubscribeEvent();
          console.log('AppKit connected successfully.');
          await checkAndTriggerCallback();
        }
      });
      
      // Subscribe to events to detect modal close and throw error
      const unsubscribeEvent = modal.subscribeEvents(async (event) => {
        if (event.data.event === 'MODAL_CLOSE' && !modal.getAccount().isConnected) {
          unsubscribe();
          unsubscribeEvent();
          console.log('AppKit modal closed by user without connection.');
          return callback && callback({ err: -1, data: 'User Close Modal !' });
        }
      });
    }
  },

  async checkNetwork(obj) {
    const chainId = modal.getChainId();
    console.log('checkNetwork current chainId:', chainId, 'targetChain:', obj.targetChain);
    
    if (chainId === obj.targetChain) {
      console.log('Network verification passed.');
      let params = {
        provider: this.provider,
        connected: true,
        userAddress: obj.userAddress,
        chainId: chainId,
        networkId: chainId,
      };
      
      if (obj.type === 'connectWallet') {
        this.hasConnected = true;
        return obj.callback && obj.callback({ err: 0, data: params });
      }
    } else {
      console.log('Network incorrect. Switching network to:', obj.targetChain);
      try {
        const targetNet = networks.find(n => n.id === obj.targetChain);
        if (targetNet) {
          await modal.switchNetwork(targetNet);
          // Re-verify after switching network successfully
          setTimeout(async () => {
            const newChainId = modal.getChainId();
            if (newChainId === obj.targetChain) {
              let params = {
                provider: this.provider,
                connected: true,
                userAddress: modal.getAccount().address,
                chainId: newChainId,
                networkId: newChainId,
              };
              if (obj.type === 'connectWallet') {
                this.hasConnected = true;
                return obj.callback && obj.callback({ err: 0, data: params });
              }
            } else {
              return obj.callback && obj.callback({ err: -1, data: 'Switch network failed or rejected.' });
            }
          }, 1000);
        } else {
          return obj.callback && obj.callback({ err: -1, data: 'Unsupported target network chain ID: ' + obj.targetChain });
        }
      } catch (switchError) {
        console.error('Switch network error:', switchError);
        return obj.callback && obj.callback({ err: -1, data: switchError.message || 'Switch network rejected.' });
      }
    }
  },

  async getSignature(token, userAddress) {
    console.log('getSignature via ethers v6: ', token, userAddress);
    try {
      const browserProvider = new ethers.BrowserProvider(this.provider);
      const signer = await browserProvider.getSigner();
      const res = await signer.signMessage(token);
      return { code: 0, message: res };
    } catch (r) {
      console.error('getSignature error:', r);
      return { code: -1, message: r.message || r };
    }
  },

  toHex(num) {
    const val = Number(num);
    return '0x' + val.toString(16);
  },

  async subscribeProvider(fn) {
    if (this.hasConnected || !this.provider) {
      return;
    }
    this.provider.on('disconnect', async () => {
      console.log('Wallet disconnected.');
      await this.resetApp();
    });
    this.provider.on('accountsChanged', async (accounts) => {
      console.log('Accounts changed:', accounts);
      return fn && fn({ err: 2, data: accounts });
    });
    this.provider.on('chainChanged', async (chainId) => {
      console.log('Chain changed:', chainId);
      return fn && fn({ err: 3, data: chainId });
    });
  },

  async resetApp() {
    this.hasConnected = false;
    try {
      await modal.disconnect();
    } catch (e) {
      console.error('AppKit disconnect error:', e);
    }
  }
};
