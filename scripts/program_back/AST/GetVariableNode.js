import ExpressionNode from "./ExpressionNode.js";

export default class GetVariableNode extends ExpressionNode{
    constructor(name){
        super();
        this.type = "GET";
        this.name = name;
    }

    evaluate(storage) {

        if (storage.variables[this.name] === undefined) {
            throw new Error(`Переменная "${this.name}" не объявлена`);
        }
        
        return storage.variables[this.name].value;
    }
}