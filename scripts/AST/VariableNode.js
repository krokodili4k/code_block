import StatementNode from "./StatementNode ";

export default class VariableNode extends StatementNode {
    constructor(name, value) {
        super();
        this.name = name;
        this.value = 0;
    }
    
    execute(context){
        context.setVarible(this.name, this.value);
        console.log('создана переменная ${this.name}');
    }

    evaluate(context) {
        return context.getVariable(this.name);
    }
}