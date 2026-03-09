document.addEventListener('DOMContentLoaded', () => {

    const programmingSpace = document.getElementById('proramingSpace');
    let bidCounter = 0;

    function getScale() {
        const t = programmingSpace.style.transform;
        if (t && t.includes('scale(')) {
            const i = t.indexOf('scale(') + 6;
            return parseFloat(t.substring(i, t.indexOf(')', i))) || 1;
        }
        return 1;
    }

    let snapHintEl = null;

    function showSnapHint(x, y, width) {
        if (!snapHintEl) {
            snapHintEl = document.createElement('div');
            Object.assign(snapHintEl.style, {
                position: 'absolute',
                height: '3px',
                borderRadius: '2px',
                background: '#e74c3c',
                pointerEvents: 'none',
                zIndex: '9999',
            });
            programmingSpace.appendChild(snapHintEl);
        }
        Object.assign(snapHintEl.style, {
            left: x + 'px',
            top: (y - 1) + 'px',
            width: width + 'px',
            display: 'block',
        });
    }

    function hideSnapHint() {
        if (snapHintEl) snapHintEl.style.display = 'none';
    }

    function findSpawnZoneAt(clientX, clientY, draggedBlock) {
        const elements = document.elementsFromPoint(clientX, clientY);
        for (const el of elements) {
            if (!el.classList.contains('spawn-zone')) continue;
            if (draggedBlock && draggedBlock.contains(el)) continue;
            return el;
        }
        return null;
    }

    function highlightZone(zone, active) {
        zone.style.borderColor = active ? '#e74c3c' : '#494949';
        zone.style.background  = active ? 'rgba(231,76,60,0.08)' : '';
    }

    function refreshZoneSize(zone) {
        if (!zone) return;
        zone.style.minHeight = zone.querySelector(':scope > .block-code') ? '' : '40px';
    }

    const SNAP_THRESHOLD = 40;

    function getWorkspaceBlocks(exclude) {
        return Array.from(programmingSpace.children).filter(el =>
            el.classList.contains('block-code') &&
            el !== exclude &&
            el !== snapHintEl
        );
    }

    function findWorkspaceSnap(block, cx, cy, bw, bh) {
        const scale  = getScale();
        const spaceR = programmingSpace.getBoundingClientRect();
        let best = null, minDist = Infinity;

        getWorkspaceBlocks(block).forEach(other => {
            const br = other.getBoundingClientRect();
            const ox = (br.left - spaceR.left) / scale;
            const oy = (br.top  - spaceR.top)  / scale;
            const ow = other.offsetWidth;
            const oh = other.offsetHeight;

            if (cx + bw < ox + 10 || cx > ox + ow - 10) return;

            const dBot = Math.abs(cy - (oy + oh));
            if (dBot < SNAP_THRESHOLD && dBot < minDist) {
                minDist = dBot;
                best = { x: ox, y: oy + oh, hintY: oy + oh };
            }
            const dTop = Math.abs((cy + bh) - oy);
            if (dTop < SNAP_THRESHOLD && dTop < minDist) {
                minDist = dTop;
                best = { x: ox, y: oy - bh, hintY: oy };
            }
        });

        return best;
    }

    function addDeleteButton(block) {
        if (block.querySelector(':scope > .delete-btn')) return;

        const btn = document.createElement('button');
        btn.className = 'delete-btn';
        btn.textContent = '✕';

        btn.addEventListener('click', e => {
            e.stopPropagation();
            const zone = block.closest('.spawn-zone');
            block.remove();
            if (zone) refreshZoneSize(zone);
        });

        block.appendChild(btn);
    }

    function placeIntoZone(block, zone) {
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

    function placeOnWorkspace(block, clientX, clientY) {
        const prevZone = block.closest('.spawn-zone');

        delete block.dataset.inSpawnZone;
        block.style.position = 'absolute';
        block.style.margin   = '0';

        const scale = getScale();
        const rect = programmingSpace.getBoundingClientRect();
        let lx = (clientX - rect.left) / scale;
        let ly = (clientY - rect.top)  / scale;

        programmingSpace.appendChild(block); 

        const bw = block.offsetWidth;
        const bh = block.offsetHeight;
        lx -= bw / 2;
        ly -= bh / 2;

        const snap = findWorkspaceSnap(block, lx, ly, bw, bh);
        if (snap) { lx = snap.x; ly = snap.y; }

        block.style.left = lx + 'px';
        block.style.top  = ly + 'px';

        if (prevZone)
            refreshZoneSize(prevZone);
    }

    function makeBlockDraggable(block) {
        block.setAttribute('draggable', 'true');

        let startClientX, startClientY, startLeft, startTop;
        let fromZone = false;
        let originalZone = null;
        let active = false;
        let currentHighlight = null;

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

            fromZone      = !!block.dataset.inSpawnZone;
            originalZone  = block.closest('.spawn-zone');
            currentHighlight = null;
            active        = true;

            startClientX = e.clientX;
            startClientY = e.clientY;
            startLeft = parseFloat(block.style.left) || 0;
            startTop = parseFloat(block.style.top)  || 0;

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

            if (fromZone) return;

            const scale = getScale();
            const cx = startLeft + (e.clientX - startClientX) / scale;
            const cy = startTop  + (e.clientY - startClientY) / scale;
            const bw = block.offsetWidth;
            const bh = block.offsetHeight;

            const snap = findWorkspaceSnap(block, cx, cy, bw, bh);
            if (snap) {
                block.style.left = snap.x + 'px';
                block.style.top  = snap.y + 'px';
                showSnapHint(snap.x, snap.hintY, bw);
            } 
            else {
                block.style.left = cx + 'px';
                block.style.top = cy + 'px';
                hideSnapHint();
            }
            block.style.opacity = '0.7';
        });

        block.addEventListener('dragend', e => {
            active = false;
            block.style.opacity = '1';
            hideSnapHint();
            if (currentHighlight) {
                highlightZone(currentHighlight, false); 
                currentHighlight = null; 
            }

            const targetZone = findSpawnZoneAt(e.clientX, e.clientY, block);

            if (targetZone) 
                placeIntoZone(block, targetZone);
   
             else if (fromZone)                
                placeOnWorkspace(block, e.clientX, e.clientY);
          
        });
    }

    document.querySelectorAll('.block-container .block-code[draggable="true"]').forEach(template => {
        template.addEventListener('dragstart', e => {
            e.dataTransfer.setData('text/plain', JSON.stringify({
                html: template.outerHTML,
                type: template.dataset.type,
            }));
            template.style.opacity = '0.5';
        });
        template.addEventListener('dragend', () => { template.style.opacity = '1'; });
    });

    let wsHighlight = null;

    programmingSpace.addEventListener('dragover', e => {
        e.preventDefault();
        const zone = findSpawnZoneAt(e.clientX, e.clientY, null);
        if (zone !== wsHighlight) {
            if (wsHighlight) highlightZone(wsHighlight, false);
            if (zone) highlightZone(zone, true);
            wsHighlight = zone;
        }
    });

    programmingSpace.addEventListener('dragleave', e => {
        if (!programmingSpace.contains(e.relatedTarget)) {
            if (wsHighlight) { highlightZone(wsHighlight, false); wsHighlight = null; }
        }
    });

    programmingSpace.addEventListener('drop', e => {
        e.preventDefault();
        hideSnapHint();
        if (wsHighlight)  
            highlightZone(wsHighlight, false); wsHighlight = null; 

        const raw = e.dataTransfer.getData('text/plain');
        if (!raw || raw.startsWith('move:')) return; 

        let payload;
        try { 
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
        newBlock.dataset.bid = 'b' + (++bidCounter);

        addDeleteButton(newBlock);
        makeBlockDraggable(newBlock);

        const targetZone = findSpawnZoneAt(e.clientX, e.clientY, null);

        if (targetZone) {
            placeIntoZone(newBlock, targetZone);

        } 
        else {
            
            newBlock.style.position = 'absolute';
            newBlock.style.margin   = '0';

            const scale  = getScale();
            const rect   = programmingSpace.getBoundingClientRect();
            let lx = (e.clientX - rect.left) / scale - newBlock.offsetWidth  / 2;
            let ly = (e.clientY - rect.top)  / scale;

            programmingSpace.appendChild(newBlock);

            const bw = newBlock.offsetWidth;
            const bh = newBlock.offsetHeight;
            lx = (e.clientX - rect.left) / scale - bw / 2;
            ly = (e.clientY - rect.top)  / scale - bh / 2;

            const snap = findWorkspaceSnap(newBlock, lx, ly, bw, bh);
            if (snap) { lx = snap.x; ly = snap.y; }

            newBlock.style.left = lx + 'px';
            newBlock.style.top  = ly + 'px';
        }
    });

});