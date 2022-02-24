
// Parser section of the compiler. Input: Token stream; Output: Concrete Syntax Tree
class Parser extends Entity{
    public compiler:Compiler;
    public tree:Tree;
    public index:number=0;
    public tokenStream:Token[];
    public errorFeedback:string = null;

    constructor(comp:Compiler){
        super("Parser");
        this.compiler = comp;

    }

    parseStream(tokenStream:Token[]):Tree{
        this.tree = new Tree();
        this.tokenStream = tokenStream
        this.parseProgram();
        if (this.errorFeedback){
            this.error(this.errorFeedback);
            return null;
        }
        return this.tree;
    }

    match(expected:string){//expected is the token name
        if (this.errorFeedback) return;
        let t = this.tokenStream[this.index++];
        if (t && t.constructor.name == expected){
            this.tree.addNode(nodeType.leaf,t.constructor.name,t);
        }else{
            if (t){
                this.errorFeedback = `[ ${t.row}: ${t.column} ] Expected [ ${expected} ] found [ ${t.constructor.name} ]`
            }else{
                let t = this.tokenStream[this.index-1];
                if (t){ // will try to bump you to put the token immediatly after the first one
                    this.errorFeedback = `[ ${t.row}: ${t.column+(t.symbol?t.symbol.length:t['lexeme'].length)} ] Expected [ ${expected} ] found nothing.`
                }else{
                    this.errorFeedback = `Expected [ ${expected} ] found nothing.`
                }
            }
        }
    }

    parseProgram(){
        this.tree.addNode(nodeType.root,'Goal')
        this.parseBlock();
        this.match("EOP");
    }

    parseBlock(){
        if (this.errorFeedback) return;
        this.match("L_BRACE");
        this.parseStatementList();
        this.match("R_BRACE");
        this.tree.moveUp();
    }

    parseStatementList(){
        if (this.errorFeedback) return;
        // check if blank
        if (!this.tokenStream[this.index+1]){
            //error
        }
        if (leadTokens.Statement.includes(this.tokenStream[this.index+1].constructor.name)){
            this.parseStatement();
        }else{
            //empty epsilon
        }
        this.tree.moveUp();
    }

    parseStatement(){
        if (this.errorFeedback) return;
        switch(this.tokenStream[this.index+1].constructor.name){
            case("PRINT")://
                this.parsePrintStatement();
                break;
            case("ID"):
                this.parseAssignmentStatement();
                break;
            case("I_TYPE"):
            case("S_TYPE"):
            case("B_TYPE"):
                this.parseVarDecl();
                break;
            case("WHILE"):
                this.parseWhileStatement();
                break;
            case("IF"):
                this.parseIfStatement();
                break;
            default:
                //error
        }
        this.tree.moveUp();
    }

    parsePrintStatement(){
        if (this.errorFeedback) return;
        this.match("PRINT");
        this.match("L_PAREN");
        this.parseExpr();
        this.match("R_PAREN");
        this.tree.moveUp();

    }

    parseAssignmentStatement(){
        if (this.errorFeedback) return;
        this.parseId()
        this.match("ASSIGN");
        this.parseExpr();
        this.tree.moveUp();

    }

    parseVarDecl(){
        if (this.errorFeedback) return;
        this.parseType();
        this.parseId();
        this.tree.moveUp();

    }

    parseWhileStatement(){
        if (this.errorFeedback) return;
        this.match("WHILE");
        this.parseBoolExpr();
        this.parseBlock();
        this.tree.moveUp();

    }

    parseIfStatement(){
        if (this.errorFeedback) return;
        this.match("IF");
        this.parseBoolExpr();
        this.parseBlock();
        this.tree.moveUp();

    }

    parseExpr(){
        if (this.errorFeedback) return;
        if (!this.tokenStream[this.index+1]){
            //error
        }
        switch(this.tokenStream[this.index+1].constructor.name){
            case("DIGIT"):
                this.parseIntExpr();
                break;
            case("QUOTE"):
                this.parseStringExpr();
                break;
            case("L_PAREN"):
            case("TRUE"):
            case("FALSE"):
                this.parseBoolExpr();
                break;
            case("ID"):
                this.parseId();
                break;
        }
        this.tree.moveUp();

    }


