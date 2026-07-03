/** Unified JS for PC and mobile **/
import getURLParam from '@utils/getURLParam';
import mitt from 'mitt';
import getStringParam from '@utils/getStringParam';
import userPlatInfo from '@utils/userPlatInfo';
import unityBridge from '@utils/unity.bridge';
import Async from '@utils/Async';
import Obj2String from '@utils/Obj2String';

/** Global string replacement **/
String.prototype.replaceAll = function (s1, s2) {
  return this.replace(new RegExp(s1, 'gm'), s2);
};
/** Get all Chinese characters in the string, return array **/
String.prototype.len = function () {
  // eslint-disable-next-line no-control-regex
  return this.match(/[^\x00-\xff]/g);
};

const $$ = {
  /** Main domain URLs **/
  apiURLS: {
    staticURL: process.env.staticURL,
    appId: Number(process.env.appId),
    infuraId: process.env.infuraId,
    ERCType: process.env.ERCType,
    nftContract: process.env.nftContract,
    targetContract: process.env.targetContract,
    targetChain: Number(process.env.targetChain),
  },
  /** APP execution environment parameters **/
  prod: process.env.prod,
  init: () => {
    $$.ENV = userPlatInfo();
    sessionStorage.userInfo = JSON.stringify($$.userInfo);
    /** unity bridge **/
    if(process.env.bridge === 'unity'){
      window.unityBridge = $$.$bridge = unityBridge;
    }
    /** native bridge **/
    if(process.env.bridge === 'cocos'){
      Async.Load('js', 'dsBridge', '1.0.0', process.env.staticURL + 'static/js/dsBridge.1.0.0.js', 'release', false);
      $$.$bridge = window.dsBridge;
    }
  },
  $bridge: null,
  userInfo: { }, /** User information **/
  ENV: null,
  routers: null, /** Global router **/
  $broadcast: mitt(),
  getURLParam,
  getStringParam,
  Async,
  Obj2String,
  $: (selector) => {
    return document.querySelector(selector)
  }, /** General selector, single element **/
  $$: (selector) => {
    return document.querySelectorAll(selector)
  }, /** General selector, multiple elements **/
  $copy: (obj) => {
    return JSON.parse(JSON.stringify(obj));
  },
  loadStepsErr(vm, index, msg){
    vm.$refs.stepRef.steps.list[index].label += msg;
    vm.$refs.stepRef.steps.list[index].error = true;
    vm.$refs.stepRef.steps.error += 1;
  },
};

$$.init();

export default $$;
