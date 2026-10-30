/**
 * TASK 2: Advanced Calculator Logic with History
 */

// --- History Manager Class ---
class HistoryManager {
    constructor(listElement) {
        this.listElement = listElement;
        this.history = [];
    }

    add(expression, result) {
        // Add new entry to the top of the array
        this.history.unshift({ expression, result });
        
        // Keep only the last 10 entries to prevent memory issues
        if (this.history.length > 10) {
            this.history.pop();
        }
        
        this.render();
    }

    clear() {
        this.history = [];
        this.render();
    }

    render() {
        this.listElement.innerHTML = '';

        if (this.history.length === 0) {
            this.listElement.innerHTML = '<li class="empty-history">No calculations yet.</li>';
            return;
        }

        this.history.forEach(item => {
            const li = document.createElement('li');
            li.innerHTML = `
                <span class="history-expression">${item.expression} =</span>
                <span class="history-result">${item.result}</span>
            `;
            
            // Click to insert result back into calculator
            li.addEventListener('click', () => {
                // We will define this callback in the Calculator class
                if (this.onHistoryClick) {
                    this.onHistoryClick(item.result);
                }
            });

            this.listElement.appendChild(li);
        });
    }
}


// --- Calculator Class ---
class Calculator {
    constructor(previousOperandElement, currentOperandElement, historyManager) {
        this.previousOperandElement = previousOperandElement;
        this.currentOperandElement = currentOperandElement;
        this.historyManager = historyManager;
        this.clear();
        
        // Link the history click event to the calculator
        this.historyManager.onHistoryClick = (result) => {
            this.currentOperand = result.toString();
            this.updateDisplay();
        };
    }

    clear() {
        this.currentOperand = '0';
        this.previousOperand = '';
        this.operation = undefined;
        this.updateDisplay();
    }

    delete() {
        if (this.currentOperand === '0') return;
        if (this.currentOperand.length === 1) {
            this.currentOperand = '0';
        } else {
            this.currentOperand = this.currentOperand.toString().slice(0, -1);
        }
        this.updateDisplay();
    }

    appendNumber(number) {
        if (number === '.' && this.currentOperand.includes('.')) return;
        
        if (this.currentOperand === '0' && number !== '.') {
            this.currentOperand = number.toString();
        } else {
            this.currentOperand = this.currentOperand.toString() + number.toString();
        }
        this.updateDisplay();
    }

    chooseOperation(operation) {
        if (this.currentOperand === '') return;
        
        if (this.previousOperand !== '') {
            this.compute();
        }
        
        this.operation = operation;
        this.previousOperand = this.currentOperand;
        this.currentOperand = '';
        this.updateDisplay();
    }

    compute() {
        let computation;
        const prev = parseFloat(this.previousOperand);
        const current = parseFloat(this.currentOperand);
        
        if (isNaN(prev) || isNaN(current)) return;

        // Store the expression before we clear it for the history log
        const expression = `${this.getDisplayNumber(prev)} ${this.operation} ${this.getDisplayNumber(current)}`;

        switch (this.operation) {
            case '+': computation = prev + current; break;
            case '-': computation = prev - current; break;
            case '×': computation = prev * current; break;
            case '÷': 
                if (current === 0) {
                    computation = "Error"; 
                } else {
                    computation = prev / current;
                }
                break;
            default: return;
        }

        if (typeof computation === 'number') {
            computation = Math.round(computation * 100000000) / 100000000;
        }

        // Add to history if it was a successful calculation
        if (computation !== "Error") {
            this.historyManager.add(expression, this.getDisplayNumber(computation));
        }

        this.currentOperand = computation.toString();
        this.operation = undefined;
        this.previousOperand = '';
        this.updateDisplay();
    }

