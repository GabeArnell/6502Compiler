var nextRunID = 1;


class Compiler extends Entity{

    public id: number;
    public lex:Lexer = null;
    public tokenlist = null;

    constructor(){
        super("Compiler");
        this.id = nextRunID++;
    }

    run(sourcecode:string){
        sourcecode = this.sanityCheck(sourcecode);

        this.lex = new Lexer();
        this.tokenlist = this.lex.lexcode(sourcecode);
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

    var comp = new Compiler();
    comp.log("Starting Compile Run #"+comp.id)

    comp.run(givenText);
}
