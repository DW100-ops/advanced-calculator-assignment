// State Management
let currentInput = '0';
let previousInput = '';
let activeOperator = null;
let errorState = false;
let memoryRegister = 0;
let historyLog = [];

const display = document.getElementById('display');
const expressionView = document.getElementById('expression');

function updateDisplay() {
    display.value = currentInput;
    if (activeOperator && previousInput) {
        expressionView.innerText = `${previousInput} ${activeOperator}`;
    } else {
        expressionView.innerText = '';
    }
}

function appendNumber(num) {
    // Error Handling requirement: Automatically clear errors on next key press
    if (errorState) clearAll();
    
    if (num === '.' && currentInput.includes('.')) return;
    if (currentInput === '0' && num !== '.') {
        currentInput = num;
    } else {
        currentInput += num;
    }
    updateDisplay();
}

function handleOperator(op) {
    if (errorState) return;
    if (activeOperator && currentInput !== '0') {
        calculate();
    }
    previousInput = currentInput;
    activeOperator = op;
    currentInput = '0';
    updateDisplay();
}

// 1. Scientific Operations Implementation
function handleScientific(type) {
    if (errorState) return;
    let value = parseFloat(currentInput);

    switch(type) {
        case 'percent':
            value = value / 100;
            break;
        case 'toggle-sign':
            value = value * -1;
            break;
        case 'sqrt':
            if (value < 0) {
                triggerError("Invalid Input");
                return;
            }
            value = Math.sqrt(value);
            break;
        case 'pow':
            value = Math.pow(value, 2);
            break;
    }
    currentInput = value.toString();
    updateDisplay();
}

// 2. Core Execution and Division by Zero Trap
function calculate() {
    if (!activeOperator || errorState) return;
    let result = 0;
    const prev = parseFloat(previousInput);
    const current = parseFloat(currentInput);

    if (activeOperator === '/' && current === 0) {
        triggerError("Cannot divide by 0");
        return;
    }

    switch(activeOperator) {
        case '+': result = prev + current; break;
        case '-': result = prev - current; break;
        case '*': result = prev * current; break;
        case '/': result = prev / current; break;
    }

    const formattedEquation = `${previousInput} ${activeOperator} ${currentInput} = ${result}`;
    addHistoryEntry(formattedEquation, result);

    currentInput = result.toString();
    activeOperator = null;
    previousInput = '';
    updateDisplay();
}

function triggerError(message) {
    currentInput = message;
    errorState = true;
    updateDisplay();
}

function clearAll() {
    currentInput = '0';
    previousInput = '';
    activeOperator = null;
    errorState = false;
    updateDisplay();
}

// 3. Interactive Calculation History Log Panel
function addHistoryEntry(equation, result) {
    historyLog.push({ equation, result });
    const historyList = document.getElementById('history-list');
    
    // Clear initial empty indicator
    if (historyLog.length === 1) historyList.innerHTML = '';

    const entryDiv = document.createElement('div');
    entryDiv.className = 'history-item';
    entryDiv.innerText = equation;
    
    // Feature requirement: Reuse previous results on log click
    entryDiv.onclick = () => {
        if (errorState) clearAll();
        currentInput = result.toString();
        updateDisplay();
    };

    historyList.prepend(entryDiv);
}

function clearHistory() {
    historyLog = [];
    document.getElementById('history-list').innerHTML = '<p class="empty-msg">No recent calculations</p>';
}

// 03 Bonus Challenge: Memory Registers
function handleMemory(action) {
    if (errorState) return;
    const value = parseFloat(currentInput);

    switch(action) {
        case 'MC': memoryRegister = 0; break;
        case 'MR': currentInput = memoryRegister.toString(); updateDisplay(); break;
        case 'M+': memoryRegister += value; break;
        case 'M-': memoryRegister -= value; break;
    }
}

// UI Toggles & Keyboard Listeners
document.getElementById('theme-toggle').onclick = () => {
    document.body.classList.toggle('light-mode');
    document.getElementById('theme-toggle').innerText = document.body.classList.contains('light-mode') ? '🌙 Dark Mode' : '☀️ Light Mode';
};

document.getElementById('toggle-history-btn').onclick = () => {
    document.getElementById('history-panel').classList.toggle('hidden');
};

window.addEventListener('keydown', (e) => {
    if (e.key >= '0' && e.key <= '9' || e.key === '.') appendNumber(e.key);
    if (e.key === '+' || e.key === '-' || e.key === '*' || e.key === '/') handleOperator(e.key);
    if (e.key === 'Enter' || e.key === '=') calculate();
    if (e.key === 'Escape') clearAll();
});
