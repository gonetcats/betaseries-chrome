// Generated by CoffeeScript 1.3.3
var BS, menu;

menu = {
  show: function() {
    return $('.action').show();
  },
  hide: function() {
    return $('.action').hide();
  },
  hideStatus: function() {
    return $('#status').hide();
  },
  hideMenu: function() {
    return $('#menu').hide();
  }
};

BS = {
  currentView: null,
  load: function() {
    var args, force, o, outdated, sameView, time, views;
    args = Array.prototype.slice.call(arguments);
    o = BS[arguments[0]].apply(args.shift(), args);
    sameView = (this.currentView != null) && o.id === this.currentView.id;
    this.currentView = o;
    if (!sameView) {
      BS.display();
    }
    if (o.update != null) {
      $('#sync').show();
      time = (new Date().getDate()) + '.' + (new Date().getFullYear());
      views = DB.get('views', {});
      outdated = views[o.id] != null ? views[o.id].time !== time : true;
      force = views[o.id] != null ? views[o.id].force : true;
      if (outdated || force) {
        return BS.update();
      }
    } else {
      return $('#sync').hide();
    }
  },
  update: function() {
    var o, params;
    o = this.currentView;
    params = o.params || '';
    if (o.url != null) {
      return ajax.post(o.url, params, function(data) {
        var cache, time, views;
        cache = data.root[o.root];
        Cache.maintenance(data.root.code);
        time = (new Date().getDate()) + '.' + (new Date().getFullYear());
        views = DB.get('views', {});
        views[o.id] = {
          time: time,
          force: false
        };
        DB.set('views', views);
        o.update(cache);
        return BS.display();
      });
    } else {
      return o.update();
    }
  },
  display: function() {
    var nbr, o;
    o = this.currentView;
    Historic.save();
    document.getElementById('page').innerHTML = '';
    if (o.content) {
      $('#page').html(o.content());
    }
    nbr = Fx.checkNotifications();
    if (nbr > 0) {
      $('.notif').html(nbr).show();
    }
    $('#title').text(__('title_' + o.name));
    $('#page').removeClass().addClass(o.name);
    return Fx.updateHeight();
  },
  refresh: function() {
    var args;
    Fx.toUpdate(this.currentView.id);
    args = this.currentView.id.split('.');
    return BS.load.apply(BS, args);
  },
  showsDisplay: function(url) {
    return {
      id: 'showsDisplay.' + url,
      name: 'showsDisplay',
      url: '/shows/display/' + url,
      root: 'show',
      login: DB.get('session').login,
      show: url,
      update: function(data) {
        data.is_in_account = data.is_in_account === "1";
        data.archive = data.archive === "1";
        return DB.set('show.' + this.show, data);
      },
      content: function() {
        var data, genres, i, k, note, output, v, _i, _ref, _ref1;
        data = DB.get('show.' + this.show, null);
        if (!data) {
          return Fx.needUpdate();
        }
        output = '<div class="title">';
        output += '<div class="fleft200">' + data.title + '</div>';
        output += '<div class="fright200 aright">';
        if (data.note != null) {
          note = Math.floor(data.note.mean);
          for (i = _i = 1; 1 <= note ? _i <= note : _i >= note; i = 1 <= note ? ++_i : --_i) {
            output += '<img src="../img/star.gif" /> ';
          }
        }
        output += '</div>';
        output += '<div class="clear"></div>';
        output += '</div>';
        output += '<div>';
        output += '<div class="fleft200">';
        genres = [];
        _ref = data.genres;
        for (k in _ref) {
          v = _ref[k];
          genres.push(v);
        }
        output += genres.join(', ') + ' | ';
        if (data.status != null) {
          output += __(data.status.toLowerCase());
        }
        output += '</div>';
        output += '<div class="fright200 aright">';
        if (((_ref1 = data.note) != null ? _ref1.mean : void 0) != null) {
          output += data.note.mean + '/5 (' + data.note.members + ')';
        }
        output += '</div>';
        output += '</div>';
        if (data.banner != null) {
          output += '<img src="' + data.banner + '" width="290" height="70" alt="banner" style="margin-top: 10px;" />';
        }
        if (data.description != null) {
          output += '<div class="title2">' + __('synopsis') + '</div>';
          output += '<div style="margin-right:5px; text-align:justify;">' + data.description + '</div>';
        }
        output += '<div class="title2">' + __('actions') + '</div>';
        output += '<a href="" class="link display_episodes" url="' + data.url + '"><span class="imgSyncNo"></span>Voir les épisodes</a>';
        if (data.is_in_account && data.archive) {
          output += '<a href="#' + data.url + '" id="showsUnarchive" class="link">' + '<span class="imgSyncOff"></span>' + __('show_unarchive') + '</a>';
        } else if (data.is_in_account && !data.archive) {
          output += '<a href="#' + data.url + '" id="showsArchive" class="link">' + '<span class="imgSyncOff"></span>' + __('show_archive') + '</a>';
        }
        if (data.is_in_account) {
          output += '<a href="#' + data.url + '" id="showsRemove" class="link">' + '<span class="imgSyncOff"></span>' + __('show_remove') + '</a>';
        } else {
          output += '<a href="#' + data.url + '" id="showsAdd" class="link">' + '<span class="imgSyncOff"></span>' + __('show_add') + '</a>';
        }
        return output;
      }
    };
  },
  showsEpisodes: function(url) {
    return {
      id: 'showsEpisodes.' + url,
      name: 'showsEpisodes',
      url: '/shows/episodes/' + url,
      params: '&summary=1&hide_notes=1',
      root: 'seasons',
      login: DB.get('session').login,
      episodes: DB.get('show.' + url + '.episodes'),
      show: url,
      update: function(data) {
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
          }
        }
        DB.set('show.' + this.show + '.episodes', showEpisodes);
        return DB.set('member.' + this.login + '.shows', shows);
      },
      content: function() {
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
          output += Content.episode2(e, hidden, start);
        }
        output += '</div></div>';
        return output;
      }
    };
  },
  showsEpisode: function(url, season, episode, global) {
    return {
      id: 'showsEpisode.' + url + '.' + season + '.' + episode + '.' + global,
      name: 'showsEpisode',
      url: '/shows/episodes/' + url,
      params: '&season=' + season + '&episode=' + episode,
      root: 'seasons',
      episodes: DB.get('show.' + url + '.episodes'),
      show: url,
      global: global,
      update: function(data) {
        var e, ep, eps;
        e = data['0']['episodes']['0'];
        eps = this.episodes != null ? this.episodes : {};
        ep = this.global in eps ? eps[this.global] : {};
        if (e.comments != null) {
          ep.comments = e.comments;
        }
        if (e.date != null) {
          ep.date = e.date;
        }
        if (e.description != null) {
          ep.description = e.description;
        }
        if (e.downloaded != null) {
          ep.downloaded = e.downloaded;
        }
        if (e.episode != null) {
          ep.episode = e.episode;
        }
        if (e.global != null) {
          ep.global = e.global;
        }
        if (e.number != null) {
          ep.number = e.number;
        }
        if (e.screen != null) {
          ep.screen = e.screen;
        }
        if (e.show != null) {
          ep.show = e.show;
        }
        if (e.subs != null) {
          ep.subs = e.subs;
        }
        if (e.title != null) {
          ep.title = e.title;
        }
        ep.url = this.show;
        eps[this.global] = ep;
        DB.set('show.' + this.show + '.episodes', eps);
        return this.episodes = eps;
      },
      content: function() {
        var dl, e, i, n, nbr_subs, note, output, sub, title, _i, _ref, _ref1;
        if (!(((_ref = this.episodes) != null ? _ref[this.global] : void 0) != null)) {
          return Fx.needUpdate();
        }
        e = this.episodes[this.global];
        title = DB.get('options').display_global ? '#' + e.global + ' ' + e.title : e.title;
        output = '<div class="title">';
        output += '<div class="fleft200"><a href="" url="' + this.show + '" class="showtitle display_show">' + e.show + '</a></div>';
        output += '<div class="fright200 aright">';
        if (e.note != null) {
          note = Math.floor(e.note.mean);
          for (i = _i = 1; 1 <= note ? _i <= note : _i >= note; i = 1 <= note ? ++_i : --_i) {
            output += '<img src="../img/star.gif" /> ';
          }
        }
        output += '</div>';
        output += '<div class="clear"></div>';
        output += '</div>';
        output += '<div>';
        output += ' <div class="fleft200">';
        output += '  <span class="num">' + Fx.displayNumber(e.number) + '</span> ' + e.title;
        output += ' </div>';
        if (((_ref1 = e.note) != null ? _ref1.mean : void 0) != null) {
          output += ' <div class="fright200 aright">' + e.note.mean + '/5 (' + e.note.members + ')' + '</div>';
        }
        output += ' <div class="clear"></div>';
        output += '</div>';
        if (e.screen != null) {
          output += '<div style="height: 70px; overflow: hidden; margin-top: 10px;"><img src="' + e.screen + '" style="width: 290px; margin-top: -15px;" /></div>';
        }
        if (e.description != null) {
          output += '<div class="title2">' + __('synopsis') + '</div>';
          output += '<div style="text-align: justify; margin-right: 5px;">' + e.description + '</div>';
        }
        if ((e.subs != null) && Object.keys(e.subs).length > 0) {
          output += '<div class="title2">' + __('subtitles') + '</div>';
          nbr_subs = 0;
          for (n in e.subs) {
            sub = e.subs[n];
            output += '[' + sub.quality + '] ' + sub.language + ' <a href="" class="subs" title="' + sub.file + '" link="' + sub.url + '">' + Fx.subLast(sub.file, 20) + '</a> (' + sub.source + ')<br />';
            nbr_subs++;
          }
        }
        output += '<div class="title2">' + __('actions') + '</div>';
        output += '<a href="" url="' + e.url + '" season="' + e.season + '" episode="' + e.episode + '" global="' + e.global + '" class="link display_comments">';
        output += '<span class="imgSyncNo"></span>' + __('see_comments', e.comments) + '</a>';
        dl = e.downloaded ? 'mark_as_not_dl' : 'mark_as_dl';
        output += '<a href="" show="' + e.url + '" season="' + e.season + '" episode="' + e.episode + '" global="' + e.global + '" class="link downloaded">';
        output += '<span class="imgSyncOff"></span>' + __(dl) + '</a>';
        return output;
      }
    };
  },
  planningMember: function(login) {
    if (login == null) {
      login = DB.get('session').login;
    }
    return {
      id: 'planningMember.' + login,
      name: 'planningMember',
      url: '/planning/member/' + login,
      params: "&view=unseen",
      root: 'planning',
      login: login,
      update: function(data) {
        return DB.set('member.' + this.login + '.planning', data);
      },
      content: function() {
        var MAX_WEEKS, actualWeek, data, diffWeek, e, hidden, nbrEpisodes, output, plot, today, todayWeek, w, week;
        output = '';
        week = 100;
        MAX_WEEKS = 2;
        nbrEpisodes = 0;
        data = DB.get('member.' + this.login + '.planning', null);
        if (!data) {
          return Fx.needUpdate();
        }
        for (e in data) {
          today = Math.floor(new Date().getTime() / 1000);
          todayWeek = parseFloat(date('W', today));
          actualWeek = parseFloat(date('W', data[e].date));
          diffWeek = actualWeek - todayWeek;
          plot = data[e].date < today ? "orange" : "red";
          if (actualWeek !== week) {
            week = actualWeek;
            hidden = "";
            if (diffWeek < -1) {
              w = __('weeks_ago', [Math.abs(diffWeek)]);
            } else if (diffWeek === -1) {
              w = __('last_week');
            } else if (diffWeek === 0) {
              w = __('this_week');
            } else if (diffWeek === 1) {
              w = __('next_week');
            } else if (diffWeek > 1) {
              w = __('next_weeks', [diffWeek]);
            }
            if (diffWeek < -2 || diffWeek > 2) {
              hidden = ' style="display:none"';
            }
            if (nbrEpisodes > 0) {
              output += '</div>';
            }
            output += '<div class="week"' + hidden + '>';
            output += '<div class="title">' + w + '</div>';
          }
          output += '<div class="episode ' + date('D', data[e].date).toLowerCase() + '">';
          output += '<div url="' + data[e].url + '" season="' + data[e].season + '" episode="' + data[e].episode + '" class="left">';
          output += '<img src="../img/empty.png" width="11" /> ';
          output += '<span class="num">' + Fx.displayNumber(data[e].number) + '</span> ';
          output += '<a href="" url="' + data[e].url + '" season="' + data[e].season + '" episode="' + data[e].episode + '" global="' + data[e].global + '" title="' + data[e].show + '" class="epLink display_episode">';
          output += data[e].show + '</a> ';
          output += '</div>';
          output += '<div class="right">';
          output += '<span class="date">' + date('D d F', data[e].date) + '</span>';
          output += '</div>';
          output += '</div>';
          nbrEpisodes++;
        }
        return output;
      }
    };
  },
  membersInfos: function(login) {
    if (login == null) {
      login = DB.get('session').login;
    }
    return {
      id: 'membersInfos.' + login,
      name: 'membersInfos',
      url: '/members/infos/' + login,
      root: 'member',
      login: login,
      update: function(data) {
        var member;
        member = DB.get('member.' + this.login + '.infos', {});
        member.login = data.login;
        member.is_in_account = data.is_in_account;
        member.avatar = data.avatar;
        member.stats = data.stats;
        return DB.set('member.' + this.login + '.infos', member);
      },
      content: function() {
        var avatar, data, output;
        data = DB.get('member.' + this.login + '.infos', null);
        if (!data) {
          return Fx.needUpdate();
        }
        if ((data.avatar != null) && data.avatar !== '') {
          avatar = new Image;
          avatar.src = data.avatar;
          avatar.onload = function() {
            return $('#avatar').attr('src', data.avatar);
          };
        }
        output = '';
        output += '<div class="title">' + data.login + '</div>';
        output += '<img src="../img/avatar.png" width="50" id="avatar" style="position:absolute; right:0;" />';
        output += '<div class="episode lun"><img src="../img/infos.png" class="icon"> ' + __('nbr_friends', [data.stats.friends]) + ' </div>';
        output += '<div class="episode lun"><img src="../img/medal.png" class="icon"> ' + __('nbr_badges', [data.stats.badges]) + ' </div>';
        output += '<div class="episode lun"><img src="../img/episodes.png" class="icon"> ' + __('nbr_shows', [data.stats.shows]) + ' </div>';
        output += '<div class="episode lun"><img src="../img/report.png" class="icon"> ' + __('nbr_seasons', [data.stats.seasons]) + ' </div>';
        output += '<div class="episode lun"><img src="../img/script.png" class="icon"> ' + __('nbr_episodes', [data.stats.episodes]) + ' </div>';
        output += '<div class="episode lun"><img src="../img/location.png" class="icon">' + data.stats.progress + ' <small>(' + __('progress') + ')</small></div>';
        if (data.is_in_account != null) {
          output += '<div class="title2">' + __('actions') + '</div>';
          if (data.is_in_account) {
            output += '<a href="#' + data.login + '" id="friendsRemove" class="link">' + '<span class="imgSyncOff"></span>' + __('remove_to_friends', [data.login]) + '</a>';
          } else {
            output += '<a href="#' + data.login + '" id="friendsAdd" class="link">' + '<span class="imgSyncOff"></span>' + __('add_to_friends', [data.login]) + '</a>';
          }
        }
        return output;
      }
    };
  },
  membersShows: function(login) {
    if (login == null) {
      login = DB.get('session').login;
    }
    return {
      id: 'membersShows.' + login,
      name: 'membersShows',
      url: '/members/infos/' + login,
      root: 'member',
      login: login,
      update: function(data) {
        var i, s, shows, _ref;
        shows = DB.get('member.' + this.login + '.shows', {});
        _ref = data.shows;
        for (i in _ref) {
          s = _ref[i];
          if (s.url in shows) {
            shows[s.url].archive = s.archive;
          } else {
            shows[s.url] = {
              url: s.url,
              title: s.title,
              archive: s.archive,
              hidden: false
            };
          }
        }
        return DB.set('member.' + this.login + '.shows', shows);
      },
      content: function() {
        var data, i, output, show;
        data = DB.get('member.' + this.login + '.shows', null);
        if (!data) {
          return Fx.needUpdate();
        }
        output = '';
        for (i in data) {
          show = data[i];
          output += '<div class="episode" id="' + show.url + '">';
          if (show.archive === '1') {
            output += '<img src="../img/folder_off.png" class="icon-3" /> ';
          } else {
            output += '<img src="../img/folder.png" class="icon-3" /> ';
          }
          output += '<a href="" url="' + show.url + '" class="epLink display_show">' + show.title + '</a>';
          output += '</div>';
        }
        return output;
      }
    };
  },
  membersEpisodes: function(lang) {
    if (lang == null) {
      lang = 'all';
    }
    return {
      id: 'membersEpisodes.' + lang,
      name: 'membersEpisodes',
      url: '/members/episodes/' + lang,
      root: 'episodes',
      login: DB.get('session').login,
      update: function(data) {
        var d, e, j, memberEpisodes, showEpisodes, shows, time, today;
        shows = DB.get('member.' + this.login + '.shows', {});
        memberEpisodes = {};
        time = Math.floor(new Date().getTime() / 1000);
        j = 0;
        for (d in data) {
          e = data[d];
          if (time - e.date < 24 * 3600) {
            continue;
          }
          if (e.url in shows) {
            shows[e.url].archive = false;
          } else {
            shows[e.url] = {
              url: e.url,
              title: e.show,
              archive: false,
              hidden: false
            };
          }
          showEpisodes = DB.get('show.' + e.url + '.episodes', {});
          showEpisodes[e.global] = {
            comments: e.comments,
            date: e.date,
            downloaded: e.downloaded === '1',
            episode: e.episode,
            global: e.global,
            number: e.number,
            season: e.season,
            title: e.title,
            show: e.show,
            url: e.url,
            subs: e.subs,
            note: e.note.mean
          };
          DB.set('show.' + e.url + '.episodes', showEpisodes);
          if (e.url in memberEpisodes) {
            today = Math.floor(new Date().getTime() / 1000);
            if (e.date <= today) {
              memberEpisodes[e.url].nbr_total++;
            }
          } else {
            memberEpisodes[e.url] = {
              start: e.global,
              nbr_total: 1
            };
          }
          j++;
        }
        DB.set('member.' + this.login + '.shows', shows);
        DB.set('member.' + this.login + '.episodes', memberEpisodes);
        return bgPage.Badge.set('episodes', j);
      },
      content: function() {
        var data, e, global, i, j, nbr_episodes_per_serie, output, s, showEpisodes, shows, today;
        data = DB.get('member.' + this.login + '.episodes', null);
        if (!data) {
          return Fx.needUpdate();
        }
        shows = DB.get('member.' + this.login + '.shows', null);
        if (!shows) {
          return Fx.needUpdate();
        }
        output = '<div id="shows">';
        for (i in data) {
          j = data[i];
          s = shows[i];
          output += '<div id="' + i + '" class="show">';
          output += Content.show(s, j.nbr_total);
          nbr_episodes_per_serie = DB.get('options').nbr_episodes_per_serie;
          showEpisodes = DB.get('show.' + i + '.episodes');
          global = j.start;
          while (global in showEpisodes && global - j.start < nbr_episodes_per_serie) {
            e = showEpisodes[global];
            today = Math.floor(new Date().getTime() / 1000);
            global++;
            if (e.date <= today) {
              output += Content.episode(e, s);
            }
          }
          output += '</div>';
        }
        /*
        			output += '<div id="noEpisodes">'
        			output += __('no_episodes_to_see') 
        			output += '<br /><br /><a href="#" onclick="BS.load(\'searchForm\').display(); return false;">'
        			output += '<img src="../img/film_add.png" class="icon2" />' + __('add_a_show') + '</a>'
        			output += '</div>'
        */

        output += '</div>';
        return output;
      }
    };
  },
  membersNotifications: function() {
    return {
      id: 'membersNotifications',
      name: 'membersNotifications',
      url: '/members/notifications',
      root: 'notifications',
      login: DB.get('session').login,
      update: function(data) {
        var n, new_notifs, old_notifs;
        old_notifs = DB.get('member.' + this.login + '.notifs', []);
        new_notifs = Fx.formatNotifications(data);
        n = Fx.concatNotifications(old_notifs, new_notifs);
        n = Fx.sortNotifications(n);
        DB.set('member.' + this.login + '.notifs', n);
        return bgPage.Badge.set('notifs', 0);
      },
      content: function() {
        var data, n, nbrNotifications, new_date, output, time;
        output = '';
        nbrNotifications = 0;
        time = '';
        data = DB.get('member.' + this.login + '.notifs', null);
        if (!data) {
          return Fx.needUpdate();
        }
        for (n in data) {
          new_date = date('D d F', data[n].date);
          if (new_date !== time) {
            time = new_date;
            output += '<div class="showtitle">' + time + '</div>';
          }
          output += '<div class="event ' + date('D', data[n].date).toLowerCase() + '">';
          if (!data[n].seen) {
            output += '<span class="new">' + __('new') + '</span> ';
          }
          output += data[n].html;
          output += '</div>';
          data[n].seen = true;
          nbrNotifications++;
        }
        DB.set('member.' + this.login + '.notifs', data);
        $('.notif').html(nbr).show();
        if (nbrNotifications === 0) {
          output += __('no_notifications');
        }
        return output;
      }
    };
  },
  commentsEpisode: function(url, season, episode, global) {
    return {
      id: 'commentsEpisode.' + url + '.' + season + '.' + episode + '.' + global,
      name: 'commentsEpisode',
      url: '/comments/episode/' + url,
      params: '&season=' + season + '&episode=' + episode,
      root: 'comments',
      show: url,
      season: season,
      episode: episode,
      global: global,
      update: function(data) {
        var comment, comments, i, nbrComments;
        comments = DB.get('show.' + this.show + '.' + this.global + '.comments', {});
        nbrComments = comments.length;
        for (i in data) {
          comment = data[i];
          if (i < nbrComments) {
            continue;
          } else {
            comments[i] = comment;
          }
        }
        return DB.set('show.' + this.show + '.' + this.global + '.comments', comments);
      },
      content: function() {
        var data, i, n, new_date, output, show, time;
        i = 1;
        time = '';
        show = '';
        output = '<div class="showtitle">' + show + '</div>';
        data = DB.get('show.' + this.show + '.' + this.global + '.comments', null);
        if (!data) {
          return Fx.needUpdate();
        }
        for (n in data) {
          new_date = date('D d F', data[n].date);
          if (new_date !== time) {
            time = new_date;
            output += '<div class="showtitle">' + time + '</div>';
          }
          output += '<div class="event ' + date('D', data[n].date).toLowerCase() + '">';
          output += '<b>' + date('H:i', data[n].date) + '</b> ';
          output += '<span class="login">' + data[n].login + '</span> ';
          output += '<small>#' + data[n].inner_id + '</small> ';
          if (data[n].in_reply_to !== '0') {
            output += '<small>en réponse à #' + data[n].in_reply_to + '</small> ';
          }
          output += '<a href="" id="addInReplyTo" commentId="' + data[n].inner_id + '">répondre</a><br />';
          output += data[n].text;
          output += '</div>';
          i++;
        }
        output += '<div class="postComment">';
        output += '<form method="post" id="postComment">';
        output += '<input type="hidden" id="show" value="' + this.show + '" />';
        output += '<input type="hidden" id="season" value="' + this.season + '" />';
        output += '<input type="hidden" id="episode" value="' + this.episode + '" />';
        output += '<input type="hidden" id="inReplyTo" value="0" />';
        output += '<textarea name="comment" placeholder="Votre commentaire.."></textarea>';
        output += '<input type="submit" name="submit" value="Poster">';
        output += '<div id="inReplyToText" style="display:none;">En réponse à #<span id="inReplyToId"></span> ';
        output += '(<a href="" id="removeInReplyTo">enlever</a>)</div>';
        output += '</form>';
        output += '<div class="clear"></div>\
					   </div>';
        if (i === 1) {
          output += __('no_comments');
        }
        return output;
      }
    };
  },
  timelineFriends: function() {
    return {
      id: 'timelineFriends',
      name: 'timelineFriends',
      url: '/timeline/friends',
      params: '&number=10',
      root: 'timeline',
      login: DB.get('session').login,
      update: function(data) {
        return DB.set('member.' + this.login + '.timeline', data);
      },
      content: function() {
        var data, n, new_date, output, time;
        output = '';
        time = '';
        data = DB.get('member.' + this.login + '.timeline', null);
        if (!data) {
          return Fx.needUpdate();
        }
        for (n in data) {
          new_date = date('D d F', data[n].date);
          if (new_date !== time) {
            time = new_date;
            output += '<div class="title">' + time + '</div>';
          }
          output += '<div class="event ' + date('D', data[n].date).toLowerCase() + '">';
          output += '<b>' + date('H:i', data[n].date) + '</b> ';
          output += '<span class="login">' + data[n].login + '</span> ' + data[n].html;
          output += '</div>';
        }
        return output;
      }
    };
  },
  connection: function() {
    return {
      id: 'connection',
      name: 'connection',
      content: function() {
        var output;
        menu.hide();
        output = '<div style="height:10px;"></div>';
        output += '<form id="connect">';
        output += '<table><tr><td>' + __('login') + '</td><td><input type="text" name="login" id="login" /></td></tr>';
        output += '<tr><td>' + __('password') + '</td><td><input type="password" name="password" id="password" /></td></tr>';
        output += '</table>';
        output += '<div class="valid"><input type="submit" value="' + __('sign_in') + '"> ou ';
        output += '	<a href="" class="display_registration">' + __('sign_up') + '</a></div>';
        output += '</form>';
        return output;
      }
    };
  },
  registration: function() {
    return {
      id: 'registration',
      name: 'registration',
      content: function() {
        var output;
        menu.hide();
        output = '<div style="height:10px;"></div>';
        output += '<form id="register">';
        output += '<table><tr><td>' + __('login') + '</td><td><input type="text" name="login" id="login" /></td></tr>';
        output += '<tr><td>' + __('password') + '</td><td><input type="password" name="password" id="password" /></td></tr>';
        output += '<tr><td>' + __('repassword') + '</td><td><input type="password" name="repassword" id="repassword" /></td></tr>';
        output += '<tr><td>' + __('email') + '</td><td><input type="text" name="mail" id="mail" /></td></tr>';
        output += '</table>';
        output += '<div class="valid"><input type="submit" value="' + __('sign_up') + '"> ou ';
        output += '	<a href="#" class="display_connection">' + __('sign_in') + '</a></div>';
        output += '</form>';
        return output;
      }
    };
  },
  searchShow: function() {
    return {
      id: 'searchShow',
      name: 'searchShow',
      content: function() {
        var output;
        output = '<div style="height:10px;"></div>';
        output += '<form id="searchForShow">';
        output += '<input type="text" name="terms" id="terms" /> ';
        output += '<input type="submit" value="chercher" />';
        output += '</form>';
        output += '<div id="results"></div>';
        setTimeout((function() {
          return $('#terms').focus();
        }), 100);
        return output;
      }
    };
  },
  searchMember: function() {
    return {
      id: 'searchMember',
      name: 'searchMember',
      content: function() {
        var output;
        output = '<div style="height:10px;"></div>';
        output += '<form id="searchForMember">';
        output += '<input type="text" name="terms" id="terms" /> ';
        output += '<input type="submit" value="chercher" />';
        output += '</form>';
        output += '<div id="results"></div>';
        setTimeout((function() {
          return $('#terms').focus();
        }), 100);
        return output;
      }
    };
  },
  blog: function() {
    return {
      id: 'blog',
      name: 'blog',
      update: function() {
        return $.ajax({
          type: 'GET',
          url: 'https://www.betaseries.com/blog/feed/',
          dataType: 'xml',
          async: false,
          success: function(data) {
            var article, blog, i, item, items, _i, _ref;
            items = $(data).find('item');
            blog = [];
            for (i = _i = 0, _ref = Math.min(10, items.length); 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
              item = $(items[i]);
              article = {};
              article.title = item.find('title').text();
              article.description = item.find('description').text();
              article.link = item.find('link').text();
              blog.push(article);
            }
            DB.set('blog', blog);
            return BS.display();
          }
        });
      },
      content: function() {
        var article, data, i, link, output, title, _i, _len;
        output = '';
        data = DB.get('blog', null);
        if (!data) {
          return Fx.needUpdate();
        }
        for (i = _i = 0, _len = data.length; _i < _len; i = ++_i) {
          article = data[i];
          title = article.title.substring(0, 40);
          if (article.title.length > 40) {
            title += '..';
          }
          output += '<div class="showtitle">' + title;
          output += '</div>';
          link = '<a href="#" link="' + article.link + '" class="display_postblog">(' + __('read_article') + ')</a>';
          output += '<div>' + article.description.replace(/<a(.*)a>/, link) + '</div>';
          output += '<div style="height:11px;"></div>';
        }
        return output;
      }
    };
  },
  menu: function() {
    return {
      id: 'menu',
      name: 'menu',
      content: function() {
        var output;
        output = '';
        output += '<a href="" id="menu-timelineFriends">';
        output += '<img src="../img/timeline.png" />';
        output += __('menu_timelineFriends') + '</a>';
        output += '<a href="" id="menu-planningMember">';
        output += '<img src="../img/planning.png" />';
        output += __('menu_planningMember') + '</a>';
        output += '<a href="" id="menu-membersEpisodes">';
        output += '<img src="../img/episodes.png" />';
        output += __('menu_membersEpisodes') + '</a>';
        output += '<a href="" id="menu-membersShows">';
        output += '<img src="../img/episodes.png" />';
        output += __('menu_membersShows') + '</a>';
        output += '<a href="" id="menu-membersInfos">';
        output += '<img src="../img/infos.png" style="margin-right: 9px;" />';
        output += __('menu_membersInfos') + '</a>';
        output += '<a href="" id="menu-membersNotifications">';
        output += '<img src="../img/notifications2.png" />';
        output += __('menu_membersNotifications') + '</a>';
        output += '<a href="" id="menu-searchShow">';
        output += '<img src="../img/search.png" />';
        output += __('menu_searchShow') + '</a>';
        output += '<a href="" id="menu-searchMember">';
        output += '<img src="../img/search.png" />';
        output += __('menu_searchMember') + '</a>';
        output += '<a href="" id="menu-blog">';
        output += '<img src="../img/blog.png" />';
        output += __('menu_blog') + '</a>';
        output += '<a href="" id="menu-options">';
        output += '<img src="../img/options.png" />';
        output += __('menu_options') + '</a>';
        output += '<a href="" id="menu-logout">';
        output += '<img src="../img/close.png" />';
        output += __('menu_logout') + '</a>';
        return output;
      }
    };
  },
  logout: function() {
    ajax.post('/members/destroy', '', function() {
      DB.removeAll();
      DB.init();
      bgPage.Badge.init();
      return BS.load('connection');
    }, function() {
      DB.removeAll();
      DB.init();
      bgPage.Badge.init();
      return BS.load('connection');
    });
    return false;
  }
};
