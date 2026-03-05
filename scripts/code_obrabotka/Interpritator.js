import DeclareVariable from '../program_back/AST/DeclareVariable.js';
import AssignNode from '../program_back/AST/AssignNode.js';
import NumNode from '../program_back/AST/NumNode.js';
import PrintNode from '../program_back/AST/PrintNode.js';
import Storage from '../program_back/Storage.js';


import { parseExpression } from './parser.js';
import { BuildNodeTree } from './parser.js';
import DeclareArrayNode from '../program_back/AST/DeclareArrayNode.js';


class Interpreter {
    constructor() {
        this.variables = {};
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
            } catch (error) {
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
            
            case 'ARRAY':
                const arrName = astNode.values.arrayName;
                
                const arrValuesStr = astNode.values.arrayValues;
                const arrValues = arrValuesStr.split(',').map(s => {
                    const trimmed = s.trim();
                    const num = Number(trimmed);
                    return new NumNode(num);

                });

                return new DeclareArrayNode(arrName, arrValues);
                
                
            case 'ASSIGN':
                const valueNode = this.createValueNode(astNode.values.variableValue);
                
                return new AssignNode(
                    astNode.values.variableName,
                    valueNode 
                );
            
            case 'PRINT':
                const printValue = astNode.values.variables;

                const printNode = this.createValueNode(printValue);
                return new PrintNode(printNode);

                
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
                const nodes = this.createNodeFromJSON(nodeJSON);

                if (Array.isArray(nodes)){
                    nodes.forEach(node => {
                        if (node){
                            node.execute(storage);
                        }
                    });

                }
                else {
                    if (nodes){
                        nodes.execute(storage);
                    }
                }
            });
        }
        
        return this.variables;
    }
}

export default Interpreter;