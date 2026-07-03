<template>
  <nav>
    <van-icon name="close" class="close Flex" @click="handleAction('close')" v-if="env === 'dev'" />
    <div class="navHead Flex" tag="LT">
      <h2 class="black">{{ $t('app.title') }}</h2>
      <van-dropdown-menu class="languageMenu">
        <van-dropdown-item v-model="locale" :options="languageOptions" @change="handleLanguageChange" />
      </van-dropdown-menu>
    </div>
    <ul>
      <template v-for="(item, index) in navItems" :key="index">
        <van-button
          v-if="item.show"
          plain
          type="primary"
          size="small"
          :id="item.path"
          @click="handleAction('/' + item.path)"
        >
          {{ $t(item.labelKey) }}
        </van-button>
      </template>
    </ul>
  </nav>

  <router-view v-slot="{ Component }">
    <keep-alive :max="1">
      <component v-if="route.meta.keepAlive" :is="Component" :key="route.fullPath" />
    </keep-alive>
    <component v-if="!route.meta.keepAlive" :is="Component" :key="route.fullPath" />
  </router-view>
</template>

<script setup>
import { getCurrentInstance, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { Button as VanButton, DropdownItem as VanDropdownItem, DropdownMenu as VanDropdownMenu, Icon as VanIcon } from 'vant';
import $$ from '@App/$$';
import i18n, { languageOptions, setLocale } from '@/i18n';

const route = useRoute();
const router = useRouter();
const { t: $t } = useI18n();
const instance = getCurrentInstance();

const navItems = [
  { labelKey: 'nav.getWalletAddress', path: 'getWalletAddress', show: true },
  { labelKey: 'nav.mint', path: 'mint', show: true },
  { labelKey: 'nav.lock', path: 'lock', show: true },
  { labelKey: 'nav.lockRole', path: 'lockRole', show: true },
  { labelKey: 'nav.unlock', path: 'unlock', show: true },
  { labelKey: 'nav.pic', path: 'pic', show: false },
];
const env = $$.prod;
const locale = ref(i18n.global.locale.value);

const handleLanguageChange = (value) => {
  locale.value = setLocale(i18n, value);
  document.title = route.meta.title ? $t(route.meta.title) : $t('app.title');
};

const handleAction = (url) => {
  if (url === 'close') {
    window.location.href = 'uniwebview://close?t=' + new Date().valueOf();
    return;
  }
  router.push(url);
};

onMounted(() => {
  const html = document.documentElement;
  html.classList.add($$.ENV.env, $$.prod);
  html.setAttribute('sys', process.env.sysName);
  instance?.proxy?.$root?.loading?.(false);
});
</script>

<style scoped>
nav { padding:0 0 10px; border-bottom:2px solid #07c160; margin:0 0 15px }
.navHead { justify-content: space-between; gap: 12px; padding-right: 44px; }
.navHead h2 { margin: 0 0 10px; line-height: 32px; font-size: 22px; }
.languageMenu { min-width: 128px; --van-dropdown-menu-title-font-size: 14px; --van-dropdown-menu-title-text-color: #323233; }
.languageMenu :deep(.van-dropdown-menu__bar) { height: 40px; box-shadow: none; background: #fff; }
.languageMenu :deep(.van-dropdown-menu__title) { max-width: 100%; }
nav ul { margin: 0; padding: 0; }
nav ul button { margin: 5px 10px 5px 0; }
.close { position:absolute; right:5px; top:5px; font-size:40px; color:#f00; cursor: pointer; z-index: 1000; }
</style>
