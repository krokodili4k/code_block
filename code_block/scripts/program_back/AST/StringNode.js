import ExpressionNode from "./ExpressionNode.js";


export default class StringNode  extends ExpressionNode{
    constructor(value) {
        super();
        this.value = value;
        this.type = 'STRING';
    }
    
    evaluate(storage) {
        return this.value;
    }
}