
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
        this.info("Parsing program "+this.compiler.id);
        this.tree = new Tree();
        this.tokenStream = tokenStream
        this.parseProgram();
        if (this.errorFeedback){
            this.error(this.errorFeedback);
            return null;
        }
        this.info("Parsing completed successfully.");
        return this.tree;
    }

    match(expected:string){//expected is the token name
        if (this.errorFeedback) return;
        let t = this.tokenStream[this.index++];
        if (t && t.constructor.name == expected){
            this.info("Added "+t.constructor.name+" node.")
            this.tree.addNode(nodeType.leaf,t.constructor.name,t);
        }else{
            if (t){
                this.errorFeedback = `[ ${t.row}: ${t.column} ] Expected [ ${expected} ] found [ ${tokenString(t)} ]`
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
        this.info("Parsing Program.");
        this.tree.addNode(nodeType.root,'Program')
        this.parseBlock();
        this.match("EOP");
    }

    parseBlock(){
        if (this.errorFeedback) return;
        this.info("Parsing Block.");

        this.tree.addNode(nodeType.branch,'Block')

        this.match("L_BRACE");
        this.parseStatementList();
        this.match("R_BRACE");
        this.tree.moveUp();
    }

    parseStatementList(){
        if (this.errorFeedback) return;
        this.tree.addNode(nodeType.branch,'StatementList')
        this.info("Parsing StatementList.");

        this.parseStatement();
        // check if blank
        if (!this.tokenStream[this.index]){
            //error
        }
        if (leadTokens.Statement.includes(this.tokenStream[this.index].constructor.name)){
            this.parseStatementList();
        }else{
            //empty epsilon
        }
        this.tree.moveUp();
    }
    
    parseStatement(){
        if (this.errorFeedback) return;
        this.info("Parsing Statement.");

        this.tree.addNode(nodeType.branch,'Statement')
        switch(this.tokenStream[this.index].constructor.name){
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
        this.info("Parsing PrintStatement.");

        this.tree.addNode(nodeType.branch,'PrintStatement')

        this.match("PRINT");
        this.match("L_PAREN");
        this.parseExpr();
        this.match("R_PAREN");
        this.tree.moveUp();

    }

    parseAssignmentStatement(){
        if (this.errorFeedback) return;
        this.info("Parsing AssignmentStatement.");

        this.tree.addNode(nodeType.branch,'AssignmentStatement')

        this.parseId()
        this.match("ASSIGN");
        this.parseExpr();
        this.tree.moveUp();
    }

    parseVarDecl(){
        if (this.errorFeedback) return;
        this.info("Parsing VarDecl.");

        this.tree.addNode(nodeType.branch,'VarDecl')
        this.parseType();
        this.parseId();
        this.tree.moveUp();
    }

    parseWhileStatement(){
        if (this.errorFeedback) return;
        this.info("Parsing WhileStatement.");

        this.tree.addNode(nodeType.branch,'WhileStatement')

        this.match("WHILE");
        this.parseBoolExpr();
        this.parseBlock();
        this.tree.moveUp();

    }

    parseIfStatement(){
        if (this.errorFeedback) return;
        this.info("Parsing IfStatement.");

        this.tree.addNode(nodeType.branch,'IfStatement')

        this.match("IF");
        this.parseBoolExpr();
        this.parseBlock();
        this.tree.moveUp();

    }

    parseExpr(){
        if (this.errorFeedback) return;
        this.info("Parsing Expr.");

        this.tree.addNode(nodeType.branch,'Expr')

        if (!this.tokenStream[this.index]){
            //error
        }
        switch(this.tokenStream[this.index].constructor.name){
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


    parseIntExpr(){
        if (this.errorFeedback) return;
        this.info("Parsing IntExpr.");
        this.tree.addNode(nodeType.branch,'IntExpr')

        this.parseDigit();
        if (this.tokenStream[this.index] && this.tokenStream[this.index].constructor.name == "ADD"){
            this.parseIntOp();
            this.parseExpr();
        }else{
            this.info("Only 1 digit I guess");
            //it was only 1 digit
        }

        this.tree.moveUp();

    }

    parseStringExpr(){
        if (this.errorFeedback) return;
        this.info("Parsing StringExpr.");

        this.tree.addNode(nodeType.branch,'StringExpr')

        this.match("QUOTE");
        this.parseCharList();
        this.match("QUOTE");
        this.tree.moveUp();

    }
    parseBoolExpr(){
        if (this.errorFeedback) return;
        this.info("Parsing BoolExpr.");
        this.tree.addNode(nodeType.branch,'BoolExpr')

        if (this.tokenStream[this.index]){
            switch(this.tokenStream[this.index].constructor.name){
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
    }
    parseId(){
        if (this.errorFeedback) return;
        this.info("Parsing ID.");

        this.match("ID");
    }

    parseCharList(){
        if (this.errorFeedback) return;
        this.info("Parsing CharList.");

        this.tree.addNode(nodeType.branch,'CharList')

        if (this.tokenStream[this.index]){
            switch(this.tokenStream[this.index].constructor.name){
                case("SPACE"):
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

        //this.tree.addNode(nodeType.branch,'Type')

        if (this.tokenStream[this.index]){
            switch(this.tokenStream[this.index].constructor.name){
                case("I_TYPE"):
                    console.log('matched')
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
        //this.tree.moveUp();
    }   

    parseChar(){
        if (this.errorFeedback) return;
        this.info("Parsing CHAR.");
        if (this.tokenStream[this.index]){
            if (this.tokenStream[this.index].constructor.name=="SPACE"){
                this.match("SPACE")
            }else if (this.tokenStream[this.index].constructor.name=="CHAR"){
                this.match("CHAR")
            }
            else{
                //also error
            }
        }else{
            //error
        }

    }
    

    parseDigit(){
        if (this.errorFeedback) return;
        this.info("Parsing DIGIT.");

        if (this.tokenStream[this.index] && DIGIT_LIST.includes(this.tokenStream[this.index].symbol)){
            this.match("DIGIT")
        }else{
            //error
        }
    }

    parseBoolOp(){
        if (this.errorFeedback) return;
        this.info("Parsing BoolOp.");

        if (!this.tokenStream[this.index]){
            //error
        }
        if (this.tokenStream[this.index].constructor.name=="E_BOOL_OP"){
            this.match("E_BOOL_OP");
        }else if (this.tokenStream[this.index].constructor.name=="NE_BOOL_OP"){
            this.match("NE_BOOL_OP");
        }
        else{
            //also error
        }
    }

    parseBoolVal(){
        if (this.errorFeedback) return;
        this.info("Parsing BoolVal.");

        this.tree.addNode(nodeType.branch,'BoolVal')

        if (this.tokenStream[this.index]){
            if (this.tokenStream[this.index].constructor.name=="T_BOOL"){
                this.match("T_BOOL");
            }else if (this.tokenStream[this.index].constructor.name=="F_BOOL"){
                this.match("F_BOOL");
            }
            else{
                //also error
            }
        }else{
            //error
        }
    }

    parseIntOp(){
        if (this.errorFeedback) return;
        this.info("Parsing IntOp.");

        this.match("ADD")
    }


}

const leadTokens = {
    ['Statement']: ["PRINT","ID","I_TYPE","S_TYPE","B_TYPE","WHILE","IF","L_BRACE"],

}