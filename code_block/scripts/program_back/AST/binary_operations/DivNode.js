import ExpressionNode from "../ExpressionNode.js";

export default class DivNode extends ExpressionNode {
    constructor(leftVelue, rightValue){
        super();
        this.type = "DIV";
        this.left = leftVelue;
        this.right = rightValue;
    }

    evaluate(storage){
        
        if (!this.left || !this.right) {
            throw new Error("RemainderNode: левый и правый операнды обязательны");
        } 
        const leftValue = this.left.evaluate(storage);
        const rightValue = this.right.evaluate(storage);
        if (rightValue == 0) {
            throw new Error("RemainderNode: деление на 0 невозможно");
        }
        return leftValue / rightValue;
    }


}