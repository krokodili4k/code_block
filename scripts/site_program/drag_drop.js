let programmingSpace = null;
let bidCounter = 0;
let wsHighlight = null;

export function initDragDrop(spaceId = 'proramingSpace') {
    programmingSpace = document.getElementById(spaceId);
    if (!programmingSpace) {
        console.error(`initDragDrop: element #${spaceId} not found`);
        return;
    }

    _initTemplates();
    _initWorkspaceEvents();
}

export function getScale() {
    const t = programmingSpace.style.transform;
    if (t && t.includes('scale(')) {
        const i = t.indexOf('scale(') + 6;
        return parseFloat(t.substring(i, t.indexOf(')', i))) || 1;
    }
    return 1;
}

export function highlightZone(zone, active) {
    zone.style.borderColor = active ? '#e74c3c' : '#494949';
    zone.style.background  = active ? 'rgba(231,76,60,0.08)' : '';
}

export function refreshZoneSize(zone) {
    if (!zone) return;
    zone.style.minHeight = zone.querySelector(':scope > .block-code') ? '' : '40px';
}

export function findSpawnZoneAt(clientX, clientY, draggedBlock) {
    const elements = document.elementsFromPoint(clientX, clientY);
    for (const el of elements) {
        if (!el.classList.contains('spawn-zone')) continue;
        if (draggedBlock && draggedBlock.contains(el)) continue;
        return el;
    }
    return null;
}


export function addDeleteButton(block) {
    if (block.querySelector(':scope > .delete-btn')) return;

    const btn = document.createElement('button');
    btn.className = 'delete-btn';
    btn.textContent = 'X';

    btn.addEventListener('click', e => {
        e.stopPropagation();
        const zone = block.closest('.spawn-zone');
        block.remove();
        if (zone) 
            refreshZoneSize(zone);
    });

    block.appendChild(btn);
}

export function placeIntoZone(block, zone) {
    if (block.dataset.type === 'start') return;

    const prevZone = block.closest('.spawn-zone');

    block.style.position = 'relative';
    block.style.left = '';
    block.style.top = '';
    block.style.margin = '4px';
    block.dataset.inSpawnZone = '1';

    zone.appendChild(block);

    refreshZoneSize(zone);
    if (prevZone && prevZone !== zone)
        refreshZoneSize(prevZone);
}

export function placeOnWorkspace(block, clientX, clientY) {
    const prevZone = block.closest('.spawn-zone');

    delete block.dataset.inSpawnZone;
    block.style.position = 'absolute';
    block.style.margin   = '0';

    const scale = getScale();
    const rect  = programmingSpace.getBoundingClientRect();

    programmingSpace.appendChild(block);

    const bw = block.offsetWidth;
    const bh = block.offsetHeight;
    block.style.left = ((clientX - rect.left) / scale - bw / 2) + 'px';
    block.style.top  = ((clientY - rect.top)  / scale - bh / 2) + 'px';

    if (prevZone) 
        refreshZoneSize(prevZone);
}

export function makeBlockDraggable(block) {
    block.setAttribute('draggable', 'true');

    let active = false;
    let currentHighlight = null;
    let startClientX, startClientY, startLeft, startTop;
    let isOnWorkspace = false;

    block.querySelectorAll('input, textarea, select').forEach(el => {
        el.addEventListener('mousedown', e => e.stopPropagation());
    });

    block.addEventListener('dragstart', e => {
        if (['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON'].includes(e.target.tagName)) {
            e.preventDefault();
            return;
        }
        e.stopPropagation();

        const ghost = new Image();
        e.dataTransfer.setDragImage(ghost, 0, 0);
        e.dataTransfer.setData('text/plain', 'move:' + block.dataset.bid);

        isOnWorkspace = !block.dataset.inSpawnZone;
        currentHighlight = null;
        active = true;

        startClientX = e.clientX;
        startClientY = e.clientY;
        startLeft = parseFloat(block.style.left) || 0;
        startTop = parseFloat(block.style.top) || 0;

        block.style.opacity = '0.5';
    });

    block.addEventListener('drag', e => {
        if (!active || (e.clientX === 0 && e.clientY === 0)) return;

        const zone = findSpawnZoneAt(e.clientX, e.clientY, block);
        if (zone !== currentHighlight) {

            if (currentHighlight)
                highlightZone(currentHighlight, false);
            if (zone)
                highlightZone(zone, true);

            currentHighlight = zone;
        }

        if (!isOnWorkspace) return;

        const scale = getScale();
        const cx = startLeft + (e.clientX - startClientX) / scale;
        const cy = startTop  + (e.clientY - startClientY) / scale;

        block.style.left = cx + 'px';
        block.style.top  = cy + 'px';
        block.style.opacity = '0.7';
    });

    block.addEventListener('dragend', e => {
        active = false;
        block.style.opacity = '1';
        if (currentHighlight) {
            highlightZone(currentHighlight, false);
            currentHighlight = null;
        }

        const targetZone = findSpawnZoneAt(e.clientX, e.clientY, block);

        if (targetZone)             
            placeIntoZone(block, targetZone);
         
        else if (!isOnWorkspace) 
            placeOnWorkspace(block, e.clientX, e.clientY);
        
    });
}

function _initTemplates() {
    document.querySelectorAll('.block-container .block-code[draggable="true"]').forEach(template => {
        template.addEventListener('dragstart', e => {
            e.dataTransfer.setData('text/plain', JSON.stringify({
                html: template.outerHTML,
                type: template.dataset.type,
                sourceId: template.id,
            }));
            template.style.opacity = '0.5';
        });
        template.addEventListener('dragend', () => { template.style.opacity = '1'; });
    });
}

function _initWorkspaceEvents() {
    programmingSpace.addEventListener('dragover', e => {
        e.preventDefault();
        const zone = findSpawnZoneAt(e.clientX, e.clientY, null);
        if (zone !== wsHighlight) {

            if (wsHighlight) 
                highlightZone(wsHighlight, false);
            if (zone) 
                highlightZone(zone, true);

            wsHighlight = zone;
        }
    });

    programmingSpace.addEventListener('dragleave', e => {
        if (!programmingSpace.contains(e.relatedTarget)) {
            if (wsHighlight) { 
                highlightZone(wsHighlight, false);
                wsHighlight = null;
            }
        }
    });

    programmingSpace.addEventListener('drop', e => {
        e.preventDefault();
        if (wsHighlight) { 
            highlightZone(wsHighlight, false); 
            wsHighlight = null; 
        }

        const raw = e.dataTransfer.getData('text/plain');

        if (!raw || raw.startsWith('move:')) return;

        let payload;
        try   { 
            payload = JSON.parse(raw);
        }
        catch { 
            return; 
        }

        const tmp = document.createElement('div');
        tmp.innerHTML = payload.html;
        const newBlock = tmp.firstElementChild;

        if (!newBlock) return;

        newBlock.classList.add('in-workspace');
        newBlock.querySelectorAll('[id]').forEach(el => el.removeAttribute('id'));
        newBlock.dataset.bid = payload.sourceId || 'b' + (++bidCounter);

        addDeleteButton(newBlock);
        makeBlockDraggable(newBlock);

        const targetZone = findSpawnZoneAt(e.clientX, e.clientY, null);

        if (targetZone) 
            placeIntoZone(newBlock, targetZone);
        
        else 
            placeOnWorkspace(newBlock, e.clientX, e.clientY);
        
    });
}