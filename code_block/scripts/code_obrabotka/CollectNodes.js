

function collectBlocksToArray() {

    const blocksArray = [];
    function collectChild(spawnZone, blockInfo, branchName) {
        const childBlocks = spawnZone.querySelectorAll(':scope > .block-code');
        
        childBlocks.forEach(childBlock => {
            const childInfo = collectBlocks(childBlock, blockInfo.id);
            if (branchName) {
                if (!blockInfo.values.branches) {
                    blockInfo.values.branches = {};
                }
                if (!blockInfo.values.branches[branchName]) {
                    blockInfo.values.branches[branchName] = [];
                }
                blockInfo.values.branches[branchName].push(childInfo);
            }
        });
    }

    const startBlock = findStartBlock();
    
    if (!startBlock) {
        console.log('Start блок не найден');
        return [];
    }
     
    function collectBlocks(block, parentId = null) {
        let blockId = block.dataset.bid;
        if (!blockId) {
            blockId = generateBlockId();
            block.dataset.bid = blockId;
        }
        
        const blockInfo = {
            id: blockId,
            type: block.dataset.type,
            parentId: parentId,
            values: {},
            children: []
        };
        
        switch(block.dataset.type) {
            case 'VARIABLE':
                const inputs = block.querySelectorAll('.input');
                const typeVar = block.querySelector('.operator-select');

                if (inputs[1] || (inputs[0] && inputs[1])) {
                    
                    blockInfo.values.typeVar = typeVar.value;
                    blockInfo.values.arrSize = inputs[0].value;
                    blockInfo.values.variables = inputs[1].value;
                }
                break;
            
            case 'ASSIGN':
                const textareas = block.querySelectorAll('textarea');

                if (textareas.length >= 2) {
                    blockInfo.values.variableName = textareas[0].value;
                    blockInfo.values.variableValue = textareas[1].value;
                }
                break;

            case 'PRINT':
                const varPrintInput = block.querySelector('.input');
                
                if (varPrintInput){
                    blockInfo.values.variables = varPrintInput.value;
                }
                break;

            case 'IFELSE':
                const condition = block.querySelector('.input');
                
                if (condition) {
                    blockInfo.values.status = condition.value;
                }
                
                blockInfo.values.branches = {
                    if: [],
                    else: []
                };
                const ifElseSpawnZone = block.querySelectorAll(':scope > .spawn-zone');
                collectChild(ifElseSpawnZone[0], blockInfo, "if");
                collectChild(ifElseSpawnZone[1], blockInfo, "else"); 
                break;

            case "WHILE":
                const whileCondition = block.querySelector('.input');
                
                if (whileCondition) {
                    blockInfo.values.condition = whileCondition.value;
                }
                const WhileSpawnZone = block.querySelector(':scope > .spawn-zone');
                collectChild(WhileSpawnZone, blockInfo, "body");
                break;

            default:
                console.log("Нет такого типа");
                break;
                
        }
        

        blocksArray.push(blockInfo);
        if (!["IFELSE", "WHILE"].includes(block.dataset.type)){
            const spawnZones = block.querySelectorAll(':scope > .spawn-zone');

            spawnZones.forEach(zone => {
                const childBlocks = zone.querySelectorAll(':scope > .block-code');
                
                childBlocks.forEach(childBlock => {
                    const childInfo = collectBlocks(childBlock, blockInfo.id);
                    blockInfo.children.push(childInfo.id);
            
                });
            });
        }
        return blockInfo;
    }
    
    collectBlocks(startBlock);

    return blocksArray;
}

function findStartBlock() {
    const programSpace = document.getElementById('proramingSpace');
    return programSpace?.querySelector('.block-code[data-type="start"]') || null;
}

export { collectBlocksToArray };