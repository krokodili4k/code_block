
import StatementNode from "./StatementNode.js";

export default class DeclareVariable extends StatementNode {  
    constructor(name) {
        super();
        this.type = "VARIABLE";
        this.name = name;
        this.value = 0;
    }
    
    execute(storage) {
        if (storage.variables[this.name])
            throw new Error("Перменная/массив с такимм именим уже существует");
        

        storage.variables[this.name] = {
            type: this.type,
            name: this.name,
            value: this.value
        }
    }

}