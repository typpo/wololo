// This file served on external partner sites.

!(function() {
  'use strict';
  var HOST = window.location.href.indexOf('localhost') > -1 ?
    'http://localhost:14000' : 'http://wololo.io';
  if (window.wololo) {
    throw 'Could not load wololo - do you already have it on the page?';
    return;
  }

  window.wololo = {
    name: 'unknown',

    init: function(account) {
      this.name = account;
      loadCss('http://localhost:14000/styles/lib/libnotify.css');
    },

    view: function(key, opts) {
      opts = opts || {};
      var cat_key = opts['category_key'];

      var url = HOST + '/' + this.name + '/viewing?key=' + key;
      if (cat_key) {
        url += '&category_key=' + cat_key;
      }

      var promiseCallback = null;
      get(url, function(xmldoc) {
        var resp = JSON.parse(xmldoc.response);
        if (promiseCallback) {
          promiseCallback(resp.count);
        }
      });

      return {
        then: function(userSuppliedCallback) {
          promiseCallback = userSuppliedCallback;
        }
      };
    },

    showMessage: function(msg) {
      humane.log(msg);
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

