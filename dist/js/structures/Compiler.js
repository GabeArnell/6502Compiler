// Each program is given its own Compiler object to allow backtracking to any point in the compile process
class Compiler extends Entity {
    //Range
    constructor(sourceCode, id, range) {
        super("Compiler");
        this.sourceCode = null;
        this.lex = null;
        this.tokenStream = null;
        this.parse = null;
        this.cst = null;
        // The starting and ending points in the sourcecode that mark where the program is and what can be actually compiled
        this.startRow = null;
        this.endRow = null;
        this.startColumn = null;
        this.endColumn = null;
        this.id = id;
        this.sourceCode = sourceCode;
        this.startRow = range.startRow;
        this.endRow = range.endRow;
        this.startColumn = range.startColumn;
        this.endColumn = range.endColumn;
    }
    run() {
        this.lex = new Lexer(this);
        this.tokenStream = this.lex.lexcode(this.sourceCode);
        console.log(this.tokenStream);
        if (!this.tokenStream) {
            this.warn("Parsing skipped due to Lex errors.");
            return;
        }
        ;
        this.parse = new Parser(this);
        this.cst = this.parse.parseStream(this.tokenStream);
        if (this.cst) {
            this.printTree(this.cst);
        }
    }
    printTree(tree) {
        let c = this; //need to create another poiner for compiler as 'this' cant be referenced in the function
        function printNode(node, step) {
            if (node.kind != nodeType.leaf) { //non-terminal
                c.info(`${"- ".repeat(step)}[ ${node.name} ]`);
            }
            else { // terminal
                c.info(`${"- ".repeat(step)}< ${tokenString(node.token, true)} >`);
            }
            for (let child of node.children) {
                printNode(child, step + 1);
            }
        }
        printNode(tree.root, 0);
    }
}
//# sourceMappingURL=Compiler.js.map