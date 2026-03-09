import StatementNode from "./StatementNode.js";

export default class AssignNode extends StatementNode {
    constructor(nameTo, formula, index = null){
        super();
        this.type = "ASSIGN";
        this.nameTo = nameTo;
        this.formula = formula;
        this.index = index;
    }

    execute(storage){
        const variableName = this.nameTo;

        if (!storage.variables[variableName]) {
            throw new Error(`Переменная ${variableName} не объявлена`);
        }

        const variable = storage.variables[variableName];

        if (variable.type === "ARRAY") {
            if (this.index !== null){
                if (this.index < 0 || ind >= variable.size) {
                    throw new Error(`Индекс ${this.index} вне границ массива "${variable.name}" (размер ${variable.size})`);
                }

                variable.value[this.index] = this.formula[0].evaluate(storage);
            }
            else {
                this.formula = this.formula.split(',').map(s => Number(s.trim()));

                if (this.formula.length > variable.size) {
                    throw new Error(`Слишком много аргументов размер массива ${variable.size}`);
                }
                
                for (let i = 0; i < this.formula.length; i++){
                    variable.value[i] = this.formula[i]; 
                }
            }
            
        } 
        else {
            let value = this.formula.evaluate();  
            variable.value = value;
            
        }
    }
}