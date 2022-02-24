class TreeNode{//would have called it Node but thats already being used by some random lib 
    public name:string=null;
    public parent:TreeNode=null;
    public children:TreeNode[] = [];
    public token:Token = null; // leaf nodes have a pointer to the token they use

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
        if (this.root == null && nodeType.root == kind){
            this.root == n;
        }else{
            n.parent = this.current;
            n.parent.children.push(n)
        }
        if (kind != nodeType.leaf){
            this.current = n;
        }else{
            n.token = token;
        }
    }

    disownChild(){

    }

}