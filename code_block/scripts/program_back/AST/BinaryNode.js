import ExpressionNode from "./ExpressionNode.js";

export default class BinaryNode extends ExpressionNode {
    constructor(left, right, operator) {
        super();
        this.type = 'BINARY';
        this.left = left;
        this.right = right;
        this.operator = operator;
    }

    evaluate(storage) {
        if (!this.left || !this.right)
            throw new Error(`BinaryNode: операнды обязательны для "${this.operator}"`);

        const l = this.left.evaluate(storage);
        const r = this.right.evaluate(storage);

        switch (this.operator) {
            case '+': return l + r;
            case '-': return l - r;
            case '*': return l * r;
            case '/':
                if (r === 0) 
                    throw new Error('Деление на ноль');
                return l / r;

            case '%':
                if (r === 0) 
                    throw new Error('Деление на ноль');
                return l % r;
                
            default:
                throw new Error(`Неизвестный оператор "${this.operator}"`);
        }
    }
}