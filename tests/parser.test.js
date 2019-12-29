var PEG = require("pegjs");
var FS = require("fs");

var parser = PEG.generate(FS.readFileSync(__dirname + '/../src/pegjs/logo.pegjs', 'utf-8'));

function parse(text) {
  try {
    return parser.parse(text, { startRule: 'program' });
  } catch (e) {
    console.log("Error parsing: ", text, e);
  }
}

exports.testSingleMove = function (test) {
  test.expect(1);
  test.deepEqual(parse("fd 10\n"), [[{ 'cmd': 'forward', 'arg': 10, 'com': '' }]]);
  test.done();
};

exports.testMultipleMoves = function (test) {
  test.expect(1);
  test.deepEqual(parse("fd 10 rt 90 fd 20\n"),
    [
      [
        { 'cmd': 'forward', 'arg': 10, 'com': '' },
        { 'cmd': 'right', 'arg': 90, 'com': '' },
        { 'cmd': 'forward', 'arg': 20, 'com': '' }
      ]
    ]);
  test.done();
};

exports.testAllAvailableMoves = function (test) {
  test.expect(16);
  test.deepEqual(parse("cls\n"), [[{ 'cmd': 'clear', 'com': '' }]]);
  test.deepEqual(parse("clear\n"), [[{ 'cmd': 'clear', 'com': '' }]]);
  test.deepEqual(parse("home\n"), [[{ 'cmd': 'home', 'com': '' }]]);
  test.deepEqual(parse("penup\n"), [[{ 'cmd': 'penup', 'com': '' }]]);
  test.deepEqual(parse("pendown\n"), [[{ 'cmd': 'pendown', 'com': '' }]]);
  test.deepEqual(parse("clr 10\n"), [[{ 'cmd': 'color', 'arg': 10, 'com': '' }]]);
  test.deepEqual(parse("color 10\n"), [[{ 'cmd': 'color', 'arg': 10, 'com': '' }]]);
  test.deepEqual(parse("fd 10\n"), [[{ 'cmd': 'forward', 'arg': 10, 'com': '' }]]);
  test.deepEqual(parse("forward 10\n"), [[{ 'cmd': 'forward', 'arg': 10, 'com': '' }]]);
  test.deepEqual(parse("bk 10\n"), [[{ 'cmd': 'back', 'arg': 10, 'com': '' }]]);
  test.deepEqual(parse("back 10\n"), [[{ 'cmd': 'back', 'arg': 10, 'com': '' }]]);
  test.deepEqual(parse("rt 10\n"), [[{ 'cmd': 'right', 'arg': 10, 'com': '' }]]);
  test.deepEqual(parse("right 10\n"), [[{ 'cmd': 'right', 'arg': 10, 'com': '' }]]);
  test.deepEqual(parse("lt 10\n"), [[{ 'cmd': 'left', 'arg': 10, 'com': '' }]]);
  test.deepEqual(parse("left 10\n"), [[{ 'cmd': 'left', 'arg': 10, 'com': '' }]]);
  test.deepEqual(parse("repeat 5 [ fd 10 ] ; this is a comment\n"), [[{
    'cmd': 'repeat', 'times': 5, 'com': 'this is a comment',
    'moves': [{ 'cmd': 'forward', 'arg': 10, 'com': '' }]
  }]]);
  test.done();
};

exports.testMultipleLineStmt = function (test) {
  test.expect(1);
  test.deepEqual(parse("fd 10\nrt 90\nfd 20\n"),
    [
      [{ 'cmd': 'forward', 'arg': 10, 'com': '' }],
      [{ 'cmd': 'right', 'arg': 90, 'com': '' }],
      [{ 'cmd': 'forward', 'arg': 20, 'com': '' }]
    ]);
  test.done();
};

exports.testRepeatStmt = function (test) {
  test.expect(1);
  test.deepEqual(parse("repeat 5 [ fd 10 rt 90 ]\n"),
    [
      [
        {
          'cmd': 'repeat', 'times': 5, 'com': '',
          'moves': [
            { 'cmd': 'forward', 'arg': 10, 'com': '' },
            { 'cmd': 'right', 'arg': 90, 'com': '' }
          ]
        }
      ]
    ]);
  test.done();
};

exports.testRepeatStmtWithPenCmds = function (test) {
  test.expect(1);
  test.deepEqual(parse("repeat 5 [ penup fd 5 pendown fd 5 rt 90 ]\n"),
    [
      [
        {
          'cmd': 'repeat', 'times': 5, 'com': '',
          'moves': [
            { 'cmd': 'penup', 'com': '' },
            { 'cmd': 'forward', 'arg': 5, 'com': '' },
            { 'cmd': 'pendown', 'com': '' },
            { 'cmd': 'forward', 'arg': 5, 'com': '' },
            { 'cmd': 'right', 'arg': 90, 'com': '' }
          ]
        }
      ]
    ]);
  test.done();
};

exports.testRepeatStmtWithHomeCmds = function (test) {
  test.expect(1);
  test.deepEqual(parse("repeat 4 [ fd 100 home rt 90 ]\n"),
    [
      [
        {
          'cmd': 'repeat', 'times': 4, 'com': '',
          'moves': [
            { 'cmd': 'forward', 'arg': 100, 'com': '' },
            { 'cmd': 'home', 'com': '' },
            { 'cmd': 'right', 'arg': 90, 'com': '' }
          ]
        }
      ]
    ]);
  test.done();
};

