// This file served on external partner sites.

!(function() {
  'use strict';
  var HOST = window.location.href.indexOf('localhost') > -1 ?
    'http://localhost:14000' : '//www.wololo.io';
  if (window.wololo) {
    throw 'Could not load wololo - do you already have it on the page?';
    return;
  }

  window.wololo = {
    name: 'unknown',

    init: function(account, useCustomCss) {
      this.name = account;
      if (!useCustomCss) {
        loadCss(HOST + '/styles/lib/libnotify.css');
      }
    },

    view: function(key, opts) {
      opts = opts || {};
      var cat_key = opts['category_key'];

      var url = HOST + '/' + this.name + '/viewing?key=' + key;
      if (cat_key) {
        url += '&category_key=' + cat_key;
      }

      var script = document.createElement('script');
      script.src = url;
      document.getElementsByTagName('head')[0].appendChild(script);

      var promiseCallback = null;
      // TODO there is a race condition here.
      window.wololoCb = function(resp) {
        if (promiseCallback) {
          promiseCallback(resp.count);
        }
      }

      return {
        then: function(userSuppliedCallback) {
          promiseCallback = userSuppliedCallback;
        }
      };
    },

    showMessage: function(msg) {
      humane.log(msg, { timeout: 3000 });
    }
  };

  function get(url, callback) {
    if (!window.XMLHttpRequest) {
      // We don't support old versions of IE.
      return;
    }

    var xmlDoc = new XMLHttpRequest();
    xmlDoc.open('GET', url, true);
    xmlDoc.onreadystatechange = function() {
      if (xmlDoc.readyState === 4 && xmlDoc.status === 200) {
        callback(xmlDoc);
      }
    }
    xmlDoc.send();
  }

  function loadCss(url) {
    var cssId = 'wololo-' + (+new Date());
    if (!document.getElementById(cssId)) {
      var head  = document.getElementsByTagName('head')[0];
      var link  = document.createElement('link');
      link.id   = cssId;
      link.rel  = 'stylesheet';
      link.type = 'text/css';
      link.href = url;
      link.media = 'all';
      head.appendChild(link);
    }
  }
})();

