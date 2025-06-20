// Simple working version of the dice app
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing dice app...');
    
    // Get DOM elements with error checking
    const diceTypeSelect = document.getElementById('diceType');
    const diceCountSelect = document.getElementById('diceCount');
    const rollBtn = document.getElementById('rollBtn');
    const clearBtn = document.getElementById('clearBtn');
    const historyBtn = document.getElementById('historyBtn');
    const settingsBtn = document.getElementById('settingsBtn');
    const diceResults = document.getElementById('diceResults');
    const totalSection = document.getElementById('totalSection');
    const totalResult = document.getElementById('totalResult');

    // Check if all elements exist
    if (!diceTypeSelect || !diceCountSelect || !rollBtn || !diceResults) {
        console.error('Critical DOM elements missing!');
        return;
    }
    
    console.log('All DOM elements found successfully');
    
    // Modal elements
    const historyModal = document.getElementById('historyModal');
    const settingsModal = document.getElementById('settingsModal');
    const closeHistoryBtn = document.getElementById('closeHistoryBtn');
    const closeSettingsBtn = document.getElementById('closeSettingsBtn');

    // Stats elements
    const rollCountEl = document.getElementById('rollCount');
    const sessionHighEl = document.getElementById('sessionHigh');
    const averageRollEl = document.getElementById('averageRoll');

    // App state
    let rollCount = 0;
    let totalSum = 0;
    let sessionHigh = 0;
    let rollHistory = [];

    // Roll a single die
    function rollDice(sides) {
        return Math.floor(Math.random() * sides) + 1;
    }

    // Create dice face based on value and dice type
    function createDiceFace(value, diceType) {
        const diceElement = document.createElement('div');
        diceElement.className = 'dice-result rolling';
        
        const diceFace = document.createElement('div');
        diceFace.className = 'dice-face';
        
        if (diceType === 6 && value <= 6) {
            // Create traditional dot pattern for D6
            const dotsContainer = document.createElement('div');
            dotsContainer.className = `dice-dots dice-${value}`;
            
            for (let i = 0; i < value; i++) {
                const dot = document.createElement('div');
                dot.className = 'dice-dot';
                dotsContainer.appendChild(dot);
            }
            
            diceFace.appendChild(dotsContainer);
        } else {
            // For other dice types, show number
            const numberElement = document.createElement('div');
            numberElement.className = 'dice-number';
            numberElement.textContent = value;
            diceFace.appendChild(numberElement);
        }
        
        diceElement.appendChild(diceFace);
        
        // Remove rolling animation after it completes
        setTimeout(() => {
            diceElement.classList.remove('rolling');
        }, 1000);
        
        return diceElement;
    }

    // Main roll function
    function rollDices() {
        const diceType = parseInt(diceTypeSelect.value);
        const diceCount = parseInt(diceCountSelect.value);
        
        console.log(`Rolling ${diceCount} dice of type D${diceType}`); // Debug log
        
        // Clear previous results
        diceResults.innerHTML = '';
        totalSection.classList.add('hidden');
        
        const results = [];
        let total = 0;

        // Disable roll button during animation
        rollBtn.disabled = true;

        // Roll each die
        for (let i = 0; i < diceCount; i++) {
            const result = rollDice(diceType);
            results.push(result);
            total += result;
            
            console.log(`Die ${i + 1}: ${result}`); // Debug log

            // Create dice element with staggered animation
            setTimeout(() => {
                const diceElement = createDiceFace(result, diceType);
                diceResults.appendChild(diceElement);
            }, i * 200);
        }

        console.log(`Total results: ${results.join(', ')}, Sum: ${total}`); // Debug log

        // Show total after all dice finish rolling
        setTimeout(() => {
            totalResult.textContent = total;
            totalSection.classList.remove('hidden');
            
            // Update stats
            updateStats(total, results, diceType, diceCount);
            
            // Re-enable roll button
            rollBtn.disabled = false;
            
        }, diceCount * 200 + 1200);
    }

    // Update statistics
    function updateStats(total, results, diceType, diceCount) {
        rollCount++;
        totalSum += total;
        
        if (total > sessionHigh) {
            sessionHigh = total;
        }

        // Add to history
        rollHistory.unshift({
            results,
            total,
            diceType,
            diceCount,
            timestamp: new Date().toLocaleTimeString()
        });

        // Keep only last 20 rolls
        if (rollHistory.length > 20) {
            rollHistory = rollHistory.slice(0, 20);
        }

        updateDisplay();
    }

    // Update display elements
    function updateDisplay() {
        rollCountEl.textContent = rollCount;
        sessionHighEl.textContent = sessionHigh;
        
        const average = rollCount > 0 ? (totalSum / rollCount).toFixed(1) : 0;
        averageRollEl.textContent = average;
    }

    // Clear results
    function clearResults() {
        diceResults.innerHTML = '';
        totalSection.classList.add('hidden');
    }

    // Show/hide modals
    function showModal(modal) {
        modal.classList.remove('hidden');
    }

    function hideModal(modal) {
        modal.classList.add('hidden');
    }

    // Show history
    function showHistory() {
        updateHistoryDisplay();
        showModal(historyModal);
    }

    // Update history display
    function updateHistoryDisplay() {
        const historyList = document.getElementById('historyList');
        const totalRolls = document.getElementById('totalRolls');
        const allTimeHigh = document.getElementById('allTimeHigh');
        
        if (totalRolls) totalRolls.textContent = rollHistory.length;
        if (allTimeHigh) {
            const highest = rollHistory.reduce((max, roll) => 
                roll.total > max ? roll.total : max, 0);
            allTimeHigh.textContent = highest;
        }

        if (historyList) {
            historyList.innerHTML = '';
            rollHistory.slice(0, 10).forEach(roll => {
                const item = document.createElement('div');
                item.className = 'history-item';
                item.innerHTML = `
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span>${roll.diceCount}×D${roll.diceType}</span>
                        <strong>Total: ${roll.total}</strong>
                    </div>
                    <div style="font-size: 0.9em; color: var(--accent-light); margin-top: 5px;">
                        ${roll.results.join(', ')} • ${roll.timestamp}
                    </div>
                `;
                historyList.appendChild(item);
            });

            if (rollHistory.length === 0) {
                historyList.innerHTML = '<p style="text-align: center; color: var(--accent-light);">No rolls yet!</p>';
            }
        }
    }

    // Clear history
    function clearHistory() {
        if (confirm('Are you sure you want to clear all roll history?')) {
            rollHistory = [];
            updateHistoryDisplay();
        }
    }

    // Event listeners
    rollBtn.addEventListener('click', rollDices);
    clearBtn.addEventListener('click', clearResults);
    
    if (historyBtn) {
        historyBtn.addEventListener('click', showHistory);
    }
    
    if (settingsBtn) {
        settingsBtn.addEventListener('click', () => showModal(settingsModal));
    }

    if (closeHistoryBtn) {
        closeHistoryBtn.addEventListener('click', () => hideModal(historyModal));
    }

    if (closeSettingsBtn) {
        closeSettingsBtn.addEventListener('click', () => hideModal(settingsModal));
    }

    // Clear history button
    const clearHistoryBtn = document.getElementById('clearHistoryBtn');
    if (clearHistoryBtn) {
        clearHistoryBtn.addEventListener('click', clearHistory);
    }

    // Keyboard shortcuts
    document.addEventListener('keypress', function(e) {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;
        
        switch(e.key) {
            case ' ':
            case 'Enter':
                e.preventDefault();
                if (!rollBtn.disabled) rollDices();
                break;
            case 'c':
            case 'C':
                clearResults();
                break;
            case 'h':
            case 'H':
                if (historyBtn) showHistory();
                break;
        }
    });

    // Close modals when clicking outside
    if (historyModal) {
        historyModal.addEventListener('click', function(e) {
            if (e.target === historyModal) {
                hideModal(historyModal);
            }
        });
    }

    if (settingsModal) {
        settingsModal.addEventListener('click', function(e) {
            if (e.target === settingsModal) {
                hideModal(settingsModal);
            }
        });
    }

    // Initialize display and test selects
    updateDisplay();
    
    // Test that selects are working
    console.log('Initial dice type:', diceTypeSelect.value);
    console.log('Initial dice count:', diceCountSelect.value);
    
    // Add change listeners to debug
    diceTypeSelect.addEventListener('change', function() {
        console.log('Dice type changed to:', this.value);
    });
    
    diceCountSelect.addEventListener('change', function() {
        console.log('Dice count changed to:', this.value);
    });

    console.log('Dice app initialized successfully!');
});