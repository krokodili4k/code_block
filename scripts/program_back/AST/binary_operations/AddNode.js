import ExpressionNode from "../ExpressionNode.js";

export default class AddNode extends ExpressionNode {
    constructor(leftVelue, numRightValue2){
        super();
        this.type = "ADD";
        this.left = leftVelue;
        this.right = numRightValue2;
    }

    evaluate(storage){
        if (!this.left || !this.right) {
            throw new Error("MinusNode: левый и правый операнды обязательны");
        }

        const leftValue = this.left.evaluate(storage);
        const rightValue = this.right.evaluate(storage);

        return leftValue + rightValue;
    }


}