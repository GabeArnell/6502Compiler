
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
            this.info("Parser Failed.");
            return null;
        }
        this.info("Parsing completed successfully.");
        return this.tree;
    }

    expectedError(expectedClasses:string[], received:Token):string{
        let result = "Expected: "
        for (let i = 0; i < expectedClasses.length; i++){
            let targetClass = getTokenClass(expectedClasses[i])
            //console.log(expectedClasses[i],targetClass)
            let postname = targetClass.name;
            if (targetClass['lexeme']){
                postname+= ` [ ${targetClass['lexeme']} ]`
            }
            if (i > 0){
                result+=` or ${postname}`
            }else{
                result+= `${postname}`
            }
        }
        if (received){
            result += ".\nFound "+tokenString(received);
            result = `[${received.row}: ${received.column}] - `+result;
        }else{
            result += ".\nFound nothing."
            // finding current position of the last token consumed and printing the next position, where the missing token should be
            let t = this.tokenStream[this.index-1];
            if (t){ // will try to bump you to put the token immediatly after the first one
                console.log('prev token',t)
                if (t.symbol){//dynamic token runs off of symbol length
                    result = +`[ ${t.row}: ${t.column+t.symbol.length} ] `+result
                }
                else { //static token runs off of lexeme link
                    let prevClass = getTokenClass(t.constructor.name)
                    result = `[ ${t.row}: ${t.column+prevClass['lexeme'].length} ] `+result
                }
            }
        }
        console.log(result)
        return result;
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

    // NEEDS AN ERROR
    parseStatementList(){
        if (this.errorFeedback) return;
        this.tree.addNode(nodeType.branch,'StatementList')
        this.info("Parsing StatementList.");

        this.parseStatement();
        if (this.errorFeedback) return;
        // check if blank

        if (!this.tokenStream[this.index]){
            this.errorFeedback = this.expectedError(['R_BRACE'],null)
            return;
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
        if (!this.tokenStream[this.index]){
            this.errorFeedback = this.expectedError(["PRINT","ID","I_TYPE","S_TYPE","B_TYPE","WHILE","IF"],null);
            return;
        }

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
                this.errorFeedback = this.expectedError(["PRINT","ID","I_TYPE","S_TYPE","B_TYPE","WHILE","IF"],this.tokenStream[this.index])
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
            this.errorFeedback = this.expectedError(["DIGIT","QUOTE","L_PAREN","T_BOOL","F_BOOL","ID"],null)
            return;
        }
        switch(this.tokenStream[this.index].constructor.name){
            case("DIGIT"):
                this.parseIntExpr();
                break;
            case("QUOTE"):
                this.parseStringExpr();
                break;
            case("L_PAREN"):
            case("T_BOOL"):
            case("F_BOOL"):
                this.parseBoolExpr();
                break;
            case("ID"):
                this.parseId();
                break;
            default:
                this.errorFeedback = this.expectedError(["DIGIT","QUOTE","L_PAREN","T_BOOL","F_BOOL","ID"],this.tokenStream[this.index])
        }
        this.tree.moveUp();

    }

    // needs the error
    parseIntExpr(){
        if (this.errorFeedback) return;
        this.info("Parsing IntExpr.");
        this.tree.addNode(nodeType.branch,'IntExpr')

        this.parseDigit();
        if (this.tokenStream[this.index] && this.tokenStream[this.index].constructor.name == "ADD"){
            this.parseIntOp();
            this.parseExpr();
        }else{
            //it was only 1 digit, empty epsiol
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
                    this.errorFeedback = this.expectedError(["T_BOOL","F_BOOL","L_PAREN"],this.tokenStream[this.index])
                }
        }else{
            this.errorFeedback = this.expectedError(["T_BOOL","F_BOOL","L_PAREN"],null)
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
                    this.errorFeedback = this.expectedError(["SPACE","CHAR","QUOTE"],this.tokenStream[this.index])
            }
        }else{
            this.errorFeedback = this.expectedError(["SPACE","CHAR","QUOTE"],null)
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
                    this.errorFeedback = this.expectedError(["I_TYPE","S_TYPE","B_TYPE"],this.tokenStream[this.index])
            }
        }else{
            this.errorFeedback = this.expectedError(["I_TYPE","S_TYPE","B_TYPE"],null)
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
                this.errorFeedback = this.expectedError(["CHAR","SPACE"],this.tokenStream[this.index])
            }
        }else{
            this.errorFeedback = this.expectedError(["CHAR","SPACE"],null)
        }

    }
    

    parseDigit(){
        if (this.errorFeedback) return;
        this.info("Parsing DIGIT.");

        if (this.tokenStream[this.index] && DIGIT_LIST.includes(this.tokenStream[this.index].symbol)){
            this.match("DIGIT")
        }else{
            this.errorFeedback = this.expectedError(["DIGIT"],this.tokenStream[this.index])
        }
    }

    parseBoolOp(){
        if (this.errorFeedback) return;
        this.info("Parsing BoolOp.");

        if (!this.tokenStream[this.index]){
            this.errorFeedback = this.expectedError(["E_BOOL_OP","NE_BOOL_OP"],this.tokenStream[this.index])
            return;
        }
        if (this.tokenStream[this.index].constructor.name=="E_BOOL_OP"){
            this.match("E_BOOL_OP");
        }else if (this.tokenStream[this.index].constructor.name=="NE_BOOL_OP"){
            this.match("NE_BOOL_OP");
        }
        else{
            this.errorFeedback = this.expectedError(["E_BOOL_OP","NE_BOOL_OP"],this.tokenStream[this.index])
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
                this.errorFeedback = this.expectedError(["T_BOOL","F_BOOL"],this.tokenStream[this.index])
            }
        }else{
            this.errorFeedback = this.expectedError(["T_BOOL","F_BOOL"],this.tokenStream[this.index])
        }
    }

    parseIntOp(){
        if (this.errorFeedback) return;
        this.info("Parsing IntOp.");

        this.match("ADD")
    }


}
// first sets for a statement
const leadTokens = {
    ['Statement']: ["PRINT","ID","I_TYPE","S_TYPE","B_TYPE","WHILE","IF","L_BRACE"],

}