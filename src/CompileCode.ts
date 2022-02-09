var nextRunID = 1;


class Compiler extends Entity{

    public id: number;
    public lex:Lexer = null;
    public tokenlist = null;
    public sourcecode:string = null

    public startRow:number = null;
    public endRow:number=null;
    public startColumn:number=null;
    public endColumn:number=null;

    //Range
    constructor(sourcecode:string,range){
        super("Compiler");
        this.id = nextRunID++;
        this.sourcecode = sourcecode;

        this.startRow = range.startRow;
        this.endRow = range.endRow;
        this.startColumn = range.startColumn;
        this.endColumn = range.endColumn;
        console.log('code',sourcecode)
    }

    run(){
        //sourcecode = this.sanityCheck(sourcecode);
        
        this.lex = new Lexer(this);
        this.tokenlist = this.lex.lexcode(this.sourcecode);
        console.log(this.tokenlist)
    }

    // Covers typical input errors
    sanityCheck(sourcecode:string):string{
        if (sourcecode.length < 1){
            this.error("No source code entered.")
        }

        if (sourcecode.trim().charAt(0) != '{'){
            this.warn("No [ { ] at start of code block.");
            sourcecode = '{'+sourcecode;
        }
        if (sourcecode.trim().charAt(sourcecode.trim().length-1) != '$'){
            this.warn("No [ $ ] after the code block.");
            sourcecode = sourcecode+'$';
        }

        // sourcecode without the ending $
        var cutSourceCode = sourcecode.substring(0,sourcecode.length-1).trim()
        if (cutSourceCode.charAt(cutSourceCode.length-1) != "}"){
            this.warn("No [ } ] at end of code block.");
            sourcecode = cutSourceCode+'}$';
        }
        
        return sourcecode;
    }


    
}


function initiateCompiler() { 

    var givenText = document.getElementById("sourceCodeInput")['value'].trim();
    var programRanges = splitSourceCode(givenText);
    
    for (let i = 0; i < programRanges.length;i++){
        var range = programRanges[i]
        var comp = new Compiler(givenText,range);
        comp.log(`Starting Compile Run: ${i+1}/${programRanges.length}` )
    
        comp.run();
    }
}

// Returns the returns the starting and ending 'coordinates' of each program in the list
function splitSourceCode(givenText:string){
    var inComment:boolean = false;
    var programs = [

    ];

    let row = 0;
    let column = 0;
    let prevRow = 0;
    let prevColumn = 0;
    for (var i = 0; i < givenText.length;i++){
        if (givenText.charAt(i)+givenText.charAt(i+1) == "/*" && (i != givenText.length-1) ){
            inComment = true;
        }
        if (givenText.charAt(i)+givenText.charAt(i+1) == "*/" && (i != givenText.length-1) ){
            inComment = false;
        }
        //cutting of code to write new program if $ is marked or if at end of file
        if ((givenText.charAt(i) == "$" && !inComment) || i == givenText.length-1){
            givenText = givenText.substring(i+1,givenText.length+1);
            programs.push({
                startRow: prevRow,
                startColumn: prevColumn,
                endRow: row,
                endColumn: column
            }); 
            prevRow = row;
            prevColumn = column;
            break;
        }
        column++;
        if (givenText.charAt(i)=="\n"){
            row++;
            column=0;
        }
    }
    // TODO, add catch for not ending in $
    


    return programs
}