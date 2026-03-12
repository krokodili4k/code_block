import DeclareVariable from '../program_back/AST/DeclareVariable.js';
import AssignNode from '../program_back/AST/AssignNode.js';
import NumNode from '../program_back/AST/NumNode.js';
import PrintNode from '../program_back/AST/PrintNode.js';
import IfElseNode from '../program_back/AST/IfElseNode.js';

import { parseExpression } from './Parser.js';
import { BuildNodeTree } from './Parser.js';
import DeclareArrayNode from '../program_back/AST/DeclareArrayNode.js';

class Interpreter {
    constructor() {
        this.variables = {};
        this.storage = {
            variables: this.variables
        };
    }

    createValueNode(value) {
        
        if (typeof value === 'string') {

           
            if (!isNaN(value)) {
                return new NumNode(value);
            }
            try {
                const exprAst = parseExpression(value);                    
                const exprNode = BuildNodeTree(exprAst);    
                return exprNode;

            }
             catch (error) {
                console.log('Ошибка парсинга "${value}":', error);
                return new NumNode(value);
            }
        }
       
        if (typeof value === 'number') {
            return new NumNode(value);
        }

        return new NumNode(value);
    }

    createNodeFromJSON(astNode) {
        switch(astNode.type) {
            case 'VARIABLE':
                const massVariables = astNode.values.variables;
                const variablesName = massVariables.split(',').map(s => s.trim());

                const varType = astNode.values.typeVar;
                const arrSize = Number(astNode.values.arrSize);

                if (varType === 'array' && arrSize > 0 && variablesName){
                    const declareNodes = variablesName.map(arrayName => {
                        return new DeclareArrayNode(arrayName, arrSize);
                    });
                    return declareNodes;
                }
                else if (varType === 'variable' && variablesName){
                    const declareNodes = variablesName.map(varName => {
                        return new DeclareVariable(varName);
                    });
                    
                    return declareNodes;
                }
                break;
                
                
            case 'ASSIGN':
                
                let variableTo = astNode.values.variableName;
                variableTo = this.createValueNode(variableTo);
                
                let varValue = astNode.values.variableValue;
                varValue = varValue.split(',').map(s => this.createValueNode(s.trim()));   
                

                if (variableTo && varValue){
                    return new AssignNode(
                        variableTo.name,
                        varValue,
                        variableTo.index
                    );
                }
                break;
            
                
            
            case 'PRINT':
                const printValue = astNode.values.variables;
                const printNode = this.createValueNode(printValue);                                
                return new PrintNode(printNode, printNode.index);

            case "IFELSE":
                const condition = this.createValueNode(astNode.values.condition)

                const childrenTrue = (astNode.childrenTrue).map(childJSON =>
                    this.createNodeFromJSON(childJSON)
                );

                const childrenFalse = (astNode.childrenFalse).map(childJSON =>
                    this.createNodeFromJSON(childJSON)
                )

                return new IfElseNode(condition, childrenTrue, childrenFalse);
            default:
                console.log(`Неизвестный тип: ${astNode.type}`);
                return null;
        }
    }

    run(programAST) {
        this.variables = {};
        
        if (programAST.body && programAST.body.length > 0) {
            programAST.body.forEach(nodeJSON => {
                const nodes = this.createNodeFromJSON(nodeJSON);

                if (Array.isArray(nodes)){
                    nodes.forEach(node => {
                        if (node){
                            node.execute(this.storage);
                        }
                    });

                }
                else {
                    if (nodes){
                        nodes.execute(this.storage);
                    }
                }
            });
        }

        
        return this.variables;
    }
}

export default Interpreter;