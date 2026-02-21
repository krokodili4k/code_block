class StatementNode extends ExpressionNode {
    constructor(){
        super();
        this.codeStrings = [];
    }

    addNode(node) {
        this.codeStrings.push(node);
        
    } 

    execute(context) {
        throw new Error('Метод execute должен быть реализован');
    }
}