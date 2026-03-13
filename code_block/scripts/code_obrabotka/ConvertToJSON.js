function convertToAST(blocksArray) {
    const blocksMap = new Map();
    blocksArray.forEach(block => blocksMap.set(block.id, block));
    
    const startBlock = blocksArray.find(block => block.type === 'start');
    if (!startBlock) {
        console.log('Start блок не найден в массиве');
        return null;
    }
    
    function buildASTNode(block) {
        const astNode = {
            type: block.type,
            id: block.id,
            values: { ...block.values } 
        };
        if (block.type === 'IFELSE') {
            const ifIds = block.children?.if ?? [];
            const elseIds = block.children?.else ?? [];

            astNode.if = ifIds
                .map(childId => {
                    const childBlock = blocksMap.get(childId);
                    return childBlock ? buildASTNode(childBlock) : null;
                })
                .filter(node => node !== null);

            astNode.else = elseIds
                .map(childId => {
                    const childBlock = blocksMap.get(childId);
                    return childBlock ? buildASTNode(childBlock) : null;
                })
                .filter(node => node !== null);
                astNode.children = [];
            return astNode;
        }

        if (block.type === "WHILE") {
            astNode.children = (block.children || [])
                .map(childId => {
                    const childBlock = blocksMap.get(childId);
                    return childBlock ? buildASTNode(childBlock) : null;
                })
                .filter(node => node !== null);
            return astNode;
        }
        
        if (block.children && block.children.length > 0) {
            astNode.children = block.children.map(childId => {
                const childBlock = blocksMap.get(childId);
                return childBlock ? buildASTNode(childBlock) : null;
            }).filter(node => node !== null);
        } 
        else {
            astNode.children = [];
        }
        
        return astNode;
    }
    
    const ast = buildASTNode(startBlock);
    

    const programAST = {
        type: 'start',
        body: ast.children || [],
        sourceType: 'module'
    };
    
    return programAST;
}

export { convertToAST };

