import ExpressionNode from "./ExpressionNode.js";

export default class NumNode extends ExpressionNode{
    constructor(num){
        super();
        this.type = "NUM";
        this.num = Number(num);
    }

    evaluate(){
        return this.num;
    }
}