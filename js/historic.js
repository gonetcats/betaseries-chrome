// Generated by CoffeeScript 1.3.3
var Historic,
  __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

Historic = {
  refresh: function() {
    var args, historic, length;
    historic = DB.get('historic');
    length = historic.length;
    args = historic[length - 1].split('.');
    BS.load.apply(BS, args);
    return this.display(length);
  },
  save: function() {
    var blackpages, historic, length, view;
    historic = DB.get('historic');
    length = historic.length;
    blackpages = ['connection', 'registration', 'menu'];
    view = BS.currentView.id;
    if (historic[length - 1] !== view && !(__indexOf.call(blackpages, view) >= 0)) {
      historic.push(view);
      DB.set('historic', historic);
      length++;
    }
    return this.display(length);
  },
  back: function() {
    var args, historic, length;
    historic = DB.get('historic');
    if ((length = historic.length) >= 2) {
      historic.pop();
      args = historic[length - 2].split('.');
      BS.load.apply(BS, args);
      DB.set('historic', historic);
      length--;
    }
    this.display(length);
    return false;
  },
  display: function(n) {
    var blackpages, view;
    view = BS.currentView.id;
    blackpages = ['connection', 'registration', 'menu'];
    if (n >= 2 && !(__indexOf.call(blackpages, view) >= 0)) {
      return $('#back').show();
    } else {
      return $('#back').hide();
    }
  }
};
