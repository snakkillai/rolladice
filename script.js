// App State Management
class DiceApp {
    constructor() {
        this.state = {
            rollHistory: [],
            sessionStats: {
                rollCount: 0,
                totalSum: 0,
                sessionHigh: 0
            },
            settings: {
                soundEnabled: true,
                vibrationEnabled: true,
                animationSpeed: 'normal'
            },
            deferredPrompt: null
        };
        
        this.loadData();
        this.initializeApp();
    }

    // Initialize app components
    initializeApp() {
        this.bindElements();
        this.attachEventListeners();
        this.updateDisplay();
        this.setupPWA();
    }

    // Bind DOM elements
    bindElements() {
        // Core elements
        this.diceTypeSelect = document.getElementById('diceType');
        this.diceCountSelect = document.getElementById('diceCount');
        this.rollBtn = document.getElementById('rollBtn');
        this.clearBtn = document.getElementById('clearBtn');
        this.historyBtn = document.getElementById('historyBtn');
        this.diceResults = document.getElementById('diceResults');
        this.totalSection = document.getElementById('totalSection');
        this.totalResult = document.getElementById('totalResult');

        // Stats elements
        this.rollCountEl = document.getElementById('rollCount');
        this.sessionHighEl = document.getElementById('sessionHigh');
        this.averageRollEl = document.getElementById('averageRoll');
        this.lastRollInfo = document.getElementById('lastRollInfo');
        this.rollTime = document.getElementById('rollTime');
        this.rollDetails = document.getElementById('rollDetails');

        // Modal elements
        this.historyModal = document.getElementById('historyModal');
        this.settingsModal = document.getElementById('settingsModal');
        this.settingsBtn = document.getElementById('settingsBtn');
        this.closeHistoryBtn = document.getElementById('closeHistoryBtn');
        this.closeSettingsBtn = document.getElementById('closeSettingsBtn');
        this.historyList = document.getElementById('historyList');
        this.clearHistoryBtn = document.getElementById('clearHistoryBtn');

        // Settings elements
        this.soundToggle = document.getElementById('soundToggle');
        this.vibrationToggle = document.getElementById('vibrationToggle');
        this.animationSpeed = document.getElementById('animationSpeed');

        // PWA elements
        this.installPrompt = document.getElementById('installPrompt');
        this.installBtn = document.getElementById('installBtn');
        this.dismissInstallBtn = document.getElementById('dismissInstallBtn');
        this.loadingOverlay = document.getElementById('loadingOverlay');
    }

