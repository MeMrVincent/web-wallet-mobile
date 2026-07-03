import { createApp } from 'vue';
import App from './App.vue';
/** Global utility methods and classes **/
import $$ from './$$';
/** Global router **/
import router from './router';
import i18n from '@/i18n';
import 'vant/es/toast/style';
import 'vant/es/dropdown-menu/style';
import 'vant/es/dropdown-item/style';

const app = createApp(App);
app.use(router);
app.use(i18n);
app.config.globalProperties.$$ = $$;
app.config.globalProperties.$router = router;
app.mount('#app');
