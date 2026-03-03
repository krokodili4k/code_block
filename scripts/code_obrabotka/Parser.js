
import AddNode from '../program_back/AST/binary_operations/AddNode.js';
import DivNode from '../program_back/AST/binary_operations/DivNode.js';
import MinusNode from '../program_back/AST/binary_operations/MinusNode.js';
import MultiplicationNode from '../program_back/AST/binary_operations/MultiplicationNode.js';
import RemainderNode from '../program_back/AST/binary_operations/RemainderNode.js';
import NumNode from '../program_back/AST/NumNode.js';
import GetVariableNode from '../program_back/AST/GetVariableNode.js'
import Storage  from '../storage.js';

function parseExpression(exprString) {
    exprString = exprString.replace(/\s+/g, '');
    
    function parse(expression) {
        let level = 0;
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
    if (ast.type === "VAR")
    {
        return new GetVariableNode(ast.name)
    }

    if (ast.op)
    {
        const left = BuildNodeTree(ast.left);
        const right = BuildNodeTree(ast.right);
        switch(ast.op)
        {
            case "+":
                return new AddNode(left, right)
            case "-":
                return new MinusNode(left, right)
            case "*":
                return new MultiplicationNode(left, right)
            case "/":
                return new DivNode(left, right)
            case "%":
                return new RemainderNode(left, right)
        }
    }
}
function Calculate(ast, storage)
{   let storage = new Storage
    Ass
    const tree = BuildNodeTree(ast)
    return tree.evaluate(storage)
}

export {parseExpression, Calculate}
