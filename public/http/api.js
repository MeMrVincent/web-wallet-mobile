import { getStaticJSON, postApi } from './ajax';
import $$ from '@App/$$';

/** Get request URL configuration of environment **/
const $API = {
  /**========== General Business Start ========================================================================================**/
  /** Get static JSON file **/
  getStaticJsonFiles: params => {
    return getStaticJSON($$.apiURLS.staticURL + 'static/json/' + params + '?t=' + new Date().valueOf());
  },
  /** postAPI - DEMO, url parameters assembly
  postAPIDemo1: params => {
    return postApi(`${host}/xxxxx/xxxxx`, params);
  },**/
  /** postAPI - DEMO, body parameters assembly
  postAPIDemo2: params => {
    return postApi(`${host}/xxxxxx/xxxxxxx`, params)
  },**/
  /**getApi - DEMO
  getApI: params => {
    return getApi(`${host}/xxxxxx/xxxxx`, params);
  },**/
  /**formpost - DEMO
  formPostDemo: params => {
    return formPost(`${host}/xxxxxx/xxxx`, params);
  },**/
  postAPIDemo2: params => {
    return postApi('/api/images'+$$.Obj2String(params))
  },
};

export default $API;
