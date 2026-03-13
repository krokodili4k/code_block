
import BinaryNode from '../program_back/AST/BinaryNode.js';
import NumNode from '../program_back/AST/NumNode.js';
import GetVariableNode from '../program_back/AST/GetVariableNode.js'
import StringNode from '../program_back/AST/StringNode.js';
import CompareNode from '../program_back/conditional_operations/CompareNode.js';
import NotNode from '../program_back/conditional_operations/NotNode.js';
import LogicalNode from '../program_back/conditional_operations/LogicalNode.js';

function parseExpression(exprString) {

    
    
    function parse(expression) {
        let level = 0;

        for (let i = expression.length - 1; i >= 0; i--) {
            const char = expression[i];

            if (char === ')') level++;
            else if (char === '(') level--;

            if (level === 0 && i > 0 && expression.substr(i - 1, 2) === "OR") {
                return {
                    op: "OR",
                    left: parse(expression.slice(0, i-1)),
                    right: parse(expression.slice(i+1))
                }
            }
        }
    
        level = 0;

        for (let i = expression.length - 1; i >= 0; i--) {
            const char = expression[i];

            if (char === ')') level++;
            else if (char === '(') level--;

            if (level === 0 && i > 1 && expression.substr(i - 2, 3) === "AND") {
                return {
                    op: "AND",
                    left: parse(expression.slice(0, i-2)),
                    right: parse(expression.slice(i+1))
                }
            }
        }

        if (expression.startsWith("NOT")) {
            return {
                op: "NOT",
                right: parse(expression.slice(3))
            }
        }
        

        level = 0;

        for (let i = expression.length - 1; i >= 0; i--) {
            const char = expression[i];

            if (char === ')') level++;
            else if (char === '(') level--;

            if (level === 0){

                if (char === ">") {
                    return {
                        op: char,
                        left: parse(expression.slice(0, i)),
                        right: parse(expression.slice(i + 1))
                    }
                    
                }
                if (char === "<"){
                    return {
                        op: char,
                        left: parse(expression.slice(0, i)),
                        right: parse(expression.slice(i + 1))
                    }
                }
                if (i > 0 && expression.substr(i-1, 2) === "==") {
                    return {
                        op: "==",
                        left: parse(expression.slice(0, i - 1)),
                        right: parse(expression.slice(i + 1))
                    }
                }
                if (i > 0 && expression.substr(i-1, 2) === "!=") {
                    return {
                        op: "!=",
                        left: parse(expression.slice(0, i - 1)),
                        right: parse(expression.slice(i + 1))
                    }
                }
                if (i > 0 && expression.substr(i-1, 2) === ">=") {
                    return {
                        op: ">=",
                        left: parse(expression.slice(0, i - 1)),
                        right: parse(expression.slice(i + 1))
                    }
                }
                if (i > 0 && expression.substr(i-1, 2) === "<=") {
                    return {
                        op: "<=",
                        left: parse(expression.slice(0, i - 1)),
                        right: parse(expression.slice(i + 1))
                    }
                }
            }
        }
        
        level = 0;
        for (let i = expression.length - 1; i >= 0; i--) {
            const char = expression[i];
            
            if (char === ')') level++;
            else if (char === '(') level--;
            
            if (level === 0 && (char === '+' || char === '-')) {
                return {
                    op: char,
                    left: parse(expression.slice(0, i)),
                    right: parse(expression.slice(i + 1))
                };
            }
        }

        level = 0;
        for (let i = expression.length - 1; i >= 0; i--) {
            const char = expression[i];
            
            if (char === ')') level++;
            else if (char === '(') level--;
            
            if (level === 0 && (char === '*' || char === '/' || char === "%")) {
                return {
                    op: char,
                    left: parse(expression.slice(0, i)),
                    right: parse(expression.slice(i + 1))
                };
            }
        }

        if (expression.startsWith('(') && expression.endsWith(')')) {
            return parse(expression.slice(1, -1));
        }

        if (!isNaN(expression)) {
            return { type: "NUM", value: parseFloat(expression) };
        }

        if ((expression.startsWith('"') && expression.endsWith('"')) || 
            (expression.startsWith("'") && expression.endsWith("'"))) {
            
            const stringContent = expression.slice(1, -1);
            return { type: "STRING", value: stringContent };
        }
        exprString = exprString.replace(/\s+/g, '');
    

        const arrayMatch = expression.trim().match(/^([^\[]+?)\s*\[\s*(.*?)\s*\]$/);
        
        if (arrayMatch) {
            const arrayName = arrayMatch[1].trim();
            const indexExpr = arrayMatch[2].trim();       

            return {
                type: "ARRAY_ELEMENT",
                name: arrayName,
                index: parse(indexExpr)
            };
        }

        if (/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(expression)) {
            return { type: "VAR", name: expression };
        }
        
        throw new Error(`Не удалось распарсить: ${expression}`);
    }
    
    return parse(exprString);
}

function BuildNodeTree(ast)
{

    if (ast.type === "NUM")
    {
        return new NumNode(ast.value)
    }   
    if (ast.type == "STRING")
    {
        return new StringNode(ast.value);
    }
    if (ast.type === "VAR")
    {
        return new GetVariableNode(ast.name)
    }
    if (ast.type === "ARRAY_ELEMENT") 
    {
        const indexNode = BuildNodeTree(ast.index);
        return new GetVariableNode(ast.name, indexNode);
    }

    if (ast.op)
    {
        if (ast.op === "NOT"){
            const right = BuildNodeTree(ast.right);
            return new NotNode(right)
        }

        const left = BuildNodeTree(ast.left);
        const right = BuildNodeTree(ast.right);

        if (ast.op === "AND" || ast.op === "OR"){
            return new LogicalNode(left, right, ast.op)
        }
        
        if ([">", "<", "==", "!=", ">=", "<="].includes(ast.op)){
            return new CompareNode(left, right, ast.op)
        }
        switch(ast.op)
        {
            case "+":
                return new BinaryNode(left, right, "+")
            case "-":
                return new BinaryNode(left, right, "-")
            case "*":
                return new BinaryNode(left, right, "*")
            case "/":
                return new BinaryNode(left, right, "/")
            case "%":
                return new BinaryNode(left, right, "%")
        }
    }
}
function Calculate(ast, storage){
    const tree = BuildNodeTree(ast)
    return tree.evaluate(storage)
}

export {parseExpression, Calculate, BuildNodeTree}
