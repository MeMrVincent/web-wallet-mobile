import Obj2String from '@utils/Obj2String';

const unityBridge = {
  cb: null,
  // eslint-disable-next-line no-unused-vars
  call: function(method, args, cb){
    this.cb = cb || undefined;
    if(this.cb){
      args.callBack = 'needCallBack';
    }
    let url = 'uniwebview://'+method;
    /** Call native methods inside App **/
    if(method === 'getNative'){
      url += Obj2String(args);
      /** Call native close window, call('getNative', { type: 'closeH5' }) **/
      if(args?.type === 'closeH5'){
        //window.location.href = 'uniwebview://getNative?type=closeH5';
        window.location.href = url;
      }
      /** Call native go back **/
      if(args?.type === 'goBack'){
        //window.location.href = 'uniwebview://getNative?type=goBack';
        window.location.href = url;
      }
      /** Call native save image, call('getNative', { type: 'saveImg', params:{type:'base64/http', url:'xxxxx', w: width, h: height, name:'xxxx'} }, R=> { callback }) **/
      if(args?.type === 'saveImg'){
        //window.location.href = 'uniwebview://getNative?type=saveImg';
      }
      /** Screen snapshot **/
      if(args?.type === 'screenShot'){
        //window.location.href = 'uniwebview://getNative?type=screenShot&callBack='+args.callBack;
        window.location.href = url;
      }
      /** Call native screen orientation **/
      if(args?.type === 'orientation'){
        //window.location.href = 'uniwebview://getNative?type=orientation&callBack='+args.callBack;
        window.location.href = url;
      }
    }
    /** Get user information **/
    if(method === 'getUserInfo'){
      /** Router intercept, get user login info, call('getUserInfo', { type: 'loginInfo' }, R=>{ callback }), R = { success: true, data: { email: '', token: '' }} **/
      if(args?.type === 'loginInfo'){
        console.log('getUserInfo.loginInfo', JSON.stringify(args));
        window.location.href = url + '?type=loginInfo&callBack='+args.callBack;
      }
    }
    /** Notify App to set user information **/
    if(method === 'setUserInfo'){
      url += Obj2String({ type: args.type, ...args.params, callBack: args.callBack });
      /** Sync user login info back to App, call('setUserInfo', { type: 'loginInfo', params: { email: '', token: '' } }, (R)=>{ callback }), R = { success: true, data: null } **/
      if(args?.type === 'loginInfo'){
        console.log('setUserInfo.loginInfo', JSON.stringify(args));
        //window.location.href = 'uniwebview://setUserInfo'+this.Obj2String({ type: args.type, ...args.params, callBack: args.callBack });
        window.location.href = url;
      }
      /** Return Telegram binding data to App, call('setUserInfo', { type: 'tg', params: { bindStatus:true } }, (R)=>{ callback }), R = { success: true, data: null} **/
      if(args?.type === 'tg'){
        console.log('setUserInfo.tg', JSON.stringify(args));
        //window.location.href = 'uniwebview://setUserInfo'+this.Obj2String({ type: args.type, ...args.params, callBack: args.callBack });
        window.location.href = url;
      }
      /** Return Discord binding data to App, call('setUserInfo', { type: 'discord', params: { bindStatus:true } }, (R)=>{ callback }), R = { success: true, data: null} **/
      if(args?.type === 'discord'){
        console.log('setUserInfo.discord', JSON.stringify(args));
        //window.location.href = 'uniwebview://setUserInfo'+this.Obj2String({ type: args.type, ...args.params, callBack: args.callBack });
        window.location.href = url;
      }
    }
  },
  needCallBack: function(obj){
    console.log(obj);
    return this.cb(obj);
  },
};

export default unityBridge;
