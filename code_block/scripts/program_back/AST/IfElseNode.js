import StatementNode from "./StatementNode.js";

export default class IfElseNode extends StatementNode{
    constructor(status, childrenTrue, childrenFalse = []){
        super();
        this.type = "IFELSE"
        this.status = status;
        this.childrenTrue = childrenTrue;
        this.childrenFalse = childrenFalse;
    }

    execute(storage){
        const statusRes = this.status.evaluate(storage);

        if (statusRes) {
            for (let block of this.childrenTrue){
                block.execute(storage);
            }
        }
        else if (this.childrenFalse && this.childrenFalse.length > 0){
            for (let block of this.childrenFalse){
                block.execute(storage);
            }
        }
    }
}