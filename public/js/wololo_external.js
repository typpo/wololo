// This file served on external partner sites.

!(function() {
  'use strict';
  var HOST = 'http://wololo.com';
  if (window.wololo) {
    throw 'Could not load wololo - do you already have it on the page?';
    return;
  }

  window.wololo = {
    record: function(name, key, opts) {
      //var name = opts['name'] || 'view';
      var cat_key = opts['cat_key'];

      var url = HOST + '/viewing?key=' + key;
      if (cat_key) {
        url += '&cat_key=' + cat_key;
      }

      get(url, function(xmldoc) {
        // ...
      });
    },
  };

  function get(url, callback) {
    if (!window.XMLHttpRequest) {
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

