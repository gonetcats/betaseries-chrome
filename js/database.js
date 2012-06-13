// Generated by CoffeeScript 1.3.1
var DB;

DB = {
  init: function() {
    var badge, options, version;
    badge = {
      value: 0,
      type: 'membersEpisodes'
    };
    options = {
      badge_notification_type: 'watched',
      dl_srt_language: 'VF',
      display_global: false,
      enable_ratings: true,
      max_height: 200
    };
    this.set('badge', badge, true);
    this.set('historic', [], false);
    this.set('options', options, true);
    this.set('views', {}, true);
    version = this.get('version', null);
    if (version === null) {
      return this.set('version', Fx.getVersion(), true);
    }
  },
  get: function(field, defaultValue) {
    if ((localStorage[field] != null) && localStorage[field] !== 'undefined') {
      return JSON.parse(localStorage[field]);
    } else {
      return defaultValue;
    }
  },
  set: function(field, value, init) {
    if (!init || (init && !localStorage[field])) {
      return localStorage[field] = JSON.stringify(value);
    }
  },
  remove: function(field) {
    return localStorage.removeItem(field);
  },
  removeAll: function() {
    return localStorage.clear();
  }
};
