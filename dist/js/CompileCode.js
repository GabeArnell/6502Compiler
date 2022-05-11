// Triggered by 'Compile' element being clicked
function initiateCompiler() {
    var givenText = document.getElementById("sourceCodeInput")['value'].trim();
    var programRanges = splitSourceCode(givenText);
    for (var i = 0; i < programRanges.length; i++) {
        var range = programRanges[i];
        var comp = new Compiler(givenText, i + 1, range);
        comp.log(`\nStarting Compile Run: ${i + 1}/${programRanges.length}`);
        comp.run();
    }
}
// Returns the returns the starting and ending 'coordinates' of each program in the list
function splitSourceCode(givenText) {
    var inComment = false;
    var programs = [];
    var row = 0;
    var column = 0;
    var prevRow = 0;
    var prevColumn = 0;
    for (var i = 0; i < givenText.length; i++) {
        if (givenText.charAt(i) + givenText.charAt(i + 1) == "/*" && (i != givenText.length - 1)) {
            inComment = true;
        }
        if (givenText.charAt(i) + givenText.charAt(i + 1) == "*/" && (i != givenText.length - 1)) {
            inComment = false;
        }
        //cutting of code to write new program if $ is marked or if at end of file
        if ((!inComment && givenText.charAt(i) == "$") || i == givenText.length - 1) {
            programs.push({
                startRow: prevRow,
                startColumn: prevColumn,
                endRow: row,
                endColumn: column
            });
            prevRow = row;
            prevColumn = column + 1;
        }
        column++;
        if (givenText.charAt(i) == "\n") {
            row++;
            column = 0;
        }
    }
    return programs;
}
//# sourceMappingURL=CompileCode.js.map