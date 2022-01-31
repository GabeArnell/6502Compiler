

class Lexer extends Entity{
    public compiler:Compiler;
    constructor(comp:Compiler){
        super("Lexer");
        this.compiler = comp;
    }


    lexcode(sourcecode:string){
        this.info("Lexing program "+this.compiler.id)

        var rows = sourcecode.split("\n");
        var errors:number = 0;
        var tokenList = [];
        var commenting:boolean = false;

        console.log(rows)
        for (var r = 0; r < rows.length; r++){
            var row:string = rows[r];
            var c = 0;
            while (c < row.length){
                var nextTokenClass = this.findNextToken(row.substring(c,row.length));
                if (nextTokenClass){
                    if (nextTokenClass.name == 'SPACE' || nextTokenClass.name == 'TAB'){
                        c++;
                        continue;
                    }
                    if (nextTokenClass.name == "STARTCOMMENT"){
                        this.warn("STARTING COMMENTING");

                        commenting = true;
                        c+=nextTokenClass.lexeme.length;
                        continue;
                    }
                    if (nextTokenClass.name == "ENDCOMMENT"){
                        this.warn("ENDING COMMENT");
                        commenting = false;
                        c+=nextTokenClass.lexeme.length;
                        continue;
                    }
                    if (commenting == true){
                        c++;
                        continue;
                    }
                    var newToken = new nextTokenClass(c,r,row[c])
                    tokenList.push(newToken);
                    
                    if (newToken.symbol){
                        this.info(`${nextTokenClass.name} [ ${newToken.symbol} ] found at (${r+1}:${c+1})`);
                        c = c + newToken.symbol.length
                    }else{
                        console.log(newToken)
                        this.info(`${nextTokenClass.name} [ ${nextTokenClass.lexeme} ] found at (${r+1}:${c+1})`);
                        c = c + nextTokenClass.lexeme.length
                    }
                }else{
                    if (!commenting){
                        this.warn(`${r+1}:${c+1} Unrecognized Token: ${row[c]}`);
                        errors++;
                    }
                    c++
                }
            }
        }

        if (errors > 0){
            this.info("Lexing failed with "+errors+" error(s).");
        }else{
            this.info("Lexing completed with "+errors+" errors.");
        }

        return tokenList;
    }
    
    /*
        Finds and returns the next token in the given string and the text it used
        Will prioritize longer token strings over smaller ones. Ex: 'print' would be returned instead of 'p' the letter
    */
    private findNextToken(line:string){

        //finding tokens in list by whichever has the closest matching from left->right
        var currentToken = null;
        //searching static tokens
        for (var token of TOKEN_LIST){
            if (line.substring(0,token.lexeme.length) == token.lexeme){
                if (!currentToken || token.lexeme > currentToken.lexeme){
                    currentToken = token;
                }
            }
        }
        if (currentToken != null)
            return currentToken;
        

        //Looking for token as a char
        if (CHAR_LIST.includes(line.charAt(0))){
            console.log("INCLUDES "+line.charAt(0))
            return ID;
        }

        //Looking for token as a char
        if (DIGIT_LIST.includes(line.charAt(0))){
            console.log("INCLUDES "+line.charAt(0))
            return DIGIT;
        }

        
        return null
    }


}
