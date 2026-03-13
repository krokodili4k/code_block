import DeclareVariable from '../program_back/AST/DeclareVariable.js';
import AssignNode from '../program_back/AST/AssignNode.js';
import NumNode from '../program_back/AST/NumNode.js';
import PrintNode from '../program_back/AST/PrintNode.js';
import IfElseNode from '../program_back/AST/IfElseNode.js';
import WhileNode from '../program_back/AST/WhileNode.js';
import Storage from '../program_back/Storage.js';

import { parseExpression } from './Parser.js';
import { BuildNodeTree } from './Parser.js';
import DeclareArrayNode from '../program_back/AST/DeclareArrayNode.js';

class Interpreter {
    constructor() {
        this.variables = {};
        this.storage = new Storage();
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
                let massVariables = astNode.values.variables;
                massVariables = massVariables.replace(/\s+/g, '');
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
                variableTo = variableTo.replace(/\s+/g, '');
                variableTo = this.createValueNode(variableTo);                
                
                let varValue = astNode.values.variableValue;
                varValue = varValue.replace(/\s+/g, '');
                varValue = varValue.split(',').map(s => this.createValueNode(s));               
                  
                
                if (variableTo && varValue){
                    return new AssignNode(
                        variableTo.name,
                        varValue,
                        variableTo.index
                    );
                }
                break;
            
            case 'PRINT':                
                let printValue = astNode.values.variables;
                printValue = printValue.replace(/\s+/g, '');
                const printNode = this.createValueNode(printValue);
                                           
                return new PrintNode(printNode, printNode.index);

            case "IFELSE":
                let con = astNode.values.condition;
                con = con.replace(/\s+/g, '');

                
                const condition = this.createValueNode(con);              
                
                const childrenTrue = (astNode.if).map(childJSON =>
                    this.createNodeFromJSON(childJSON)
                );

                const childrenFalse = (astNode.else).map(childJSON =>
                    this.createNodeFromJSON(childJSON)
                )

                return new IfElseNode(condition, childrenTrue, childrenFalse);

            case "WHILE":
                let conW = astNode.values.condition;
                conW = conW.replace(/\s+/g, '');
                const whileCondition = this.createValueNode(conW); 
                
                const bodyNodes = (astNode.children || []).map(childJSON =>
                    this.createNodeFromJSON(childJSON))
                    .filter(node => node !== null);;
                
                return new WhileNode(whileCondition, bodyNodes);

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