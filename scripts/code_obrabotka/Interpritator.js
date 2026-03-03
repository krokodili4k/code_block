import DeclareVariable from '../program_back/AST/DeclareVariable.js';
import AssignNode from '../program_back/AST/AssignNode.js';
import NumNode from '../program_back/AST/NumNode.js';

class Interpreter {
    constructor() {
        this.variables = {};
    }

    createValueNode(value) {
        if (typeof value === 'string' && !isNaN(value)) {
            return new NumNode(value);
        }
       
        if (typeof value === 'number') {
            return new NumNode(value);
        }

        return new NumNode(value);
    }

    createNodeFromJSON(astNode) {
        switch(astNode.type) {
            case 'VARIABLE':
                return new DeclareVariable(astNode.values.variables);
                
            case 'ASSIGN':
                const valueNode = this.createValueNode(astNode.values.variableValue);
                
                return new AssignNode(
                    astNode.values.variableName,
                    valueNode 
                );
                
            default:
                console.log(`Неизвестный тип: ${astNode.type}`);
                return null;
        }
    }

    run(programAST) {
        this.variables = {};
        
        const storage = {
            variables: this.variables
        };
        
        if (programAST.body && programAST.body.length > 0) {
            programAST.body.forEach(nodeJSON => {
                const node = this.createNodeFromJSON(nodeJSON);
                if (node) {
                    node.execute(storage);
                }
            });
        }
        
        console.log('Переменные:', this.variables);
        
        return this.variables;
    }
}

export default Interpreter;