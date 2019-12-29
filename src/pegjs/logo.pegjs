
/** 
 * Logo Language Grammar
 * ---------------------
 * 
 * This is a pegjs compatible grammar for the Logo language
 * 
 */

{
  var Env = {};
  try {
    Env = window; 
  } catch(e) { }// fix for test

  Env.LogoParser = Env.LogoParser || {
    reserved : ('def|define|end|repeat|forward|fd|back|bk|right|rt|left|lt|penup|pendown|color|clr|clear|cls|home'.split('|')),
    varDict : {},
    procDict : {}
  };    
}

program = (p:(proc / statement )? EOL { return p == "" ? [] : p })*

/* procedure definition */

proc = name:PSTART EOL body:PBODY PEND { Env.LogoParser.procDict[name] = body; return [{ cmd: "proc", name: name, body: body }]; }

PSTART = "def"("ine")? SP name:ALPHA { return name }

PBODY = (stmt:statement EOL { return stmt } )+

PEND = "end"

PNAME = name:ALPHA & { return !!Env.LogoParser.procDict[name] } OPT_SP com:OPT_COM { return Env.LogoParser.procDict[name] ? { cmd: "pname", body: Env.LogoParser.procDict[name] } : null; }

/* a full statement */

statement = stmt:((MOVE / PEN / HOME / RPT )+ / COLOR / CLEAR / (PNAME)+ / (PREVAR)+ / COMMENT ) { return stmt }

/* The repeat command */

RPT = cmd:"repeat" OPT_SP times:PRIMARY OPT_SP "[" OPT_SP moves:(MOVE / PEN / HOME / RPT / PREVAR / PNAME)+  OPT_SP "]" OPT_SP com:OPT_COM
    { return { cmd: cmd, times: times, moves: moves, com: com }; }

/* Basic Moves */

MOVE = cmd:(FD/BK/LT/RT) OPT_SP by:PREPRIMARY OPT_SP com:OPT_COM { return { cmd: cmd, arg: by, com: com }; }

FD = "forward"/"fd" { return "forward" }

BK = "back"/"bk" { return "back" }

RT = "right"/"rt" { return "right" }

LT = "left"/"lt" { return "left" }

/* Pen Commands */
PEN = cmd:("penup"/"pendown") OPT_SP com:OPT_COM { return { cmd: cmd, com: com }; }

/* Other Commands */

COLOR = cmd:("color"/"clr") OPT_SP to:PRIMARY OPT_SP com:OPT_COM { return [ { cmd: "color", arg: to, com: com } ]; }

CLEAR = cmd:("clear"/"cls") OPT_SP com:OPT_COM { return [ { cmd: "clear", com: com } ]; }

HOME = cmd:"home" OPT_SP com:OPT_COM { return { cmd: "home", com: com }; }

/* Variables need basic preprocessing as they can change at runtime */

PREVAR = name:ALPHA OPT_SP "=" OPT_SP val:PREADD OPT_SP com:OPT_COM { if (!Env.LogoParser.varDict[name]) Env.LogoParser.varDict[name] = true; return { cmd: "var", name: name, exp: (name + " = " + val), com: com }; }

PREADD = left:PREMUL OPT_SP "+" OPT_SP right:PREADD { return left + " + " + right; }  / PREMUL

PREMUL = left:PREPRIMARY OPT_SP "*" OPT_SP right:PREMUL { return left + " * " + right; }  / PREPRIMARY

PREPRIMARY = NUM / PREVNAME / "(" OPT_SP add:PREADD OPT_SP ")" { return "(" + add + ")"; }

PREVNAME = name:ALPHA { return Env.LogoParser.varDict[name] ? name : null; }

/* Variable rules for processing at runtime */

VAR = name:ALPHA OPT_SP "=" OPT_SP val:ADD OPT_SP com:OPT_COM { Env.LogoParser.varDict[name] = val; return { cmd: "var", val: val, com: com }; }

ADD = left:MUL OPT_SP "+" OPT_SP right:ADD { return left + right; }  / MUL

MUL = left:PRIMARY OPT_SP "*" OPT_SP right:MUL { return left * right; }  / PRIMARY

PRIMARY = NUM / VNAME / "(" OPT_SP add:ADD OPT_SP ")" { return add; }

VNAME = name:ALPHA { return Env.LogoParser.varDict[name] ? Env.LogoParser.varDict[name] : null }

/* Comments */
COMMENT = com: COM { return [ { cmd: "comment", com: com } ]; }

OPT_COM = com: (COM)? { return com || '' }

COM = ";" OPT_SP text:ANY_NOT_EOL* { return text.join(""); }

/* Misc */

OPT_SP = SP?

SP = ([ ]+)

ALPHA = chars:([a-z]+) { var text = chars.join(""); return Env.LogoParser.reserved.indexOf(text) == -1 ? text : null }

NUM = digits:[0-9]+ { return parseInt(digits.join(""), 10); }

ANY_NOT_EOL = chars:(!EOL ANY) { return chars.join(""); }

EOL = [\n\r\u2028\u2029\\\\]
    
ANY = .
