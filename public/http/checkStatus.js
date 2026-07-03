import { showFailToast } from 'vant';

export const checkStatus = (status, $t) => {
  let msg = $t('checkStatus.' + status) || $t('checkStatus.default');
  console.log('error status==>', status, msg);
  showFailToast({
    message: msg,
    duration: 2000,
  });
};
