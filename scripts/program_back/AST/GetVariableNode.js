import ExpressionNode from "./ExpressionNode.js";

export default class GetVariableNode extends ExpressionNode{
    constructor(name, index = null){
        super();
        this.type = "GET";
        this.name = name;
        this.index = index;
    }

    evaluate(storage) {

        if (storage.variables[this.name] === undefined) {
            throw new Error(`Переменная "${this.name}" не объявлена`);
        }
        
        return storage.variables[this.name].value;
    }
}