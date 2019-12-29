import Logo from './logo'

var KeyCodes = {
  ENTER: 13,
  UP: 38,
  DOWN: 40,
  ESC: 27
};

var Selector = {
  field: '#field',
  button: '#enter',
  overlay: '#overlay',
  pane: '.pane',
  paneContent: '.pane .content',
  container: '#container',
  multiline: '.multiline',
  messenger: '#messenger',
  tipper: '.tipper',
  error: '#error',
  trySample: '#samples .copy'
};

var setFieldSize = function () {
  return $(Selector.field).width(window.innerWidth - 400);
};

var toggleMultiline = function () {
  var $this = $(this);
  var pos = $this.offset();
  var height = $this.height();

  if ($this.toggleClass('on').hasClass('on')) {
    $this.data({ height: height }).css({
      left: pos.left,
      bottom: window.innerHeight - (pos.top + height)
    });
  }
};

var TOOLTIP_DEFAULTS = {
  style: {
    tip: {
      corner: 'left top'
    },
    classes: 'ui-tooltip-turtle ui-tooltip-rounded ui-tooltip-shadow'
  },
  position: {
    my: 'top left',
    at: 'center right',
    adjust: {
      x: -5,
      y: -15
    },
    target: $(Selector.messenger)
  }
};

var initTips = function () {
  $(Selector.tipper).qtip($.extend({}, {
    content: {
      attr: 'tip'
    }
  }, TOOLTIP_DEFAULTS));

  $(Selector.error).qtip($.extend({}, {
    content: {
      text: 'Error!!'
    },
    show: {
      modal: true
    }
  }, TOOLTIP_DEFAULTS));
};

var error = function (message) {
  $(Selector.error).qtip('option', 'content.text', message + '<br/>Hit ESC to dismiss.').qtip('show');
};

var initMenus = function () {
  var hidePanes = function () {
    $.each($(Selector.pane), function (index, item) {
      $(item).removeClass('active');
    });
  };

  $(document).keyup(function (e) {
    switch (e.which || e.keyCode) {
      case KeyCodes.ESC:
        $(Selector.overlay).hide();
        return false;
    }
  });

  $(Selector.overlay).click(function () {
    $(this).hide();
  });

  $.each($(Selector.paneContent), function (index, item) {
    $(item).click(function (e) {
      e.stopImmediatePropagation();
    });
  });

  $("#buttons a").click(function () {
    var $this = $(this);
    hidePanes();
    $($this.attr('href')).addClass('active');
    $(Selector.overlay).show();
  });

  $.each($(Selector.trySample), function (i, item) {
    $(item).click(function () {
      !$(Selector.multiline).is('.on') && $(Selector.multiline).click();
      $(Selector.field).val($(this).parent().next('.code').text());
      $(Selector.overlay).hide();
    });
  });
};

$(document).ready(function () {
  var current = 0;

  // init the canvas
  Logo.ui.init();

  // field operations
  setFieldSize().keydown(function (e) { // wire the field key shortcuts
    var prev;
    var shortcut = !$(Selector.multiline).hasClass('on') || e.ctrlKey;
    switch (e.which || e.keyCode) {
      case KeyCodes.ENTER:
        if (shortcut) {
          $(Selector.button).trigger('click');
          return false;
        }
        return true;
      case KeyCodes.UP:
        if (e.altKey) {
          $(Selector.multiline).trigger('click');
          return false;
        } else if (shortcut) {
          prev = Logo.interpreter.prev(++current);
          prev && $(Selector.field).val(prev) || --current;
          return false;
        }
        return true;
      case KeyCodes.DOWN:
        if (e.altKey) {
          $(Selector.multiline).trigger('click');
          return false;
        } else if (shortcut) {
          prev = Logo.interpreter.prev(--current);
          prev && $(Selector.field).val(prev) || ++current;
          return false;
        }
        return true;
      default: return true;
    }
  })
    .bind({
      'click': function (e) { // stop propagation of event
        e.stopImmediatePropagation();
      },
      'focus': function (e) {
        $(Selector.multiline).addClass('focus');
      },
      'blur': function (e) {
        $(Selector.multiline).removeClass('focus');
      }
    });

  $(window).resize(setFieldSize);

  // wire the multiline widget
  $(Selector.multiline).bind('click', toggleMultiline);

  // wire the button
  $(Selector.button).bind('click', function () {
    try {
      $(Selector.field).val() != '' && Logo.interpreter.interpret($(Selector.field).val().toLowerCase());

      // resets
      $(Selector.field).val("");
      current = 0;
    } catch (e) {
      error(e.message);
    }
  });

  // start the draw loop
  Logo.ui.loop(Logo.interpreter);

  // initiate the tips
  initTips();

  // init the menus
  initMenus();


  // finally show the canvas and hide the splash screen
  setTimeout(function () {
    $(Selector.container).show();
    $(Selector.overlay).hide();
  }, 200);
});
