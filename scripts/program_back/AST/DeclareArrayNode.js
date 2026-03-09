
import StatementNode from "./StatementNode.js";

export default class DeclareArrayNode extends StatementNode {  
    constructor(name, size) {
        super();
        this.type = "ARRAY";
        this.name = name;
        this.size = size;
        this.values;
    }
    
    execute(storage) {
        if (storage.variables[this.name]){
            console.log("Переменная/массив с такимм именим уже существует");
        }

        const array = new Array(this.size).fill(0);


        storage.variables[this.name] = {
            type: this.type,
            name: this.name,
            size: this.size,
            value: array
        }

       
    }

}