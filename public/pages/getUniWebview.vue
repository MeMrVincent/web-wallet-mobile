<template>
  <div class="getUniWebview">
    <van-button plain type="success" @click="getParams">
      {{ $t('button.startParams') }}
    </van-button>
    <template v-if="params">
      <van-button plain type="primary">
        {{ $t('field.unityParams') }}: {{ params }}
      </van-button>
      <van-button plain type="danger" @click="handle">
        {{ $t('button.callback') }}
      </van-button>
    </template>
  </div>
</template>

<script setup>
import { getCurrentInstance, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { Button as VanButton } from 'vant';
import $$ from '@App/$$';

const { t: $t } = useI18n();
const instance = getCurrentInstance();
const params = ref(null);

const getParams = () => {
  params.value = $$.getURLParam({}, window.location.href);
};

const handle = () => {
  const obj = { ...params.value, t: new Date().valueOf() };
  window.location.href = 'uniwebview://close' + $$.Obj2String(obj);
};

onMounted(() => {
  getParams();
  setTimeout(() => {
    handle();
  }, 500);
  instance?.proxy?.$root?.loading?.(false);
});
</script>