exports.testRepeatStmtWithNames = function (test) {
  test.expect(1);
  test.deepEqual(parse("def sq\nfd 100\nend\nrepeat 4 [ sq fd 100 home rt 90 ]\n"),
    [
      [
        {
          'cmd': 'proc', 'name': 'sq',
          'body': [
            [
              { 'cmd': 'forward', 'arg': 100, 'com': '' },
            ]
          ]
        }
      ],
      [
        {
          'cmd': 'repeat', 'times': 4, 'com': '',
          'moves': [
            {
              'cmd': 'pname',
              'body': [
                [
                  { 'cmd': 'forward', 'arg': 100, 'com': '' },
                ]
              ]
            },
            { 'cmd': 'forward', 'arg': 100, 'com': '' },
            { 'cmd': 'home', 'com': '' },
            { 'cmd': 'right', 'arg': 90, 'com': '' }
          ]
        }
      ]
    ]);
  test.done();
};

exports.testNestedRepeatStmt = function (test) {
  test.expect(1);
  test.deepEqual(parse("repeat 5 [ rt 10 repeat 2 [ fd 10 rt 30 ] ]\n"),
    [
      [
        {
          'cmd': 'repeat', 'times': 5, 'com': '',
          'moves': [
            { 'cmd': 'right', 'arg': 10, 'com': '' },
            {
              'cmd': 'repeat', 'times': 2, 'com': '',
              'moves': [
                { 'cmd': 'forward', 'arg': 10, 'com': '' },
                { 'cmd': 'right', 'arg': 30, 'com': '' }
              ]
            }
          ]
        }
      ]
    ]);
  test.done();
};

exports.testSimpleProcedure = function (test) {
  test.expect(1);
  test.deepEqual(parse("def sq\nrepeat 4 [ fd 50 rt 90 ]\nend\n"),
    [
      [
        {
          'cmd': 'proc', 'name': 'sq',
          'body': [
            [
              {
                'cmd': 'repeat', 'times': 4, 'com': '',
                'moves': [
                  { 'cmd': 'forward', 'arg': 50, 'com': '' },
                  { 'cmd': 'right', 'arg': 90, 'com': '' },
                ]
              }
            ]
          ]
        }
      ]
    ]);
  test.done();
};

exports.testSimpleProcedureWithOtherStatements = function (test) {
  test.expect(1);
  test.deepEqual(parse("define sq\nrepeat 4 [ fd 50 rt 90 ]\nend\nlt 90 fd 100\n"),
    [
      [
        {
          'cmd': 'proc', 'name': 'sq',
          'body': [
            [
              {
                'cmd': 'repeat', 'times': 4, 'com': '',
                'moves': [
                  { 'cmd': 'forward', 'arg': 50, 'com': '' },
                  { 'cmd': 'right', 'arg': 90, 'com': '' },
                ]
              }
            ]
          ]
        }
      ],
      [
        { 'cmd': 'left', 'arg': 90, 'com': '' },
        { 'cmd': 'forward', 'arg': 100, 'com': '' },
      ]
    ]);
  test.done();
};

exports.testSimpleProcedureWithOtherStatementsAndUsage = function (test) {
  test.expect(1);
  test.deepEqual(parse("define sq\nrepeat 4 [ fd 50 rt 90 ]\nclear\nend\nlt 90 fd 100\nsq\n"),
    [
      [
        {
          'cmd': 'proc', 'name': 'sq',
          'body': [
            [
              {
                'cmd': 'repeat', 'times': 4, 'com': '',
                'moves': [
                  { 'cmd': 'forward', 'arg': 50, 'com': '' },
                  { 'cmd': 'right', 'arg': 90, 'com': '' },
                ]
              }
            ],
            [{ cmd: 'clear', com: '' }]
          ]
        }
      ],
      [
        { 'cmd': 'left', 'arg': 90, 'com': '' },
        { 'cmd': 'forward', 'arg': 100, 'com': '' },
      ],
      [{
        'cmd': 'pname',
        'body': [
          [
            {
              'cmd': 'repeat', 'times': 4, 'com': '',
              'moves': [
                { 'cmd': 'forward', 'arg': 50, 'com': '' },
                { 'cmd': 'right', 'arg': 90, 'com': '' },
              ]
            }
          ],
          [{ cmd: 'clear', com: '' }]]
      }]
    ]);
  test.done();
};

exports.testMovesWithVariables = function (test) {
  test.expect(1);
  test.deepEqual(parse("x = 10\nfd x rt (x + 80) fd (x * 2)\n"),
    [
      [{ cmd: 'var', name: 'x', exp: 'x = 10', com: '' }],
      [
        { 'cmd': 'forward', 'arg': 'x', 'com': '' },
        { 'cmd': 'right', 'arg': '(x + 80)', 'com': '' },
        { 'cmd': 'forward', 'arg': '(x * 2)', 'com': '' }
      ]
    ]);
  test.done();
};


exports.testError = function (test) {
  test.expect(1);
  test.throws(function () { parser.parse("foward 10\n") });
  test.done();
};