    getDisplayNumber(number) {
        if (number === 'Error') return number;
        
        const stringNumber = number.toString();
        const integerDigits = parseFloat(stringNumber.split('.')[0]);
        const decimalDigits = stringNumber.split('.')[1];
        
        let integerDisplay;
        if (isNaN(integerDigits)) {
            integerDisplay = '';
        } else {
            integerDisplay = integerDigits.toLocaleString('en', { maximumFractionDigits: 0 });
        }

        if (decimalDigits != null) {
            return `${integerDisplay}.${decimalDigits}`;
        } else {
            return integerDisplay;
        }
    }

    updateDisplay() {
        this.currentOperandElement.innerText = this.getDisplayNumber(this.currentOperand);
        
        if (this.operation != null) {
            this.previousOperandElement.innerText = 
                `${this.getDisplayNumber(this.previousOperand)} ${this.operation}`;
        } else {
            this.previousOperandElement.innerText = '';
        }
    }
}


// --- DOM Initialization ---
const numberButtons = document.querySelectorAll('[data-number]');
const operationButtons = document.querySelectorAll('[data-operator]');
const equalsButton = document.querySelector('[data-action="calculate"]');
const deleteButton = document.querySelector('[data-action="delete"]');
const clearButton = document.querySelector('[data-action="clear"]');
const previousOperandElement = document.getElementById('previous-operand');
const currentOperandElement = document.getElementById('current-operand');

// History Elements
const historyPanel = document.getElementById('history-panel');
const historyList = document.getElementById('history-list');
const historyToggle = document.getElementById('history-toggle');
const clearHistoryBtn = document.getElementById('clear-history-btn');

const historyManager = new HistoryManager(historyList);
const calculator = new Calculator(previousOperandElement, currentOperandElement, historyManager);

// --- Event Listeners ---
numberButtons.forEach(button => {
    button.addEventListener('click', () => calculator.appendNumber(button.dataset.number));
});

operationButtons.forEach(button => {
    button.addEventListener('click', () => calculator.chooseOperation(button.dataset.operator));
});

equalsButton.addEventListener('click', () => calculator.compute());
clearButton.addEventListener('click', () => calculator.clear());
deleteButton.addEventListener('click', () => calculator.delete());

// History Panel Toggles
historyToggle.addEventListener('click', () => {
    // Toggle class based on screen size
    if (window.innerWidth <= 750) {
        historyPanel.classList.toggle('active-mobile');
    } else {
        historyPanel.classList.toggle('hidden-panel');
    }
});

clearHistoryBtn.addEventListener('click', () => historyManager.clear());

// --- BONUS: Keyboard Support ---
document.addEventListener('keydown', (e) => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) return;

    if ((e.key >= '0' && e.key <= '9') || e.key === '.') {
        calculator.appendNumber(e.key);
        highlightButton(`[data-number="${e.key}"]`);
    }
    
    if (e.key === '=' || e.key === 'Enter') {
        e.preventDefault();
        calculator.compute();
        highlightButton('[data-action="calculate"]');
    }
    
    if (e.key === 'Backspace') {
        calculator.delete();
        highlightButton('[data-action="delete"]');
    }
    
    if (e.key === 'Escape') {
        calculator.clear();
        highlightButton('[data-action="clear"]');
    }

    if (e.key === '+') { calculator.chooseOperation('+'); highlightButton('[data-operator="+"]'); }
    if (e.key === '-') { calculator.chooseOperation('-'); highlightButton('[data-operator="-"]'); }
    if (e.key === '*') { calculator.chooseOperation('×'); highlightButton('[data-operator="×"]'); }
    if (e.key === '/') { e.preventDefault(); calculator.chooseOperation('÷'); highlightButton('[data-operator="÷"]'); }
});

function highlightButton(selector) {
    const button = document.querySelector(selector);
    if (!button) return;
    
    button.style.backgroundColor = 'var(--btn-hover)';
    setTimeout(() => {
        button.style.backgroundColor = ''; // Revert to CSS default
    }, 100);
}