import ExpressionNode from "../ExpressionNode.js";

export default class MinusNode extends ExpressionNode {
    constructor(leftVelue, rightValue){
        super();
        this.type = "MINUS";
        this.left = leftVelue;
        this.right = rightValue;
    }

    evaluate(storage){
        if (!this.left || !this.right) {
            throw new Error("MinusNode: левый и правый операнды обязательны");
        }

        const leftValue = this.left.evaluate(storage);
        const rightValue = this.right.evaluate(storage);

        return leftValue - rightValue;
    }


}