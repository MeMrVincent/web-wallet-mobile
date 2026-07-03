import { createRouter, createWebHashHistory } from 'vue-router';
import pathList from './pathList';
import $$ from '@App/$$'; /** Custom methods and classes **/
import i18n from '@/i18n';

const router = createRouter({
  history: createWebHashHistory(),
  routes: pathList,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      if (from.meta.keepAlive) {
        from.meta.savedPosition = document.body.scrollTop;
      }
      return {
        left: 0,
        top: to.meta.savedPosition || 0,
      }
    }
  },
});

$$.routers = router;

/** Before route enter **/
router.beforeEach((to) => {
  if (to.meta.title) {
    document.title = i18n.global.t(to.meta.title);
  }
});


router.afterEach(() => {
  document.documentElement.scrollTop = 0;
  if (window.onscroll) {
    window.onscroll = null;
  }
  if (window.setInterval) {
    window.clearInterval;
  }
  if (window.onresize) {
    window.onresize = null;
  }
});


export default router;

