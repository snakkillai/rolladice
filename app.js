// Enhanced dice app with improved 3D effects
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing enhanced dice app...');
    
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

    // Create enhanced 3D dice face based on value and dice type
    function createDiceFace(value, diceType) {
        const diceElement = document.createElement('div');
        diceElement.className = 'dice-result rolling';
        
        // Add random rotation for more realistic effect
        const randomRotation = Math.random() * 360;
        diceElement.style.setProperty('--random-rotation', `${randomRotation}deg`);
        
        const diceFace = document.createElement('div');
        diceFace.className = 'dice-face';
        
        if (diceType === 6 && value <= 6) {
            // Create traditional dot pattern for D6 with enhanced 3D dots
            const dotsContainer = document.createElement('div');
            dotsContainer.className = `dice-dots dice-${value}`;
            
            for (let i = 0; i < value; i++) {
                const dot = document.createElement('div');
                dot.className = 'dice-dot';
                
                // Add slight random positioning for more natural look (removed transform scaling)
                const offsetX = (Math.random() - 0.5) * 0.5;
                const offsetY = (Math.random() - 0.5) * 0.5;
                if (offsetX !== 0 || offsetY !== 0) {
                    dot.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
                }
                
                dotsContainer.appendChild(dot);
            }
            
            diceFace.appendChild(dotsContainer);
        } else {
            // For other dice types, show number with enhanced blue styling
            const numberElement = document.createElement('div');
            numberElement.className = 'dice-number';
            numberElement.textContent = value;
            
            // Enhanced styling for better visibility
            numberElement.style.color = '#0066cc';
            numberElement.style.textShadow = '1px 1px 2px rgba(255, 255, 255, 0.8), 0 0 4px rgba(0, 102, 204, 0.3)';
            numberElement.style.fontWeight = 'bold';
            
            diceFace.appendChild(numberElement);
        }
        
        diceElement.appendChild(diceFace);
        
        // Enhanced rolling animation with 3D effects
        setTimeout(() => {
            diceElement.classList.remove('rolling');
            // Add subtle hover effect
            diceElement.addEventListener('mouseenter', function() {
                this.style.transform = 'scale(1.05) rotateX(5deg) rotateY(5deg)';
                this.style.transition = 'transform 0.3s ease';
            });
            
            diceElement.addEventListener('mouseleave', function() {
                this.style.transform = 'scale(1) rotateX(0deg) rotateY(0deg)';
            });
        }, 1000);
        
        return diceElement;
    }

    // Enhanced roll function with improved animations
    function rollDices() {
        const diceType = parseInt(diceTypeSelect.value);
        const diceCount = parseInt(diceCountSelect.value);
        
        console.log(`Rolling ${diceCount} dice of type D${diceType}`);
        
        // Clear previous results with fade out animation
        const existingDice = diceResults.querySelectorAll('.dice-result');
        existingDice.forEach((die, index) => {
            setTimeout(() => {
                die.style.opacity = '0';
                die.style.transform = 'scale(0.8)';
            }, index * 50);
        });
        
        setTimeout(() => {
            diceResults.innerHTML = '';
            totalSection.classList.add('hidden');
        }, existingDice.length * 50 + 200);
        
        const results = [];
        let total = 0;

        // Disable roll button during animation
        rollBtn.disabled = true;
        rollBtn.style.opacity = '0.6';

        // Roll each die with enhanced staggered animation
        for (let i = 0; i < diceCount; i++) {
            const result = rollDice(diceType);
            results.push(result);
            total += result;
            
            console.log(`Die ${i + 1}: ${result}`);

            // Create dice element with enhanced staggered animation
            setTimeout(() => {
                const diceElement = createDiceFace(result, diceType);
                
                // Add entrance animation
                diceElement.style.opacity = '0';
                diceElement.style.transform = 'scale(0) rotate(180deg)';
                
                diceResults.appendChild(diceElement);
                
                // Trigger entrance animation
                requestAnimationFrame(() => {
                    diceElement.style.transition = 'all 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
                    diceElement.style.opacity = '1';
                    diceElement.style.transform = 'scale(1) rotate(0deg)';
                });
                
            }, existingDice.length * 50 + 400 + i * 150);
        }

        console.log(`Total results: ${results.join(', ')}, Sum: ${total}`);

        // Show total after all dice finish rolling with enhanced animation
        setTimeout(() => {
            // Animate total result
            totalResult.style.transform = 'scale(0)';
            totalResult.textContent = total;
            totalSection.classList.remove('hidden');
            
            // Enhanced total animation with bounce effect
            requestAnimationFrame(() => {
                totalResult.style.transition = 'transform 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
                totalResult.style.transform = 'scale(1)';
            });
            
            // Update stats
            updateStats(total, results, diceType, diceCount);
            
            // Re-enable roll button with animation
            rollBtn.disabled = false;
            rollBtn.style.transition = 'opacity 0.3s ease';
            rollBtn.style.opacity = '1';
            
            // Add success vibration if supported
            if (navigator.vibrate) {
                navigator.vibrate([50, 30, 50]);
            }
            
        }, existingDice.length * 50 + 400 + diceCount * 150 + 800);
    }

    // Enhanced stats update with animations
    function updateStats(total, results, diceType, diceCount) {
        rollCount++;
        totalSum += total;
        
        if (total > sessionHigh) {
            sessionHigh = total;
            // Highlight new high score
            sessionHighEl.style.animation = 'pulse 1s ease-in-out';
            setTimeout(() => {
                sessionHighEl.style.animation = '';
            }, 1000);
        }

        // Add to history
        rollHistory.unshift({
            results,
            total,
            diceType,
            diceCount,
            timestamp: new Date().toLocaleTimeString()
        });

        // Keep only last 50 rolls for better performance
        if (rollHistory.length > 50) {
            rollHistory = rollHistory.slice(0, 50);
        }

        updateDisplay();
    }

    // Enhanced display update with smooth transitions
    function updateDisplay() {
        // Animate counter changes
        animateValue(rollCountEl, parseInt(rollCountEl.textContent) || 0, rollCount, 300);
        animateValue(sessionHighEl, parseInt(sessionHighEl.textContent) || 0, sessionHigh, 300);
        
        const average = rollCount > 0 ? (totalSum / rollCount).toFixed(1) : 0;
        animateValue(averageRollEl, parseFloat(averageRollEl.textContent) || 0, parseFloat(average), 300);
    }

    // Smooth number animation helper
    function animateValue(element, start, end, duration) {
        const startTime = performance.now();
        
        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function for smooth animation
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            const current = start + (end - start) * easeOutQuart;
            
            if (element === averageRollEl) {
                element.textContent = current.toFixed(1);
            } else {
                element.textContent = Math.round(current);
            }
            
            if (progress < 1) {
                requestAnimationFrame(update);
            }
        }
        
        requestAnimationFrame(update);
    }

    // Enhanced clear results with fade animation
    function clearResults() {
        const existingDice = diceResults.querySelectorAll('.dice-result');
        
        existingDice.forEach((die, index) => {
            setTimeout(() => {
                die.style.transition = 'all 0.3s ease';
                die.style.opacity = '0';
                die.style.transform = 'scale(0.8) rotate(90deg)';
            }, index * 50);
        });
        
        setTimeout(() => {
            diceResults.innerHTML = '';
            totalSection.classList.add('hidden');
        }, existingDice.length * 50 + 300);
    }

    // Modal functions with enhanced animations
    function showModal(modal) {
        modal.classList.remove('hidden');
        const modalContent = modal.querySelector('.modal-content');
        modalContent.style.transform = 'scale(0.8) translateY(-50px)';
        modalContent.style.opacity = '0';
        
        requestAnimationFrame(() => {
            modalContent.style.transition = 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)';
            modalContent.style.transform = 'scale(1) translateY(0)';
            modalContent.style.opacity = '1';
        });
    }

    function hideModal(modal) {
        const modalContent = modal.querySelector('.modal-content');
        modalContent.style.transition = 'all 0.3s ease';
        modalContent.style.transform = 'scale(0.8) translateY(-50px)';
        modalContent.style.opacity = '0';
        
        setTimeout(() => {
            modal.classList.add('hidden');
        }, 300);
    }

    // Show history with enhanced display
    function showHistory() {
        updateHistoryDisplay();
        showModal(historyModal);
    }

    // Enhanced history display
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
            rollHistory.slice(0, 15).forEach((roll, index) => {
                const item = document.createElement('div');
                item.className = 'history-item';
                item.style.opacity = '0';
                item.style.transform = 'translateX(-20px)';
                
                item.innerHTML = `
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span>${roll.diceCount}×D${roll.diceType}</span>
                        <strong style="color: var(--accent-bright);">Total: ${roll.total}</strong>
                    </div>
                    <div style="font-size: 0.9em; color: var(--accent-light); margin-top: 5px;">
                        Results: ${roll.results.join(', ')} • ${roll.timestamp}
                    </div>
                `;
                
                historyList.appendChild(item);
                
                // Staggered entrance animation
                setTimeout(() => {
                    item.style.transition = 'all 0.3s ease';
                    item.style.opacity = '1';
                    item.style.transform = 'translateX(0)';
                }, index * 50);
            });

            if (rollHistory.length === 0) {
                historyList.innerHTML = '<p style="text-align: center; color: var(--accent-light); opacity: 0.7;">No rolls yet! 🎲</p>';
            }
        }
    }

    // Enhanced clear history with confirmation
    function clearHistory() {
        if (confirm('🗑️ Are you sure you want to clear all roll history?\n\nThis action cannot be undone.')) {
            // Animate out existing items
            const items = document.querySelectorAll('.history-item');
            items.forEach((item, index) => {
                setTimeout(() => {
                    item.style.transition = 'all 0.3s ease';
                    item.style.opacity = '0';
                    item.style.transform = 'translateX(20px)';
                }, index * 30);
            });
            
            setTimeout(() => {
                rollHistory = [];
                updateHistoryDisplay();
            }, items.length * 30 + 300);
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

    // Enhanced keyboard shortcuts
    document.addEventListener('keypress', function(e) {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;
        
        switch(e.key.toLowerCase()) {
            case ' ':
            case 'enter':
                e.preventDefault();
                if (!rollBtn.disabled) {
                    rollBtn.style.transform = 'scale(0.95)';
                    setTimeout(() => {
                        rollBtn.style.transform = '';
                    }, 100);
                    rollDices();
                }
                break;
            case 'c':
                clearResults();
                break;
            case 'h':
                if (historyBtn) showHistory();
                break;
            case 's':
                if (settingsBtn) showModal(settingsModal);
                break;
        }
    });

    // Enhanced modal interactions
    [historyModal, settingsModal].forEach(modal => {
        if (modal) {
            modal.addEventListener('click', function(e) {
                if (e.target === modal) {
                    hideModal(modal);
                }
            });
        }
    });

    // Add button hover effects
    document.querySelectorAll('button').forEach(button => {
        button.addEventListener('mouseenter', function() {
            if (!this.disabled) {
                this.style.transform = 'translateY(-2px) scale(1.02)';
            }
        });
        
        button.addEventListener('mouseleave', function() {
            if (!this.disabled) {
                this.style.transform = '';
            }
        });
    });

    // Initialize display and add welcome effect
    updateDisplay();
    
    // Welcome animation
    setTimeout(() => {
        console.log('🎲 Enhanced 3D Dice App Ready! 🎲');
        console.log('Features: 30px dots, 3D effects, horizontal total, compact design');
        console.log('Keyboard shortcuts: Space/Enter = Roll, C = Clear, H = History, S = Settings');
    }, 500);

    // Test that selects are working
    console.log('Initial dice type:', diceTypeSelect.value);
    console.log('Initial dice count:', diceCountSelect.value);
    
    // Add change listeners for debugging
    diceTypeSelect.addEventListener('change', function() {
        console.log('Dice type changed to:', this.value);
        this.style.transform = 'scale(1.02)';
        setTimeout(() => {
            this.style.transform = '';
        }, 200);
    });
    
    diceCountSelect.addEventListener('change', function() {
        console.log('Dice count changed to:', this.value);
        this.style.transform = 'scale(1.02)';
        setTimeout(() => {
            this.style.transform = '';
        }, 200);
    });

    console.log('✅ Enhanced dice app initialized successfully!');
});