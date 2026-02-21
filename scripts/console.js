function siteLog(msg, isError = false){
    const body = document.getElementById('console-body');
    if (!body) return;
    const line = document.createElement('div');
    line.className = 'console-line' + (isError ? ' console-error' : ''); 
    line.innerHTML = '<span class="console-prefix">&gt;</span>' + String(msg);
    body.appendChild(line);
    body.scrollTop = body.scrollHeight;
}

function updateCoordinatesPosition() {
    const consoleWrapper = document.getElementById('console-wrapper');
    const coordinates = document.getElementById('coordinates');
    
    if (consoleWrapper && coordinates) {
        if (consoleWrapper.classList.contains('open')) {
            coordinates.style.bottom = '305px';
        } 
        else {
            coordinates.style.bottom = '35px';
        }
    }
}

function openConsole() {
    const wrapper = document.getElementById('console-wrapper');
    if (wrapper && !wrapper.classList.contains('open')) {
        wrapper.classList.add('open');
        updateCoordinatesPosition();
    }
}

function toggleConsole() {
    const wrapper = document.getElementById('console-wrapper');
    if (!wrapper) return;
    wrapper.classList.toggle('open');
    updateCoordinatesPosition();
}

window.addEventListener('resize', () => {
    updateCoordinatesPosition();
});

document.addEventListener('DOMContentLoaded', () => {
    updateCoordinatesPosition();
});

function main(){
    const consoleBody = document.getElementById('console-body');
    if (consoleBody) consoleBody.innerHTML = '';
    openConsole();
    
}