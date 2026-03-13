import ExpressionNode from "./ExpressionNode.js";

export default class GetVariableNode extends ExpressionNode{
    constructor(name, index = null){
        super();
        this.type = "GET";
        this.name = name;
        this.index = index;
    }

    evaluate(storage) {

        if (storage.variables[this.name] === undefined) 
            throw new Error(`Переменная "${this.name}" не объявлена`);
        

        const variable = storage.variables[this.name];
        

        if (variable.type === "ARRAY" && this.index !== null){ 
            let ind = this.index.evaluate(storage);

            if (ind < 0 || ind >= variable.size) 
                throw new Error(`Индекс ${ind} вне границ массива "${this.name}" (размер ${variable.size})`);
            
            return variable.value[ind];
        }
        return variable.value;
        
    }
}