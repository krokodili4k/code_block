import ExpressionNode from "./ExpressionNode.js";

export default class GetVariableNode extends ExpressionNode{
    constructor(name, index = null){
        super();
        this.type = "GET";
        this.name = name;
        this.inext = index;
    }

    evaluate(storage) {

        if (storage.variables[this.name] === undefined) {
            throw new Error(`Переменная "${this.name}" не объявлена`);
        }

        const variable = storage.variables[this.name];

        if (variable.type === "ARRAY"){
            if (this.index === null){
                throw new Error('Задайте индекс массива');
            }

            let ind = this.index.evaluate(storage);

            if (ind < 0 || ind >= variable.size) {
                throw new Error(`Индекс ${ind} вне границ массива "${this.name}" (размер ${variable.size})`);
            }

            return variable.value[ind];
            
        }
        else {
            return variable.value;
        }
    }
}