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
        {{ $t('button.startMint') }}
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
import { isApprovalForAll, setApprovalForAll, handleSettleNewLoots, getGameSignerHash, getLocalGameSignerSig, handleLockRoleNFT } from '@m4m/game';
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
    { step: 3, labelKey: 'steps.checkApproval' },
    { step: 4, labelKey: 'steps.approval' },
    { step: 5, labelKey: 'steps.lockRole' },
    { step: 6, labelKey: 'steps.mintNFT' },
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
    window.location.href = 'uniwebview://mint' + $$.Obj2String(obj);
  }, 2000);
};

const handleMintResult = () => {
  console.log('handleMintResult start');
  steps.select = 5;
  handleSettleNewLoots(
    chainStore.provider,
    mint.targetContract,
    mint.m4mTokenId.toString(),
    mint.nonce,
    mint.params,
    mint.operatorSig,
    mint.gameSignerSig,
  ).then((res) => {
    console.log('handleMintResult general result', res);
    if (res) {
      showSuccessToast($t('message.mintNFTSuccess'));
      mint.txId = res.transactionHash;
      steps.select = 6;
      if ($$.prod === 'prod') handle();
      return;
    }

    showFailToast($t('message.mintNFTFailed'));
    setStepError(5, 'Failed !');
    if ($$.prod === 'prod') {
      window.location.href = 'uniwebview://close?route=mint&step=5&t=' + new Date().valueOf() + '&msg=Mint NFT Failed !';
    }
  }).catch((res) => {
    setStepError(5, 'error !');
    console.log('handleMintResult catch error', res);
    if ($$.prod === 'prod') {
      window.location.href = 'uniwebview://close?route=mint&step=5&t=' + new Date().valueOf() + '&msg=handleMintResult catch error, ' + res.toString();
    }
  });
};

const handleLockRole = () => {
  console.log('handleLockRole start');
  steps.select = 4;
  handleLockRoleNFT(
    chainStore.provider,
    mint.targetContract,
    mint.m4mTokenId.toString(),
    mint.gameId,
    [],
    [],
  ).then((res) => {
    console.log('handleLockRole general result', res);
    if (res) {
      handleMintResult();
      return;
    }

    showFailToast($t('message.lockRoleFailed'));
    setStepError(4, 'Failed !');
    if ($$.prod === 'prod') {
      window.location.href = 'uniwebview://close?route=mint&step=4&t=' + new Date().valueOf() + '&msg=Lock Role Failed !';
    }
  }).catch((res) => {
    setStepError(4, 'error !');
    console.log('handleLockRole catch error', res);
    if ($$.prod === 'prod') {
      window.location.href = 'uniwebview://close?route=mint&step=4&t=' + new Date().valueOf() + '&msg=handleLockRole catch error, ' + res.toString();
    }
  });
};

const handleSetApprovalForAll = () => {
  console.log('handleSetApprovalForAll start');
  steps.select = 3;
  setApprovalForAll(
    chainStore.provider,
    mint.ERCType,
    mint.owner,
    mint.nftContract,
    mint.targetContract,
  ).then((res) => {
    console.log('handleSetApprovalForAll general result', res);
    if (res && res.transactionHash) {
      handleLockRole();
      return;
    }

    showFailToast($t('message.userApprovalFailed'));
    setStepError(3, 'error !');
    if ($$.prod === 'prod') {
      window.location.href = 'uniwebview://close?route=mint&step=3&t=' + new Date().valueOf() + '&error=User Approval Failed !';
    }
  }).catch((res) => {
    setStepError(3, 'error !');
    console.log('handleSetApprovalForAll catch error', res);
    if ($$.prod === 'prod') {
      window.location.href = 'uniwebview://close?route=mint&step=3&t=' + new Date().valueOf() + '&error=handleSetApprovalForAll catch error, ' + res.toString();
    }
  });
};

const handleIsApprovalForAll = () => {
  steps.select = 2;
  console.log('handleIsApprovalForAll start');
  isApprovalForAll(
    chainStore.provider,
    mint.ERCType,
    mint.owner,
    mint.nftContract,
    mint.targetContract,
  ).then((res) => {
    console.log('handleIsApprovalForAll general result', res);
    if (res && typeof res === 'boolean' && JSON.stringify(res) === 'true') {
      handleLockRole();
    } else {
      handleSetApprovalForAll();
    }
  }).catch((res) => {
    setStepError(2, 'error !');
    console.log('handleIsApprovalForAll catch error', res);
    if ($$.prod === 'prod') {
      window.location.href = 'uniwebview://close?route=mint&step=2&t=' + new Date().valueOf() + '&error=handleIsApprovalForAll catch error, ' + res.toString();
    }
  });
};

const getWalletAddress = () => {
  steps.select = 1;
  console.log('getWalletAddress start');
  $web3Ext.init('connectWallet', null, async (res) => {
    console.log('connectWallet result', res);
    if (res.err === 0) {
      Object.assign(chainStore, res.data);
      mint.owner = chainStore.userAddress;
      handleIsApprovalForAll();
      return;
    }

    const msg = res.data || $t('message.connectWalletError');
    showFailToast(msg);
    setStepError(1, msg);
    if ($$.prod === 'prod') {
      window.location.href = 'uniwebview://close?route=mint&step=1&t=' + new Date().valueOf() + '&error=' + msg;
    }
  });
};

const handleGetLocalGameSignerSig = (hash) => {
  getLocalGameSignerSig(hash, '9c242f13f94872bda353270957f72bb7a1e4c71e3e9b5d174ad0684ffe6b62f0').then((res) => {
    if (res !== mint.gameSignerSig) {
      showFailToast($t('message.signatureIncorrect'));
    } else {
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
  getGameSignerHash(mint.params, mint.m4mTokenId, mint.gameId, mint.nonce).then((res) => {
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
    const url = 'https://aradpay.gamewonderlab.io/#/mint?gameSign=0x5fc60e3b729078c839b632170a7a7a95a79ef5e6923b39f5cbb396b72c540c1a04dc4438358d7e1aba2812216a79a5c5f30bc23d423b1c84d4161c5aa82d9bd21b&guid=401963858928873894&nonce=1&params=%7b%22nonce%22%3a%201%2c%20%22params%22%3a%20%5b%7b%22name%22%3a%20%22fashionName%22%2c%20%22amount%22%3a%201%2c%20%22symbol%22%3a%20%22fashionName%22%2c%20%22prepare%22%3a%20true%2c%20%22tokenId%22%3a%20%22401963858928872084%22%7d%5d%2c%20%22m4m_token_id%22%3a%20%22399712059115176343%22%7d&tokenId=399712059115176343';
    query = $$.getURLParam({}, url);
  }
  console.log('url query parameters', query);
  mint.m4mTokenId = query.tokenId || query.m4mTokenId;
  mint.params = query.params && JSON.parse(query.params) || '';
  mint.nonce = mint.params && Number(mint.params.nonce) || '';
  mint.params = mint.params && mint.params.params || '';
  mint.gameSignerSig = query.gameSign;
  mint.operatorSig = Buffer.from('');
  mint.guid = query.guid;
  console.log('mint', mint);
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
