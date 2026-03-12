import StatementNode from "./StatementNode.js";

export default class WhileNode extends StatementNode{
    constructor(condition, body){
        super();
        this.type = "WHILE"
        this.condition = condition;
        this.body = body;
    }

    execute(storage){
        if (this.condition.evaluate(storage)){
            for (let block of this.body){
                block.execute(storage);
            }

        this.execute(storage);

        }
        
    }
}
