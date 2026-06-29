/**
 * Module 7: Strict Anti-Cheat Engine
 */
window.AntiCheat = {
    cheatCount: 0,
    maxQuota: 3, // Overridden by settings in real app
    isActive: false,

    init(maxQuota = 3) {
        this.maxQuota = maxQuota;
        this.cheatCount = 0;
        this.isActive = true;
        this.bindEvents();
        this.addWatermark();
        this.requestFullscreen();
        console.log("Anti-Cheat Engine Initialized");
    },

    bindEvents() {
        // 1. Tab Switch / Window Blur
        window.addEventListener('blur', this.handleBlur.bind(this));
        
        // 2. Prevent Context Menu (Right Click)
        document.addEventListener('contextmenu', e => {
            if (this.isActive) e.preventDefault();
        });
 
        // 3. Prevent Copy, Paste, Cut
        document.addEventListener('copy', e => { if (this.isActive) e.preventDefault(); });
        document.addEventListener('paste', e => { if (this.isActive) e.preventDefault(); });
        document.addEventListener('cut', e => { if (this.isActive) e.preventDefault(); });

        // 4. Keyboard Shortcuts (F12, PrintScreen, Ctrl+C, etc)
        document.addEventListener('keydown', this.handleKeydown.bind(this));

        // 5. Fullscreen Exit Detection
        document.addEventListener('fullscreenchange', this.handleFullscreenChange.bind(this));
    },

    unbindEvents() {
        this.isActive = false;
        window.removeEventListener('blur', this.handleBlur);
        document.removeEventListener('fullscreenchange', this.handleFullscreenChange);
        document.removeEventListener('keydown', this.handleKeydown);
        this.removeWatermark();
        if (document.fullscreenElement) {
            document.exitFullscreen().catch(err => console.log(err));
        }
    },

    triggerCheat(reason) {
        if (!this.isActive) return;
        this.cheatCount++;
        
        // Log to backend (simulated)
        console.warn(\`Cheat Alert (\${this.cheatCount}/\${this.maxQuota}): \${reason}\`);
        
        // Show terrifying UI alert
        this.showWarningOverlay(reason, this.cheatCount);

        if (this.cheatCount >= this.maxQuota) {
            this.forceSubmit();
        }
    },

    handleBlur() {
        if (!this.isActive) return;
        this.triggerCheat("Tab switched or window lost focus");
    },

    handleKeydown(e) {
        if (!this.isActive) return;
        
        // Block F12
        if (e.key === 'F12' || e.keyCode === 123) {
            e.preventDefault();
            this.triggerCheat("Developer tools accessed");
        }
        
        // Block Ctrl+C, Ctrl+V, Ctrl+P
        if ((e.ctrlKey || e.metaKey) && (e.key === 'c' || e.key === 'v' || e.key === 'p')) {
            e.preventDefault();
            this.triggerCheat(\`Restricted shortcut used: Ctrl+\${e.key}\`);
        }
    },

    handleFullscreenChange() {
        if (!this.isActive) return;
        if (!document.fullscreenElement) {
            this.triggerCheat("Exited fullscreen mode");
            // Force back to fullscreen
            setTimeout(() => this.requestFullscreen(), 2000);
        }
    },

    requestFullscreen() {
        const elem = document.documentElement;
        if (elem.requestFullscreen) {
            elem.requestFullscreen().catch(err => console.log("Fullscreen request failed", err));
        }
    },

    addWatermark() {
        const user = App.state.currentUser || { name: 'Student', id: '123' };
        const watermark = document.createElement('div');
        watermark.id = 'exam-watermark';
        watermark.innerHTML = \`\${user.name} (\${user.id})\`;
        watermark.style.cssText = \`
            position: fixed;
            top: 0; left: 0; right: 0; bottom: 0;
            z-index: 9999;
            pointer-events: none;
            opacity: 0.03;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 5vw;
            font-weight: bold;
            color: black;
            transform: rotate(-30deg);
            white-space: nowrap;
        \`;
        document.body.appendChild(watermark);
    },

    removeWatermark() {
        const watermark = document.getElementById('exam-watermark');
        if (watermark) watermark.remove();
    },

    showWarningOverlay(reason, count) {
        const overlay = document.createElement('div');
        overlay.style.cssText = \`
            position: fixed; inset: 0; z-index: 10000;
            background: rgba(220, 38, 38, 0.95);
            backdrop-filter: blur(8px);
            display: flex; flex-direction: column;
            align-items: center; justify-content: center;
            color: white; text-align: center; padding: 2rem;
        \`;
        
        overlay.innerHTML = \`
            <svg class="w-24 h-24 mb-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
            <h1 class="text-4xl font-bold mb-2 uppercase tracking-widest">Warning!</h1>
            <p class="text-xl mb-6">Suspicious activity detected: <strong>\${reason}</strong></p>
            <div class="bg-black/20 p-4 rounded-xl mb-8">
                <p class="text-lg font-medium">Strike \${count} of \${this.maxQuota}</p>
                <p class="text-sm mt-1 opacity-80">If you reach \${this.maxQuota} strikes, your exam will be automatically submitted.</p>
            </div>
            <button class="bg-white text-red-600 px-8 py-3 rounded-full font-bold hover:bg-red-50 transition-colors" onclick="this.parentElement.remove()">I Understand, Return to Exam</button>
        \`;
        
        document.body.appendChild(overlay);
    },

    forceSubmit() {
        this.isActive = false;
        alert("Maximum cheat limit exceeded. Submitting exam automatically...");
        if (window.ExamRunner) {
            window.ExamRunner.submitExam(true);
        }
    }
};
