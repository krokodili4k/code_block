document.addEventListener('DOMContentLoaded', () => {
    const blocks = document.querySelectorAll('.block-code[draggable="true"]');
    const programmingSpace = document.getElementById('proramingSpace');
    const SNAP_THRESHOLD = 43;
    const SPAWN_SNAP_THRESHOLD = 30;

    function getScale() {
        const transform = programmingSpace.style.transform;
        if (transform && transform.includes('scale(')) {
            const i = transform.indexOf('scale(') + 6;
            return parseFloat(transform.substring(i, transform.indexOf(')', i))) || 1;
        }
        return 1;
    }

    let snapHintEl = null;

    function showSnapHint(x, y, width, container) {
        const parent = container || programmingSpace;
        if (!snapHintEl || snapHintEl.parentElement !== parent) {
            if (snapHintEl) snapHintEl.remove();
            snapHintEl = document.createElement('div');
            snapHintEl.id = 'snap-hint';
            Object.assign(snapHintEl.style, {
                position: 'absolute',
                height: '4px',
                borderRadius: '2px',
                background: '#e74c3c',
                pointerEvents: 'none',
                zIndex: '9999',
                transition: 'opacity 0.1s',
            });
            parent.appendChild(snapHintEl);
        }

        Object.assign(snapHintEl.style, {
            left: x + 'px',
            top: (y - 2) + 'px',
            width: width + 'px',
            opacity: '1',
            display: 'block',
        });
    }

    function hideSnapHint() {
        if (snapHintEl) {
            snapHintEl.style.opacity = '0';
            snapHintEl.style.display = 'none';
        }
    }

    function getPlaced(container) {
        const c = container || programmingSpace;
        return Array.from(c.children).filter(
            ch => ch.classList.contains('block-code') && ch !== snapHintEl
        );
    }

    function findSnapTarget(currentBlock, currentX, currentY, blockWidth, blockHeight, container) {
        const scale = getScale();
        const spaceR = (container || programmingSpace).getBoundingClientRect();
        let snapTarget = null;
        let minDist = Infinity;

        getPlaced(container).forEach(block => {
            if (block === currentBlock) return;

            const br = block.getBoundingClientRect();
            const blockLeft = (br.left - spaceR.left) / scale;
            const blockTop = (br.top - spaceR.top) / scale;
            const blockW = block.offsetWidth;
            const blockH = block.offsetHeight;
            const blockRight = blockLeft + blockW;
            const blockBottom = blockTop + blockH;
            const type = block.dataset.type;

            const withinX = currentX < blockRight - 10 && (currentX + blockWidth) > blockLeft + 10;
            if (!withinX) 
                return;

            if (!block.dataset.snapBottomTaken) {
                const dist = Math.abs(currentY - blockBottom);
                if (dist < SNAP_THRESHOLD && dist < minDist) {
                    if (type !== 'start' || currentY > blockBottom - 10) {
                        minDist = dist;
                        snapTarget = {
                            block,
                            x: blockLeft,
                            y: blockBottom,
                            hintY: blockBottom,
                            position: 'bottom',
                            container: container || programmingSpace,
                        };
                    }
                }
            }

            if (type !== 'start' && !block.dataset.snapTopTaken) {
                const dist = Math.abs((currentY + blockHeight) - blockTop);
                if (dist < SNAP_THRESHOLD && dist < minDist) {
                    minDist = dist;
                    snapTarget = {
                        block,
                        x: blockLeft,
                        y: blockTop - blockHeight,
                        hintY: blockTop,
                        position: 'top',
                        container: container || programmingSpace,
                    };
                }
            }
        });

        return snapTarget;
    }

    function findSpawnZoneSnap(currentBlock, clientX, clientY) {
        let best = null;
        let minDist = Infinity;

        function checkZonesIn(container) {
            const containerBlocks = Array.from(container.querySelectorAll('.block-code'));
            containerBlocks.forEach(block => {
                if (block === currentBlock)
                     return;

                const spawnZones = block.querySelectorAll(':scope > .spawn-zone');

                spawnZones.forEach(zone => {
                    const zr = zone.getBoundingClientRect();
                    const tolerance = SPAWN_SNAP_THRESHOLD;
                    const inX = clientX >= zr.left - tolerance && clientX <= zr.right + tolerance;
                    const inY = clientY >= zr.top - tolerance && clientY <= zr.bottom + tolerance;
                    if (!inX || !inY) return;

                    const cx = zr.left + zr.width / 2;
                    const cy = zr.top + zr.height / 2;
                    const dist = Math.hypot(clientX - cx, clientY - cy);

                    if (dist < minDist) {
                        minDist = dist;
                        best = { zone, block, dist };
                    }
                });
            });
        }

        checkZonesIn(programmingSpace);
        return best;
    }

    function claimSlot(movingBlock, targetBlock, position) {
        const mid = movingBlock.dataset.bid || movingBlock.id || '';
        if (position === 'bottom') {
            targetBlock.dataset.snapBottomTaken = mid;
            movingBlock.dataset.snapTopTaken = targetBlock.dataset.bid || targetBlock.id || '1';
        } 
        else {
            targetBlock.dataset.snapTopTaken = mid;
            movingBlock.dataset.snapBottomTaken = targetBlock.dataset.bid || targetBlock.id || '1';
        }
    }

    function releaseSlots(block) {
        getPlaced().forEach(other => {
            if (other === block)
                 return;
            if (other.dataset.snapBottomTaken === (block.dataset.bid || block.id))
                delete other.dataset.snapBottomTaken;
            if (other.dataset.snapTopTaken === (block.dataset.bid || block.id))
                delete other.dataset.snapTopTaken;
        });
        programmingSpace.querySelectorAll('.spawn-zone .block-code').forEach(other => {
            if (other === block) 
                return;
            if (other.dataset.snapBottomTaken === (block.dataset.bid || block.id))
                delete other.dataset.snapBottomTaken;
            if (other.dataset.snapTopTaken === (block.dataset.bid || block.id))
                delete other.dataset.snapTopTaken;
        });
        delete block.dataset.snapBottomTaken;
        delete block.dataset.snapTopTaken;
        delete block.dataset.inSpawnZone;
    }

    function placeInSpawnZone(newBlock, zone) {
        if (newBlock.dataset.type === 'start')
            return;
        
        newBlock.style.position = 'relative';
        
        newBlock.style.left = '';
        newBlock.style.top = '';
        newBlock.style.margin = '4px';
        newBlock.dataset.inSpawnZone = '1';


        zone.appendChild(newBlock);
        
        updateSpawnZoneStyle(zone);
    }

    function updateSpawnZoneStyle(zone) {
        const hasBlocks = zone.querySelector('.block-code');
        zone.style.minHeight = hasBlocks ? '' : '40px';
        zone.style.borderColor = '#494949';
    }

    function highlightSpawnZone(zone, active) {
        if (active) {
            zone.style.borderColor = '#e74c3c';
            zone.style.background = 'rgba(231,76,60,0.08)';
        } 
        else {
            zone.style.borderColor = '#494949';
            zone.style.background = '';
        }
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
        block.addEventListener('dragend', () => { block.style.opacity = '1'; });
    });

    programmingSpace.addEventListener('dragover', (e) => {
        e.preventDefault();

        const data = e.dataTransfer.getData('text/plain');
        const spawnResult = findSpawnZoneSnap(null, e.clientX, e.clientY);

        programmingSpace.querySelectorAll('.spawn-zone').forEach(z => highlightSpawnZone(z, false));

        if (spawnResult) {
            highlightSpawnZone(spawnResult.zone, true);
        }
    });

    programmingSpace.addEventListener('dragleave', (e) => {
        if (!programmingSpace.contains(e.relatedTarget)) {
            programmingSpace.querySelectorAll('.spawn-zone').forEach(z => highlightSpawnZone(z, false));
        }
    });

    programmingSpace.addEventListener('drop', (e) => {
        e.preventDefault();
        hideSnapHint();
        programmingSpace.querySelectorAll('.spawn-zone').forEach(z => highlightSpawnZone(z, false));

        const data = e.dataTransfer.getData('text/plain');

        if (data.startsWith('move:')) 
            return;

        try {
            const blockData = JSON.parse(data);
            const temp = document.createElement('div');
            temp.innerHTML = blockData.html;
            const newBlock = temp.firstChild;

            newBlock.classList.add('in-workspace');
            newBlock.querySelectorAll('[id]').forEach(el => el.removeAttribute('id'));
            newBlock.dataset.bid = 'b' + Date.now();

            const spawnResult = findSpawnZoneSnap(null, e.clientX, e.clientY);

            if (spawnResult) {
                if (newBlock.dataset.type !== 'start'){
                    addDeleteButton(newBlock);
                    placeInSpawnZone(newBlock, spawnResult.zone);
                    makeBlockDraggable(newBlock);
            
                    const zoneBlocks = getPlaced(spawnResult.zone);
                    if (zoneBlocks.length > 1) {
                        const last = zoneBlocks[zoneBlocks.length - 2];
                        claimSlot(newBlock, last, 'bottom');
                    }
                }
            }
            else {
                newBlock.style.position = 'absolute';
                newBlock.style.margin = '0';

                const scale = getScale();
                const rect = programmingSpace.getBoundingClientRect();
                const mouseX = (e.clientX - rect.left) / scale;
                const mouseY = (e.clientY - rect.top) / scale;

                programmingSpace.appendChild(newBlock);

                const bw = newBlock.offsetWidth;
                const bh = newBlock.offsetHeight;

                const cx = mouseX - bw / 2;
                const cy = mouseY - bh / 2;

                const snap = findSnapTarget(newBlock, cx, cy, bw, bh);

                newBlock.style.left = (snap ? snap.x : cx) + 'px';
                newBlock.style.top = (snap ? snap.y : cy) + 'px';

                if (snap) claimSlot(newBlock, snap.block, snap.position);

                addDeleteButton(newBlock);
                makeBlockDraggable(newBlock);
            }

        } 
        catch (err) {
            console.error('Ошибка при создании блока:', err);
        }
    });

    function addDeleteButton(block) {
        if (block.querySelector('.delete-btn'))
            return;

        const btn = document.createElement('button');
        btn.className = 'delete-btn';
        btn.innerHTML = 'X';

        btn.onclick = (e) => {
            e.stopPropagation();
            releaseSlots(block);

            const zone = block.closest('.spawn-zone');
            
            block.remove();
            if (zone) 
                updateSpawnZoneStyle(zone);
        };

        block.appendChild(btn);
    }

    function makeBlockDraggable(block) {
        block.setAttribute('draggable', 'true');

        let isDragging = false;
        let startX, startY, startLeft, startTop;
        let lastSnap = null;
        let isInSpawnZone = false;
        let originalZone = null;
        let originalNextSibling = null;

        block.addEventListener('dragstart', (e) => {
            e.stopPropagation();

            const img = new Image();
            e.dataTransfer.setDragImage(img, 0, 0);
            e.dataTransfer.setData('text/plain', 'move:' + block.dataset.bid);

            isInSpawnZone = !!block.dataset.inSpawnZone;
            originalZone = block.closest('.spawn-zone');
            originalNextSibling = block.nextSibling;

            releaseSlots(block);
            lastSnap = null;

            if (!isInSpawnZone) {
                startX = e.clientX;
                startY = e.clientY;
                startLeft = parseFloat(block.style.left) || 0;
                startTop = parseFloat(block.style.top) || 0;
            }

            block.classList.add('dragging');
            block.style.opacity = '0.5';
            isDragging = true;
        });

        block.addEventListener('drag', (e) => {
            if (!isDragging || (e.clientX === 0 && e.clientY === 0)) return;

            const spawnResult = findSpawnZoneSnap(block, e.clientX, e.clientY);
            programmingSpace.querySelectorAll('.spawn-zone').forEach(z => highlightSpawnZone(z, false));
            if (spawnResult) {
                highlightSpawnZone(spawnResult.zone, true);
            }

            if (isInSpawnZone) {
                return;
            }

            const scale = getScale();
            const dx = (e.clientX - startX) / scale;
            const dy = (e.clientY - startY) / scale;
            const cx = startLeft + dx;
            const cy = startTop + dy;
            const bw = block.offsetWidth;
            const bh = block.offsetHeight;

            const snap = findSnapTarget(block, cx, cy, bw, bh);

            if (snap) {
                block.style.left = snap.x + 'px';
                block.style.top = snap.y + 'px';
                showSnapHint(snap.x, snap.hintY, bw);
                lastSnap = snap;
            } 
            else {
                block.style.left = cx + 'px';
                block.style.top = cy + 'px';
                hideSnapHint();
                lastSnap = null;
            }

            block.style.opacity = '0.7';
        });

        block.addEventListener('dragend', (e) => {
            block.classList.remove('dragging');
            block.style.opacity = '1';
            hideSnapHint();
            isDragging = false;
            programmingSpace.querySelectorAll('.spawn-zone').forEach(z => highlightSpawnZone(z, false));

            const spawnResult = findSpawnZoneSnap(block, e.clientX, e.clientY);

            if (spawnResult && spawnResult.zone !== originalZone) {
               
                if (originalZone) updateSpawnZoneStyle(originalZone);

                block.style.position = 'relative';
                block.style.left = '';
                block.style.top = '';

                placeInSpawnZone(block, spawnResult.zone);

                const zoneBlocks = getPlaced(spawnResult.zone).filter(b => b !== block);
                if (zoneBlocks.length > 0) {
                    const last = zoneBlocks[zoneBlocks.length - 1];
                    claimSlot(block, last, 'bottom');
                }
                lastSnap = null;
                return;
            }

            if (isInSpawnZone && !spawnResult) {
    
                if (originalZone) {
                    block.style.position = 'absolute';
                    delete block.dataset.inSpawnZone;

                    const scale = getScale();
                    const rect = programmingSpace.getBoundingClientRect();
                    const mouseX = (e.clientX - rect.left) / scale;
                    const mouseY = (e.clientY - rect.top) / scale;

                    programmingSpace.appendChild(block);

                    const bw = block.offsetWidth;
                    const bh = block.offsetHeight;
                    block.style.left = (mouseX - bw / 2) + 'px';
                    block.style.top = (mouseY - bh / 2) + 'px';

                    updateSpawnZoneStyle(originalZone);

                    const cx = parseFloat(block.style.left);
                    const cy = parseFloat(block.style.top);
                    const snap = findSnapTarget(block, cx, cy, bw, bh);
                    if (snap) {
                        block.style.left = snap.x + 'px';
                        block.style.top = snap.y + 'px';
                        claimSlot(block, snap.block, snap.position);
                    }
                }
                lastSnap = null;
                return;
            }

            if (!isInSpawnZone) {
                if (lastSnap) {
                    claimSlot(block, lastSnap.block, lastSnap.position);
                } else {
                    const scale = getScale();
                    const cx = parseFloat(block.style.left) || 0;
                    const cy = parseFloat(block.style.top) || 0;
                    const snap = findSnapTarget(block, cx, cy, block.offsetWidth, block.offsetHeight);
                    if (snap) {
                        block.style.left = snap.x + 'px';
                        block.style.top = snap.y + 'px';
                        claimSlot(block, snap.block, snap.position);
                    }
                }
            }

            lastSnap = null;
        });
    }
});