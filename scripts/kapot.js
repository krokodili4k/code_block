import { collectBlocksToArray } from './code_obrabotka/CollectNodes.js'
import { convertToAST } from './code_obrabotka/ConvertToJSON.js'
import Interpreter from './code_obrabotka/interpritator.js';

const runProgram = document.getElementById("run-program-btn");
const downloadBtn = document.getElementById("download-btn");
const importProgramBtn = document.getElementById("import-btn")
const deleteProgramBtn = document.getElementById("clear-program-btn");



deleteProgramBtn.addEventListener("click", function() { 
    workspaceCanvas.innerHTML = '';
});

function RunProgram(){
    const blocks = collectBlocksToArray();
    const ast = convertToAST(blocks);
    
    if (ast) {
        const interpreter = new Interpreter();

        try {
            interpreter.run(ast); 
        } 
        catch (error) {
            console.error('Ошибка выполнения:', error);
        }
    }
     else {
        alert('Не удалось создать AST');
    }
}


function DownLoadCode(){
    const fileName = prompt('Введите название файла: ' + 'ast.json');
    if (fileName){
        const blocks = collectBlocksToArray();   
        const ast = convertToAST(blocks);

        const jsonString = JSON.stringify(ast, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName.endsWith('.json') ? fileName : fileName + '.json';
        link.click();
        
        URL.revokeObjectURL(url);
    }

}

function ImportCode() {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.json,application/json';
    
    fileInput.addEventListener('change', function(event) {
        const file = event.target.files[0];
        
        if (!file) return;

        const reader = new FileReader();
        
        reader.onload = function(e) {
            try {
                const ast = JSON.parse(e.target.result);
                
                const interpreter = new Interpreter();
                try {
                    interpreter.run(ast);
                                      
                } 
                catch (error) {
                    throw new Error('Ошибка выполнения импортированного кода:', error);
                }

            }
            catch (error) {
                throw new Error('Ошибка при чтении файла:', error);
            }
        };
        
        reader.readAsText(file);
    });
    
    fileInput.click();
}


runProgram.addEventListener("click", () => { 
    RunProgram()
});
downloadBtn.addEventListener("click", () => {
    DownLoadCode()
});
importProgramBtn.addEventListener("click", () => {
    ImportCode()
})

