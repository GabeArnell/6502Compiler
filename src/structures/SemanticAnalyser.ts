
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
    public warnings:number = 0;

    constructor(comp:Compiler){
        super("Semantic Analyser");
        this.compiler = comp;
    }
    
    parseStream(tokenStream:Token[]):Tree{
        this.info("Semantic Analysis for program "+this.compiler.id);
        this.tree = new Tree();
        this.tokenStream = tokenStream
        this.parseProgram();

        // Run through the tree and ensure all symbols are used & initialized
        let symbolFeedback = this.searchForSymbols(this.tree.root);
        this.errorFeedback =this.errorFeedback || symbolFeedback;
        if (this.errorFeedback){
            this.error(this.errorFeedback);
            this.info("Semantic Analysis Failed.");
            
        }else{
            this.info("Semantic Analysis completed successfully with "+this.warnings+" warning(s)\n");
        }
        
        return this.tree;
    }

    searchForSymbols(node:TreeNode):string{
        let error = null;
        if (node.symbolTable){
            for (let key in node.symbolTable){
                let data = node.symbolTable[key];
                if (data.initialization == null ){
                    if (data.used){
                        this.warnings++;
                        this.warn(`[ ${data.declaration.row} : ${data.declaration.column} ] variable [ ${key} ] declared & used but not initialized.`)
                    }else{
                        this.warnings++;
                        this.warn(`[ ${data.declaration.row} : ${data.declaration.column} ] variable [ ${key} ] declared but not initialized.`)    
                    }
                }
                else if (data.used == false){
                    this.warnings++;
                    this.warn(`[ ${data.declaration.row} : ${data.declaration.column} ] variable [ ${key} ] declared but not used.`)
                }
            }
        }
        for (let child of node.children){
            error = this.searchForSymbols(child);
            if (error){
                return error;
            }
        }

        return error;
    }


    match(expected:string,AST:boolean=false){//expected is the token name, AST is if it appears in AST
        if (this.errorFeedback) return;
        let t = this.tokenStream[this.index++];
        if (AST && t && t.constructor.name == expected){
            //this.info("Added "+t.constructor.name+" node.")
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
        let idToken = this.tokenStream[this.index]
        this.parseId()
        
        this.match("ASSIGN");
        let usedSymbols:Token[] = this.parseExpr();
        if (this.errorFeedback) return;
        //check if assign
        console.log("Use symbols",usedSymbols);
        console.log('current',this.tree.current)
        let feedback = this.tree.current.initializeSymbol(idToken,usedSymbols,this.tree.current)
        if (feedback[0]){
            this.errorFeedback = feedback[0];
            return;
        }
        if (feedback[1]){
            this.warn(feedback[1]);
            this.warnings++
        }

       

        this.tree.moveUp();
    }

    parseVarDecl(){
        if (this.errorFeedback) return;

        this.tree.addNode(nodeType.branch,'VarDecl')
        let typeToken = this.tokenStream[this.index]
        this.parseType();
        let idToken = this.tokenStream[this.index]
        this.parseId();
        //adding to symbol tree
        console.log(typeToken,typeToken.constructor.name)
        let error = this.tree.current.addSymbol(idToken,typeToken)
        if (error){
            this.errorFeedback = `[ ${idToken.row} : ${idToken.column} ] `+error;
            return;
        }
        this.tree.moveUp();
    }

    parseWhileStatement(){
        if (this.errorFeedback) return;

        this.tree.addNode(nodeType.branch,'WhileStatement')

        this.match("WHILE");
        this.parseBoolExpr();
        if (this.errorFeedback) return;
        this.parseBlock();
        this.tree.moveUp();
    }

    parseIfStatement(){
        if (this.errorFeedback) return;

        this.tree.addNode(nodeType.branch,'IfStatement')

        this.match("IF");
        this.parseBoolExpr();
        if (this.errorFeedback) return;
        this.parseBlock();
        this.tree.moveUp();

    }

    parseExpr(tokenList = []):any{
        if (this.errorFeedback) return;

        //this.tree.addNode(nodeType.branch,'Expr')

        switch(this.tokenStream[this.index].constructor.name){
            case("DIGIT"):
                tokenList=this.parseIntExpr(tokenList);
                return tokenList;
                break;
            case("QUOTE"):
                this.parseStringExpr(tokenList);
                return tokenList;
                break;
            case("L_PAREN"):
            case("T_BOOL"):
            case("F_BOOL"):
                this.parseBoolExpr(tokenList);
                return tokenList;
            case("ID"):
                let idToken = this.tokenStream[this.index]
                tokenList.push(idToken)
                this.parseId();
                // the variable is being used in a statement
                console.log("using")
                this.errorFeedback = this.tree.current.useSymbol(idToken);
                console.log(this.errorFeedback)
                if (this.errorFeedback) return;
                return tokenList;
        }

    }

    // needs the error
    parseIntExpr(tokenList = []):any{
        if (this.errorFeedback) return;

        if (this.tokenStream[this.index+1].constructor.name == "ADD"){ // token after next is intop
            this.tree.addNode(nodeType.branch,'ADD')
            this.parseDigit();
            this.parseIntOp(); // need this before the above node
            let usedTokens = this.parseExpr([])
            for (let t of usedTokens){
                console.log('checking',t)
                if (t.constructor.name == "DIGIT" || (t.symbol && this.tree.current.getSymbol(t.symbol).type=="I_TYPE")){
                    //valid
                }
                else{
                    this.errorFeedback= `[ ${t.row} : ${t.column} ] Type error. `
                    switch(t.constructor.name){
                        case("QUOTE"): // string
                            this.errorFeedback += `Used string [ ${t.string} ] in int expression. Can only use int variables or digits.`
                            break;
                        case("F_BOOL"):
                        case("T_BOOL"):
                            this.errorFeedback += `Used boolean [ ${t.constructor.lexeme} ] in int expression. Can only use int variables or digits.`
                            break;
                        case("ID"):
                            let wrongType = this.tree.current.getSymbol(t.symbol).type
                            this.errorFeedback += `Used ${varType[wrongType]} variable [ ${t.symbol} ] in int expression. Can only use int variables or digits.`
                            break;
                    }
                    return;
                }
            }
            this.tree.moveUp();
            return [...tokenList,...usedTokens];

        }else{
            let digit = this.tokenStream[this.index]
            this.parseDigit();
            tokenList.push(digit)
            return tokenList
        }

    }

    parseStringExpr(tokenList=[]){
        if (this.errorFeedback) return;
        let startingToken = this.tokenStream[this.index];
        this.match("QUOTE");
        let string =  this.parseCharList();
        console.log(string)
        startingToken['string'] = string;
        tokenList.push(startingToken);
        this.tree.addNode(nodeType.branch,string,startingToken);
        this.match("QUOTE");
        this.tree.moveUp();
    }
    parseBoolExpr(tokenList = []):any{
        if (this.errorFeedback) return;

        if (this.tokenStream[this.index]){
            switch(this.tokenStream[this.index].constructor.name){
                case("T_BOOL"):
                case("F_BOOL"):
                    tokenList.push(this.tokenStream[this.index])
                    this.parseBoolVal();
                    return tokenList;
                case("L_PAREN"):
                    this.match("L_PAREN");

                    /* There are two options here, either it is == or !=, ifEq or ifNEq. 
                    However we can't tell that until we parse the expression, and we need the ifEq/ifNEq node to be on top of the expression.
                    So we'll assume that the BoolOp is == until we get to the parseBoolOp, then if it is different we'll change the node to ifNEq
                    */
                    this.tree.addNode(nodeType.branch,'IfEqual')
                    let boolOpNode = this.tree.current;
                    let leftList = []; //
                    let rightList = [];
                    leftList=this.parseExpr();

                    // This method will take the node as input and change it if it matches !=
                    this.parseBoolOp(boolOpNode);

                    rightList=this.parseExpr();
                    //checking that the used types match. As it is recursive, we only really need to check the first in every array.
                    let leftToken = leftList[0];
                    let rightToken = rightList[0];
                    console.log(leftList,'vs',rightList)
                    if (leftToken.constructor.name == rightToken.constructor.name && leftToken.constructor.name != 'ID'){
                        // valid case, either a DIGIT, QUOTE(string header), are working
                    }
                    else if (leftToken.constructor.name.toLowerCase().includes("bool") && rightToken.constructor.name.toLowerCase().includes("bool")){
                        // valid case, leftToken and rightToken are either true or false, or the placeholder boolexperession
                    }else{
                        // checking the actual types
                        let leftType:string,rightType:string;
                        if (this.tree.current.getSymbol(leftToken.symbol)){
                            leftType = this.tree.current.getSymbol(leftToken.symbol).type;
                        }else{
                            leftType=staticTokenTypes[leftToken.constructor.name]
                        }
                        if (this.tree.current.getSymbol(rightToken.symbol)){
                            rightType = this.tree.current.getSymbol(rightToken.symbol).type;
                        }else{
                            rightType=staticTokenTypes[rightToken.constructor.name]
                        }
                        if (leftType != rightType){
                            this.errorFeedback = `Type missmatch: compared ${varType[leftType]} ${tokenString(leftToken,true)} [ ${leftToken.row} : ${leftToken.column} ] to ${varType[rightType]} ${tokenString(rightToken,true)} [ ${rightToken.row} : ${rightToken.column} ]`
                            return;
                        }
                    }

                    this.match("R_PAREN");
                    this.tree.moveUp()
                    let boolPlaceholder = new comparison(leftToken.column,rightToken.row)
                    tokenList.push(boolPlaceholder);
                    return tokenList;
                }
        }
    }

    parseId(){
        if (this.errorFeedback) return;

        this.match("ID",true);
    }

    parseCharList(string=""):string{
        console.log(string)
        if (this.errorFeedback) return;
        if (this.tokenStream[this.index]){
            switch(this.tokenStream[this.index].constructor.name){
                case("SPACE"):
                    string+=" "
                    this.parseChar();
                    return this.parseCharList(string);
                case("CHAR"):
                    string+=this.tokenStream[this.index].symbol;
                    this.parseChar();
                    return this.parseCharList(string);
                case("QUOTE")://charlist ends
                    // marks end of charlist, 
                    return string;
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
                this.match("SPACE")
            }else if (this.tokenStream[this.index].constructor.name=="CHAR"){
                this.match("CHAR")
            }
        }
    }
    

    parseDigit(tokenList=[]){
        if (this.errorFeedback) return;
        if (this.tokenStream[this.index] && DIGIT_LIST.includes(this.tokenStream[this.index].symbol)){
            tokenList.push(this.tokenStream[this.index]);
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

    parseBoolVal(tokenList=[]){
        if (this.errorFeedback) return;

        if (this.tokenStream[this.index]){
            if (this.tokenStream[this.index].constructor.name=="T_BOOL"){
                tokenList.push(this.tokenStream[this.index])
                this.match("T_BOOL",true);
            }else if (this.tokenStream[this.index].constructor.name=="F_BOOL"){
                tokenList.push(this.tokenStream[this.index])
                this.match("F_BOOL",true);
            }
            
        }
    }

    parseIntOp(){
        if (this.errorFeedback) return;
        this.match("ADD")
    }


}