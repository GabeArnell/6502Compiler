
// Semantic Analysis section of the compiler. Input: Token stream; Output: Abstract Syntax Tree
/*
The AST is basically a copy of the parser just with the unimportant nodes of the tree removed
 and parser error handling removed (its redundent!)

*/
class SemanticAnalyser extends Entity{
    public compiler:Compiler;
    public tree:Tree;
    public index:number=0;
    public tokenStream:Token[];
    public errorFeedback:string = null;
    
    constructor(comp:Compiler){
        super("Semantic Analyser");
        this.compiler = comp;
    }

    parseStream(tokenStream:Token[]):Tree{
        this.info("Semantic Analysis for program "+this.compiler.id);
        this.tree = new Tree();
        this.tokenStream = tokenStream
        this.parseProgram();
        if (this.errorFeedback){
            this.error(this.errorFeedback);
            this.info("Semantic Analysis Failed.");
            return null;
        }
        this.info("Semantic Analysis completed successfully.\n");
        return this.tree;
    }


    match(expected:string,AST:boolean=false){//expected is the token name, AST is if it appears in AST
        if (this.errorFeedback) return;
        let t = this.tokenStream[this.index++];
        if (AST && t && t.constructor.name == expected){
            this.info("Added "+t.constructor.name+" node.")
            this.tree.addNode(nodeType.leaf,t.constructor.name,t);
        }
    }

    parseProgram(){
        this.parseBlock(true);
    }

    parseBlock(isRoot:boolean=false){
        if (this.errorFeedback) return;

        if (isRoot){
            this.tree.addNode(nodeType.root,'Block')
        }
        else{
            this.tree.addNode(nodeType.branch,'Block')
        }

        this.match("L_BRACE");
        this.parseStatementList();
        this.match("R_BRACE");
        this.tree.moveUp();
    }

    parseStatementList(){
        if (this.errorFeedback) return;

        if (this.errorFeedback) return;
        // check if blank

        if (this.tokenStream[this.index].constructor.name == "R_BRACE"){
            //empty epsilon
            return;
        }
        this.parseStatement();
        if (leadTokens.Statement.includes(this.tokenStream[this.index].constructor.name)){
            this.parseStatementList();
        }else{
            //empty epsilon
        }
    }
    
    parseStatement(){
        if (this.errorFeedback) return;
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
            case("L_BRACE"):
                this.parseBlock()
                break;
        }
    }

    parsePrintStatement(){
        if (this.errorFeedback) return;

        this.tree.addNode(nodeType.branch,'PrintStatement')

        this.match("PRINT");
        this.match("L_PAREN");
        this.parseExpr();
        this.match("R_PAREN");
        this.tree.moveUp();

    }

    parseAssignmentStatement(){
        if (this.errorFeedback) return;

        this.tree.addNode(nodeType.branch,'AssignmentStatement')

        this.parseId()
        this.match("ASSIGN");
        this.parseExpr();
        this.tree.moveUp();
    }

    parseVarDecl(){
        if (this.errorFeedback) return;

        this.tree.addNode(nodeType.branch,'VarDecl')
        this.parseType();
        this.parseId();
        this.tree.moveUp();
    }

    parseWhileStatement(){
        if (this.errorFeedback) return;

        this.tree.addNode(nodeType.branch,'WhileStatement')

        this.match("WHILE");
        this.parseBoolExpr();
        this.parseBlock();
        this.tree.moveUp();
    }

    parseIfStatement(){
        if (this.errorFeedback) return;

        this.tree.addNode(nodeType.branch,'IfStatement')

        this.match("IF");
        this.parseBoolExpr();
        this.parseBlock();
        this.tree.moveUp();

    }

    parseExpr(){
        if (this.errorFeedback) return;

        //this.tree.addNode(nodeType.branch,'Expr')

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
        }

    }

    // needs the error
    parseIntExpr(){
        if (this.errorFeedback) return;

        this.parseDigit();
        if (this.tokenStream[this.index] && this.tokenStream[this.index].constructor.name == "ADD"){
            this.parseIntOp();
            this.parseExpr();
        }else{
            //it was only 1 digit, empty epsiol
        }


    }

    parseStringExpr(){
        if (this.errorFeedback) return;
        this.match("QUOTE",true);
        this.parseCharList();
        this.match("QUOTE",true);

    }
    parseBoolExpr(){
        if (this.errorFeedback) return;

        if (this.tokenStream[this.index]){
            switch(this.tokenStream[this.index].constructor.name){
                case("T_BOOL"):
                case("F_BOOL"):
                    this.parseBoolVal();
                    break;
                case("L_PAREN"):
                    this.match("L_PAREN");

                    /* There are two options here, either it is == or !=, ifEq or ifNEq. 
                    However we can't tell that until we parse the expression, and we need the ifEq/ifNEq node to be on top of the expression.
                    So we'll assume that the BoolOp is == until we get to the parseBoolOp, then if it is different we'll change the node to ifNEq
                    */
                    this.tree.addNode(nodeType.branch,'IfEqual')
                    let boolOpNode = this.tree.current;
                    this.parseExpr();

                    // This method will take the node as input and change it if it matches !=
                    this.parseBoolOp(boolOpNode);

                    this.parseExpr();

                    this.match("R_PAREN");
                    this.tree.moveUp()
                    break;
                }
        }
    }

    parseId(){
        if (this.errorFeedback) return;

        this.match("ID",true);
    }

    parseCharList(){
        if (this.errorFeedback) return;

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
            }
        }
    }

    parseType(){
        if (this.errorFeedback) return;
        if (this.tokenStream[this.index]){
            switch(this.tokenStream[this.index].constructor.name){
                case("I_TYPE"):
                    this.match("I_TYPE",true);
                    break;
                case("S_TYPE"):
                    this.match("S_TYPE",true);
                    break;
                case("B_TYPE"):
                    this.match("B_TYPE",true);
                    break;
            }
        }
    }   

    parseChar(){
        if (this.errorFeedback) return;
        if (this.tokenStream[this.index]){
            if (this.tokenStream[this.index].constructor.name=="SPACE"){
                this.match("SPACE",true)
            }else if (this.tokenStream[this.index].constructor.name=="CHAR"){
                this.match("CHAR",true)
            }
        }
    }
    

    parseDigit(){
        if (this.errorFeedback) return;
        if (this.tokenStream[this.index] && DIGIT_LIST.includes(this.tokenStream[this.index].symbol)){
            this.match("DIGIT",true)
        }
    }

    parseBoolOp(boolOpNode:TreeNode){
        if (this.errorFeedback) return;
        if (this.tokenStream[this.index].constructor.name=="E_BOOL_OP"){
            this.match("E_BOOL_OP");
        }else if (this.tokenStream[this.index].constructor.name=="NE_BOOL_OP"){
            this.match("NE_BOOL_OP");
            boolOpNode.name = "IfNotEqual"
        }
    }

    parseBoolVal(){
        if (this.errorFeedback) return;

        if (this.tokenStream[this.index]){
            if (this.tokenStream[this.index].constructor.name=="T_BOOL"){
                this.match("T_BOOL",true);
            }else if (this.tokenStream[this.index].constructor.name=="F_BOOL"){
                this.match("F_BOOL",true);
            }
            
        }
    }

    parseIntOp(){
        if (this.errorFeedback) return;
        this.match("ADD",true)
    }


}