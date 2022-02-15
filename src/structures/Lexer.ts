
// Lexer section of the compiler. Returns the tokenstream
class Lexer extends Entity{
    public compiler:Compiler;

    constructor(comp:Compiler){
        super("Lexer");
        this.compiler = comp;
    }


    lexcode(sourceCode:string){
        this.info("Lexing program "+this.compiler.id);

        var rows:string[] = sourceCode.split("\n");
        var errors:number = 0;
        var warnings:number = 0;
        var tokenStream:Token[] = [];
        var inComment:number[] = null; // using a quick 2 element array to store where the comment starts in case I need to give a warning for it.
        var inString:number[] = null; //same for inString

        for (var r = this.compiler.startRow; r <= this.compiler.endRow; r++){
            var row:string = rows[r];
            var c:number = r==this.compiler.startRow?this.compiler.startColumn:0;

            while ((r < this.compiler.endRow && c <row.length) || (r == this.compiler.endRow &&c <= this.compiler.endColumn)){ //can go to end of row if its not the last row
                var nextTokenClass = this.findNextToken(row.substring(c,row.length),inString);
                
                if (nextTokenClass){

                    // Non-string spaces get thrown out.
                    if (nextTokenClass.name == 'SPACE' && !inString){
                        c++;
                        continue;
                    }

                    if (nextTokenClass.name == "STARTCOMMENT"){
                        inComment = [c+1,r+1]; //labeling where comment starts incase it needs a warning
                        c+=nextTokenClass.lexeme.length;
                        continue;
                    }

                    if (nextTokenClass.name == "ENDCOMMENT"){
                        if (inComment == null){ //in case of double */
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
                        if (inString){
                            inString=null
                        }else{
                            inString = [c+1,r+1];
                        }
                    }else if (inString && nextTokenClass.name != "CHAR" && nextTokenClass.name != "SPACE"){
                        this.error(`${r+1}:${c+1} Illegal Token placement in string: ${row[c]}`);
                        errors++;
                        c++;
                        continue;
                    }

                    var newToken:Token = new nextTokenClass(c+1,r+1,row[c])
                    tokenStream.push(newToken);
                    
                    // Dynamic token is output via symbol
                    if (newToken.symbol){
                        this.info(`${nextTokenClass.name} [ ${newToken.symbol} ] found at (${r+1}:${c+1})`);
                        c = c + newToken.symbol.length
                    }
                    // Static token is output via lexeme
                    else{
                        console.log(newToken)
                        this.info(`${nextTokenClass.name} [ ${nextTokenClass.lexeme} ] found at (${r+1}:${c+1})`);
                        c = c + nextTokenClass.lexeme.length
                    }
                }else{          
                    if (inComment == null){
                        var badToken:string = row[c];

                        // the \t is a popular character that would be unrecognized but also show up invisibly on the output.
                        // this replacement makes it easier to identify what the actual issue is.
                        // added switchstatement for later expansion
                        switch(badToken){
                            case("\t"):
                                badToken = 'tab'
                                break;
                        }
                        this.error(`${r+1}:${c+1} Unrecognized Token${inString?" in string ":""}: ${badToken}`);
                        errors++;
                    }   
                    c++
                }
            }
            if (inString){
                this.error(`Unclosed string starting at ${inString[1]}:${inString[0]}`); 
                inString=null;
                errors++;
            }
        }


        // Post Run Error Checks
        if (inComment){
            this.warn("Unclosed Comment starting at "+`${inComment[1]}:${inComment[0]}`); //add info where comment starts here
            errors++;
        }
        
        if (tokenStream[tokenStream.length-1].constructor.name != "EOP"){
            this.warn(`Did not end program code with $`);
            warnings++;
        }

        if (tokenStream.length < 1){
            return tokenStream;
        }

        if (errors > 0 ){
            this.error(`Lexing failed with ${errors} error(s) and ${warnings} warning(s).`);
        }else{
            this.info(`Lexing completed with ${errors} errors and ${warnings} warning(s).`);
        }

        return tokenStream;
    }
    
    /*
        Finds and returns the *class* of the next token in the given string and the text it used
        Will prioritize longer token strings over smaller ones. Ex: 'print' would be returned instead of 'p' the letter
    */
    private findNextToken(line:string,inString:number[]){

        //finding tokens in list by whichever has the closest matching from left->right
        var currentTokenClass = null;

        //searching static tokens for the longest lexeme match
        for (var token of TOKEN_LIST){
            if (line.substring(0,token.lexeme.length) == token.lexeme){
                if (!currentTokenClass || token.lexeme > currentTokenClass.lexeme){
                    currentTokenClass = token;
                }
            }
        }
        if (currentTokenClass != null && !inString)
            return currentTokenClass;
        

        //Looking for token as a char
        if (CHAR_LIST.includes(line.charAt(0))){
            if (!inString){
                return ID
            }else{
                return CHAR
            }
        }

        //Looking for token as a char
        if (DIGIT_LIST.includes(line.charAt(0)) && !inString){
            return DIGIT;
        }

        return currentTokenClass
    }


}
