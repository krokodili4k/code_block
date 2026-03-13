function collectChild(spawnZone, blockInfo, branchName, collectBlocks) {
    const childBlocks = spawnZone.querySelectorAll(':scope > .block-code');
    
    childBlocks.forEach(childBlock => {
        const childInfo = collectBlocks(childBlock, blockInfo.id);
        blockInfo.children[branchName].push(childInfo.id);
    });
}

function collectBlocksToArray() {
    const startBlock = findStartBlock();
    
    if (!startBlock) {
        console.log('Start блок не найден');
        return [];
    }
    
    const blocksArray = [];
    
    function collectBlocks(block, parentId = null) {
        let blockId = block.dataset.bid;

        if (!blockId) {
            blockId = generateBlockId();
            block.dataset.bid = blockId;
        }
        
        const isIfElse = block.dataset.type === 'IFELSE';
     
        const blockInfo = {
            id: blockId,
            type: block.dataset.type,
            parentId: parentId,
            values: {},
            children: isIfElse ? { if: [], else: [] } : [],
        };
        
        
        switch(block.dataset.type) {
            case 'start':
                break;

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
                    blockInfo.values.condition = condition.value;
                }
                            
                const ifElseSpawnZones = block.querySelectorAll(':scope > .spawn-zone');          
            
                
                if (ifElseSpawnZones[0]) {
                    collectChild(ifElseSpawnZones[0], blockInfo, 'if', collectBlocks);
                }
                
                if (ifElseSpawnZones[1]) {
                    collectChild(ifElseSpawnZones[1], blockInfo, 'else', collectBlocks);
                }
                
                break;

            case "WHILE":
                const whileCondition = block.querySelector(".input")

                if (whileCondition) {
                    blockInfo.values.condition = whileCondition.value
                }

                break

            default:
                console.log("Нет такого типа");
                break;
                
        }

        blocksArray.push(blockInfo);
        
        const spawnZones = block.querySelectorAll(':scope > .spawn-zone');
        if (!isIfElse){
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