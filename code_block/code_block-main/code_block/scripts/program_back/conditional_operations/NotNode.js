import ExpressionNode from "../AST/ExpressionNode.js";
    
export default class NotNode extends ExpressionNode {
    constructor(value){
        super();
        this.type = "NOT";  
        this.value = value;
    }

    evaluate(storage){
        return !this.value.evaluate(storage);
    }
}