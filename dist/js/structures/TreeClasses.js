class TreeNode {
    constructor() {
        this.name = null;
        this.parent = null;
        this.children = [];
        this.token = null; // leaf nodes have a pointer to the token they use
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
        console.log("adding", n);
        if (this.root == null && kind == nodeType.root) {
            console.log('this is a root');
            this.root = n;
        }
        else {
            n.parent = this.current;
            n.parent.children.push(n);
        }
        if (kind != nodeType.leaf) {
            console.log('set current', n);
            this.current = n;
        }
        else {
            n.token = token;
        }
    }
    moveUp() {
        if (this.current != this.root) {
            this.current = this.current.parent;
            console.log('set back current', this.current);
        }
    }
}
//# sourceMappingURL=TreeClasses.js.map