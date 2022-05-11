/*
Symbol Table hash list
key:{
    type: type token
    declaration: [row,column]
    initialization: [row,column]
    used: bool // if it was used in any statement besides its initialization and declaration
}

*/
class TreeNode {
    constructor() {
        this.name = null;
        this.parent = null;
        this.children = [];
        this.token = null; // leaf nodes have a pointer to the token they use
        this.compPosition = null; // Code Gen: if node is a comparison, where the result of the comparison is stored
        this.symbolTable = null;
    }
    getSymbol(symbol) {
        if (!this.symbolTable || !this.symbolTable[symbol]) {
            if (this.parent == null)
                return null;
            console.log('cant find ', symbol, 'checking parent');
            return this.parent.getSymbol(symbol);
        }
        return this.symbolTable[symbol];
    }
    addSymbol(idToken, typeToken) {
        let error = null;
        if (this.symbolTable) {
            if (!this.symbolTable[idToken.symbol]) {
                // adding symbol
                console.log("Adding symbol: " + idToken.symbol);
                this.symbolTable[idToken.symbol] = {
                    type: typeToken.constructor.name,
                    declaration: idToken,
                    initialization: null,
                    used: false,
                    tempPosition: null, // for code generation variable temp positions
                };
                console.log(this.symbolTable);
            }
            else {
                //error double declares
                error = `Variable [ ${idToken.symbol} ] already declared in same scope at [ ${this.symbolTable[idToken.symbol].declaration.row} : ${this.symbolTable[idToken.symbol].declaration.column} ]`;
            }
        }
        else {
            error = this.parent.addSymbol(idToken, typeToken);
        }
        return error;
    }
    initializeSymbol(idToken, usedTokens, startingBlock) {
        let feedback = [null, null]; // [error, warning]
        let errorMessage = `[ ${idToken.row} : ${idToken.column} ] Initialized undeclared variable [ ${idToken.symbol} ] `;
        if (this.symbolTable) {
            if (this.symbolTable[idToken.symbol]) {
                for (let token of usedTokens) {
                    if (token.constructor.name == "ID" && startingBlock.getSymbol(token.symbol).type != this.symbolTable[idToken.symbol].type) {
                        feedback[0] = `[ ${idToken.row} : ${idToken.column} ] Type missmatch: Used ${varType[this.getSymbol(token.symbol).type]} variable [ ${token.symbol} ] in assigning ${varType[this.symbolTable[idToken.symbol].type]} variable [ ${idToken.symbol} ] `;
                        return feedback;
                    }
                    else if (token.constructor.name != "ID" && this.symbolTable[idToken.symbol].type != staticTokenTypes[token.constructor.name]) {
                        feedback[0] = `[ ${idToken.row} : ${idToken.column} ] Type missmatch: Used ${varType[staticTokenTypes[token.constructor.name]]} ${tokenString(token, true)} in assigning ${varType[this.symbolTable[idToken.symbol].type]} variable [ ${idToken.symbol} ] `;
                    }
                }
                // adding first assignment, where it is initialized
                if (!this.symbolTable[idToken.symbol].initialization) {
                    //checking to make sure that the initialization doesnt reference the symbol in the assignment like: int a a=2+a
                    //it is still technically valid however
                    // need to fix this, just take first used token
                    for (let token of usedTokens) {
                        if (token.symbol && token.symbol == idToken.symbol) {
                            feedback[1] = `[ ${idToken.row} : ${idToken.column} ] Initialized variable [ ${idToken.symbol} ] with itself, using its default value`;
                            break;
                        }
                    }
                    this.symbolTable[idToken.symbol].initialization = idToken;
                    console.log(this.symbolTable);
                }
                else {
                    // symbol was already initialized and this was just another assignment. In which case, it counts as being used.
                    this.symbolTable[idToken.symbol].used = true;
                }
            }
            else {
                if (this.parent == null)
                    return [errorMessage, null];
                feedback = this.parent.initializeSymbol(idToken, usedTokens, startingBlock);
            }
        }
        else {
            if (this.parent == null)
                return [errorMessage, null];
            feedback = this.parent.initializeSymbol(idToken, usedTokens, startingBlock);
        }
        return feedback;
    }
    useSymbol(idToken) {
        let error = null;
        let undeclaredError = `[ ${idToken.row} : ${idToken.column} ] Used undeclared variable [ ${idToken.symbol} ] `;
        if (this.symbolTable) {
            console.log('has table');
            if (this.symbolTable[idToken.symbol]) {
                console.log('in table');
                if (!this.symbolTable[idToken.symbol].initialization) { // symbol was parsed in an EXPR but never initialized
                    this.symbolTable[idToken.symbol].used = true;
                }
                else { // symbol was used 
                    this.symbolTable[idToken.symbol].used = true;
                }
            }
            else {
                if (this.parent == null)
                    return undeclaredError;
                error = this.parent.useSymbol(idToken);
            }
        }
        else {
            if (this.parent == null)
                return undeclaredError;
            error = this.parent.useSymbol(idToken);
        }
        return error;
    }
}
var nodeType;
(function (nodeType) {
    nodeType[nodeType["root"] = 0] = "root";
    nodeType[nodeType["branch"] = 1] = "branch";
    nodeType[nodeType["leaf"] = 2] = "leaf";
})(nodeType || (nodeType = {}));
class Tree {
    constructor() {
        this.root = null;
        this.current = null;
    }
    addNode(kind, label, token) {
        let n = new TreeNode();
        n.name = label;
        n.kind = kind;
        //console.log("adding",n)
        if (this.root == null && kind == nodeType.root) {
            //console.log('this is a root');
            this.root = n;
        }
        else {
            n.parent = this.current;
            n.parent.children.push(n);
        }
        if (kind != nodeType.leaf) {
            //console.log('set current',n)
            this.current = n;
            if (token) {
                n.token = token;
            }
        }
        else {
            n.token = token;
        }
        if (label == "Block") {
            n.symbolTable = {};
        }
    }
    moveUp() {
        if (this.current != this.root) {
            //console.log("leaving ",this.current.name)
            this.current = this.current.parent;
            //console.log('set back current',this.current.name)
        }
    }
}
//# sourceMappingURL=TreeClasses.js.map