import ExpressionNode from "./ExpressionNode.js";

export default class GetVariableNode extends ExpressionNode{
    constructor(name){
        super();
        this.type = "GET";
        this.name = name;
    }

    evaluate(storage){
        if (storage.varibles[this.name] !== undefined){
            return storage.varibles[this.name].value;

        }
        
        return undefined;

    }
}