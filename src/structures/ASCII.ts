
// Does char to HEX
const ASCII = {
    " ":"20",
    "a":"61", 
    "b":"62", 
    "c":"63", 
    "d":"64", 
    "e":"65", 
    "f":"66", 
    "g":"67", 
    "h":"68", 
    "i":"69", 
    "j":"6A", 
    "k":"6B", 
    "l":"6C", 
    "m":"6D", 
    "n":"6E", 
    "o":"6F", 
    "p":"70", 
    "q":"71", 
    "r":"72", 
    "s":"73", 
    "t":"74", 
    "u":"75", 
    "v":"76", 
    "w":"77", 
    "x":"78", 
    "y":"79", 
    "z":"7A"
}

function charToHex(char:string){
    return (parseInt(ASCII[char],16) || 0x00);
}

