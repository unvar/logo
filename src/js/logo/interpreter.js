import parser from './generated/parser.js'

var Interpreter = (function () {
  var queue = [];
  var history = [];
  var procedures = {};
  var MAX_HISTORY = 10;

  var safeParse = function (text, start) {
    try {
      return parser.parse(text, { startRule: start });
    } catch (e) {
      throw { name: 'SyntaxError', message: 'Bad syntax. Please check line: ' + e.line + ' column: ' + e.column };
    }
  };

  var process = function process(move) {
    var count, index, procedure;
    switch (move.cmd) {
      case 'forward':
      case 'back':
      case 'right':
      case 'left':
      case 'color':
        if (isNaN(move.arg)) {
          move = $.extend(true, {}, move);
          move.arg = safeParse(move.arg, "PRIMARY");
        }
      case 'clear':
      case 'home':
      case 'penup':
      case 'pendown':
        queue.push(move);
        break;
      case 'repeat':
        for (count = 0; count < move.times; count++) {
          for (index in move.moves) {
            process(move.moves[index]);
          }
        }
        break;
      case 'var':
        safeParse(move.exp, "VAR");
        break;
      case 'proc':
        break;
      case 'pname':
        procedure = $.extend(true, [], move.body);
        for (count in procedure) {
          for (index in procedure[count]) {
            process(procedure[count][index]);
          }
        }
        break;
      case 'comment':
        break;
      default:
        throw { name: 'UnknownMove', message: 'Unknown move: ' + move.cmd };
    }
  };

  var addToHistory = function (program) {
    // if present then remove
    var index = history.indexOf(program);
    index != -1 && history.splice(index, 1);

    // add to history
    history.push(program) >= MAX_HISTORY && history.shift();
  };

  return {
    interpret: function (program) {
      var input = [];
      var i, j, statement, move;

      // update history
      addToHistory(program);

      // parse the input
      input = safeParse(program.endsWith("\n") ? program : program.concat("\n"), 'program');

      // process the commands
      for (i in input) {
        statement = input[i];
        for (j in statement) {
          move = statement[j];
          process(move);
        }
      }
    },
    next: function () {
      return queue.length > 0 ? queue.shift() : undefined;
    },
    prev: function (n) {
      var index = history.length - n;
      return (index >= 0) && history[index];
    }
  };

})();

export default Interpreter;
