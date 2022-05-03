
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

    public trueStringPosition:number = null
    public falseStringPosition:number = null

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
        //adding true
        this.machineCode[0xFE]='00'
        this.machineCode[0xFD]='65'
        this.machineCode[0xFC]='75'
        this.machineCode[0xFB]='72'
        this.machineCode[0xFA]='74'
        this.trueStringPosition = 0xFA
        this.heapOffset+=5;
        this.machineCode[0xF9]='00'
        this.machineCode[0xF8]='65'
        this.machineCode[0xF7]='73'
        this.machineCode[0xF6]='6C'
        this.machineCode[0xF5]='61'
        this.machineCode[0xF4]='66'
        this.heapOffset+=6;
        this.falseStringPosition = 0xF4

        this.collectStrings();

        this.genNext();
        
        //add final 00 break
        this.addOp(0x00,this.nextCode++);

        // replace all S0 temp strings swith the position of the above final break


        //Adding static offset STILL NEED ERROR CHECKING FOR OVERLAP!
        this.addStack();

        if (this.errorFeedback){
            this.error(this.errorFeedback);
            this.info("Code Generation Failed.");
        }else{
            this.info("Code Generation completed successfully with "+this.warnings+" warning(s)\n");
        }
        // fill in rest with 00s
        for (let i = 0; i < this.machineCode.length; i++){
            if (this.machineCode[i] == null){
                this.machineCode[i] = "00"
            }
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
            case("AssignmentStatement"):
                this.genAssignmentStatement();
                break;
            case("PrintStatement"):
                this.genPrintStatement();
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
                this.addTempOp("S0",this.nextCode++); // S0 will be replaced with the final halt before the stack 
            }
        }else{
            this.addTempOp("T"+symbolData.tempPosition,this.nextCode++); //TMP position
        }
        
        this.addOp(0x00,this.nextCode++); // the low order byte will always be 00 because we are only doing 256 bytes, theres no need to do an XX
        
    }

    genAssignmentStatement(){
        let symbolNode:TreeNode = this.AST.current.children[0];
        let valueNode:TreeNode = this.AST.current.children[1];
        let symbolData = this.AST.current.getSymbol(symbolNode.token.symbol);

        //load in value not actually needed
        /*this.addOp(0xAD,this.nextCode++); 
        this.addTempOp("T"+symbolData.tempPosition,this.nextCode++); //TMP position
        this.addOp(0x00,this.nextCode++);*/

        switch(valueNode.name){
            case("ADD"):
                this.AST.current = valueNode;
                this.genAddition();
                break;
            case("IfEqual"):
            case("IfNotEqual"):
            case("DIGIT"):
                this.addOp(0xA9,this.nextCode++); //load acc with constant
                this.addOp(parseInt(valueNode.token.symbol),this.nextCode++); // constant being the symbol of the value token
                break;
            case("T_BOOL"):
                this.addOp(0xA9,this.nextCode++); //load acc with constant
                this.addOp(0x01,this.nextCode++); //constant being 1 (true)
                break;
            case("F_BOOL"):
                this.addOp(0xA9,this.nextCode++); //load acc with constant
                this.addOp(0x00,this.nextCode++); //constant being 0 (false)
                break;
            default: // default is a string
                this.addOp(0xA9,this.nextCode++); //load acc with constant
                this.addOp(this.stringMap.get(valueNode.name),this.nextCode++); //constant being 0 (false)
                break;
        }

        this.addOp(0x8D,this.nextCode++); // save from ACC back to memory
        this.addTempOp("T"+symbolData.tempPosition,this.nextCode++);
        this.addOp(0x00,this.nextCode++);

    }

    genPrintStatement(){
        let child = this.AST.current.children[0];
        console.log('printing: ',child.name)
        switch(child.name){
            case("DIGIT"):
                this.printInt();
                break;
            case("T_BOOL"):
            case("F_BOOL"):
                this.printBool();
                break;
            case("ID"):
                this.printID();
                break;
            case("ADD"):
                this.printAddition();
                break;
            default:
                this.printString();
                break;

        }
    }

    printID(){
        let child = this.AST.current.children[0];
        let token = child.token;
        let symbol = token.symbol; // the number
        let symbolData = this.AST.current.getSymbol(symbol);
        switch(symbolData.type){
            case("I_TYPE"):
                this.addOp(0xA2,this.nextCode++); // Load X register with constant
                this.addOp(0x01,this.nextCode++); // constant = 1
                this.addOp(0xAC,this.nextCode++); // load y register from memory
                this.addTempOp('T'+symbolData.tempPosition,this.nextCode++);
                this.addOp(0x00,this.nextCode++); // load y register from memory
                this.addOp(0xFF,this.nextCode++); // make the system call
                break;
            case("S_TYPE"):
                this.addOp(0xA2,this.nextCode++); // Load X register with constant
                this.addOp(0x02,this.nextCode++); // constant = 1
                this.addOp(0xAC,this.nextCode++); // load y register from memory
                this.addTempOp('T'+symbolData.tempPosition,this.nextCode++);
                this.addOp(0x00,this.nextCode++); // load y register from memory
                this.addOp(0xFF,this.nextCode++); // make the system call
                break;
            case("B_TYPE"):
                // first need a check if it is false or true
                // we'll compare the byte it points to to 1
                this.addOp(0xA2,this.nextCode++); // Load X register with constant
                this.addOp(0x01,this.nextCode++); // constant = 1
                this.addOp(0xEC,this.nextCode++); // Compare X reg to memory
                this.addTempOp('T'+symbolData.tempPosition,this.nextCode++);
                this.addOp(0x00,this.nextCode++); 
                this.addOp(0xD0,this.nextCode++); //jump a number of bytes ahead if it isnt == 1 (aka bool is 0, or false)
                this.addOp(/*Need to check*/0x0A,this.nextCode++); //jump a number of bytes ahead if it isnt == 1 (aka bool is 0, or false)
                // true on equals, does not skip
                {
                    this.addOp(0xA2,this.nextCode++); // Load X register with constant
                    this.addOp(0x02,this.nextCode++); // constant = 2
                    this.addOp(0xA0,this.nextCode++); // Load y register with constant
                    this.addOp(this.trueStringPosition,this.nextCode++);
                    this.addOp(0xFF,this.nextCode++); // make the system call
                    //then we need to skip over the false portion
                    this.addOp(0xEC,this.nextCode++); // Compare X reg to first memory bit, which can not be 00
                    this.addOp(0x00,this.nextCode++); 
                    this.addOp(0x00,this.nextCode++);
                    this.addOp(0xD0,this.nextCode++); //jump a number of bytes ahead to skip false
                    this.addOp(/*NEEDS TO check*/0x05,this.nextCode++); //jump a number of bytes ahead if it isnt == 1 (aka bool is 0, or false)
                }
                // false on not equals
                {
                    this.addOp(0xA2,this.nextCode++); // Load X register with constant
                    this.addOp(0x02,this.nextCode++); // constant = 2
                    this.addOp(0xA0,this.nextCode++); // Load y register with constant
                    this.addOp(this.falseStringPosition,this.nextCode++);
                    this.addOp(0xFF,this.nextCode++); // make the system call
                }
        }
    }
    printInt(){
        let child = this.AST.current.children[0];
        let token = child.token;
        let symbol = token.symbol; // the number
        this.addOp(0xA2,this.nextCode++); // Load X register with constant
        this.addOp(0x01,this.nextCode++); // constant = 1
        this.addOp(0xA0,this.nextCode++); // Load y register with constant
        this.addOp(parseInt(symbol),this.nextCode++); // constant being the symbol
        this.addOp(0xFF,this.nextCode++); // make the system call
    }
    printString(){
        let child = this.AST.current.children[0];
        let string = child.name
        let position = this.stringMap.get(string);
        this.addOp(0xA2,this.nextCode++); // Load X register with constant
        this.addOp(0x02,this.nextCode++); // constant = 2
        this.addOp(0xA0,this.nextCode++); // Load y register with constant
        this.addOp(position,this.nextCode++); // make the constant the string substitute
        this.addOp(0xFF,this.nextCode++); // make the system call
    }
    printBool(){
        let child = this.AST.current.children[0];
        this.addOp(0xA2,this.nextCode++); // Load X register with constant
        this.addOp(0x02,this.nextCode++); // constant = 2
        this.addOp(0xA0,this.nextCode++); // Load y register with constant
        if (child.name == "T_BOOL"){
            this.addOp(this.trueStringPosition,this.nextCode++);
        }else{
            this.addOp(this.falseStringPosition,this.nextCode++);
        }

        this.addOp(0xFF,this.nextCode++); // make the system call
    }
    printComparison(){

    }
    printAddition(){
        this.AST.current = this.AST.current.children[0]
        this.genAddition();
        // save the accumulator to temp position so we can put it in y register
        this.addOp(0x8D,this.nextCode++); 
        this.addOp(0xFF,this.nextCode++);
        this.addOp(0x00,this.nextCode++); 

        this.addOp(0xAC,this.nextCode++); // Load y register with temp value
        this.addOp(0xFF,this.nextCode++);
        this.addOp(0x00,this.nextCode++); 

        this.addOp(0xA2,this.nextCode++); // Load X register with constant
        this.addOp(0x01,this.nextCode++); // constant = 1

        this.addOp(0xFF,this.nextCode++); // make the system call

    }


    genIfStatement(){

    }

    genWhileStatement(){

    }

    //takes the two symbols and adds it to accumulator. 
    genAddition(){
        let firstNode:TreeNode = this.AST.current.children[0];
        let secondNode:TreeNode = this.AST.current.children[1];
        let currentScope = this.AST.current;
        if (secondNode.name != 'ADD'){
            // add the two values

            // load second value in accumulator
            if (secondNode.name == "ID"){
                let symbolData = this.AST.current.getSymbol(secondNode.token.symbol);
                this.addOp(0xAD,this.nextCode++); // Load ACC from memory
                this.addTempOp('T'+symbolData.tempPosition,this.nextCode++);
                this.addOp(0x00,this.nextCode++); 
            }else { // is a digit
                this.addOp(0xA9,this.nextCode++); // Load ACC with constant
                this.addOp(parseInt(secondNode.token.symbol),this.nextCode++); 
            }
            // save second value thats in ACC to temp file
            this.addOp(0x8D,this.nextCode++);
            this.addOp(0xFF,this.nextCode++); // 0xFF is the temp storage
            this.addOp(0x00,this.nextCode++);

            //first part must always be a digit
            this.addOp(0xA9,this.nextCode++); // Load ACC with constant
            this.addOp(parseInt(firstNode.token.symbol,16),this.nextCode++); 

            // now add the first to the second
            this.addOp(0x6D,this.nextCode++);
            this.addOp(0xFF,this.nextCode++); // 0xFF is the temp storage
            this.addOp(0x00,this.nextCode++);
        }
        else{
            this.AST.current = secondNode;
            this.genAddition(); // inner result is now stored in ACC
            // save second value thats in ACC to temp file
            this.addOp(0x8D,this.nextCode++);
            this.addOp(0xFF,this.nextCode++); // 0xFF is the temp storage
            this.addOp(0x00,this.nextCode++);

            //first part must always be a digit
            this.addOp(0xA9,this.nextCode++); // Load ACC with constant
            this.addOp(parseInt(firstNode.token.symbol),this.nextCode++); 

            // now add the first to the second
            this.addOp(0x6D,this.nextCode++);
            this.addOp(0xFF,this.nextCode++); // 0xFF is the temp storage
            this.addOp(0x00,this.nextCode++);

            this.AST.current = currentScope;
        }
        
    }


    //load variable into accumulator
    genVariableGetter(){
        
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

    // need to add a default place for strings to be pointed towards that has 00. So that if it prints nothing is output
    collectStrings(){
        let gen = this;

        gen.stringMap.set('true',0xFA)
        gen.log("Stored string [ true ] at position "+0xFA.toString(16).toUpperCase())

        function iterate(node:TreeNode):void{
            console.log(node)
            //terminal string that has not been set yet
            if (node.token && node.token['string'] && gen.stringMap.get(node.name) == null){ 
                let string = node.name;
                gen.addOp(0x00,0xFF-gen.heapOffset)
                gen.heapOffset++;
                for (let i = string.length-1; i >= 0; i--){
                    gen.addOp(charToHex(string.charAt(i)),0xFF-gen.heapOffset)
                    gen.heapOffset++;
                }
                let startingPosition = 0xFF-gen.heapOffset+1;
                gen.log("Stored string [ "+string+" ] at position "+startingPosition.toString(16).toUpperCase())
                gen.stringMap.set(string,startingPosition)
            }
            for (let child of node.children){
                iterate(child);
            }
        }
        iterate(this.AST.root);
    }
}