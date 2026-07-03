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
        {{ $t('button.startLockNFT') }}
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
import { handleLockComponents } from '@m4m/game';
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
    { step: 3, labelKey: 'steps.lockNFT' },
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
    window.location.href = 'uniwebview://lock' + $$.Obj2String(obj);
  }, 2000);
};

const handleLockNFT = () => {
  console.log('handleLockNFT start');
  steps.select = 2;
  const inComponentIds = [];
  const inAmounts = [];
  if (mint.params) {
    for (let i = 0; i < mint.params.length; i += 1) {
      const item = mint.params[i];
      inComponentIds.push(item.toString());
      inAmounts.push(1);
    }
    console.log('handleLockNFT for components !');
  } else {
    console.log('handleLockNFT for role !');
  }

  handleLockComponents(
    chainStore.provider,
    mint.targetContract,
    mint.m4mTokenId.toString(),
    inComponentIds,
    inAmounts,
  ).then((res) => {
    console.log('handleLockNFT general result', res);
    if (res) {
      showSuccessToast($t('message.lockNFTSuccess'));
      mint.txId = res.transactionHash;
      steps.select = 3;
      if ($$.prod === 'prod') handle();
      return;
    }

    showFailToast($t('message.lockNFTFailed'));
    setStepError(2, 'Failed !');
    if ($$.prod === 'prod') {
      window.location.href = 'uniwebview://close?route=lockNFT&step=2&t=' + new Date().valueOf() + '&error=general result lock NFT Failed !';
    }
  }).catch((res) => {
    const errorText = res.toLocaleString();
    setStepError(2, 'Failed !' + errorText.substring(errorText.indexOf(':') + 1, errorText.indexOf(';')));
    console.log('handleLockNFT catch error', errorText);
    if ($$.prod === 'prod') {
      window.location.href = 'uniwebview://close?route=lockNFT&step=2&t=' + new Date().valueOf() + '&error=handleLockNFT catch error, ' + errorText;
    }
  });
};

const getWalletAddress = () => {
  console.log('getWalletAddress start');
  steps.select = 1;
  $web3Ext.init('connectWallet', null, async (res) => {
    console.log('connectWallet result', res);
    if (res.err === 0) {
      Object.assign(chainStore, res.data);
      mint.owner = chainStore.userAddress;
      handleLockNFT();
      return;
    }

    const msg = res.data || $t('message.connectWalletError');
    showFailToast(msg);
    setStepError(1, msg);
    if ($$.prod === 'prod') {
      window.location.href = 'uniwebview://close?route=lockNFT&step=1&t=' + new Date().valueOf() + '&error=' + msg;
    }
  });
};

const getParams = () => {
  steps.show = true;
  let query = route.query;
  if (JSON.stringify(query) === '{}') {
    const url = 'https://aradpay.gamewonderlab.io/#/lock?gameSign=&guid=401963858928889568&nonce=2&params=%7b%22nonce%22%3a%202%2c%20%22m4m_token_id%22%3a%20%22399712059115176546%22%2c%20%22component_ids%22%3a%20%5b%22401963858928887572%22%5d%7d&tokenId=399712059115176546';
    query = $$.getURLParam({}, url);
  }

  console.log('url query parameters', query);
  mint.m4mTokenId = query.tokenId || query.m4mTokenId;
  mint.params = query.params && JSON.parse(query.params) || '';
  mint.nonce = mint.params && Number(mint.params.nonce) || '';
  mint.params = mint.params && mint.params.component_ids || '';
  mint.gameSignerSig = query.gameSign;
  mint.operatorSig = Buffer.from('');
  mint.guid = query.guid;
  console.log('mint', mint);
  getWalletAddress();
};

onMounted(() => {
  instance?.proxy?.$root?.loading?.(false);
  if ($$.prod === 'prod') {
    getParams();
  }
});
</script>
