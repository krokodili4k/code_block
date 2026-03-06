import StatementNode from "./StatementNode.js";

export default class AssignNode extends StatementNode {
    constructor(nameTo, formula, arrSize = null, index = null){
        super();
        this.type = "ASSIGN";
        this.nameTo = nameTo;
        this.formula = formula;
        this.arrSize = arrSize;
        this.index = index;
    }

    execute(storage){
        const variableName = this.nameTo;

        if (!storage.variables[variableName]) {
            throw new Error(`Переменная ${variableName} не объявлена`);
        }

        const variable = storage.variables[variableName];

        if (variable.type === "ARRAY") {
            
            for (let i = 0; i < this.arrSize; i++){
                variable.value[i] = this.formula[i].evaluate(storage); 
            }
            
        } 
        else {
            let value = this.formula[0].evaluate(storage);
            
            variable.value = value;
            
        }
    }
}