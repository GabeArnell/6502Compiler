// Each program is given its own Compiler object to allow backtracking to any point in the compile process
class Compiler extends Entity {
    //Range
    constructor(sourceCode, id, range) {
        super("Compiler");
        this.lex = null;
        this.tokenlist = null;
        this.sourceCode = null;
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
        this.tokenlist = this.lex.lexcode(this.sourceCode);
        console.log(this.tokenlist);
    }
}
//# sourceMappingURL=Compiler.js.map