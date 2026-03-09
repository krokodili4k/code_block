import { collectBlocksToArray } from './code_obrabotka/CollectNodes.js'
import { convertToAST } from './code_obrabotka/ConvertToJSON.js'
import Interpreter from './code_obrabotka/interpritator.js';


const but = document.getElementById("run-program-btn");


but.addEventListener("click", function() {
    const blocks = collectBlocksToArray();   
    const ast = convertToAST(blocks);
    
    
    console.log(ast); 
    if (ast) {
        const interpreter = new Interpreter();

        try {
            const result = interpreter.run(ast); 
        } 
        catch (error) {
            console.error('Ошибка выполнения:', error);
        }
    }
     else {
        alert('Не удалось создать AST');
    }

    
});