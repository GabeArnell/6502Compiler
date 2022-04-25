
// Generator. Input: AST; Output: 6502 code
/*

*/
class CodeGenerator extends Entity{
    public compiler:Compiler;
    public tree:Tree;
    public index:number=0;
    public tokenStream:Token[];
    public errorFeedback:string = null;
    public warnings:number = 0;

    public nextCode:number =0; // Where the next op code will be inserted
    public stackOffset:number = 1; //stack offset from normal code
    public heapOffset=1; // heap goes in 0xFF-heapOffset. Starts with 1 already offset to account for temp storage

    public stringMap = new Map();// key = string, value = position
    
    public machineCode:string[]=null;

    public AST:Tree = null;

    public tempStorage:number=0xFF;

    public nextTemp = 0;

    constructor(comp:Compiler){
        super("Code Generator");
        this.compiler = comp;
    }
    
    genCode(AST:Tree):string[]{
        this.info("Code Generation for program "+this.compiler.id);

        // Run through the tree and ensure 
        this.machineCode = new Array(0x100) 
        this.AST = AST
        this.AST.current = this.AST.root;

        //writes all strings to heap
        this.machineCode[0xFF]="00";//marking the temp holder

        this.collectStrings();

        this.genNext();

        //Adding static offset STILL NEED ERROR CHECKING FOR OVERLAP!
        this.addStack();
        if (this.errorFeedback){
            this.error(this.errorFeedback);
            this.info("Code Generation Failed.");
        }else{
            this.info("Code Generation completed successfully with "+this.warnings+" warning(s)\n");
        }
        
        return this.machineCode;
    }

/*
    replaceBytes(targetString:string,newString:string){
        for (let i = 0; i < this.machineCode.length;i++){
            if (this.machineCode[i] && this.machineCode[i] == targetString){
                this.machineCode[i] = newString
            }
        }
    }*/

    genNext(){
        if (this.errorFeedback)return;
        switch(this.AST.current.name){
            case("Block"):
                this.genBlock();
                break;
            case("VarDecl"):
                this.genVarDecl();
                break;
    }
    }
    genBlock(){
        let block = this.AST.current;
        for (let child of this.AST.current.children){
            this.AST.current = child;
            this.genNext();
        }
        this.AST.current = block
    }

    // THIS NEEDS TO DEFAULT STRINGS TO SOME 0 CONSTANT
    genVarDecl(){

        let typeNode:TreeNode = this.AST.current.children[0];
        let symbolNode:TreeNode = this.AST.current.children[1];
        let symbolData = this.AST.current.getSymbol(symbolNode.token.symbol);

        symbolData.tempPosition = this.nextTemp++;
        this.stackOffset++; // static table now has 1 more symbol

        this.addOp(0xA9,this.nextCode++); //load accumulator with constant
        this.addOp(0x00,this.nextCode++); // constant is zero 
        this.addOp(0x8D,this.nextCode++); // SAVE ACC TO MEMORY

        if (typeNode.token.constructor.name == "S_TYPE"){ // string
            if (this.heapOffset > 1){ //heap offset is > 1 if a string is ever actually used, if it is not then we just make the pointer point to 00 because it will never be used
                this.addOp(0xFF-1,this.nextCode++); // if a heap exists, 0xFE will always be the 00 as it has to null terminate the first string stored
            }else{
                this.addOp(0x00,this.nextCode++); // constant is zero 
            }
        }else{
            this.addTempOp("T"+symbolData.tempPosition,this.nextCode++); //TMP position
        }
        
        this.addOp(0x00,this.nextCode++); // the low order byte will always be 00 because we are only doing 256 bytes, theres no need to do an XX
        
    }


    
    addOp(opcode:number,position:number,overide:boolean=false){
        if (position < 0 || position > 256){
            this.errorFeedback = "Invalid Position: "+position+ " is not a valid memory position"
            return;
        }
        if (this.machineCode[position]!=null && !overide){
            this.errorFeedback = "Overwriting Position: "+position+ " already has code."
            return;
        }
        var stringCode:string = opcode.toString(16).toUpperCase();
        if (stringCode.length < 2){
            stringCode = "0"+stringCode;
        }
        stringCode = "0x"+stringCode;
        this.machineCode[position] = stringCode
    }
    addTempOp(opstring:string,position:number){
        if (position < 0 || position > 256){
            this.errorFeedback = "Invalid Position: "+position+ " is not a valid memory position --temp op"
            return;
        }
        if (this.machineCode[position]!=null){
            this.errorFeedback = "Overwriting Position: "+position+ " already has code  --temp op"
            return;
        }
        this.machineCode[position] = opstring
    }

    // NEED TO MAKE SURE IT DOES NOT OVERWRITE INTO HEAP. Strings also need to be added separately
    //adds the stack to the program code 
    addStack(){
        // check here to see if nextcode+stackoffset is > than 0x100-heapoffset, otherwise we can assume every symbol has a slot
        let gen = this;
        function iterate(node:TreeNode):void{
            if (node.name == "Block"){ //non-terminal
                for (let key in node.symbolTable){
                    let symbolData = node.symbolTable[key];
                    if (symbolData.tempPosition == null){
                        console.log("Symbol Does not have a temp position for some reason. Fix it")
                        console.log(symbolData)
                    }
                    let variableAddress = gen.nextCode+symbolData.tempPosition;
                    gen.log("Byte replacement: "+key+" [ T"+symbolData.tempPosition+" ] with [ "+variableAddress.toString(16).toUpperCase()+" ]")
                    for (let i = 0; i < gen.machineCode.length; i++){//replace all instances
                        if (gen.machineCode[i] && gen.machineCode[i] == "T"+symbolData.tempPosition){
                            gen.addOp(variableAddress,i,true);
                        }
                    }
                    gen.addOp(0,variableAddress)
                }
            }
            for (let child of node.children){
                iterate(child);
            }
        }
        iterate(this.AST.root);

    }

    //
    collectStrings(){
        
        let gen = this;
        function iterate(node:TreeNode):void{
            console.log(node)
            if (node.token && node.token['string']){ //non-terminal
                let string = node.name;
                gen.addOp(0x00,0xFF-gen.heapOffset)
                gen.heapOffset++;
                for (let i = string.length-1; i >= 0; i--){
                    gen.addOp(charToHex(string.charAt(i)),0xFF-gen.heapOffset)
                    gen.heapOffset++;
                }
                let startingPosition = 0xFF-gen.heapOffset+1;
                gen.log("Stored string [ "+string+" ] at position "+startingPosition.toString(16).toUpperCase())
                this.stringMap.set(string,startingPosition)
            }
            for (let child of node.children){
                iterate(child);
            }
        }
        iterate(this.AST.root);
    }
}