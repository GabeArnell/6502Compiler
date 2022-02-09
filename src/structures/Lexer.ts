

class Lexer extends Entity{
    public compiler:Compiler;
    constructor(comp:Compiler){
        super("Lexer");
        this.compiler = comp;
    }


    lexcode(sourcecode:string){
        this.info("Lexing program "+this.compiler.id);



        var rows = sourcecode.split("\n");
        var errors:number = 0;
        var warnings:number = 0;
        var tokenStream = [];
        var inComment = null;
        var inString:boolean = false;

        console.log(rows)
        for (var r = this.compiler.startRow; r <= this.compiler.endRow; r++){
            var row:string = rows[r];
            var c = r==this.compiler.startRow?this.compiler.startColumn:0;
            
            while ((r < this.compiler.endRow && c <row.length) || (c <= this.compiler.endColumn)){
                var nextTokenClass = this.findNextToken(row.substring(c,row.length),inString);
                if (nextTokenClass){
                    if (nextTokenClass.name == 'SPACE' && !inString){
                        c++;
                        continue;
                    }
                    if (nextTokenClass.name == "STARTCOMMENT"){
                        inComment = [c+1,r+1];//labeling where comment starts incase it needs a warning
                        c+=nextTokenClass.lexeme.length;
                        continue;
                    }
                    if (nextTokenClass.name == "ENDCOMMENT"){
                        console.log(inComment)
                        if (inComment == null){//incase of double */
                            this.error(`Unpaired [ ${nextTokenClass.lexeme} ] token at ${r+1}:${c+1}`);
                            errors++; 
                            c+=nextTokenClass.lexeme.length;
                            continue;   
                        }
                        inComment = null;
                        c+=nextTokenClass.lexeme.length;
                        continue;
                    }
                    if (inComment != null){
                        c++;
                        continue;
                    }
                    if (nextTokenClass.name == "QUOTE"){
                        inString  = !inString;
                    }else if (inString){
                        c++;
                        continue;
                    }

                    
                    var newToken = new nextTokenClass(c+1,r+1,row[c])
                    tokenStream.push(newToken);
                    
                    if (newToken.symbol){
                        this.info(`${nextTokenClass.name} [ ${newToken.symbol} ] found at (${r+1}:${c+1})`);
                        c = c + newToken.symbol.length
                    }else{
                        console.log(newToken)
                        this.info(`${nextTokenClass.name} [ ${nextTokenClass.lexeme} ] found at (${r+1}:${c+1})`);
                        c = c + nextTokenClass.lexeme.length
                    }
                }else{
                    if (inComment == null){
                        this.error(`${r+1}:${c+1} Unrecognized Token${inString?" in string ":""}: ${row[c]}`);
                        errors++;
                    }
                    c++
                }
            }
        }


        // Post Run Error CHecks

        if (inComment){
            this.warn("Unclosed Comment starting at "+`${inComment[0]}:${inComment[0]}`); //add info where comment starts here
            errors++;
        }
        if (inString){
            var lastToken:Token = tokenStream[tokenStream.length-1]
            this.error(`Unclosed string starting at ${lastToken.row}:${lastToken.column}`); //add info where comment starts here
            errors++;
        }
        if (tokenStream[tokenStream.length-1].constructor.name != "EOP"){
            this.warn(`Did not end program code with $`);
            warnings++;
        }

        if (tokenStream.length < 1){
            return tokenStream;
        }

        //checking {} and $ format
        /* Lexer shouldnt be doing this
        if (tokenStream[0].constructor.name != "L_BRACE"){
            this.warn(`Did not start program block with {`);
            const startClass = getTokenClass("L_BRACE");
            const startBrace = new startClass(0,0); 
            tokenStream.splice(0,0,startBrace);
            warnings++;
        }
        
        if (tokenStream[tokenStream.length-2].constructor.name != "R_BRACE"){
            this.warn(`Did not end program block with }`);
            const endClass = getTokenClass("R_BRACE");
            const endEOP = new endClass(tokenStream[tokenStream.length-1].column+1,tokenStream[tokenStream.length-1].row); 
            tokenStream.splice(tokenStream.length-1,0,endEOP);
            warnings++;
        }*/


        if (errors > 0 ){
            this.error(`Lexing failed with ${errors} error(s) and ${warnings} warnings.`);
        }else{
            this.info(`Lexing completed with ${errors} errors and ${warnings} warnings.`);
        }

        return tokenStream;
    }
    
    /*
        Finds and returns the next token in the given string and the text it used
        Will prioritize longer token strings over smaller ones. Ex: 'print' would be returned instead of 'p' the letter
    */
    private findNextToken(line:string,inString:boolean){

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
        if (currentToken != null && !inString)
            return currentToken;
        

        //Looking for token as a char
        if (CHAR_LIST.includes(line.charAt(0))){
            console.log("INCLUDES "+line.charAt(0))
            if (!inString){
                return ID
            }else{
                return CHAR
            }
        }

        //Looking for token as a char
        if (DIGIT_LIST.includes(line.charAt(0)) && !inString){
            console.log("INCLUDES "+line.charAt(0))
            return DIGIT;
        }

        
        return currentToken
    }


}
