<template>
  <div class="m4mMint">
    <van-button plain type="success" @click="getParams">
      {{ $t('button.startParams') }}
    </van-button>
    <template v-if="mint && mint.m4mTokenId">
      <p style="margin:20px 0; border:1px solid #f00; padding:15px;word-break: break-all;">
        {{ $t('field.gameParams') }}: {{ mint }}
      </p>
      <van-button plain type="primary" @click="getWalletAddress()">
        {{ $t('button.startUnlock') }}
      </van-button>
      <br>
      <van-button plain type="danger" @click="handle">
        {{ $t('button.callback') }}
      </van-button>
    </template>
  </div>
  <load-steps :steps="steps" @callBack="handle" />
</template>

<script setup>
import { getCurrentInstance, onMounted, reactive } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { Button as VanButton, showFailToast, showSuccessToast } from 'vant';
import { handleUnlockComponents, getUnlockGameSignerHash, getLocalGameSignerSig } from '@m4m/game';
import $web3Ext from '@web3/web3.extend';
import $$ from '@App/$$';
import loadSteps from '@/components/loadSteps';

const route = useRoute();
const { t: $t } = useI18n();
const instance = getCurrentInstance();

const mint = reactive({
  gameSignerSig: '',
  guid: '',
  nonce: null,
  params: null,
  m4mTokenId: '',
  operatorSig: '',
  owner: '',
  signHash: '',
  gameId: $$.apiURLS.appId,
  nftContract: $$.apiURLS.nftContract,
  targetContract: $$.apiURLS.targetContract,
  ERCType: $$.apiURLS.ERCType,
  txId: '',
  loot_ids: [],
  lost_ids: [],
  loot_amounts: [],
  lost_amounts: [],
});

const chainStore = reactive({
  chainId: null,
  connected: false,
  networkId: null,
  provider: {},
  userAddress: '',
  walletSignature: '',
  urlSign: '',
});

const steps = reactive({
  select: 0,
  list: [
    { step: 1, labelKey: 'steps.getParams' },
    { step: 2, labelKey: 'steps.connectWallet' },
    { step: 3, labelKey: 'steps.unlockNFT' },
  ],
  show: false,
  error: 0,
});

const setStepError = (index, msg) => {
  const item = steps.list[index];
  if (item) {
    item.label = (item.labelKey ? $t(item.labelKey) : item.label || '') + msg;
    item.labelKey = '';
    item.error = true;
  }
  steps.error += 1;
};

const handle = () => {
  setTimeout(() => {
    const obj = { guid: mint.guid, txId: mint.txId, t: new Date().valueOf() };
    window.location.href = 'uniwebview://unlock' + $$.Obj2String(obj);
  }, 2000);
};

const handleUnlockNFT = () => {
  console.log('handleUnlockNFT start');
  steps.select = 2;
  handleUnlockComponents(
    chainStore.provider,
    mint.targetContract,
    mint.m4mTokenId.toString(),
    mint.nonce,
    mint.loot_ids,
    mint.loot_amounts,
    mint.lost_ids,
    mint.lost_amounts,
    mint.operatorSig,
    mint.gameSignerSig,
  ).then((res) => {
    console.log('handleUnlockNFT general result', res);
    if (res) {
      showSuccessToast($t('message.unlockNFTSuccess'));
      mint.txId = res.transactionHash;
      steps.select = 3;
      if ($$.prod === 'prod') handle();
      return;
    }

    showFailToast($t('message.unlockNFTFailed'));
    setStepError(2, 'Failed !');
    if ($$.prod === 'prod') {
      window.location.href = 'uniwebview://close?route=UnlockNFT&step=2&t=' + new Date().valueOf() + '&error=general result Unlock NFT Failed !';
    }
  }).catch((res) => {
    let msg = 'Failed ! ';
    if (res.error && res.error.code && res.error.data && res.error.message) {
      msg += 'error:{ code:' + res.error.code + ', msg:' + res.error.message + ' ' + res.error.data.message + '}';
    } else {
      const errorText = res.toLocaleString();
      msg += errorText.substring(errorText.indexOf(':') + 1, errorText.indexOf('('));
    }
    setStepError(2, msg);
    console.log('handleUnlockNFT catch error', res);
    if ($$.prod === 'prod') {
      window.location.href = 'uniwebview://close?route=UnlockNFT&step=2&t=' + new Date().valueOf() + '&error=handleUnlockNFT catch error, ' + res;
    }
  });
};

