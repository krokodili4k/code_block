document.addEventListener('DOMContentLoaded', () => {
    const blocks = document.querySelectorAll('.block-code[draggable="true"]');
    const programmingSpace = document.getElementById('proramingSpace');
    const SNAP_THRESHOLD = 43;
    
    function getScale() {
        const transform = programmingSpace.style.transform;
        if (transform && transform.includes('scale')) {
            const scaleIndex = transform.indexOf('scale(');

            if (scaleIndex === -1)
                 return 1;
            
            const startNum = scaleIndex + 6;
            const endNum = transform.indexOf(')', startNum);
            
            const scaleValue = transform.substring(startNum, endNum);
            return parseFloat(scaleValue);
        }

        return 1;
    }

    function findSnapTarget(currentBlock, currentX, currentY, blockWidth, blockHeight) {
        const existingBlocks = Array.from(programmingSpace.children).filter(
            child => child.classList.contains('block-code') && child !== currentBlock
        );
        
        if (existingBlocks.length === 0) return null;
        
        let snapTarget = null;
        let minVerticalDistance = Infinity;
        
        existingBlocks.forEach(block => {
            const blockRect = block.getBoundingClientRect();
            const spaceRect = programmingSpace.getBoundingClientRect();
            const scale = getScale();
            
            const targetBlockType = block.dataset.type;
            
            const blockLeft = (blockRect.left - spaceRect.left) / scale;
            const blockTop = (blockRect.top - spaceRect.top) / scale;
            const blockRight = blockLeft + block.offsetWidth;
            const blockBottom = blockTop + block.offsetHeight;
            
            const isWithinBlockWidth = currentX >= blockLeft - 5 && currentX <= blockRight - blockWidth + 5;
            
            if (isWithinBlockWidth) {
                const distanceToTop = Math.abs(currentY - blockBottom);
                
                if (distanceToTop < SNAP_THRESHOLD && distanceToTop < minVerticalDistance) {
                    if (targetBlockType === 'start') {
                        if (currentY > blockBottom - 10) {
                            minVerticalDistance = distanceToTop;
                            snapTarget = {
                                block: block,
                                y: blockBottom,
                                x: blockLeft,
                                position: 'bottom'
                            };
                        }
                    } 
                    else {
                        minVerticalDistance = distanceToTop;
                        snapTarget = {
                            block: block,
                            y: blockBottom,
                            x: blockLeft,
                            position: 'bottom'
                        };
                    }
                }
                
                const distanceToBottom = Math.abs((currentY + blockHeight) - blockTop);
                if (distanceToBottom < SNAP_THRESHOLD && distanceToBottom < minVerticalDistance) {
                    if (targetBlockType !== 'start') {
                        minVerticalDistance = distanceToBottom;
                        snapTarget = {
                            block: block,
                            y: blockTop - blockHeight,
                            x: blockLeft,
                            position: 'top'
                        };
                    }
                }
            }
        });
        
        return snapTarget;
    }
    
    blocks.forEach(block => {
        block.addEventListener('dragstart', (e) => {
            const blockData = {
                html: block.outerHTML,
                type: block.dataset.type
            };
            console.log(blockData);
            e.dataTransfer.setData('text/plain', JSON.stringify(blockData));
            block.style.opacity = '0.5';
        });
        
        block.addEventListener('dragend', (e) => {
            block.style.opacity = '1';
        });
    });
    
    programmingSpace.addEventListener('dragover', (e) => {
        e.preventDefault();
    });
    
    programmingSpace.addEventListener('drop', (e) => {
        e.preventDefault();
        
        const data = e.dataTransfer.getData('text/plain');
        
        if (data.startsWith('move:')) {
            return;
        }
        
        try {
            const blockData = JSON.parse(data);
            
            const temp = document.createElement('div');
            temp.innerHTML = blockData.html;
            const newBlock = temp.firstChild;
            
            newBlock.classList.add('in-workspace');
            newBlock.style.position = 'absolute';
            newBlock.style.margin = '0';
            
            const elementsWithId = newBlock.querySelectorAll('[id]');
            elementsWithId.forEach(el => el.removeAttribute('id'));
            
            const scale = getScale();
            const rect = programmingSpace.getBoundingClientRect();
            
            const mouseX = (e.clientX - rect.left) / scale;
            const mouseY = (e.clientY - rect.top) / scale;
            
            newBlock.style.left = '-1000px';
            newBlock.style.top = '-1000px';
            programmingSpace.appendChild(newBlock);
            
            const blockWidth = newBlock.offsetWidth;
            const blockHeight = newBlock.offsetHeight;
            
            const snapTarget = findSnapTarget(newBlock, mouseX - blockWidth/2, mouseY - blockHeight/2, blockWidth, blockHeight);
            
            let finalX = mouseX - blockWidth/2;
            let finalY = mouseY - blockHeight/2;
            
            if (snapTarget) {
                finalY = snapTarget.y;
                finalX = snapTarget.x;
            }
            
            newBlock.style.left = finalX + 'px';
            newBlock.style.top = finalY + 'px';
            
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'delete-btn';
            deleteBtn.innerHTML = 'X';
            
            deleteBtn.onclick = (e) => {
                e.stopPropagation();
                newBlock.remove();
            };
            
            newBlock.appendChild(deleteBtn);
            
            makeBlockDraggable(newBlock);
            
        } catch (error) {
            console.error('Ошибка при создании блока:', error);
        }
    });
    
    function makeBlockDraggable(block) {
        let isDragging = false;
        let startX, startY, startLeft, startTop;
        
        block.addEventListener('dragstart', (e) => {
            const img = new Image();
            e.dataTransfer.setDragImage(img, 0, 0);
            
            startX = e.clientX;
            startY = e.clientY;
            startLeft = parseFloat(block.style.left) || 0;
            startTop = parseFloat(block.style.top) || 0;
            
            block.dataset.dragStartX = startLeft;
            block.dataset.dragStartY = startTop;
            block.dataset.mouseStartX = startX;
            block.dataset.mouseStartY = startY;
            
            e.dataTransfer.setData('text/plain', 'move:' + block.id);
            
            block.classList.add('dragging');
            isDragging = true;
        });
        
        block.addEventListener('drag', (e) => {
            if (e.clientX === 0 || e.clientY === 0 || !isDragging) return;
            
            const scale = getScale();
            
            const dx = (e.clientX - startX) / scale;
            const dy = (e.clientY - startY) / scale;
            
            const currentX = startLeft + dx;
            const currentY = startTop + dy;
            
            const snapTarget = findSnapTarget(block, currentX, currentY, block.offsetWidth, block.offsetHeight);
            
            if (snapTarget) {
                block.style.left = snapTarget.x + 'px';
                block.style.top = snapTarget.y + 'px';
                block.dataset.snappedTo = snapTarget.block.id;
                block.dataset.snapPosition = snapTarget.position;
            } else {
                block.style.left = currentX + 'px';
                block.style.top = currentY + 'px';
                delete block.dataset.snappedTo;
                delete block.dataset.snapPosition;
            }
            
            block.style.opacity = '0.7';
        });
        
        block.addEventListener('dragend', (e) => {
            block.classList.remove('dragging');
            block.style.opacity = '1';
            isDragging = false;
            
            delete block.dataset.dragStartX;
            delete block.dataset.dragStartY;
            delete block.dataset.mouseStartX;
            delete block.dataset.mouseStartY;
        });
    }
});