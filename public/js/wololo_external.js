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
    },

    view: function(key, opts) {
      opts = opts || {};
      var cat_key = opts['category_key'];

      var url = HOST + '/' + this.name + '/viewing?key=' + key;
      if (cat_key) {
        url += '&category_key=' + cat_key;
      }

      get(url, function(xmldoc) {
        var resp = JSON.parse(xmldoc.response);
        alert(resp.count);
      });
    },

    getCount: function(name, key) {

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
})();

