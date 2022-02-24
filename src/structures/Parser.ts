
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
    }

    parseBlock(){
        if (this.errorFeedback) return;

    }

    parseStatementList(){
        if (this.errorFeedback) return;

    }

    parseStatement(){
        if (this.errorFeedback) return;

    }

    parsePrintStatement(){
        if (this.errorFeedback) return;

    }

    parseAssignmentStatement(){
        if (this.errorFeedback) return;

    }

    parseVarDecl(){
        if (this.errorFeedback) return;

    }

    parseWhileStatement(){
        if (this.errorFeedback) return;

    }

    parseIfStatement(){
        if (this.errorFeedback) return;

    }

    parseExpr(){
        if (this.errorFeedback) return;

    }

    parseIntExpr(){
        if (this.errorFeedback) return;

    }

    parseStringExpr(){
        if (this.errorFeedback) return;

    }

    parseId(){
        if (this.errorFeedback) return;

    }

    parseCharList(){
        if (this.errorFeedback) return;

    }

    parseType(){
        if (this.errorFeedback) return;

    }   

    parseChar(){
        if (this.errorFeedback) return;

    }
    
    parseSpace(){
        if (this.errorFeedback) return;

    }

    parseDigit(){
        if (this.errorFeedback) return;

    }

    parseBoolOp(){
        if (this.errorFeedback) return;

    }

    parseBoolVal(){
        if (this.errorFeedback) return;

    }

    parseIntOp(){
        if (this.errorFeedback) return;

    }


}