    // Attach event listeners
    attachEventListeners() {
        // Core functionality
        this.rollBtn.addEventListener('click', () => this.rollDices());
        this.clearBtn.addEventListener('click', () => this.clearResults());
        this.historyBtn.addEventListener('click', () => this.showHistory());

        // Settings
        this.settingsBtn.addEventListener('click', () => this.showSettings());
        this.closeHistoryBtn.addEventListener('click', () => this.hideModal(this.historyModal));
        this.closeSettingsBtn.addEventListener('click', () => this.hideModal(this.settingsModal));
        this.clearHistoryBtn.addEventListener('click', () => this.clearHistory());

        // Settings controls
        this.soundToggle.addEventListener('change', (e) => this.updateSetting('soundEnabled', e.target.checked));
        this.vibrationToggle.addEventListener('change', (e) => this.updateSetting('vibrationEnabled', e.target.checked));
        this.animationSpeed.addEventListener('change', (e) => this.updateSetting('animationSpeed', e.target.value));

        // PWA install
        this.installBtn.addEventListener('click', () => this.installApp());
        this.dismissInstallBtn.addEventListener('click', () => this.dismissInstall());

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));

        // PWA events
        window.addEventListener('beforeinstallprompt', (e) => this.handleInstallPrompt(e));
        window.addEventListener('appinstalled', () => this.handleAppInstalled());

        // Close modals on outside click
        this.historyModal.addEventListener('click', (e) => {
            if (e.target === this.historyModal) this.hideModal(this.historyModal);
        });
        this.settingsModal.addEventListener('click', (e) => {
            if (e.target === this.settingsModal) this.hideModal(this.settingsModal);
        });
    }

    // Roll dice main function
    async rollDices() {
        const diceType = parseInt(this.diceTypeSelect.value);
        const diceCount = parseInt(this.diceCountSelect.value);
        
        // Show loading
        this.showLoading();
        
        // Clear previous results
        this.diceResults.innerHTML = '';
        this.totalSection.classList.add('hidden');
        this.lastRollInfo.classList.add('hidden');
        
        const results = [];
        let total = 0;
        const rollTime = new Date();

        // Disable roll button during animation
        this.rollBtn.disabled = true;

        // Play sound effect
        this.playSound('roll');

        // Vibrate if enabled
        this.vibrate([100, 50, 100]);

        // Roll each die
        for (let i = 0; i < diceCount; i++) {
            const result = this.rollDice(diceType);
            results.push(result);
            total += result;

            // Create dice element with staggered animation
            setTimeout(() => {
                const diceElement = this.createDiceFace(result, diceType);
                this.diceResults.appendChild(diceElement);
            }, i * this.getAnimationDelay());
        }

        // Show total and update stats after all dice finish rolling
        setTimeout(() => {
            this.totalResult.textContent = total;
            this.totalSection.classList.remove('hidden');
            
            // Update statistics
            this.updateStats(total, results, diceType, diceCount, rollTime);
            
            // Show roll info
            this.showRollInfo(results, diceType, diceCount, rollTime);
            
            // Re-enable roll button
            this.rollBtn.disabled = false;
            
            // Hide loading
            this.hideLoading();
            
            // Play success sound
            this.playSound('success');
            
            // Save data
            this.saveData();
            
        }, diceCount * this.getAnimationDelay() + 1200);
    }

    // Roll single die
    rollDice(sides) {
        return Math.floor(Math.random() * sides) + 1;
    }

    // Create dice face based on value and dice type
    createDiceFace(value, diceType) {
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

    // Clear results
    clearResults() {
        this.diceResults.innerHTML = '';
        this.totalSection.classList.add('hidden');
        this.lastRollInfo.classList.add('hidden');
        this.playSound('clear');
    }

    // Update statistics
    updateStats(total, results, diceType, diceCount, rollTime) {
        this.state.sessionStats.rollCount++;
        this.state.sessionStats.totalSum += total;
        
        if (total > this.state.sessionStats.sessionHigh) {
            this.state.sessionStats.sessionHigh = total;
        }

        // Add to history
        this.state.rollHistory.unshift({
            results,
            total,
            diceType,
            diceCount,
            timestamp: rollTime.toISOString(),
            formattedTime: rollTime.toLocaleTimeString()
        });

        // Keep only last 50 rolls
        if (this.state.rollHistory.length > 50) {
            this.state.rollHistory = this.state.rollHistory.slice(0, 50);
        }

        this.updateDisplay();
    }

    // Update display elements
    updateDisplay() {
        const stats = this.state.sessionStats;
        this.rollCountEl.textContent = stats.rollCount;
        this.sessionHighEl.textContent = stats.sessionHigh;
        
        const average = stats.rollCount > 0 ? (stats.totalSum / stats.rollCount).toFixed(1) : 0;
        this.averageRollEl.textContent = average;

        // Update settings display
        this.soundToggle.checked = this.state.settings.soundEnabled;
        this.vibrationToggle.checked = this.state.settings.vibrationEnabled;
        this.animationSpeed.value = this.state.settings.animationSpeed;
    }

    // Show roll information
    showRollInfo(results, diceType, diceCount, rollTime) {
        this.rollTime.textContent = `Rolled at ${rollTime.toLocaleTimeString()}`;
        this.rollDetails.textContent = `${diceCount}×D${diceType}: ${results.join(', ')}`;
        this.lastRollInfo.classList.remove('hidden');
    }

    // Show history modal
    showHistory() {
        this.updateHistoryDisplay();
        this.showModal(this.historyModal);
    }

    // Update history display
    updateHistoryDisplay() {
        const totalRolls = document.getElementById('totalRolls');
        const allTimeHigh = document.getElementById('allTimeHigh');
        
        totalRolls.textContent = this.state.rollHistory.length;
        
        const highest = this.state.rollHistory.reduce((max, roll) => 
            roll.total > max ? roll.total : max, 0);
        allTimeHigh.textContent = highest;

        // Update history list
        this.historyList.innerHTML = '';
        this.state.rollHistory.slice(0, 10).forEach(roll => {
            const item = document.createElement('div');
            item.className = 'history-item';
            item.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span>${roll.diceCount}×D${roll.diceType}</span>
                    <strong>Total: ${roll.total}</strong>
                </div>
                <div style="font-size: 0.9em; color: var(--accent-light); margin-top: 5px;">
                    ${roll.results.join(', ')} • ${roll.formattedTime}
                </div>
            `;
            this.historyList.appendChild(item);
        });

        if (this.state.rollHistory.length === 0) {
            this.historyList.innerHTML = '<p style="text-align: center; color: var(--accent-light);">No rolls yet!</p>';
        }
    }

    // Show settings modal
    showSettings() {
        this.showModal(this.settingsModal);
    }

    // Clear history
    clearHistory() {
        if (confirm('Are you sure you want to clear all roll history?')) {
            this.state.rollHistory = [];
            this.updateHistoryDisplay();
            this.saveData();
            this.playSound('clear');
        }
    }

    // Update setting
    updateSetting(key, value) {
        this.state.settings[key] = value;
        this.saveData();
    }

    // Get animation delay based on setting
    getAnimationDelay() {
        const speeds = { slow: 300, normal: 200, fast: 100 };
        return speeds[this.state.settings.animationSpeed] || 200;
    }

    // Modal management
    showModal(modal) {
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }

    hideModal(modal) {
        modal.classList.add('hidden');
        document.body.style.overflow = '';
    }

    // Loading management
    showLoading() {
        this.loadingOverlay.classList.remove('hidden');
    }

    hideLoading() {
        this.loadingOverlay.classList.add('hidden');
    }

    // Sound effects
    playSound(type) {
        if (!this.state.settings.soundEnabled) return;
        
        // Create audio context for sound effects
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        switch(type) {
            case 'roll':
                oscillator.frequency.setValueAtTime(200, this.audioContext.currentTime);
                oscillator.frequency.linearRampToValueAtTime(400, this.audioContext.currentTime + 0.1);
                break;
            case 'success':
                oscillator.frequency.setValueAtTime(400, this.audioContext.currentTime);
                oscillator.frequency.linearRampToValueAtTime(600, this.audioContext.currentTime + 0.2);
                break;
            case 'clear':
                oscillator.frequency.setValueAtTime(300, this.audioContext.currentTime);
                oscillator.frequency.linearRampToValueAtTime(200, this.audioContext.currentTime + 0.1);
                break;
        }
        
        gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.3);
    }

    // Vibration
    vibrate(pattern) {
        if (this.state.settings.vibrationEnabled && 'vibrate' in navigator) {
            navigator.vibrate(pattern);
        }
    }

    // Keyboard shortcuts
    handleKeyboard(e) {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;
        
        switch(e.key) {
            case ' ':
            case 'Enter':
                e.preventDefault();
                if (!this.rollBtn.disabled) this.rollDices();
                break;
            case 'c':
            case 'C':
                this.clearResults();
                break;
            case 'h':
            case 'H':
                this.showHistory();
                break;
            case 's':
            case 'S':
                this.showSettings();
                break;
            case 'Escape':
                this.hideModal(this.historyModal);
                this.hideModal(this.settingsModal);
                break;
        }
    }

    // PWA Setup
    setupPWA() {
        // Check if already installed
        if (window.matchMedia('(display-mode: standalone)').matches) {
            this.installPrompt.classList.add('hidden');
        }
    }

    // Handle install prompt
    handleInstallPrompt(e) {
        e.preventDefault();
        this.state.deferredPrompt = e;
        this.installPrompt.classList.remove('hidden');
    }

    // Install app
    async installApp() {
        if (!this.state.deferredPrompt) return;
        
        this.state.deferredPrompt.prompt();
        const { outcome } = await this.state.deferredPrompt.userChoice;
        
        if (outcome === 'accepted') {
            this.state.deferredPrompt = null;
            this.installPrompt.classList.add('hidden');
        }
    }

    // Dismiss install prompt
    dismissInstall() {
        this.installPrompt.classList.add('hidden');
        // Show again after 24 hours
        setTimeout(() => {
            if (!window.matchMedia('(display-mode: standalone)').matches) {
                this.installPrompt.classList.remove('hidden');
            }
        }, 24 * 60 * 60 * 1000);
    }

    // Handle app installed
    handleAppInstalled() {
        this.installPrompt.classList.add('hidden');
        this.state.deferredPrompt = null;
    }

    // Data persistence
    saveData() {
        try {
            localStorage.setItem('diceAppData', JSON.stringify({
                rollHistory: this.state.rollHistory,
                sessionStats: this.state.sessionStats,
                settings: this.state.settings
            }));
        } catch (e) {
            console.warn('Could not save data to localStorage:', e);
        }
    }

    loadData() {
        try {
            const saved = localStorage.getItem('diceAppData');
            if (saved) {
                const data = JSON.parse(saved);
                this.state.rollHistory = data.rollHistory || [];
                this.state.sessionStats = { ...this.state.sessionStats, ...data.sessionStats };
                this.state.settings = { ...this.state.settings, ...data.settings };
            }
        } catch (e) {
            console.warn('Could not load data from localStorage:', e);
        }
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.diceApp = new DiceApp();
});