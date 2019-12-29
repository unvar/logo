var UI = (function () {

  var config = {
    TURTLE_HEIGHT: 25,
    TURTLE_WIDTH: 15,
    TURTLE_COLOR: 3,
    SCREEN_ID: 'screen',
    SCREEN_MPS: 200,
    COLORS: ['#FFFAF0', 'red', '#FFFF31', '#FFA812', '#1F75FE', 'green', '#FAF0BE', '#964B00', '#36454F', '#7FFF00', '#F7E98E']
  };
  var canvas, turtle, color = config.COLORS[config.TURTLE_COLOR];

  var addNewTail = function () {
    if (!turtle.tailOn) return;
    turtle.tail = new fabric.Line([turtle.left, turtle.top, turtle.left, turtle.top], {
      fill: color,
      strokeWidth: 1,
      selectable: false
    });
    canvas.add(turtle.tail);
  };

  var moveBy = function (distance) {
    turtle.set({
      left: (turtle.left + distance * Math.sin(turtle.angle * Math.PI / 180)),
      top: (turtle.top - distance * Math.cos(turtle.angle * Math.PI / 180))
    });

    turtle.tail && turtle.tail.set({ 'x2': turtle.left, 'y2': turtle.top });
    canvas.renderAll();
  };

  var turnBy = function (angle) {
    turtle.setAngle(turtle.angle + angle);
    canvas.renderAll();
    addNewTail();
  };

  var setCanvasSize = function () {
    canvas.setHeight(window.innerHeight - 230);
    canvas.setWidth(window.innerWidth - 220);

    var home = {
      top: Math.floor(canvas.getHeight() / 2 - (config.TURTLE_HEIGHT / 2)),
      left: Math.floor(canvas.getWidth() / 2 - (config.TURTLE_WIDTH / 2))

    };

    if (turtle) {
      turtle.home = home;
    }

    return home;
  };


  return {
    init: function () {
      // init the canvas
      canvas = new fabric.StaticCanvas(config.SCREEN_ID);
      var home = setCanvasSize();

      // bind the window resize to canvas
      $(window).resize(setCanvasSize);

      // create the turtle shape
      turtle = new fabric.Triangle({
        left: home.left,
        top: home.top,
        width: config.TURTLE_WIDTH,
        height: config.TURTLE_HEIGHT,
        fill: color,
        selectable: false
      });

      // add additional properties
      turtle.home = home;
      turtle.tailOn = true;

      // add the objects to the canvas
      canvas.add(turtle);
      addNewTail();
    },
    forward: function (distance) {
      moveBy(distance);
    },
    back: function (distance) {
      moveBy(-distance);
    },
    right: function (angle) {
      turnBy(angle);
    },
    left: function (angle) {
      turnBy(-angle);
    },
    color: function (index) {
      if (index > 0 && index <= config.COLORS.length) {
        color = config.COLORS[index - 1];

        turtle.set({ fill: color });
        addNewTail();
        canvas.renderAll();
      }
    },
    clear: function () {
      canvas.clear();
      color = config.COLORS[config.TURTLE_COLOR];
      turtle.set({
        fill: color,
        left: turtle.home.left,
        top: turtle.home.top,
        angle: 0
      });
      turtle.tailOn = true;
      canvas.add(turtle);
      addNewTail();
      canvas.renderAll();
    },
    penup: function () {
      turtle.tailOn = false;
      turtle.tail = undefined;
    },
    pendown: function () {
      turtle.tailOn = true;
      addNewTail();
    },
    home: function () {
      this.penup();

      turtle.set({
        left: turtle.home.left,
        top: turtle.home.top,
        angle: 0
      });

      this.pendown();

      canvas.renderAll();
    },
    loop: function (queue) {
      var self = this;

      var move = queue.next();

      if (move !== undefined) {
        self[move.cmd].call(self, move.arg);
      }

      window.setTimeout(function () {
        self.loop(queue);
      }, 1000 / config.SCREEN_MPS);
    }
  };
})();

export default UI;
