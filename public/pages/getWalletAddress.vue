<template>
  <div class="getWalletAddress">
    <van-button plain type="success" @click="getWalletAddress" v-if="!chainStore || !chainStore.userAddress">
      {{ $t('button.startWallet') }}
    </van-button>
    <template v-if="chainStore && chainStore.userAddress && chainStore.walletSignature">
      <van-button plain type="primary">
        {{ $t('field.walletAddress') }}: {{ chainStore.userAddress }}
      </van-button>
      <van-button plain type="primary">
        {{ $t('field.signature') }}: {{ chainStore.walletSignature }}
      </van-button>
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
import { Button as VanButton, showFailToast } from 'vant';
import $web3Ext from '@web3/web3.extend';
import $$ from '@App/$$';
import loadSteps from '@/components/loadSteps';

const route = useRoute();
const { t: $t } = useI18n();
const instance = getCurrentInstance();

const chainStore = reactive({
  chainId: null,
  connected: false,
  networkId: null,
  provider: {},
  userAddress: '',
  walletSignature: '',
  urlSign: route.query.sign || '111111',
});

const steps = reactive({
  select: 0,
  list: [
    { step: 1, labelKey: 'steps.connectWallet' },
    { step: 2, labelKey: 'steps.getSignatureCode' },
    { step: 3, labelKey: 'steps.getWalletSignature' },
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

const getSignature = () => {
  steps.select = 2;
  $web3Ext.getSignature(chainStore.urlSign, chainStore.userAddress).then((r) => {
    console.log('getSignature success:', r);
    if (r.code === 0) {
      steps.select = 3;
      chainStore.walletSignature = r.message;
      if ($$.prod === 'prod') {
        handle();
      }
      return;
    }

    const msg = r.message || $t('message.unknownError');
    setStepError(2, msg);
    if ($$.prod === 'prod') {
      window.location.href = 'uniwebview://close?route=getWallerAddress&step=3&t=' + new Date().valueOf() + '&msg=' + msg;
    }
  });
};

const getWalletAddress = () => {
  steps.show = true;
  console.log('getWalletAddress start');
  $web3Ext.init('connectWallet', null, async (res) => {
    console.log('connectWallet result', res);
    if (res.err === 0) {
      Object.assign(chainStore, res.data);
      getSignature();
      return;
    }

    const msg = res.data || $t('message.connectWalletError');
    showFailToast(msg);
    setStepError(0, msg);
    if ($$.prod === 'prod') {
      window.location.href = 'uniwebview://close?route=getWallerAddress&step=1&t=' + new Date().valueOf() + '&error=' + msg;
    }
  });
};

const handle = () => {
  setTimeout(() => {
    const obj = { userWalletAddress: chainStore.userAddress, userWalletSignature: chainStore.walletSignature, t: new Date().valueOf() };
    window.location.href = 'uniwebview://getWalletAddress' + $$.Obj2String(obj);
  }, 2000);
};

onMounted(() => {
  instance?.proxy?.$root?.loading?.(false);
  if ($$.prod === 'prod') {
    getWalletAddress();
  }
});
</script>
