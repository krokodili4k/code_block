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
        const variable = storage.variables[this.nameTo];

        if (!variable) 
            throw new Error(`Переменная ${variableName} не объявлена`);
        else if (this.formula.length > variable.size && variable.size) 
            throw new Error(`Слишком много аргументов размер массива ${variable.size}`);
        else if (this.formula.length > 1)
            throw new Error("Вы присваиваете элемнет к переменной, а не к массиву");
        
        
        if (variable.type === "ARRAY") {
            if (this.index !== null){
                let ind = this.index.evaluate(storage);
                variable.value[ind] = this.formula[0].evaluate();
            }
            else 
                for (let i = 0; i < this.formula.length; i++)
                    variable.value[i] = this.formula[i].evaluate(); 
                
        } 
        else {
            
            let value = this.formula[0].evaluate();  
            variable.value = value;
            
        }
    }
}