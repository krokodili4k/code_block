import ExpressionNode from "./ExpressionNode.js";

export default class NumNode extends ExpressionNode{
    constructor(value){
        super();
        this.type = "ARRAY";
        this.value = value;
    }

    evaluate(){
        return this.value;
    }
}