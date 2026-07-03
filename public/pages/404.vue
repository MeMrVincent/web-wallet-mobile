<template>
  <div class="page404 MFlex">
    <h2>404</h2>
    <h3>{{ $t('app.notFound') }}</h3>
  </div>
</template>

<script setup>
import { getCurrentInstance, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';

const { t: $t } = useI18n();
const instance = getCurrentInstance();

onMounted(() => {
  instance?.proxy?.$root?.loading?.(false);
});
</script>

<style scoped>
.page404 { height:100%; width:100%; }
</style>
