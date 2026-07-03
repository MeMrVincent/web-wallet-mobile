const qs = require('qs');
import { showFailToast } from 'vant';
import { checkStatus } from './checkStatus';
import i18n from '@/i18n';

const $t = i18n.default?.global?.t || i18n.global?.t;

const Err = (err, fn) => {
  let msg = $t('checkStatus.default');
  showFailToast(msg);
  err = { msg, code: -1 };
  return fn(err);
};

const getHeaders = (req, headers, params, url) => {
  let userInfo = sessionStorage.userInfo ? JSON.parse(sessionStorage.userInfo) : {};
  let token = userInfo.token || null;
  headers = headers || {};
  if (token) {
    headers = { ...headers, token };
  }
  params = params || {};
  params._t = params._t || new Date().valueOf().toString();

  if (req.method.toLowerCase() === 'get') {
    req.params = params;
  }
  if (req.method.toLowerCase() === 'post') {
    req.data = params;
  }
  if (headers.responseType) {
    req.responseType = headers.responseType;
    delete headers.responseType;
  }
  req.headers = headers;
  req.url = url;
  return { Req: req };
};

const resNext = (R, resolve) => {
  checkStatus(R.status, $t);
  resolve(R.data || {});
};

/** Wrap json static file request **/
export const getStaticJSON = (url) => {
  return new Promise((resolve, reject) => {
    window.axios({
      method: 'get',
      url: url,
      dataType: 'json',
      cache: false,
    }).then(res => {
      resolve(res);
    }).catch(err => {
      return Err(err, reject);
    });
  });
};

const API = (method, url, params, headers) => {
  const headerResult = getHeaders({ method }, headers, params, url);
  if (!headerResult) {
    return Promise.resolve({ code: 401, errcode: 401 });
  }
  const { Req } = headerResult;
  return new Promise((resolve) => {
    window.axios(Req).then(res => {
      if (res.status === 200) {
        if (res.data) {
          resolve(res.data);
        } else {
          return Err(res, resolve);
        }
      } else {
        return resNext(res, resolve);
      }
    }).catch(err => {
      const status = err?.response?.status || err?.request?.status || err?.status;
      checkStatus(status, $t);
      return Err(err, resolve);
    });
  });
};

export const formPost = (url, params) => {
  return new Promise((resolve, reject) => {
    let headers = {};
    let userInfo = sessionStorage.userInfo ? JSON.parse(sessionStorage.userInfo) : {};
    let token = userInfo.token || null;
    if (token) {
      headers.token = token;
    }
    if (params && params.header) {
      headers = Object.assign(headers, params.header);
      delete params.header;
    }
    headers['Content-Type'] = 'application/x-www-form-urlencoded';
    window.axios({
      method: 'POST',
      url: url,
      data: qs.stringify(params),
      headers: headers,
    }).then(res => {
      if (res.status === 200) {
        if (res.data) {
          resolve(res.data);
        } else {
          return resNext(res, resolve);
        }
      } else {
        return resNext(res, resolve);
      }
    }).catch(err => {
      const status = err?.response?.status || err?.request?.status || err?.status;
      checkStatus(status, $t);
      return Err(err, reject);
    });
  });
};

export const getApi = (url, params, headers = {}) => {
  return API('GET', url, params, headers);
};

export const postApi = (url, params, headers = {}) => {
  return API('POST', url, params, headers);
};
