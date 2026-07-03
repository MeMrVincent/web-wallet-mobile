/** Sync or async component loader **/
const Async = {
  /** Import content synchronously **/
  ReleaseFile: function(type, TEXT, name, version, isSameName, selected){
    if(type === 'js'){
      if(isSameName){ /** Already loaded **/
        selected.text = TEXT;
        selected.setAttribute('version', version);
      }else{ /** Not loaded **/
        let js = document.createElement('script');
        js.setAttribute('name', name);
        js.setAttribute('version', version);
        js.type = 'text/javascript';
        js.text = TEXT;
        document.querySelector('body').appendChild(js);
      }
    }else{
      if(isSameName){
        selected.cssText = TEXT;
        selected.setAttribute('version', version);
      }else{
        let css = document.createElement('link');
        css.setAttribute('name', name);
        css.setAttribute('version', version);
        css.rel = 'stylesheet';
        css.type = 'text/css';
        css.cssText = TEXT;
        document.querySelector('head').appendChild(css);
      }
    }
  },
  /** Import file asynchronously **/
  InsertURL: function(type, url, name, version, isSameName, selected){
    if(isSameName){
      selected.remove();
    }
    if(type === 'js'){
      let js = document.createElement('script');
      js.setAttribute('name', name);
      js.setAttribute('version', version);
      js.type = 'text/javascript';
      js.src = url;
      //script.async = "async";
      //script.defer = "defer";
      document.querySelector('body').appendChild(js);
    }else{
      let css = document.createElement('link');
      css.setAttribute('name', name);
      css.setAttribute('version', version);
      css.href = url;
      css.rel = 'stylesheet';
      css.type = 'text/css';
      document.querySelector('head').appendChild(css);
    }
  },
  /** Validate ajax result **/
  ajaxResult: function(type, res, name, version, isSameName, selected, url){
    if(res.readyState === 4){
      if(res.status === 200 || res.status === 304){
        Async.ReleaseFile(type, res.responseText, name, version, isSameName, selected);
      }else{
        alert( 'Request Error: '+url+', Error Msg: '+res.statusText+', Error Code: '+res.status);
      }
    }
  },
  /** Synchronous ajax loader **/
  callAjax: function(type, url, name, version, isSameName, selected){
    if(window.jQuery){
      /** Parameters accepted after dataType:
             1. "xml": Returns XML document, can be processed by jQuery.
             2. "html": Returns plain text HTML; script tags inside will be executed when inserted to DOM.
             3. "script": Returns plain text JavaScript code. Does not cache by default unless "cache" parameter is set. Note: In remote requests (different domains), all POST requests will be converted to GET requests (loaded via script tags).
             4. "json": Returns JSON data.
             5. "jsonp": JSONP format. When calling function via JSONP like "myurl?callback=?", jQuery replaces ? automatically.
             6. "text": Returns plain text string.
             7. "local": Returns local data (load local display styles in initialization without server data).
             **/
      jQuery.ajax({
        type: 'GET',
        url: url,
        async: false,
        dataType: 'text',
        success: function(result){
          Async.ReleaseFile(type, result, name, version, isSameName, selected);
        },
        error: function(result){
          Async.ajaxResult(type, result, name, version, isSameName, selected, url);
        },
      });
    }else{
      let xhr = new XMLHttpRequest() || new ActiveXObject('Msxml2.XMLHTTP') || new ActiveXObject('Microsoft.XMLHTTP');
      xhr.onreadystatechange = function(){
        Async.ajaxResult(type, xhr, name, version, isSameName, selected, url);
      };
      xhr.open('GET', url, false);
      xhr.send(null);
    }
  },
  /** Initial validation of component **/
  Load: function(type, name, version, url, loadType, isCache){
    let isSameName = false, isSameVersion = false, Array = [], selected;
    if(type === 'js'){
      Array = document.querySelectorAll('script');
    }else if(type === 'css'){
      Array = document.querySelectorAll('link');
    }
    for(let i=0;i<Array.length;i++){
      if(Array[i].getAttribute('name') === name){
        isSameName = true;
        if(Array[i].getAttribute('version') === version) {
          isSameVersion = true;
        }
        selected = Array[i];
        break;
      }
    }
    if(isSameName && isSameVersion){
      return false;
    }
    if(isCache){
      url = url + '?t=' + new Date().valueOf();
    }
    if(loadType === 'link'){
      Async.InsertURL(type, url, name, version, isSameName, selected);
    }else if(loadType === 'release'){
      Async.callAjax(type, url, name, version, isSameName, selected);
    }
  },
};

export default Async;