const getWalletAddress = () => {
  console.log('getWalletAddress start');
  steps.select = 1;
  $web3Ext.init('connectWallet', null, async (res) => {
    console.log(res);
    if (res.err === 0) {
      Object.assign(chainStore, res.data);
      mint.owner = chainStore.userAddress;
      handleUnlockNFT();
      return;
    }

    const msg = res.data || $t('message.connectWalletError');
    showFailToast(msg);
    setStepError(1, msg);
    if ($$.prod === 'prod') {
      window.location.href = 'uniwebview://close?route=UnlockNFT&step=1&t=' + new Date().valueOf() + '&error=' + msg;
    }
  });
};

const handleGetLocalGameSignerSig = (hash) => {
  getLocalGameSignerSig(hash, '9c242f13f94872bda353270957f72bb7a1e4c71e3e9b5d174ad0684ffe6b62f0').then((res) => {
    console.log('handleGetLocalGameSignerSig', res);
    if (res !== mint.gameSignerSig) {
      mint.gameSignerSig = res;
      showFailToast($t('message.signatureIncorrect'));
    } else {
      console.log('handleGetLocalGameSignerSig', 'same as the game Signature');
      showSuccessToast($t('message.signaturePassed'));
    }
    getWalletAddress();
  }).catch(() => {
    if ($$.prod === 'prod') {
      window.location.href = 'uniwebview://close?t=' + new Date().valueOf();
    }
  });
};

const handleGetGameSignerHash = () => {
  getUnlockGameSignerHash(
    mint.m4mTokenId.toString(),
    mint.gameId,
    mint.nonce,
    mint.loot_ids,
    mint.loot_amounts,
    mint.lost_ids,
    mint.lost_amounts,
  ).then((res) => {
    handleGetLocalGameSignerSig(res);
  }).catch(() => {
    if ($$.prod === 'prod') {
      window.location.href = 'uniwebview://close?t=' + new Date().valueOf();
    }
  });
};

const getParams = () => {
  steps.show = true;
  let query = route.query;
  if (JSON.stringify(query) === '{}') {
    const url = 'http://127.0.0.1:9010/#/unlock?gameSign=0x395e2ea834104e535c71d5b9ac2c780f0bd0471292054945c1db65b840ad6a2e0dff4bbe91496d27337bdf861e32f2f701503b61f6c76cc6678be24e628100701c&guid=401963858928891262&nonce=1&params={"nonce": 1, "gameId": 1, "loot_ids": ["401963858928886705"], "lost_ids": ["401963858928886705"], "loot_amounts": [1], "lost_amounts": [1], "m4m_token_id": "399712059115176656"}&tokenId=399712059115176656';
    query = $$.getURLParam({}, url);
  }

  console.log('url query parameters', query);
  mint.m4mTokenId = query.tokenId || query.m4mTokenId;
  mint.params = query.params && JSON.parse(query.params) || '';
  mint.nonce = mint.params && Number(mint.params.nonce) || '';
  mint.loot_ids = mint.params && mint.params.loot_ids || '';
  mint.loot_amounts = mint.params && mint.params.loot_amounts || '';
  mint.lost_ids = mint.params && mint.params.lost_ids || '';
  mint.lost_amounts = mint.params && mint.params.lost_amounts || '';
  mint.gameSignerSig = query.gameSign;
  mint.operatorSig = Buffer.from('');
  mint.guid = query.guid;
  console.log(mint);
  if ($$.prod === 'prod') {
    getWalletAddress();
  } else {
    handleGetGameSignerHash();
  }
};

onMounted(() => {
  instance?.proxy?.$root?.loading?.(false);
  if ($$.prod === 'prod') {
    getParams();
  }
});
</script>
