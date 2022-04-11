/* The lexer checks 2 general types of token classes that extend the base token: 
'Static' Tokens which have a discrete lexeme character(s) to define them, like an EoP using $
'Dynamic' Tokens which have variable lexeme like a digit, ID, or character

*/
class Token{

    // Location of the token
    public row:number=null;
    public column:number=null;

    public symbol:string=null;
    constructor(column:number,row:number){
        this.row = row;
        this.column = column
    }
}

/* Input a token and outputs a string description of the token. justLexeme will return only the token's lexeme and not the name
*/
function tokenString(t:Token,justLexeme:boolean=false){
    let result = `${t.constructor.name}`;
    let baseClass = getTokenClass(t.constructor.name)
    if (justLexeme && (baseClass['lexeme'] || t.symbol)){
        if (t.constructor.name == "SPACE"){ 
            return `[ *space* ]`
        }    
        result =  ``
    }
    if (baseClass['lexeme']){
        result+=`[ ${baseClass['lexeme']} ]`;
    }
    else if (t.symbol){
        result+=`[ ${t.symbol} ]`;
    }

    // special case for concatonated strings in AST
    if (t.constructor.name == "QUOTE" && t['string']){
        justLexeme==false?result=`string`:result='';
        result+=`[ ${t['string']} ]`;
    }
    return result;
}

// List of static tokens
const TOKEN_LIST = [
    class EOP extends Token{
        static lexeme:string = '$'
        constructor(c:number,r:number){
            super(c,r)
        }
    },

    class STARTCOMMENT extends Token{
        static lexeme:string = '/*'
        constructor(c:number,r:number){
            super(c,r)
        }
    },
    class ENDCOMMENT extends Token{
        static lexeme:string = '*/'
        constructor(c:number,r:number){
            super(c,r)
        }
    },
    class L_BRACE extends Token{
        static lexeme:string = '{'
        constructor(c:number,r:number){
            super(c,r)
        }
    },
    class R_BRACE extends Token{
        static lexeme:string = '}'
        constructor(c:number,r:number){
            super(c,r)
        }
    },
    class L_PAREN extends Token{
        static lexeme:string = '('
        constructor(c:number,r:number){
            super(c,r)
        }
    },
    
    class R_PAREN extends Token{
        static lexeme:string = ')'
        constructor(c:number,r:number){
            super(c,r)
        }
    },
    
    class PRINT extends Token{
        static lexeme:string = 'print'
        constructor(c:number,r:number){
            super(c,r)
        }
    },
    class ASSIGN extends Token{
        static lexeme:string = '='
        constructor(c:number,r:number){
            super(c,r)
        }
    },
    class WHILE extends Token{
        static lexeme:string = 'while'
        constructor(c:number,r:number){
            super(c,r)
        }
    },
    
    class IF extends Token{
        static lexeme:string = 'if'
        constructor(c:number,r:number){
            super(c,r)
        }
    },
    class QUOTE extends Token{
        static lexeme:string = '"'
        constructor(c:number,r:number){
            super(c,r)
        }
    },
    class I_TYPE extends Token{
        static lexeme:string = 'int'
        constructor(c:number,r:number){
            super(c,r)
        }
    },
    class S_TYPE extends Token{
        static lexeme:string = 'string'
        constructor(c:number,r:number){
            super(c,r)
        }
    },
    class B_TYPE extends Token{
        static lexeme:string = 'boolean'
        constructor(c:number,r:number){
            super(c,r)
        }
    },
    // false bool
    class F_BOOL extends Token{
        static lexeme:string = 'false'
        constructor(c:number,r:number){
            super(c,r)
        }
    },
    // true bool
    class T_BOOL extends Token{
        static lexeme:string = 'true'
        constructor(c:number,r:number){
            super(c,r)
        }
    },
    // Equals Bool operation
    class E_BOOL_OP extends Token{
        static lexeme:string = '=='
        constructor(c:number,r:number){
            super(c,r)
        }
    },
    // Not Equals Bool Operation
    class NE_BOOL_OP extends Token{
        static lexeme:string = '!='
        constructor(c:number,r:number){
            super(c,r)
        }
    },
    class ADD extends Token{
        static lexeme:string = '+'
        constructor(c:number,r:number){
            super(c,r)
        }
        
    },

    //These never get actually constructed but are identified as tokens for the lexer to throw away
    class SPACE extends Token{ 
        static lexeme:string = ' '
    }
]

// Dynamic tokens that can have multiple lexemes. 
class ID extends Token{
    constructor(c:number,r:number,symbol:string){
        super(c,r)
        this.symbol=symbol;
    }
}
class DIGIT extends Token{
    constructor(c:number,r:number,symbol:string){
        super(c,r)
        this.symbol=symbol;
    }
}
class CHAR extends Token{
    constructor(c:number,r:number,symbol:string){
        super(c,r)
        this.symbol=symbol;
    }
}
const DYNAMIC_TOKENS = [
    ID,
    DIGIT,
    CHAR
]

//Lets me grab token classes for specific token creation
function getTokenClass(className:string){
    for (var t of [...TOKEN_LIST,...DYNAMIC_TOKENS,comparison]){
        if (t.name == className){
            return t;
        }
    }
    
    return null;
}

class comparison extends Token{
    constructor(c:number,r:number){
        super(c,r)
    }
}
const varType = {
    "I_TYPE": "int",
    "S_TYPE": "string",
    "B_TYPE": "bool"
}
const staticTokenTypes = {
    "QUOTE": "S_TYPE",
    "F_BOOL": "B_TYPE",
    "T_BOOL": "B_TYPE",
    "comparison": "B_TYPE",
    "DIGIT": "I_TYPE"
}