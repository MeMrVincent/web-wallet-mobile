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
        {{ $t('button.startLockRole') }}
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
import { handleLockRoleNFT, isApprovalForAll, setApprovalForAll } from '@m4m/game';
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
    const obj = { success: 1, t: new Date().valueOf() };
    window.location.href = 'uniwebview://lockRole' + $$.Obj2String(obj);
  }, 2000);
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
      showSuccessToast($t('message.lockRoleSuccess'));
      steps.select = 5;
      if ($$.prod === 'prod') handle();
      return;
    }

    showFailToast($t('message.lockRoleFailed'));
    setStepError(4, 'error !');
    if ($$.prod === 'prod') {
      window.location.href = 'uniwebview://close?route=lockRole&step=4&t=' + new Date().valueOf() + '&error=Lock Role Failed !';
    }
  }).catch((res) => {
    const errorText = res.toLocaleString();
    setStepError(4, 'Failed !' + errorText.substring(errorText.indexOf(':') + 1, errorText.indexOf(';')));
    console.log('handleLockRole catch error', errorText);
    if ($$.prod === 'prod') {
      window.location.href = 'uniwebview://close?route=lockRole&step=4&t=' + new Date().valueOf() + '&msg=handleLockRole catch error, ' + errorText;
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
      window.location.href = 'uniwebview://close?route=lockRole&step=3&t=' + new Date().valueOf() + '&error=User Approval Failed !';
    }
  }).catch((res) => {
    setStepError(3, 'error !');
    console.log('handleSetApprovalForAll catch error', res);
    if ($$.prod === 'prod') {
      window.location.href = 'uniwebview://close?route=lockRole&step=3&t=' + new Date().valueOf() + '&error=handleSetApprovalForAll catch error, ' + res.toString();
    }
  });
};

const handleIsApprovalForAll = () => {
  console.log('handleIsApprovalForAll start');
  steps.select = 2;
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
      window.location.href = 'uniwebview://close?route=lockRole&step=2&t=' + new Date().valueOf() + '&error=handleIsApprovalForAll catch error, ' + res.toString();
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
      handleIsApprovalForAll();
      return;
    }

    const msg = res.data || $t('message.connectWalletError');
    showFailToast(msg);
    setStepError(1, msg);
    if ($$.prod === 'prod') {
      window.location.href = 'uniwebview://close?route=lockRole&step=1&t=' + new Date().valueOf() + '&error=' + msg;
    }
  });
};

const getParams = () => {
  steps.show = true;
  let query = route.query;
  if (JSON.stringify(query) === '{}') {
    const url = 'https://aradpay.gamewonderlab.io/#/mint?m4mTokenId=399712059115176343';
    query = $$.getURLParam({}, url);
  }
  console.log('url query parameters', query);
  mint.m4mTokenId = query.tokenId || query.m4mTokenId;
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
