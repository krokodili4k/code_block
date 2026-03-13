import StatementNode  from "./StatementNode.js";

export default class PrintNode extends StatementNode {
    constructor(node, index){
        super();
        this.type = "PRINT";
        this.node = node;
        this.index = index;
    }

    execute(storage){
        if (this.node.type === "STRING"){
            console.log(this.node.value);
            return;
        }
        
        const variable = storage.variables[this.node.name];
        if (variable){
            if (variable.type === "ARRAY"){
                if (this.index){
                    let ind = this.index.evaluate(storage);

                    if (ind < 0 || ind > variable.size) 
                        throw new Error("Не верный индекс");

                    console.log(variable.value[ind]);
                    return;                    
                }
                console.log(variable.value);
                return;
            }
            console.log(variable.value);
            return;
        }
        console.log(this.node.evaluate(storage));
        
    }

}