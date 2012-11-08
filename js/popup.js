// Generated by CoffeeScript 1.3.3
var __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

$(document).ready(function() {
  var bgPage, clean, highlight, message, registerAction;
  bgPage = chrome.extension.getBackgroundPage();
  $('*[title], *[smart-title]').live({
    mouseenter: function() {
      var title;
      title = $(this).attr('title');
      if (title != null) {
        $(this).removeAttr('title');
        $(this).attr('smart-title', title);
      } else {
        title = $(this).attr('smart-title');
      }
      $('#help').show();
      return $('#help-text').html(title);
    },
    mouseleave: function() {
      $('#help').hide();
      return $('#help-text').html('');
    },
    click: function() {
      $('#help').hide();
      return $('#help-text').html('');
    }
  });
  $('.membersEpisodes .watched').live({
    click: function() {
      var e, enable_ratings, episode, es, login, nbr, params, s, season, show;
      s = $(this).closest('.show');
      show = s.attr('id');
      e = $(this).closest('.episode');
      season = e.attr('season');
      episode = e.attr('episode');
      login = DB.get('session').login;
      enable_ratings = DB.get('options').enable_ratings;
      es = DB.get('member.' + login + '.episodes');
      es[show].start = "" + (parseInt(e.attr('global')) + 1);
      nbr = 0;
      while (e.hasClass('episode')) {
        nbr++;
        if (enable_ratings) {
          $(e).css('background-color', '#f5f5f5');
          $(e).find('.watched').removeClass('watched');
          $(e).find('.wrapper-comments').hide();
          $(e).find('.wrapper-recover').hide();
          $(e).find('.wrapper-subtitles').hide();
          $(e).find('.wrapper-rate').css('display', 'inline-block');
        } else {
          clean(e);
        }
        e = e.prev();
      }
      es[show].nbr_total -= nbr;
      if (es[show].nbr_total === 0) {
        delete es[show];
      }
      params = "&season=" + season + "&episode=" + episode;
      return ajax.post("/members/watched/" + show, params, function() {
        var badge_notification_type, total_episodes;
        DB.set('member.' + login + '.episodes', es);
        Cache.force('timelineFriends');
        badge_notification_type = DB.get('options').badge_notification_type;
        if (badge_notification_type === 'watched') {
          total_episodes = DB.get('badge').total_episodes;
          return bgPage.Badge.set('total_episodes', total_episodes - nbr);
        }
      }, function() {
        return registerAction("/members/watched/" + show, params);
      });
    },
    mouseenter: function() {
      var e, _results;
      e = $(this).closest('.episode');
      _results = [];
      while (e.hasClass('episode')) {
        e.find('.watched').css('opacity', 1);
        _results.push(e = e.prev());
      }
      return _results;
    },
    mouseleave: function() {
      var e, _results;
      e = $(this).closest('.episode');
      _results = [];
      while (e.hasClass('episode')) {
        e.find('.watched').css('opacity', 0.5);
        _results.push(e = e.prev());
      }
      return _results;
    }
  });
  $('.showsEpisodes .watched').live({
    click: function() {
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
        Cache.force('timelineFriends');
        badge_notification_type = DB.get('options').badge_notification_type;
        if (badge_notification_type === 'watched') {
          return bgPage.Badge.searchEpisodes();
        }
      }, function() {
        return registerAction("/members/watched/" + show, params);
      });
    },
    mouseenter: function() {
      var e;
      e = $(this).closest('.episode');
      return e.find('.watched').attr('src', '../img/arrow_right.png').css('opacity', 1);
    },
    mouseleave: function() {
      var e, start;
      start = parseInt($(this).closest('.show').attr('start'));
      e = $(this).closest('.episode');
      if (e.attr('global') < start) {
        return e.find('.watched').attr('src', '../img/tick.png').css('opacity', 0.5);
      } else {
        return e.find('.watched').attr('src', '../img/empty.png');
      }
    }
  });
  clean = function(node) {
    var episode, es, global, login, nbr, nbr_episodes_per_serie, s, show, showName;
    show = node.closest('.show');
    node.slideToggle('slow', function() {
      return $(this).remove();
    });
    nbr = parseInt($(show).find('.remain').text()) - 1;
    if (nbr === 0) {
      $(show).slideToggle('slow', function() {
        return $(this).remove();
      });
    } else {
      $(show).find('.remain').text(nbr);
    }
    nbr_episodes_per_serie = DB.get('options').nbr_episodes_per_serie;
    if (nbr + 1 > nbr_episodes_per_serie) {
      global = parseInt($(show).find('.episode').last().attr('global')) + 1;
      login = DB.get('session').login;
      showName = $(show).attr('id');
      s = DB.get('member.' + login + '.shows')[showName];
      es = DB.get('show.' + showName + '.episodes');
      episode = Content.episode(es[global], s);
      $(show).append(episode);
    }
    Fx.updateHeight();
    return true;
  };
  $('#page').on('click', '.copy_episode', function() {
    var sanbox;
    event.preventDefault();
    sanbox = $(this).find('textarea');
    sanbox.show();
    sanbox.select();
    document.execCommand('copy');
    sanbox.hide();
    message(__('copied_to_clipboard'));
    return $(this).focus();
  });
  $('#page').on('click', '.display_show', function() {
    var url;
    event.preventDefault();
    url = $(this).attr('url');
    return BS.load('showsDisplay', url);
  });
  $('#page').on('click', '.display_episode', function() {
    var episode, global, season, url;
    event.preventDefault();
    url = $(this).attr('url');
    season = $(this).attr('season');
    episode = $(this).attr('episode');
    global = $(this).attr('global');
    return BS.load('showsEpisode', url, season, episode, global);
  });
  $('#page').on('click', '.display_episodes', function() {
    var url;
    event.preventDefault();
    url = $(this).attr('url');
    return BS.load('showsEpisodes', url);
  });
  $('#page').on('click', '.display_comments', function() {
    var episode, global, season, url;
    event.preventDefault();
    url = $(this).attr('url');
    season = $(this).attr('season');
    episode = $(this).attr('episode');
    global = $(this).attr('global');
    return BS.load('commentsEpisode', url, season, episode, global);
  });
  $('#page').on('click', '.display_member', function() {
    var login;
    event.preventDefault();
    login = $(this).attr('login');
    return BS.load('membersInfos', login);
  });
  $('#page').on('click', '.display_registration', function() {
    event.preventDefault();
    return BS.load('registration');
  });
  $('#page').on('click', '.display_connection', function() {
    event.preventDefault();
    return BS.load('connection');
  });
  $('#page').on('click', '.display_postblog', function() {
    var link;
    event.preventDefault();
    link = $(this).attr('link');
    return Fx.openTab(link, true);
  });
  $('.episode').live({
    mouseenter: function() {
      return $(this).find('.watched').attr('src', '../img/arrow_right.png').css('opacity', 0.5);
    },
    mouseleave: function() {
      var e, start;
      start = parseInt($(this).closest('.show').attr('start'));
      e = $(this).closest('.episode');
      if (e.attr('global') < start) {
        return e.find('.watched').attr('src', '../img/tick.png').css('opacity', 0.5);
      } else {
        return e.find('.watched').attr('src', '../img/empty.png');
      }
    }
  });
  $('.star').live({
    mouseenter: function() {
      var nodeStar, _results;
      nodeStar = $(this);
      _results = [];
      while (nodeStar.hasClass('star')) {
        nodeStar.attr('src', '../img/star.gif');
        _results.push(nodeStar = nodeStar.prev());
      }
      return _results;
    },
    mouseleave: function() {
      var nodeStar, _results;
      nodeStar = $(this);
      _results = [];
      while (nodeStar.hasClass('star')) {
        nodeStar.attr('src', '../img/star_off.gif');
        _results.push(nodeStar = nodeStar.prev());
      }
      return _results;
    },
    click: function() {
      var e, episode, params, rate, s, season, show;
      s = $(this).closest('.show');
      show = s.attr('id');
      e = $(this).closest('.episode');
      clean(e);
      season = e.attr('season');
      episode = e.attr('episode');
      rate = $(this).attr('id').substring(4);
      params = "&season=" + season + "&episode=" + episode + "&note=" + rate;
      return ajax.post("/members/note/" + show, params, function() {
        return Cache.force('timelineFriends');
      }, function() {
        return registerAction("/members/watched/" + show, params);
      });
    }
  });
  $('.close_stars').live({
    click: function() {
      var e;
      e = $(this).closest('.episode');
      return clean(e);
    }
  });
  $('#page.membersEpisodes .downloaded').live('click', function() {
    var downloaded, e, episode, es, global, params, s, season, show;
    event.preventDefault();
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
        return bgPage.Badge.set('downloaded_episodes', downloaded_episodes);
      }
    }, function() {
      return registerAction("/members/downloaded/" + show, params);
    });
  });
  $('#page.showsEpisode .downloaded').live('click', function() {
    var dl, downloaded, episode, es, global, params, season, show,
      _this = this;
    event.preventDefault();
    show = $(this).attr('show');
    season = $(this).attr('season');
    episode = $(this).attr('episode');
    global = $(this).attr('global');
    es = DB.get('show.' + show + '.episodes');
    downloaded = es[global].downloaded;
    es[global].downloaded = !downloaded;
    DB.set('show.' + show + '.episodes', es);
    $(this).find('span').toggleClass('imgSyncOff imgSyncOn');
    dl = downloaded ? 'mark_as_dl' : 'mark_as_not_dl';
    params = "&season=" + season + "&episode=" + episode;
    return ajax.post("/members/downloaded/" + show, params, function() {
      var badge_notification_type;
      Cache.force('membersEpisodes.all');
      badge_notification_type = DB.get('options').badge_notification_type;
      if (badge_notification_type === 'downloaded') {
        bgPage.Badge.searchEpisodes();
      }
      return $(_this).html('<span class="imgSyncOff"></span>' + __(dl));
    }, function() {
      return registerAction("/members/downloaded/" + show, params);
    });
  });
  $('.subs').live({
    click: function() {
      Fx.openTab($(this).attr('link'));
      return false;
    }
  });
  $('#showsArchive').live({
    click: function() {
      var show,
        _this = this;
      show = $(this).attr('href').substring(1);
      $(this).find('span').toggleClass('imgSyncOff imgSyncOn');
      ajax.post("/shows/archive/" + show, "", function() {
        Cache.force('membersEpisodes.all');
        Cache.force('membersInfos.' + DB.get('session').login);
        bgPage.Badge.searchEpisodes();
        $(_this).html('<span class="imgSyncOff"></span>' + __('show_unarchive'));
        return $(_this).attr('id', 'showsUnarchive');
      }, function() {
        return registerAction("/shows/archive/" + show, "");
      });
      return false;
    }
  });
  $('#showsUnarchive').live({
    click: function() {
      var show,
        _this = this;
      show = $(this).attr('href').substring(1);
      $(this).find('span').toggleClass('imgSyncOff imgSyncOn');
      ajax.post("/shows/unarchive/" + show, "", function() {
        Cache.force('membersEpisodes.all');
        Cache.force('membersInfos.' + DB.get('session').login);
        bgPage.Badge.searchEpisodes();
        $(_this).html('<span class="imgSyncOff"></span>' + __('show_archive'));
        return $(_this).attr('id', 'showsArchive');
      }, function() {
        return registerAction("/shows/unarchive/" + show, "");
      });
      return false;
    }
  });
  $('#showsAdd').live({
    click: function() {
      var show,
        _this = this;
      show = $(this).attr('href').substring(1);
      $(this).find('span').toggleClass('imgSyncOff imgSyncOn');
      ajax.post('/shows/add/' + show, '', function() {
        Cache.force('membersEpisodes.all');
        Cache.force('membersInfos.' + DB.get('session').login);
        bgPage.Badge.searchEpisodes();
        $(_this).html('<span class="imgSyncOff"></span>' + __('show_remove'));
        return $(_this).attr('id', 'showsRemove');
      }, function() {
        return registerAction("/shows/add/" + show, '');
      });
      return false;
    }
  });
  $('#showsRemove').live({
    click: function() {
      var show,
        _this = this;
      show = $(this).attr('href').substring(1);
      $(this).find('span').toggleClass('imgSyncOff imgSyncOn');
      $('#showsArchive').slideUp();
      $('#showsUnarchive').slideUp();
      ajax.post('/shows/remove/' + show, '', function() {
        Cache.force('membersEpisodes.all');
        Cache.force('membersInfos.' + DB.get('session').login);
        bgPage.Badge.searchEpisodes();
        $(_this).html('<span class="imgSyncOff"></span>' + __('show_add'));
        return $(_this).attr('id', 'showsAdd');
      }, function() {
        return registerAction("/shows/remove/" + show, '');
      });
      return false;
    }
  });
  $('#friendsAdd').live({
    click: function() {
      var login,
        _this = this;
      login = $(this).attr('href').substring(1);
      $(this).find('span').toggleClass('imgSyncOff imgSyncOn');
      ajax.post("/members/add/" + login, '', function() {
        Cache.force('membersInfos.' + DB.get('session').login);
        Cache.force('membersInfos.' + login);
        Cache.force('timelineFriends');
        $(_this).html('<span class="imgSyncOff"></span>' + __('remove_to_friends', [login]));
        return $(_this).attr('id', 'friendsRemove');
      }, function() {
        return registerAction("/members/add/" + login, '');
      });
      return false;
    }
  });
  $('#friendsRemove').live({
    click: function() {
      var login,
        _this = this;
      login = $(this).attr('href').substring(1);
      $(this).find('span').toggleClass('imgSyncOff imgSyncOn');
      ajax.post("/members/delete/" + login, '', function() {
        Cache.force('membersInfos.' + DB.get('session').login);
        Cache.force('membersInfos.' + login);
        Cache.force('timelineFriends');
        $(_this).html('<span class="imgSyncOff"></span>' + __('add_to_friends', [login]));
        return $(_this).attr('id', 'friendsAdd');
      });
      return false;
    }
  });
  $('#connect').live({
    submit: function() {
      var inputs, login, params, password;
      login = $('#login').val();
      password = hex_md5($('#password').val());
      inputs = $(this).find('input').attr({
        disabled: 'disabled'
      });
      params = "&login=" + login + "&password=" + password;
      ajax.post("/members/auth", params, function(data) {
        var token;
        if (data.root.member != null) {
          $('#message').slideUp();
          $('#connect').remove();
          token = data.root.member.token;
          DB.set('session', {
            login: login,
            token: data.root.member.token
          });
          menu.show();
          $('#back').hide();
          return BS.load('membersEpisodes');
        } else {
          $('#password').attr('value', '');
          message('<img src="../img/inaccurate.png" /> ' + __('wrong_login_or_password'));
          return inputs.removeAttr('disabled');
        }
      }, function() {
        $('#password').attr('value', '');
        return inputs.removeAttr('disabled');
      });
      return false;
    }
  });
  $('#register').live({
    submit: function() {
      var inputs, login, mail, params, pass, password, repassword;
      login = $('#login').val();
      password = $('#password').val();
      repassword = $('#repassword').val();
      mail = $('#mail').val();
      inputs = $(this).find('input').attr({
        disabled: 'disabled'
      });
      params = "&login=" + login + "&password=" + password + "&mail=" + mail;
      pass = true;
      if (password !== repassword) {
        pass = false;
        message('<img src="../img/inaccurate.png" /> ' + __("password_not_matching"));
      }
      if (login.length > 24) {
        pass = false;
        message('<img src="../img/inaccurate.png" /> ' + __("long_login"));
      }
      if (pass) {
        ajax.post("/members/signup", params, function(data) {
          var err;
          if (data.root.errors.error) {
            err = data.root.errors.error;
            message('<img src="../img/inaccurate.png" /> ' + __('err' + err.code));
            $('#password').attr('value', '');
            $('#repassword').attr('value', '');
            return inputs.removeAttr('disabled');
          } else {
            BS.load('connection').display();
            $('#login').val(login);
            $('#password').val(password);
            return $('#connect').trigger('submit');
          }
        }, function() {
          $('#password').attr('value', '');
          $('#repassword').attr('value', '');
          return inputs.removeAttr('disabled');
        });
      } else {
        $('#password').attr('value', '');
        $('#repassword').attr('value', '');
        inputs.removeAttr('disabled');
      }
      return false;
    }
  });
  $('#searchForMember').live({
    submit: function() {
      var params, terms;
      terms = $('#terms').val();
      params = "&login=" + terms;
      ajax.post("/members/search", params, function(data) {
        var content, member, members, n;
        content = '<div class="title">' + __('members') + '</div>';
        members = data.root.members;
        if (Object.keys(members).length > 0) {
          for (n in members) {
            member = members[n];
            content += '<div class="episode"><a href="#" login="' + member.login + '" class="epLink display_member">' + Fx.subFirst(member.login, 25) + '</a></div>';
          }
        } else {
          content += '<div class="episode">' + __('no_members_found') + '</div>';
        }
        $('#results').html(content);
        return Fx.updateHeight();
      }, function() {});
      return false;
    }
  });
  $('#searchForShow').live({
    submit: function() {
      var params, terms;
      terms = $('#terms').val();
      params = "&title=" + terms;
      ajax.post("/shows/search", params, function(data) {
        var content, n, show, shows;
        content = '<div class="title">' + __('shows') + '</div>';
        shows = data.root.shows;
        if (Object.keys(shows).length > 0) {
          for (n in shows) {
            show = shows[n];
            content += '<div class="episode"><a href="" url="' + show.url + '" title="' + show.title + '" class="epLink display_show">' + Fx.subFirst(show.title, 25) + '</a></div>';
          }
        } else {
          content += '<div class="episode">' + __('no_shows_found') + '</div>';
        }
        $('#results').html(content);
        return Fx.updateHeight();
      }, function() {});
      return false;
    }
  });
  $('#postComment').live({
    submit: function() {
      var episode, in_reply_to, params, season, show, text;
      show = $('#postComment input[id=show]').val();
      season = $('#postComment input[id=season]').val();
      episode = $('#postComment input[id=episode]').val();
      text = $('#postComment textarea').val();
      in_reply_to = $('#postComment input[id=inReplyTo]').val();
      if (text !== '') {
        $('#postComment input[type=submit]').val('Patientez..');
        $('#postComment input[type=submit]').prop('disabled', true);
        params = '&show=' + show + '&season=' + season + '&episode=' + episode + '&text=' + text;
        if (in_reply_to !== '0') {
          params += '&in_reply_to=' + in_reply_to;
        }
        ajax.post("/comments/post/episode", params, function(data) {
          var day, hour, login, num, output, showtitle, time;
          $('#postComment textarea').val('');
          $('#postComment input[id=inReplyTo]').val(0);
          $('#postComment input[type=submit]').val('Poster');
          $('#postComment input[type=submit]').prop('disabled', false);
          $('#postComment #inReplyToText').hide();
          time = date('D d F');
          day = date('D').toLowerCase();
          hour = date('H:i');
          login = DB.get('session').login;
          num = data.comment.id;
          showtitle = time === $('.showtitle').last().text() ? '' : '<div class="showtitle">' + time + '</div>';
          output = '<div class="newComment" style="display:none;">';
          output += showtitle;
          output += '<div class="event ' + day + '">';
          output += '<b>' + hour + '</b> ';
          output += '<span class="login">' + login + '</span> ';
          output += '<small>#' + num + '</small> ';
          if (in_reply_to !== '0') {
            output += '<small>en réponse à #' + in_reply_to + '</small> ';
          }
          output += '<a href="" id="addInReplyTo" commentId="' + num + '">répondre</a><br />';
          output += text;
          output += '</div>';
          output += '</div>';
          $('.postComment').before(output);
          return $('.newComment').slideDown('slow');
        }, function() {});
      }
      return false;
    }
  });
  $('#addInReplyTo').live({
    click: function() {
      var commentId;
      commentId = $(this).attr('commentId');
      $('#postComment input[id=inReplyTo]').val(commentId);
      $('#postComment #inReplyToText').show();
      $('#postComment #inReplyToId').text(commentId);
      return false;
    }
  });
  $('#removeInReplyTo').live({
    click: function() {
      $('#postComment input[id=inReplyTo]').val(0);
      $('#postComment #inReplyToText').hide();
      return false;
    }
  });
  registerAction = function(category, params) {
    return console.log("action: " + category + params);
  };
  $('.toggleShow').live({
    click: function() {
      var hidden, login, show, showName, shows;
      show = $(this).closest('.show');
      showName = $(show).attr('id');
      login = DB.get('session').login;
      shows = DB.get('member.' + login + '.shows');
      hidden = shows[showName].hidden;
      shows[showName].hidden = !hidden;
      DB.set('member.' + login + '.shows', shows);
      $(show).find('.episode').slideToggle();
      if (shows[showName].hidden) {
        $(this).attr('src', '../img/arrow_right.gif');
      } else {
        $(this).attr('src', '../img/arrow_down.gif');
      }
      return Fx.updateHeight();
    }
  });
  $('.toggleSeason').live({
    click: function() {
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
    }
  });
  $('.toggleWeek').live({
    click: function() {
      var hidden, week;
      week = $(this).closest('.week');
      hidden = $(week).hasClass('hidden');
      $(week).toggleClass('hidden');
      $(week).find('.episode').slideToggle();
      if (hidden) {
        $(this).attr('src', '../img/arrow_down.gif');
      } else {
        $(this).attr('src', '../img/arrow_right.gif');
      }
      return Fx.updateHeight();
    }
  });
  $('#logoLink').click(function() {
    return Fx.openTab(ajax.site_url, true);
  }).attr('title', __("logo"));
  $('#versionLink').click(function() {
    return Fx.openTab('https://chrome.google.com/webstore/detail/dadaekemlgdonlfgmfmjnpbgdplffpda', true);
  }).attr('title', __("version"));
  $('#page.menu a').live('click', function() {
    var id;
    event.preventDefault();
    id = $(this).attr('id').substring(5);
    if (id === 'options') {
      return Fx.openTab(chrome.extension.getURL('../html/options.html'), true);
    } else if (id === 'logout') {
      return BS.logout();
    } else {
      return BS.load(id);
    }
  });
  $('#back').click(function() {
    Historic.back();
    return false;
  }).attr('title', __("back"));
  $('#sync').click(function() {
    return BS.refresh();
  }).attr('title', __('sync'));
  $('#notifications').click(function() {
    BS.load('membersNotifications');
    return false;
  }).attr('title', __('notifs'));
  $('#menu').click(function() {
    if (BS.currentView.id === 'menu') {
      return Historic.refresh();
    } else {
      return BS.load("Menu");
    }
  }).attr('title', __('menu'));
  message = function(content) {
    $('#message .content').html(content);
    $('#message').slideDown();
    return highlight($('#message'));
  };
  highlight = function(selector) {
    var bgColor;
    bgColor = selector.css('background-color');
    selector.animate({
      backgroundColor: '#FAFA97'
    }, 500);
    return selector.animate({
      backgroundColor: bgColor
    }, 500);
  };
  $('#message').on('click', '.close', function() {
    event.preventDefault();
    return $('#message').slideUp();
  });
  DB.init();
  Fx.updateHeight(true);
  Fx.checkVersion();
  window.BS = new Controller;
  if (bgPage.logged()) {
    return BS.load("MyEpisodes");
  } else {
    return BS.load("Connection");
  }
});