    // THIS IS NOT COMPLETED
    parseIntExpr(){
        if (this.errorFeedback) return;
        this.parseDigit();
        if (this.tokenStream[this.index+2] && this.tokenStream[this.index+2].constructor.name){
            //error
        }

        this.tree.moveUp();

    }

    parseStringExpr(){
        if (this.errorFeedback) return;
        this.match("QUOTE");
        this.parseCharList();
        this.match("QUOTE");
        this.tree.moveUp();

    }
    parseBoolExpr(){
        if (this.errorFeedback) return;
        if (this.tokenStream[this.index+1]){
            switch(this.tokenStream[this.index+1].constructor.name){
                case("T_BOOL"):
                case("F_BOOL"):
                    this.parseBoolVal()
                case("L_PAREN"):
                    this.match("L_PAREN");
                    this.parseExpr();
                    this.parseBoolOp();
                    this.parseExpr();
                    this.match("R_PAREN");
                    break;
                default:
                    //error
            }
        }else{
            //error
        }
        this.tree.moveUp();

    }
    parseId(){
        if (this.errorFeedback) return;
        this.match("ID");
        this.tree.moveUp();

    }

    parseCharList(){
        if (this.errorFeedback) return;
        if (this.tokenStream[this.index+1]){
            switch(this.tokenStream[this.index+1].constructor.name){
                case("CHAR"):
                    this.parseChar();
                    this.parseCharList();
                    break;
                case("QUOTE")://charlist ends
                    // marks end of charlist, 
                    break;
                default:
                    //error
            }
        }else{
            //error
        }
        this.tree.moveUp();

    }

    parseType(){
        if (this.errorFeedback) return;
        if (this.tokenStream[this.index+1]){
            switch(this.tokenStream[this.index+1].constructor.name){
                case("I_TYPE"):
                    this.match("I_TYPE");
                    break;
                case("S_TYPE"):
                    this.match("S_TYPE");
                    break;
                case("B_TYPE"):
                    this.match("B_TYPE");
                    break;
                default:
                    //error
            }
        }else{
            //error
        }
        this.tree.moveUp();
    }   

    parseChar(){
        if (this.errorFeedback) return;
        this.match("CHAR")
        this.tree.moveUp();
    }
    
    parseSpace(){
        if (this.errorFeedback) return;
        this.match("SPACE")
        this.tree.moveUp();
    }

    parseDigit(){
        if (this.errorFeedback) return;
        if (this.tokenStream[this.index+1] && DIGIT_LIST.includes(this.tokenStream[this.index+1].symbol)){
            this.match("DIGIT")
        }else{
            //error
        }
        this.tree.moveUp();
    }

    parseBoolOp(){
        if (this.errorFeedback) return;
        if (!this.tokenStream[this.index+1]){
            //error
        }
        if (this.tokenStream[this.index+1].constructor.name=="E_BOOL_OP"){
            this.match("E_BOOL_OP");
        }else if (this.tokenStream[this.index+1].constructor.name=="NE_BOOL_OP"){
            this.match("NE_BOOL_OP");
        }
        else{
            //also error
        }
        this.tree.moveUp();        
    }

    parseBoolVal(){
        if (this.errorFeedback) return;
        if (this.tokenStream[this.index+1]){
            if (this.tokenStream[this.index+1].constructor.name=="T_BOOL"){
                this.match("T_BOOL");
            }else if (this.tokenStream[this.index+1].constructor.name=="F_BOOL"){
                this.match("F_BOOL");
            }
            else{
                //also error
            }
        }else{
            //error
        }
        this.tree.moveUp();
    }

    parseIntOp(){
        if (this.errorFeedback) return;
        this.match("ADD")
        this.tree.moveUp();
    }


}

const leadTokens = {
    ['Statement']: ["PRINT","ID","I_TYPE","S_TYPE","B_TYPE","WHILE","IF","L_BRACE"],

}