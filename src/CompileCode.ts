var nextRunID = 1;


class Reader extends Entity{
    public name:string;

    public id: number;
    
    constructor(){
        super("Test");
        this.name = "Reader";
        this.id = nextRunID++;
    }

    
}


function initiateCompiler(text:string) { 
    var read = new Reader();
    read.log("Starting Compile Run #"+read.id)
}


