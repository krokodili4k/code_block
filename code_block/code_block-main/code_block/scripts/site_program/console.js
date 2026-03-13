const originalConsole = {
    log: console.log,
    error: console.error,
    warn: console.warn,
    info: console.info,
    debug: console.debug
};

console.log = function(...args) {
    originalConsole.log.apply(console, args);

    siteLog(args.map(formatArg).join(' '), false);
};

function formatArg(arg) {
    if (arg === null) 
        return 'null';

    else if (arg === undefined)
         return 'undefined';
    
    try {
        if (typeof arg === 'object') 
            return JSON.stringify(arg, null, 2);
        
        return String(arg);
    } 
    catch (e) {
        return String(arg);
    }
}


window.addEventListener('error', function(event) {
    siteLog('Ошибка: ' + event.message + ' в ' + event.filename + ':' + event.lineno, true);
});

function siteLog(msg, isError = false){
    const body = document.getElementById('console-body');

    const line = document.createElement('div');
    line.className = 'console-line' + (isError ? ' console-error' : ''); 
    
    const time = new Date().toLocaleTimeString();
    
    line.innerHTML = '<span class="console-time">[' + time + ']</span> ' + 
                     '<span class="console-prefix">&gt;</span>' + 
                     '<span class="console-message">' + escapeHtml(msg) + '</span>';
    
    body.appendChild(line);
    body.scrollTop = body.scrollHeight;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}


function main(){
    const consoleBody = document.getElementById('console-body');
    if (consoleBody) {
        
        if (confirm('Очистить консоль?')) {
            consoleBody.innerHTML = '';
            siteLog('Консоль очищена');
        }
    }
    openConsole();
 
}


function clearConsole() {
    const consoleBody = document.getElementById('console-body');
    if (consoleBody) {
        consoleBody.innerHTML = '';
        siteLog('Консоль очищена');
    }
}

window.clearConsole = clearConsole;

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
    console.log('Сайт загружен', new Date().toLocaleString());
});
