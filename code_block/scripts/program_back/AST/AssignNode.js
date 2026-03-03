import StatementNode from "./StatementNode.js";

export default class AssignNode extends StatementNode {
    constructor(nameTo, formula){
        super();
        this.type = "ASSIGN";
        this.nameTo = nameTo;
        this.formula = formula;
    }

    execute(storage){
        const variableName = this.nameTo;
        

        const value = this.formula.evaluate(storage);


        storage.varibles[variableName].value = value;

    }

}