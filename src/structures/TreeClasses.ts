
/*
Symbol Table hash list
key:{
    type: type token
    declaration: [row,column]
    initialization: [row,column]
    used: bool // if it was used in any statement besides its initialization and declaration
}

*/

class TreeNode{//would have called it Node but thats already being used by some random lib 
    public name:string=null;
    public parent:TreeNode=null;
    public children:TreeNode[] = [];
    public token:Token = null; // leaf nodes have a pointer to the token they use
    public kind: nodeType;

    public symbolTable = null;

    public getSymbol(symbol:string){
        if (!this.symbolTable || !this.symbolTable[symbol]){
            if (this.parent == null) return null;
            return this.parent.getSymbol(symbol);
        }
        return this.symbolTable[symbol]
    }

    public addSymbol(idToken:Token,typeToken:Token):string{
        let error:string = null;
        if (this.symbolTable){
            if (!this.symbolTable[idToken.symbol]){
                // adding symbol
                console.log("Adding symbol: "+idToken.symbol)
                this.symbolTable[idToken.symbol] = {
                    type: typeToken.constructor.name,
                    declaration: idToken,
                    initialization: null,
                    used: false
                }
                console.log(this.symbolTable);
            }else{
                //error double declares
                error = `Variable [ ${idToken.symbol} ] already declared in same scope at [ ${this.symbolTable[idToken.symbol].declaration.row} : ${this.symbolTable[idToken.symbol].declaration.column} ]`
            }
        }else{
            error = this.parent.addSymbol(idToken,typeToken);
        }

        return error;
    }
    public initializeSymbol(idToken:Token,usedTokens:Token[]):string[]{
        let feedback:string[] = [null,null];// [error, warning]
        let errorMessage = `[ ${idToken.row} : ${idToken.column} ] Initialized undeclared variable [ ${idToken.symbol} ] `;
        if (this.symbolTable){
            if (this.symbolTable[idToken.symbol]){

                for (let token of usedTokens){
                    if (token.constructor.name == "ID" && this.getSymbol(token.symbol).type != this.symbolTable[idToken.symbol].type){
                        feedback[0] = `[ ${idToken.row} : ${idToken.column} ] Type missmatch: Used ${varType[this.getSymbol(token.symbol).type]} variable [ ${token.symbol} ] in assigning ${varType[this.symbolTable[idToken.symbol].type]} variable [ ${idToken.symbol} ] `;
                        return feedback;
                    }
                    else if (this.symbolTable[idToken.symbol].type != staticTokenTypes[token.constructor.name]){
                        feedback[0] = `[ ${idToken.row} : ${idToken.column} ] Type missmatch: Used ${varType[staticTokenTypes[token.constructor.name]]} ${tokenString(token,true)} in assigning ${varType[this.symbolTable[idToken.symbol].type]} variable [ ${idToken.symbol} ] `;
                    }
                }

                // adding first assignment, where it is initialized
                if (!this.symbolTable[idToken.symbol].initialization){
                    //checking to make sure that the initialization doesnt reference the symbol in the assignment like: int a a=2+a
                    //it is still technically valid however
                    // need to fix this, just take first used token
                    for (let token of usedTokens){
                        if (token.symbol && token.symbol == idToken.symbol){
                            feedback[1] = `[ ${idToken.row} : ${idToken.column} ] Initialized variable [ ${idToken.symbol} ] with itself, using its default value`;
                            break;
                        }
                    }
                    this.symbolTable[idToken.symbol].initialization = idToken
                    console.log(this.symbolTable);    
                }else{
                    // symbol was already initialized and this was just another assignment. In which case, it counts as being used.
                    this.symbolTable[idToken.symbol].used = true;
                }
            }else{
                if (this.parent == null) return [errorMessage,null];
                feedback = this.parent.initializeSymbol(idToken,usedTokens);
            }
        }else{
            if (this.parent == null) return [errorMessage,null];
            feedback = this.parent.initializeSymbol(idToken,usedTokens);
        }

        return feedback;
    }
    public useSymbol(idToken:Token):string{
        let error:string = null;
        let undeclaredError = `[ ${idToken.row} : ${idToken.column} ] Used undeclared variable [ ${idToken.symbol} ] `;

        if (this.symbolTable){
            console.log('has table')
            if (this.symbolTable[idToken.symbol]){
                console.log('in table')
                if (!this.symbolTable[idToken.symbol].initialization){// symbol was parsed in an EXPR but never initialized

                    this.symbolTable[idToken.symbol].used = true;
                }else{ // symbol was used 
                    this.symbolTable[idToken.symbol].used = true;
                }
            }else{
                if (this.parent == null) return undeclaredError;
                error = this.parent.useSymbol(idToken);
            }
        }else{
            if (this.parent == null) return undeclaredError;
            error = this.parent.useSymbol(idToken);
        }

        return error;
    }



}

enum nodeType{
    root,
    branch,
    leaf
}


class Tree {
    public root:TreeNode = null;
    public current:TreeNode = null;
    
    constructor(){}

    addNode(kind:nodeType,label:string,token?:Token){
        let n:TreeNode = new TreeNode();
        n.name = label;
        n.kind = kind;
        //console.log("adding",n)
        if (this.root == null && kind == nodeType.root){
            //console.log('this is a root');
            this.root = n;
        }else{
            n.parent = this.current;
            n.parent.children.push(n)
        }
        if (kind != nodeType.leaf){
            //console.log('set current',n)
            this.current = n;
        }else{
            n.token = token;
        }

        if (label =="Block"){
            n.symbolTable = {};
        }
    }

    moveUp(){
        if (this.current != this.root){
            //console.log("leaving ",this.current.name)
            this.current = this.current.parent;
            //console.log('set back current',this.current.name)
        }
    }

}