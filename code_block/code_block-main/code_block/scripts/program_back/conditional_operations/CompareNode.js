import ExpressionNode from "../AST/ExpressionNode.js";

export default class CompareNode extends ExpressionNode {
    constructor(leftVelue, rightValue, operator){
        super();
        this.type = "COMPARE";
        this.left = leftVelue;
        this.right = rightValue;
        this.operator = operator;
    }

    evaluate(storage){
        
        if (!this.left || !this.right) {
            throw new Error("RemainderNode: левый и правый операнды обязательны");
        } 
        const leftValue = this.left.evaluate(storage);
        const rightValue = this.right.evaluate(storage);

        switch(this.operator){
            case ">": return leftValue > rightValue;
            case "<": return leftValue < rightValue;
            case "==": return leftValue === rightValue;
            case "!=": return leftValue !== rightValue;
            case ">=": return leftValue >= rightValue;
            case "<=": return leftValue <= rightValue;
        }
    }


}