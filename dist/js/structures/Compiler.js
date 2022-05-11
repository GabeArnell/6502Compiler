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
        this.semantic = null;
        this.ast = null;
        this.generator = null;
        this.machineCode = null;
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
            this.warn("Semantic Analysis skipped due to Lex errors.");
            this.warn("Code Generation skipped due to Lex error.");
            return;
        }
        ;
        this.parse = new Parser(this);
        this.cst = this.parse.parseStream(this.tokenStream);
        if (!this.cst) {
            this.warn("Semantic Analysis skipped due to Parse error.");
            this.warn("Code Generation skipped due to Parse error.");
            return;
        }
        this.info("CST for program " + this.id);
        this.printTree(this.cst);
        this.info("");
        this.semantic = new SemanticAnalyser(this);
        this.ast = this.semantic.parseStream(this.tokenStream);
        if (this.semantic.errorFeedback) {
            this.info("INCOMPLETE AST for program " + this.id);
            this.printTree(this.ast);
            this.info("");
            this.warn("Code Generation skipped due to Semantic Analysis error.");
            return;
        }
        else {
            this.info("AST for program " + this.id);
            this.printTree(this.ast);
            this.info("");
        }
        this.info("Symbol Table for program " + this.id);
        this.printSymbolTable(this.ast);
        this.info("");
        this.generator = new CodeGenerator(this);
        this.machineCode = this.generator.genCode(this.ast);
        if (this.generator.errorFeedback) {
            this.info("INCOMPLETE MACHINE CODE for program " + this.id);
            //this.warn("Code Generation skipped due to Semantic Analysis error.")
        }
        else {
            document.getElementById('machineCodeOutput').innerHTML = this.machineCode.join(" ");
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
    printSymbolTable(tree) {
        let c = this; //need to create another poiner for compiler as 'this' cant be referenced in the function
        function printNode(node, step) {
            if (node.name == "Block") { //non-terminal
                step++;
                c.info(`${"- ".repeat(step)}[ ${node.name} ]`);
                for (let key in node.symbolTable) {
                    let symbolData = node.symbolTable[key];
                    c.info(`${"- ".repeat(step)}<${key}> | ${varType[symbolData.type]} | [ ${symbolData.declaration.row} : ${symbolData.declaration.column} ] | ${symbolData.used ? "used" : "not used"}`);
                }
            }
            for (let child of node.children) {
                printNode(child, step);
            }
        }
        printNode(tree.root, 0);
    }
}
//# sourceMappingURL=Compiler.js.map