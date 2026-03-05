import StatementNode  from "./StatementNode.js";

export default class PrintNode extends StatementNode {
    constructor(variable){
        super();
        this.type = "PRINT";
        this.variable = variable;
    }

    execute(storage){
        const value = this.variable.evaluate(storage); 
        
        console.log(value);
    }

}