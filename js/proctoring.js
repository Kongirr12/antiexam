/** 
 * Module 8: Live Proctoring
 */ 
window.ProctoringModule = {
    state: {
        sessions: [],
        isLoading: true,
        interval: null
    },
    
    async render() {
        App.container.innerHTML = `
            <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <div class="flex items-center gap-4">
                    <button onclick="App.navigate('dashboard')" class="p-2 rounded-lg hover:bg-slate-200 transition-colors">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                    </button>
                    <div>
                        <h1 class="text-3xl font-bold text-slate-800 tracking-tight">Live Proctoring</h1>
                        <p class="text-slate-500 text-sm">Monitor student progress and cheating alerts in real-time.</p>
                    </div>
                </div>
                <div class="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-full text-sm font-bold border border-emerald-200">
                    <div class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                    Live Updates Active
                </div>
            </div>

            <!-- Toolbar -->
            <div class="glass-panel p-4 rounded-xl flex gap-4 mb-6">
                <select class="premium-input w-full md:w-64" id="proc-exam-select">
                    <option value="">All Active Exams</option>
                    <option value="E01">Midterm Math</option>
                </select>
                <div class="relative flex-grow">
                    <svg class="w-5 h-5 absolute left-3 top-2.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                    <input type="text" placeholder="Search student name or ID..." class="premium-input pl-10">
                </div>
            </div>

            <!-- Loader -->
            <div id="proctor-loader" class="flex justify-center items-center py-12">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>

            <!-- Grid -->
            <div id="proctor-grid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 hidden">
                <!-- Session Cards injected here -->
            </div>
        `;

        await this.loadSessions();
        
        // Polling simulation
        this.state.interval = setInterval(() => {
            if (App.state.currentRoute === 'proctoring') {
                this.loadSessions(true); // silent reload
            } else {
                clearInterval(this.state.interval);
            }
        }, 5000);
    },

    async loadSessions(silent = false) {
        try {
            this.state.sessions = await API.post('getLiveSessions');
            if (!silent) {
                document.getElementById('proctor-loader').classList.add('hidden');
                document.getElementById('proctor-grid').classList.remove('hidden');
            }
            this.renderGrid(document.getElementById('proctor-grid'));
        } catch (error) {
            console.error("Failed to load sessions", error);
        }
    },

    renderGrid(gridElement) {
        if (!gridElement) return;

        if (this.state.sessions.length === 0) {
            gridElement.innerHTML = `<div class="col-span-full text-center py-12 text-slate-500">No active sessions found.</div>`;
            return;
        }

        gridElement.innerHTML = this.state.sessions.map(s => {
            const isCritical = s.cheatCount >= 2;
            const borderClass = isCritical ? 'border-l-4 border-l-rose-500' : 'border-l-4 border-l-primary-500';
            
            return `
            <div class="glass-panel p-5 rounded-xl hover-lift ${borderClass} flex flex-col h-full relative">
                ${s.status === 'Offline' ? '<div class="absolute inset-0 bg-white/60 backdrop-blur-[1px] z-10 flex items-center justify-center rounded-xl"><span class="bg-slate-800 text-white px-3 py-1 rounded-full text-sm font-bold opacity-80 shadow-lg">Disconnected</span></div>' : ''}
                
                <div class="flex justify-between items-start mb-3">
                    <div>
                        <h3 class="font-bold text-slate-800 leading-tight">${s.name}</h3>
                        <p class="text-xs text-slate-500">ID: ${s.studentId}</p>
                    </div>
                    <div class="flex flex-col items-end">
                        <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${s.cheatCount > 0 ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-500'}">
                            ${s.cheatCount} Alerts
                        </span>
                    </div>
                </div>
                
                <div class="mb-4">
                    <div class="flex justify-between text-xs font-semibold mb-1">
                        <span class="text-slate-500">Progress</span>
                        <span class="${s.progress > 90 ? 'text-emerald-600' : 'text-primary-600'}">${s.progress}%</span>
                    </div>
                    <div class="w-full bg-slate-100 rounded-full h-2">
                        <div class="bg-primary-500 h-2 rounded-full transition-all duration-1000" style="width: ${s.progress}%"></div>
                    </div>
                </div>
                
                <div class="mt-auto flex justify-between items-center border-t border-slate-100 pt-3 text-xs font-medium">
                    <span class="text-slate-500 flex items-center gap-1">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        ${s.timeRemaining}
                    </span>
                    <button class="text-rose-600 hover:text-rose-700 font-bold hover:underline" onclick="ProctoringModule.forceSubmit('${s.studentId}')">Force Submit</button>
                </div>
            </div>
        `}).join('');
    },

    forceSubmit(studentId) {
        if (confirm(\`Are you sure you want to forcibly submit the exam for student ID: \${studentId}?\`)) {
            alert('Command sent. The student\\'s exam will be submitted immediately.');
            // In a real app, this would send a ping to GAS, which would flag the session, 
            // and the student's polling mechanism would catch it and auto-submit.
        }
    }
};
