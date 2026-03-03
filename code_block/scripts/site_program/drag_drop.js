document.addEventListener('DOMContentLoaded', () => {
    const blocks = document.querySelectorAll('.block-code[draggable="true"]');
    const programmingSpace = document.getElementById('proramingSpace');

    
    
    function getScale() {
        const transform = programmingSpace.style.transform;
        if (transform && transform.includes('scale')) {
            const match = transform.match(/scale\(([^)]+)\)/);
            return match ? parseFloat(match[1]) : 1;
        }
        return 1;
    }
    
    
    blocks.forEach(block => {
        block.addEventListener('dragstart', (e) => {
            const blockData = {
                html: block.outerHTML,
                type: block.dataset.type
            };
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
        
        const blockData = JSON.parse(e.dataTransfer.getData('text/plain'));
        
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
        
        
        
        
        newBlock.style.left = (mouseX - blockWidth/2) + 'px';
        newBlock.style.top = (mouseY - blockHeight/2) + 'px';
        
        
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.innerHTML = 'X';
        
        deleteBtn.onclick = (e) => {
            e.stopPropagation();
            newBlock.remove();
        };
        
        newBlock.appendChild(deleteBtn);
        
        
        makeBlockDraggable(newBlock);
        
        programmingSpace.appendChild(newBlock);
    });
    
    function makeBlockDraggable(block) {
        block.addEventListener('dragstart', (e) => {
            
            const img = new Image();
            e.dataTransfer.setDragImage(img, 0, 0);
            
            
            const startX = parseFloat(block.style.left) || 0;
            const startY = parseFloat(block.style.top) || 0;
            const mouseX = e.clientX;
            const mouseY = e.clientY;
            
            block.dataset.dragStartX = startX;
            block.dataset.dragStartY = startY;
            block.dataset.mouseStartX = mouseX;
            block.dataset.mouseStartY = mouseY;
            
            e.dataTransfer.setData('text/plain', 'move:' + block.id);
            
            block.classList.add('dragging');
        });
        
        block.addEventListener('drag', (e) => {
            if (e.clientX === 0) return;
            
            const scale = getScale();
            
            const startX = parseFloat(block.dataset.dragStartX);
            const startY = parseFloat(block.dataset.dragStartY);
            const mouseStartX = parseFloat(block.dataset.mouseStartX);
            const mouseStartY = parseFloat(block.dataset.mouseStartY);
            
            
            const dx = (e.clientX - mouseStartX) / scale;
            const dy = (e.clientY - mouseStartY) / scale;
            
            
            block.style.left = (startX + dx) + 'px';
            block.style.top = (startY + dy) + 'px';
            
            block.style.opacity = '0.7';
        });
        
        block.addEventListener('dragend', (e) => {
            block.classList.remove('dragging');
            block.style.opacity = '1';
            
            delete block.dataset.dragStartX;
            delete block.dataset.dragStartY;
            delete block.dataset.mouseStartX;
            delete block.dataset.mouseStartY;
        });
    }
});