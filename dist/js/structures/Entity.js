// Base class for other classes to extend onto. In the future I want to enhance the logging code and this makes it all in one spot.
class Entity {
    constructor(name) {
        this.name = null;
        this.name = name;
    }
    log(text) {
        document.getElementById("compilerLogOutput")['value'] += text + "\n";
    }
    warn(text) {
        this.log("WARNING " + this.name + ": " + text);
    }
    error(text) {
        this.log("ERROR " + this.name + ": " + text);
    }
    info(text) {
        this.log("INFO " + this.name + ": " + text);
    }
}
//# sourceMappingURL=Entity.js.map