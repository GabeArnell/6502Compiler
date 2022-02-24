// Each program is given its own Compiler object to allow backtracking to any point in the compile process
class Compiler extends Entity{

    public id:number;
    public sourceCode:string = null

    public lex:Lexer = null;
    public tokenStream = null;

    public parse:Parser = null;
    public cst:Tree = null

    // The starting and ending points in the sourcecode that mark where the program is and what can be actually compiled
    public startRow:number = null;
    public endRow:number=null;
    public startColumn:number=null;
    public endColumn:number=null;

    //Range
    constructor(sourceCode:string,id,range:{startRow:number,endRow:number,startColumn:number,endColumn:number}){
        super("Compiler");
        this.id = id;
        this.sourceCode = sourceCode;

        this.startRow = range.startRow;
        this.endRow = range.endRow;
        this.startColumn = range.startColumn;
        this.endColumn = range.endColumn;
    }

    run(){        
        this.lex = new Lexer(this);
        this.tokenStream = this.lex.lexcode(this.sourceCode);
        console.log(this.tokenStream)

        this.parse = new Parser(this);
        this.cst = this.parse.parseStream(this.tokenStream)
    }
}
