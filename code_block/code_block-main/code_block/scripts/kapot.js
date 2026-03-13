import { collectBlocksToArray } from './code_obrabotka/CollectNodes.js'
import { convertToAST } from './code_obrabotka/ConvertToJSON.js'
import { addDeleteButton, makeBlockDraggable, placeOnWorkspace,placeIntoZone } from './site_program/drag_drop.js';
import Interpreter from './code_obrabotka/Interpritator.js';

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

function createBlockFromType(blockType) {
    const sourceBlock = document.querySelector(`.left-panel [data-type="${blockType}"]`);

    if (!sourceBlock) {
        console.error(`Блок типа "${blockType}" не найден`);
        return null;
    }

    const newBlock = sourceBlock.cloneNode(true);

    newBlock.style.position = '';

    return newBlock;
}

function PrepareNode(block, ID, spawnZone){
    block.classList.add('in-workspace');

    block.querySelectorAll('[id]').forEach(el => el.removeAttribute('id'));
    block.dataset.bid = ID;

    addDeleteButton(block);
    makeBlockDraggable(block);

    if (spawnZone)
        placeIntoZone(block, spawnZone);     
    else
        placeOnWorkspace(block, 700, 500);
}

function ApplyValues(htmlBlock, jsonBlock){
    
    switch (jsonBlock.type){
        case 'VARIABLE':
            const operatorSelect = htmlBlock.querySelector('.operator-select');
            const inputs = htmlBlock.querySelectorAll('.input');
            const arraySizeInput = inputs[0];
            const variablesInput = inputs[1];

            operatorSelect.value = jsonBlock.type;

            if (jsonBlock.values.typeVar === 'variable')
                operatorSelect.value = 'variable';
            else
                operatorSelect.value = 'array';
            
            arraySizeInput.value = jsonBlock.values.arrSize;
            variablesInput.value = jsonBlock.values.variables;
            break;


        case 'ASSIGN':
            const variableNameTextarea = htmlBlock.querySelector('textarea[name="block-name-varible"]');            
            const variableValueTextarea = htmlBlock.querySelector('textarea[name="block-varible-values"]');
        
            variableNameTextarea.value = jsonBlock.values.variableName;
            variableValueTextarea.value = jsonBlock.values.variableValue;
            break;


        case 'PRINT':
            const inputElementPrint = htmlBlock.querySelector('#input_block_varible');

            inputElementPrint.value = jsonBlock.values.variables;
            break;
        
        case 'IFELSE':            
            const inputElementCond = htmlBlock.querySelector('#input_if_else_block');
            const spawnZones = htmlBlock.querySelectorAll('.spawn-zone');

            inputElementCond.value = jsonBlock.values.condition;

            if (spawnZones[0]){
                jsonBlock.if.forEach(block =>{
                    const newBlock = createBlockFromType(block.type);
                    ApplyValues(newBlock, block);
                    PrepareNode(newBlock, block.id, spawnZones[0]);
                });
            }
            if (spawnZones[1]){
                jsonBlock.else.forEach(block =>{
                    const newBlock = createBlockFromType(block.type);
                    ApplyValues(newBlock, block);
                    PrepareNode(newBlock, block.id, spawnZones[1]);
                });
            }
            
            break;
        
        case 'WHILE':
            const inputWhileElementCond = htmlBlock.querySelector('#input_while_block');
            const spawnZoneWhile = htmlBlock.querySelector('.spawn-zone');

            inputWhileElementCond.value = jsonBlock.values.condition;

            if (spawnZoneWhile){
                jsonBlock.children.forEach(block =>{
                    const newBlock = createBlockFromType(block.type);
                    ApplyValues(newBlock, block);
                    PrepareNode(newBlock, block.id, spawnZoneWhile);
                });
            }
            break;

        default:
            console.log(`Неизвестный тип: ${astNode.type}`);
            return null;

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
                const startBlock = createBlockFromType('start');
                
                PrepareNode(startBlock, ast.body[0].id);
                
                const spawnZone = startBlock.querySelector('.spawn-zone');
                startBlock.style.width = '400px';

                ast.body.forEach(block =>{
                    const newBlock = createBlockFromType(block.type);
                    ApplyValues(newBlock, block);
                    PrepareNode(newBlock, block.id, spawnZone);
                  
                });                

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

