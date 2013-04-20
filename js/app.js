// Generated by CoffeeScript 1.3.3
var App;

App = (function() {

  function App() {}

  App.prototype.historic = null;

  App.prototype.view = null;

  App.prototype.init = function() {
    var homepage;
    DB.init();
    Fx.checkVersion();
    homepage = Fx.logged() ? 'MyEpisodes' : 'Connection';
    this.historic = new Historic(this);
    this.view = new View(this);
    this.view.load(homepage);
    return this.listen();
  };

  App.prototype.listen = function() {
    var _this = this;
    $('#page').on('mouseenter', '*[title], *[smart-title]', function() {
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
    }).on('mouseleave', '*[title], *[smart-title]', function() {
      $('#help').hide();
      return $('#help-text').html('');
    }).on('click', '*[title], *[smart-title]', function() {
      $('#help').hide();
      return $('#help-text').html('');
    });
    $('#back').click(function() {
      _this.historic.back();
      return false;
    }).attr('title', __("back"));
    $('#sync').click(function() {
      return _this.view.refresh();
    }).attr('title', __('sync'));
    $('#notifications').click(function() {
      _this.view.load('MemberNotifications');
      return false;
    }).attr('title', __('notifs'));
    $('#menu').click(function() {
      if (_this.view.infos.id === 'Menu') {
        return _this.historic.refresh();
      } else {
        return _this.view.load('Menu');
      }
    }).attr('title', __('menu'));
    return $('#message').on('click', '.close', function() {
      event.preventDefault();
      return $('#message').fadeOut();
    });
  };

  return App;

})();
