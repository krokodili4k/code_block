import ExpressionNode from "../AST/ExpressionNode.js";

export default class LogicalNode extends ExpressionNode {
    constructor(leftVelue, rightValue, operator){
        super();
        this.type = "LOGICAL";
        this.left = leftVelue;
        this.right = rightValue;
        this.operator = operator;
    }

    evaluate(storage){
        const leftValue = this.left.evaluate(storage);
        const rightValue = this.right.evaluate(storage);
        if (this.operator === "AND"){
            return leftValue && rightValue;
        }
        else if (this.operator === "OR"){
            return leftValue || rightValue;
        }
    }
}