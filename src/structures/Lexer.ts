

class Lexer extends Entity{

    constructor(){
        super("Lexer");
    }


    lexcode(sourcecode:string){
        var rows = sourcecode.split("\n");
        var errors = 0;
        var tokenList = [];
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
                    tokenList.push(new nextTokenClass(c,r));
                    this.info(`${nextTokenClass.name} [ ${nextTokenClass.lexeme} ] found at (${r+1}:${c+1})`);
                    c = c + nextTokenClass.lexeme.length
                }else{
                    this.warn(`${r+1}:${c+1} Unrecognized Token: ${row[c]}`)
                    c++
                }
            }
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
        for (var token of TOKEN_LIST){
            if (line.substring(0,token.lexeme.length) == token.lexeme){
                if (!currentToken || token.lexeme > currentToken.lexeme){
                    currentToken = token;
                }
            }
        }
        


        //Looking for token as a char or digit
        


        //rejecting if anything but a space

        return currentToken
    }


}
