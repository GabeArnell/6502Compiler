var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w;
/* The lexer checks 2 general types of token classes that extend the base token:
'Static' Tokens which have a discrete lexeme character(s) to define them, like an EoP using $
'Dynamic' Tokens which have variable lexeme like a digit, ID, or character

*/
class Token {
    constructor(column, row) {
        // Location of the token
        this.row = null;
        this.column = null;
        this.symbol = null;
        this.row = row;
        this.column = column;
    }
}
/* Input a token and outputs a string description of the token. justLexeme will return only the token's lexeme and not the name
*/
function tokenString(t, justLexeme = false) {
    let result = `${t.constructor.name}`;
    let baseClass = getTokenClass(t.constructor.name);
    if (justLexeme) {
        if (t.constructor.name == "SPACE") {
            return `[ *space* ]`;
        }
        result = ``;
    }
    if (baseClass['lexeme']) {
        result += `[ ${baseClass['lexeme']} ]`;
    }
    else if (t.symbol) {
        result += `[ ${t.symbol} ]`;
    }
    return result;
}
// List of static tokens
const TOKEN_LIST = [
    (_a = class EOP extends Token {
            constructor(c, r) {
                super(c, r);
            }
        },
        _a.lexeme = '$',
        _a),
    (_b = class STARTCOMMENT extends Token {
            constructor(c, r) {
                super(c, r);
            }
        },
        _b.lexeme = '/*',
        _b),
    (_c = class ENDCOMMENT extends Token {
            constructor(c, r) {
                super(c, r);
            }
        },
        _c.lexeme = '*/',
        _c),
    (_d = class L_BRACE extends Token {
            constructor(c, r) {
                super(c, r);
            }
        },
        _d.lexeme = '{',
        _d),
    (_e = class R_BRACE extends Token {
            constructor(c, r) {
                super(c, r);
            }
        },
        _e.lexeme = '}',
        _e),
    (_f = class L_PAREN extends Token {
            constructor(c, r) {
                super(c, r);
            }
        },
        _f.lexeme = '(',
        _f),
    (_g = class R_PAREN extends Token {
            constructor(c, r) {
                super(c, r);
            }
        },
        _g.lexeme = ')',
        _g),
    (_h = class PRINT extends Token {
            constructor(c, r) {
                super(c, r);
            }
        },
        _h.lexeme = 'print',
        _h),
    (_j = class ASSIGN extends Token {
            constructor(c, r) {
                super(c, r);
            }
        },
        _j.lexeme = '=',
        _j),
    (_k = class WHILE extends Token {
            constructor(c, r) {
                super(c, r);
            }
        },
        _k.lexeme = 'while',
        _k),
    (_l = class IF extends Token {
            constructor(c, r) {
                super(c, r);
            }
        },
        _l.lexeme = 'if',
        _l),
    (_m = class QUOTE extends Token {
            constructor(c, r) {
                super(c, r);
            }
        },
        _m.lexeme = '"',
        _m),
    (_o = class I_TYPE extends Token {
            constructor(c, r) {
                super(c, r);
            }
        },
        _o.lexeme = 'int',
        _o),
    (_p = class S_TYPE extends Token {
            constructor(c, r) {
                super(c, r);
            }
        },
        _p.lexeme = 'string',
        _p),
    (_q = class B_TYPE extends Token {
            constructor(c, r) {
                super(c, r);
            }
        },
        _q.lexeme = 'boolean',
        _q),
    (_r = 
    // false bool
    class F_BOOL extends Token {
            constructor(c, r) {
                super(c, r);
            }
        },
        _r.lexeme = 'false',
        _r),
    (_s = 
    // true bool
    class T_BOOL extends Token {
            constructor(c, r) {
                super(c, r);
            }
        },
        _s.lexeme = 'true',
        _s),
    (_t = 
    // Equals Bool operation
    class E_BOOL_OP extends Token {
            constructor(c, r) {
                super(c, r);
            }
        },
        _t.lexeme = '==',
        _t),
    (_u = 
    // Not Equals Bool Operation
    class NE_BOOL_OP extends Token {
            constructor(c, r) {
                super(c, r);
            }
        },
        _u.lexeme = '!=',
        _u),
    (_v = class ADD extends Token {
            constructor(c, r) {
                super(c, r);
            }
        },
        _v.lexeme = '+',
        _v),
    (_w = 
    //These never get actually constructed but are identified as tokens for the lexer to throw away
    class SPACE extends Token {
        },
        _w.lexeme = ' ',
        _w)
];
// Dynamic tokens that can have multiple lexemes. 
class ID extends Token {
    constructor(c, r, symbol) {
        super(c, r);
        this.symbol = symbol;
    }
}
class DIGIT extends Token {
    constructor(c, r, symbol) {
        super(c, r);
        this.symbol = symbol;
    }
}
class CHAR extends Token {
    constructor(c, r, symbol) {
        super(c, r);
        this.symbol = symbol;
    }
}
const DYNAMIC_TOKENS = [
    ID,
    DIGIT,
    CHAR
];
//Lets me grab token classes for specific token creation
function getTokenClass(className) {
    for (var t of [...TOKEN_LIST, ...DYNAMIC_TOKENS]) {
        if (t.name == className) {
            return t;
        }
    }
    return null;
}
//# sourceMappingURL=Tokens.js.map