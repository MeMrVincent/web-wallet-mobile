<template>
  <div id="demoApp" :class="ENV">
    <router-view />
  </div>
</template>

<script setup>
import { watch } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { showLoadingToast } from 'vant';
import $$ from './$$';

const route = useRoute();
const { t: $t } = useI18n();
const ENV = $$.ENV.env;

const loading = (boolean) => {
  showLoadingToast({
    message: $t('app.loading'),
    forbidClick: true,
    loadingType: 'spinner',
    duration: boolean ? 0 : 100,
  });
};

watch(
  () => route.fullPath,
  () => loading(true),
);

defineExpose({ loading });
</script>

<style scoped>
#demoApp { padding:20px; }
</style>
