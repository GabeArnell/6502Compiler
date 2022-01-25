var nextRunID = 1;
class Reader extends Entity {
    constructor() {
        super("Test");
        this.name = "Reader";
        this.id = nextRunID++;
    }
}
function initiateCompiler(text) {
    var read = new Reader();
    read.log("Starting Compile Run #" + read.id);
}
//# sourceMappingURL=CompileCode.js.map