class Entity{
    constructor(name){
        console.log(name)
    }

    log(text:string):void{
       document.getElementById("compilerLogOutput")['value'] += text+"\n"
    }
}