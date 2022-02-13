// Base class for other classes to extend onto. In the future I want to enhance the logging code and this makes it all in one spot.

class Entity{
    name:string=null;

    constructor(name:string){
        this.name= name;
    }

    log(text:string):void{
       document.getElementById("compilerLogOutput")['value'] += text+"\n"
    }

    warn(text:string):void{
        this.log("WARNING "+this.name+": "+text);
    }
    error(text:string):void{
        this.log("ERROR "+this.name+": "+text);
    }
    
    info(text:string):void{
        this.log("INFO "+this.name+": "+text);
    }
}