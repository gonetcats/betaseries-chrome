// Generated by CoffeeScript 1.3.3
var View_Search,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

View_Search = (function() {

  function View_Search() {
    this.init = __bind(this.init, this);

  }

  View_Search.prototype.init = function() {
    this.id = 'Search';
    return this.name = 'Search';
  };

  View_Search.prototype.content = function() {
    var output;
    output = '<form id="search">';
    output += '<input type="text" name="terms" id="terms" /> ';
    output += '<input type="submit" value="chercher" />';
    output += '</form>';
    output += '<div id="suggests_shows"></div>';
    output += '<div id="suggests_members"></div>';
    output += '<div id="results_shows"></div>';
    output += '<div id="results_members"></div>';
    setTimeout((function() {
      return $('#terms').focus();
    }), 100);
    return output;
  };

  View_Search.prototype.listen = function() {
    $('#search').on('submit', function() {
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
        $('#results_shows').html(content);
        return Fx.updateHeight();
      }, function() {});
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
        $('#results_members').html(content);
        return Fx.updateHeight();
      }, function() {});
      return false;
    });
    $('#page').on('click', '.display_show', function() {
      var url;
      event.preventDefault();
      url = $(this).attr('url');
      return app.view.load('Show', url);
    });
    return $('#page').on('click', '.display_member', function() {
      var login;
      event.preventDefault();
      login = $(this).attr('login');
      return app.view.load('Member', login);
    });
  };

  return View_Search;

})();
