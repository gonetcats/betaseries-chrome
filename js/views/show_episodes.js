// Generated by CoffeeScript 1.6.2
var View_ShowEpisodes,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

View_ShowEpisodes = (function() {
  function View_ShowEpisodes() {
    this.init = __bind(this.init, this);
  }

  View_ShowEpisodes.prototype.init = function(url) {
    var _ref;

    this.id = 'ShowEpisodes.' + url;
    this.url = '/shows/episodes/' + url;
    this.episodes = DB.get('show.' + url + '.episodes');
    this.show = url;
    this.name = 'ShowEpisodes';
    this.params = '&summary=1&hide_notes=1';
    this.root = 'seasons';
    return this.login = (_ref = DB.get('session')) != null ? _ref.login : void 0;
  };

  View_ShowEpisodes.prototype.update = function(data) {
    var e, i, j, n, seasons, showEpisodes, shows, _ref;

    shows = DB.get('member.' + this.login + '.shows', {});
    if (this.show in shows) {
      shows[this.show].archive = false;
    } else {
      shows[this.show] = {
        url: this.show,
        archive: false,
        hidden: false
      };
    }
    showEpisodes = DB.get('show.' + this.show + '.episodes', {});
    for (i in data) {
      seasons = data[i];
      _ref = seasons.episodes;
      for (j in _ref) {
        e = _ref[j];
        n = Fx.splitNumber(e.number);
        showEpisodes[e.global] = {
          comments: e.comments,
          date: e.date,
          downloaded: e.downloaded === '1',
          episode: n.episode,
          global: e.global,
          number: e.number,
          season: n.season,
          title: e.title,
          show: this.show,
          url: this.show
        };
        if (e.downloaded !== '-1') {
          showEpisodes[e.global].downloaded = e.downloaded === '1';
        }
      }
    }
    DB.set('show.' + this.show + '.episodes', showEpisodes);
    return DB.set('member.' + this.login + '.shows', shows);
  };

  View_ShowEpisodes.prototype.content = function() {
    var classHidden, data, e, episodes, hidden, i, lastSeason, nbrEpisodes, output, s, season, seasons, shows, start;

    data = DB.get('show.' + this.show + '.episodes', null);
    if (!data) {
      return Fx.needUpdate();
    }
    episodes = DB.get('member.' + this.login + '.episodes', null);
    if (!episodes) {
      return Fx.needUpdate();
    }
    shows = DB.get('member.' + this.login + '.shows', null);
    if (!shows) {
      return Fx.needUpdate();
    }
    s = shows[this.show];
    seasons = {};
    lastSeason = -1;
    nbrEpisodes = 0;
    for (i in data) {
      e = data[i];
      nbrEpisodes++;
      lastSeason = e.season;
      if (e.season in seasons) {
        seasons[e.season]++;
      } else {
        seasons[e.season] = 1;
      }
    }
    start = this.show in episodes ? episodes[this.show].start : nbrEpisodes;
    output = '<div id="' + this.show + '" class="show" start="' + start + '">';
    season = -1;
    for (i in data) {
      e = data[i];
      hidden = e.season !== lastSeason;
      classHidden = hidden ? ' hidden' : '';
      if (e.season !== season) {
        if (season !== -1) {
          output += '</div>';
        }
        output += '<div class="season' + classHidden + '" id="season' + e.season + '">';
        output += Content.season(e.season, seasons[e.season], hidden);
        season = e.season;
      }
      output += Content.episode(e, s.title, hidden, start);
    }
    output += '</div></div>';
    return output;
  };

  View_ShowEpisodes.prototype.listen = function() {
    $('.ShowEpisodes').on('click', '.toggleSeason', function() {
      var hidden, season;

      season = $(this).closest('.season');
      hidden = $(season).hasClass('hidden');
      $(season).toggleClass('hidden');
      $(season).find('.episode').slideToggle();
      if (hidden) {
        $(this).attr('src', '../img/arrow_down.gif');
      } else {
        $(this).attr('src', '../img/arrow_right.gif');
      }
      return Fx.updateHeight();
    });
    $('.ShowEpisodes').on('click', '.watched', function() {
      var e, episode, es, login, newStart, params, s, season, show, start, _ref;

      s = $(this).closest('.show');
      show = s.attr('id');
      start = parseInt(s.attr('start'));
      e = $(this).closest('.episode');
      newStart = parseInt(e.attr('global')) + 1;
      s.attr('start', newStart);
      season = e.attr('season');
      episode = e.attr('episode');
      login = DB.get('session').login;
      es = DB.get('member.' + login + '.episodes');
      if ((_ref = !show, __indexOf.call(es, _ref) >= 0)) {
        es[show] = {};
      }
      es[show].start = "" + newStart;
      es[show].nbr_total += start - newStart;
      if (es[show].nbr_total === 0) {
        delete es[show];
      }
      $('.show').find('.episode').each(function(i) {
        if ($(this).attr('global') <= newStart - 1) {
          return $(this).find('.watched').attr('src', '../img/tick.png').css('opacity', 0.5);
        } else {
          return $(this).find('.watched').attr('src', '../img/empty.png');
        }
      });
      params = "&season=" + season + "&episode=" + episode;
      return ajax.post("/members/watched/" + show, params, function() {
        var badge_notification_type;

        DB.set('member.' + login + '.episodes', es);
        Cache.force('MemberTimeline');
        badge_notification_type = DB.get('options').badge_notification_type;
        if (badge_notification_type === 'watched') {
          return Badge.search_episodes();
        }
      }, function() {
        return registerAction("/members/watched/" + show, params);
      });
    });
    $('.ShowEpisodes').on('mouseenter', '.watched', function() {
      var e;

      e = $(this).closest('.episode');
      return e.find('.watched').attr('src', '../img/arrow_right.png').css('opacity', 1);
    });
    $('.ShowEpisodes').on('mouseleave', '.watched', function() {
      var e, start;

      start = parseInt($(this).closest('.show').attr('start'));
      e = $(this).closest('.episode');
      if (e.attr('global') < start) {
        return e.find('.watched').attr('src', '../img/tick.png').css('opacity', 0.5);
      } else {
        return e.find('.watched').attr('src', '../img/empty.png');
      }
    });
    $('.ShowEpisodes').on('click', '.display_episode', function() {
      var episode, global, season, url;

      event.preventDefault();
      url = $(this).attr('url');
      season = $(this).attr('season');
      episode = $(this).attr('episode');
      global = $(this).attr('global');
      return app.view.load('Episode', url, season, episode, global);
    });
    $('.ShowEpisodes').on('click', '.display_comments', function() {
      var episode, global, season, url;

      event.preventDefault();
      url = $(this).attr('url');
      season = $(this).attr('season');
      episode = $(this).attr('episode');
      global = $(this).attr('global');
      return app.view.load('EpisodeComments', url, season, episode, global);
    });
    $('.ShowEpisodes').on('click', '.downloaded', function() {
      var downloaded, e, episode, es, global, params, s, season, show;

      s = $(this).closest('.show');
      show = s.attr('id');
      e = $(this).closest('.episode');
      season = e.attr('season');
      episode = e.attr('episode');
      global = e.attr('global');
      es = DB.get('show.' + show + '.episodes');
      downloaded = es[global].downloaded;
      es[global].downloaded = !downloaded;
      DB.set('show.' + show + '.episodes', es);
      if (downloaded) {
        $(this).attr('src', '../img/folder_off.png');
      } else {
        $(this).attr('src', '../img/folder.png');
      }
      params = "&season=" + season + "&episode=" + episode;
      return ajax.post("/members/downloaded/" + show, params, function() {
        var badge_notification_type, downloaded_episodes;

        badge_notification_type = DB.get('options').badge_notification_type;
        if (badge_notification_type === 'downloaded') {
          downloaded_episodes = DB.get('badge').downloaded_episodes;
          if (es[global].downloaded) {
            downloaded_episodes--;
          } else {
            downloaded_episodes++;
          }
          return Badge.set('downloaded_episodes', downloaded_episodes);
        }
      }, function() {
        return registerAction("/members/downloaded/" + show, params);
      });
    });
    return $('.ShowEpisodes').on('click', '.subs', function() {
      Fx.openTab($(this).attr('link'));
      return false;
    });
  };

  return View_ShowEpisodes;

})();
