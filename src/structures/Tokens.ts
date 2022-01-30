class Token{
    public row:number=null;
    public column:number=null;
    constructor(column:number,row:number){
        this.row = row;
        this.column = column
    }
}

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
        static lexeme:string = 'print'
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
    },
    class TAB extends Token{ 
        static lexeme:string = '\t'
    }
]

