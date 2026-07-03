const envConfig = {
  modules: [],
  process: null,
  argvs: process.argv.slice(2),

  getParams(key) {
    let item = this.argvs.find(item => item.split('=')[0] === key);
    return item ? item.split('=') : [];
  },

  defineModules() {
    class MultiModule {
      constructor(name, opts) {
        Object.assign(this, {
          name,
          host: '0.0.0.0',
          filename: '',
          title: '',
          lanKeys: 'en-us,zh-cn,ja-jp',
          defaultLanguage: 'en-us',
          server: 'https',
          receiveCurrency: 'USDT',
        }, opts);
      }
    }

    this.modules = [
      new MultiModule('dungeondual', {
        port: 9010,
        filename: 'index.html',
        title: 'h5 web3 wallet',
        sysApp: 'dungeondual',
        sysName: 'dungeondual',
        bridge: 'unity',
        appId: 1,
        dev: {
          staticURL: './',
          infuraId: '4d491126ad1f4b50a1c6b26bb0c623f2',
          ERCType: '1155',
          nftContract: '0xb6bb4812a8e075cbad0128e318203553c4ca463d',
          targetContract: '0xdd5b1C4685A34Ff07A21Ca2507D4b80e60EbC85f',
          targetChain: 80001,
          dist: 'dev',
        },
        test: {
          staticURL: './',
          infuraId: '4d491126ad1f4b50a1c6b26bb0c623f2',
          ERCType: '1155',
          nftContract: '0xb6bb4812a8e075cbad0128e318203553c4ca463d',
          targetContract: '0xdd5b1C4685A34Ff07A21Ca2507D4b80e60EbC85f',
          targetChain: 80001,
          dist: 'test',
        },
        uat: {
          staticURL: './',
          infuraId: '4d491126ad1f4b50a1c6b26bb0c623f2',
          ERCType: '1155',
          nftContract: '0xb6bb4812a8e075cbad0128e318203553c4ca463d',
          targetContract: '0xdd5b1C4685A34Ff07A21Ca2507D4b80e60EbC85f',
          targetChain: 80001,
          dist: 'uat',
        },
        prod: {
          staticURL: './',
          infuraId: '4d491126ad1f4b50a1c6b26bb0c623f2',
          ERCType: '1155',
          nftContract: '0xb6bb4812a8e075cbad0128e318203553c4ca463d',
          targetContract: '0xdd5b1C4685A34Ff07A21Ca2507D4b80e60EbC85f',
          targetChain: 80001,
          dist: 'prod',
        },
      }),
    ];
  },

  getModuleProcess(name) {
    let mItem = this.modules.find(item => item.name === name);
    return mItem || this.modules[0];
  },

  getNodeENV(obj) {
    return this.getENV('node', obj, this.process);
  },

  getBuildENV(obj) {
    return this.getENV('build', obj, this.process);
  },

  getENV(type, obj, params) {
    let item;
    for (let x in params) {
      item = params[x];
      if (typeof item === 'object' && x === JSON.parse(obj.prod)) {
        this.getENV(type, obj, item);
      }
      if (typeof item !== 'object') {
        if (type === 'node') {
          obj[x] = '"' + item + '"';
        }
        if (type === 'build') {
          obj[x] = item;
        }
      }
    }
    return obj;
  },

  init() {
    this.defineModules();
    let eventName = String(process.env.npm_lifecycle_event).split('-');
    let moduleName = this.getParams('name')[1] || eventName[1];
    this.process = this.getModuleProcess(moduleName);
  },
};

envConfig.init();

module.exports = envConfig;
