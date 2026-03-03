const rightPanel = document.getElementById('rightPanel');
const workspaceCanvas = document.getElementById('proramingSpace');
const coordinatesDisplay = document.getElementById('coordinates');

let isPanning = false;
let startX, startY;
let translateX = 0, translateY = 0;
let scale = 1;

rightPanel.addEventListener('mousedown', (e) => {
    if (e.target.closest('.block-code')) return;
    
    isPanning = true;
    rightPanel.classList.add('panning');
    
    startX = e.clientX - translateX;
    startY = e.clientY - translateY;
    
    e.preventDefault();
});


document.addEventListener('mousemove', (e) => {
    if (!isPanning) return;
    
    translateX = e.clientX - startX;
    translateY = e.clientY - startY;

    
    updateTransform();
});

document.addEventListener('mouseup', () => {
    isPanning = false;
    rightPanel.classList.remove('panning');
});

rightPanel.addEventListener('wheel', (e) => {
    e.preventDefault();
    
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newScale = scale * delta;
    
    if (newScale < 0.1 || newScale > 2) return;
    
    const rect = rightPanel.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    const worldX = (mouseX - translateX) / scale;
    const worldY = (mouseY - translateY) / scale;
    
    scale = newScale;
    
    translateX = mouseX - worldX * scale;
    translateY = mouseY - worldY * scale;
    
    updateTransform();
});

function updateTransform() {
    workspaceCanvas.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
    updateCoordinates();
}

function updateCoordinates() {
    if (coordinatesDisplay) {
        coordinatesDisplay.textContent = `X: ${Math.round(translateX) * -1} | Y: ${Math.round(translateY) * -1} | Zoom: ${Math.round(scale * 100)}%`;
    }
}

updateTransform();