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
        
        const blockInfo = {
            id: blockId,
            type: block.dataset.type,
            parentId: parentId,
            values: {},
            children: []
        };
        
        switch(block.dataset.type) {
            case 'VARIABLE':

                const varInput = block.querySelector('.input-left');
                if (varInput) {
                    blockInfo.values.variables = varInput.value;
                    console.log('VARIABLE values:', blockInfo.values); // Отладка
                }
                break;
                
            case 'ASSIGN':
                const textareas = block.querySelectorAll('textarea');
                if (textareas.length >= 2) {
                    blockInfo.values.variableName = textareas[0].value;
                    blockInfo.values.variableValue = textareas[1].value;
                    console.log('ASSIGN values:', blockInfo.values); // Отладка
                }
                break;
            
        }
        

        blocksArray.push(blockInfo);
        
        const spawnZones = block.querySelectorAll(':scope > .spawn-zone');

        spawnZones.forEach(zone => {
            const childBlocks = zone.querySelectorAll(':scope > .block-code');
            
            childBlocks.forEach(childBlock => {
                const childInfo = collectBlocks(childBlock, blockInfo.id);
                blockInfo.children.push(childInfo.id);
            });
        });
        
        return blockInfo;
    }
    
    collectBlocks(startBlock);
    
    console.log('Собранные блоки:', blocksArray);
    return blocksArray;
}

function findStartBlock() {
    const programSpace = document.getElementById('proramingSpace');
    return programSpace?.querySelector('.block-code[data-type="start"]') || null;
}
