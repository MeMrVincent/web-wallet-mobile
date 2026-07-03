/** Get user device information **/
import getStringParam from '@utils/getStringParam';

const GetUserDeviceInformation = {
  // Global telemetry parameters
  UA: '',
  UAList: [],
  data: {},

  // Fast one-click parsing finalized results
  get: function(obj) {
    return this.init(obj)
      .detectOS()
      .detectBrowser()
      .applyOverrides()
      .getInfo();
  },

  // Initialize data schema and cache UserAgent queries
  init: function(obj) {
    this.UA = navigator.userAgent.toLowerCase();
    this.UAList = this.UA.split(' ');
    this.data = {
      appMode: 'browser', // app / browser / WX / TG / LINE
      appVersion: process.env.appVersion || '', // current app version
      appType: 'web', // app / game / web
      appName: '', // platform / gameName
      equipment: '', // device name
      equipmentOS: '', // device system
      osVersion: '', // system version
      browser: '', // browser name
      browserVersion: '', // browser version
      env: '' // mobile / pc
    };
    if (obj) {
      Object.assign(this.data, obj);
    }
    return this;
  },

  // Detect hardware platform and OS (macOS, iPadOS desktop-mode, Windows, Android, Linux, iOS)
  detectOS: function() {
    let UA = this.UA;
    let data = this.data;

    // Apple Macintosh / iPad Desktop Mode
    if(UA.indexOf('macintosh') > -1){
      // iPad Safari in Desktop Mode triggers maxTouchPoints > 0
      if (navigator.maxTouchPoints && navigator.maxTouchPoints > 0) {
        data.equipment = 'IOS';
        data.equipmentOS = 'Ipad';
        data.osVersion = 'iPadOS';
        data.env = 'mobile';
      } else {
        data.equipment = 'Macintosh';
        data.equipmentOS = 'Mac OS X';
        let t = UA.indexOf('mac os x'), t1 = UA.indexOf(')');
        if (t > -1 && t1 > t) {
          data.osVersion = UA.slice(t+9, t1).replace('mac os x', '').replace(/_/g, '.').trim();
        } else {
          data.osVersion = 'Mac OS X';
        }
        data.env = 'pc';
      }
    }
    // Windows Desktop Platform
    else if(UA.indexOf('windows') > -1){
      data.equipment = 'Windows';
      let PcList = [
        { name: '5.0', OS: '2000', version: '2000' },
        { name: '5.1', OS: 'XP', version: 'Sp1 / Sp2' },
        { name: '5.2', OS: 'XP / 2003', version: 'XP Sp3 / Server 2003' },
        { name: '6.0', OS: 'Vista / 2008', version: 'Vista / Server 2008' },
        { name: '6.1', OS: '7 / 2008', version: '7 / Server 2008 R2' },
        { name: '6.2', OS: '8 / 2012', version: '8 / Server 2012' },
        { name: '6.3', OS: '8.1 / 2012', version: '8.1 / Server 2012 R2' },
        { name: '6.4', OS: '10', version: '6.4' },
        { name: '10.0', OS: '10', version: '10.0' },
        { name: '11.0', OS: '11', version: '11.0' },
      ];
      for(let i=0; i<PcList.length; i++){
        let win = 'windows nt ' + PcList[i].name;
        if(UA.indexOf(win) > -1){
          data.equipmentOS = 'Windows ' + PcList[i].OS;
          data.osVersion = 'Win' + PcList[i].version;
        }
      }
      if (data.equipmentOS === '') {
        data.equipmentOS = 'Windows';
        data.osVersion = 'Windows';
      }
      if(1024 >= document.documentElement.offsetWidth){
        data.env = 'mobile';
      }else{
        data.env = 'pc';
      }
    }
    // Android Mobile Platform
    else if(UA.indexOf('android') > -1){
      data.equipment = 'Android';
      let MList = UA.split(';');
      for(let i=0; i<MList.length; i++){
        if(MList[i].indexOf('android') > -1){
          data.equipmentOS = 'Android' + MList[i].slice(MList[i].indexOf('android'), MList[i].length).replace('android', '').replace(/\*|\_|\?/g, '.').replace(/\-|\+|\?/g, ' ');
        }
        if(MList[i].indexOf('build') > -1){
          data.osVersion = MList[i].slice(0, MList[i].indexOf('build')).replace(/\*|\_|\?/g, '.').replace(/\-|\/|\+|\?/g, ' ');
        }
      }
      data.env = 'mobile';
    }
    // Linux Desktop Platform (Exclusive from Android Linux mobile)
    else if(UA.indexOf('linux') > -1){
      data.equipment = 'Linux';
      data.equipmentOS = 'Linux';
      data.osVersion = 'Linux';
      if(1024 >= document.documentElement.offsetWidth){
        data.env = 'mobile';
      }else{
        data.env = 'pc';
      }
    }
    // iOS Mobile Platform (iPhone / iPad / iPod)
    else if(UA.match(/\(i[^;]+;( U;)? cpu.+mac os x/) || UA.indexOf('iphone') > -1 || UA.indexOf('ipad') > -1 || UA.indexOf('ipod') > -1){
      data.equipment = 'IOS';
      if(UA.indexOf('iphone') > -1){
        data.equipmentOS = 'Iphone';
      }else if(UA.indexOf('ipad') > -1){
        data.equipmentOS = 'Ipad';
      }else if(UA.indexOf('ipod') > -1){
        data.equipmentOS = 'Ipod';
      }else{
        data.equipmentOS = 'Iphone';
      }
      let t = UA.indexOf('cpu os'), t1 = UA.indexOf('like');
      if (t > -1 && t1 > t) {
        data.osVersion = UA.slice(t+6, t1-1).replace(/\*|\_|\?/g, '.').replace(/\-|\/|\+|\?/g, ' ').trim();
      } else {
        data.osVersion = data.equipmentOS + ' OS';
      }
      data.env = 'mobile';
    }

    return this;
  },

  // Detect browser applications and platforms (Telegram, LINE, WeChat, iOS variants, standard)
  detectBrowser: function() {
    let UA = this.UA;
    let data = this.data;

    let TestList = [
      // Social platforms
      { test: 'telegram', name: 'Telegram', get: 'telegram', appMode: 'TG' },
      { test: 'line/', name: 'LINE', get: 'line', appMode: 'LINE' },
      { test: 'micromessenger', name: 'WeXin', get: 'micromessenger', appMode: 'WX' },
      // iOS browsers
      { test: 'criopt', name: 'Chrome', get: 'criopt', appMode: 'browser' },
      { test: 'edgios', name: 'Edge', get: 'edgios', appMode: 'browser' },
      { test: 'fxios', name: 'FireFox', get: 'fxios', appMode: 'browser' },
      // Standalone browsers
      { test: 'tencenttraveler', name: 'TencentTraveler', get: 'tencenttraveler', appMode: 'browser' },
      { test: 'firefox', name: 'FireFox', get: 'firefox', appMode: 'browser' },
      { test: 'edge', name: 'Edge', get: 'edge', appMode: 'browser' },
      { test: 'bidubrowser', name: 'BaiDuBrowser', get: 'bidubrowser', appMode: 'browser' },
      { test: 'maxthon', name: 'Maxthon', get: 'maxthon', appMode: 'browser' },
      { test: 'qqbrowser', name: 'QQBrowser', get: 'qqbrowser', appMode: 'browser' },
      { test: 'opera', name: 'Opera', get: 'opera', appMode: 'browser' },
      { test: 'opr', name: 'Opera', get: 'opr', appMode: 'browser' },
      { test: 'presto', name: 'Opera', get: 'version', appMode: 'browser' },
      { test: '360se', name: '360SE', get: '360se', appMode: 'browser' },
      { test: '360ee', name: '360EE', get: '360ee', appMode: 'browser' },
      { test: 'metasr', name: 'SoGou', get: 'metasr', appMode: 'browser' },
      { test: 'se', name: 'SoGou', get: 'se', appMode: 'browser' },
      { test: 'the world', name: 'The World', get: 'the world', appMode: 'browser' },
      { test: 'theworld', name: 'The World', get: 'theworld', appMode: 'browser' },
      { test: 'uc', name: 'UC', get: 'uc', appMode: 'browser' },
      { test: 'ubrowser', name: 'UC', get: 'ubrowser', appMode: 'browser' },
      { test: 'lbbrowser', name: 'LBBrowser', get: 'lbbrowser', appMode: 'browser' },
      { test: 'version', name: 'Safari', get: 'version', appMode: 'browser' },
      { test: 'chrome', name: 'Chrome', get: 'chrome', appMode: 'browser' },
      { test: 'iemobile', name: 'IEMobile', get: 'iemobile', appMode: 'browser' },
      { test: 'trident/7.0', name: 'MSIE', get: 'rv:', appMode: 'browser' },
      { test: 'msie', name: 'MSIE', get: 'msie', appMode: 'browser' }
    ];

    let matched = false;
    for(let j=0; j<TestList.length; j++) {
      if (UA.indexOf(TestList[j].test) > -1) {
        data.browser = TestList[j].name;
        data.appName = TestList[j].get;
        data.appMode = TestList[j].appMode;
        this.getBrowserVersion(TestList[j].get);
        matched = true;
        break;
      }
    }

    if (!matched) {
      data.browser = 'Unknown';
      data.appName = 'Unknown';
      data.appMode = 'browser';
    }

    // Audit IE kernel compatibility
    if(UA.indexOf('trident') > -1 || UA.indexOf('msie') > -1){
      if(UA.indexOf('msie') > -1){
        this.getBrowserVersion('msie');
      }else if(UA.indexOf('trident') > -1){
        this.getBrowserVersion('rv');
      }
      data.browserVersion = 'IE' + (data.browserVersion || '');
    }

    return this;
  },

  // Helper method to extract browser version from UA token list safely
  getBrowserVersion: function(browser) {
    let UAList = this.UAList;
    let data = this.data;
    for(let k=0; k<UAList.length; k++){
      if(UAList[k].indexOf(browser) > -1){
        let cleanSegment = UAList[k].replace(/[;:)_/\-+*?]/g, '');
        data.browserVersion = cleanSegment.slice(cleanSegment.indexOf(browser) + browser.length);
        break;
      }
    }
  },

  // Apply cache retrieval and URL param override logic securely with JSON verification
  applyOverrides: function() {
    let data = this.data;
    let appVersion = '';
    let appMode = '';
    let appType = '';
    let appName = '';

    if(localStorage.app){
      try {
        let object = JSON.parse(localStorage.app);
        if (object && typeof object === 'object') {
          appVersion = object.appVersion || '';
          appMode = object.appMode || '';
          appType = object.appType || '';
          appName = object.appName || '';
        }
      } catch (e) {
        // Keep raw localStorage data intact for Native APP bridges
      }
    }

    if(!appVersion && !appMode && !appType && !appName){
      try {
        let url = decodeURIComponent(window.location.href);
        appVersion = getStringParam('appVersion', url);
        appMode = getStringParam('from', url) || getStringParam('appMode', url);
        appType = getStringParam('appType', url);
        appName = getStringParam('appName', url);
      } catch (e) {
        // Safe catch for decoding issues
      }
    }

    if(appVersion || appMode || appType || appName){
      const parsedOverride = { appVersion, appMode, appType, appName };
      for (let key in parsedOverride) {
        if (parsedOverride[key]) {
          data[key] = parsedOverride[key];
        }
      }
      try {
        localStorage.app = JSON.stringify({
          appVersion: data.appVersion,
          appMode: data.appMode,
          appType: data.appType,
          appName: data.appName
        });
      } catch (e) {
        // Bypass storage permissions errors
      }
    }

    return this;
  },

  // Return final formatted device information
  getInfo: function() {
    return this.data;
  }
};

const userPlatInfo = function(obj) {
  return GetUserDeviceInformation.get(obj);
};

export default userPlatInfo;
