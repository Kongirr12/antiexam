/**
 * Module 2: Exam Management
 */
window.ExamsModule = {
    state: {
        exams: [],
        isLoading: true
    },
 
    async render() {
        App.container.innerHTML = `
            <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <div class="flex items-center gap-4">
                    <button onclick="App.navigate('dashboard')" class="p-2 rounded-lg hover:bg-slate-200 transition-colors">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                    </button>
                    <div>
                        <h1 class="text-3xl font-bold text-slate-800 tracking-tight">Exam Management</h1>
                        <p class="text-slate-500 text-sm">Create and manage examinations.</p>
                    </div>
                </div>
                <button class="premium-btn gap-2" onclick="ExamsModule.showCreateExam()">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
                    Create New Exam
                </button>
            </div>

            <!-- Loader -->
            <div id="exams-loader" class="flex justify-center items-center py-12">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>

            <!-- Exams Grid -->
            <div id="exams-grid" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 hidden">
                <!-- Exam Cards will be injected here -->
            </div>
            
            <!-- Empty State -->
            <div id="exams-empty" class="hidden text-center py-20 glass-panel rounded-2xl">
                <div class="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                    <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>
                </div>
                <h3 class="text-lg font-medium text-slate-800">No Exams Found</h3>
                <p class="text-slate-500 mt-1 mb-6">You haven't created any exams yet.</p>
                <button class="premium-btn" onclick="ExamsModule.showCreateExam()">Create First Exam</button>
            </div>
        `;

        await this.loadExams();
    },

    async loadExams() {
        try {
            this.state.exams = await API.post('getExams');
            document.getElementById('exams-loader').classList.add('hidden');
            
            if (this.state.exams.length === 0) {
                document.getElementById('exams-empty').classList.remove('hidden');
            } else {
                const grid = document.getElementById('exams-grid');
                grid.classList.remove('hidden');
                this.renderGrid(grid);
            }
        } catch (error) {
            console.error("Failed to load exams", error);
            document.getElementById('exams-loader').innerHTML = `<p class="text-danger-500">Failed to load exams.</p>`;
        }
    },

    renderGrid(gridElement) {
        gridElement.innerHTML = this.state.exams.map(e => `
            <div class="glass-panel rounded-2xl p-6 hover-lift flex flex-col h-full border-t-4 border-t-primary-500">
                <div class="flex justify-between items-start mb-4">
                    <div>
                        <span class="text-xs font-semibold text-primary-600 tracking-wider uppercase">${e.subject}</span>
                        <h3 class="text-lg font-bold text-slate-800 leading-tight mt-1">${e.name}</h3>
                    </div>
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${e.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}">
                        ${e.status}
                    </span>
                </div>
                
                <div class="grid grid-cols-2 gap-4 mt-4 mb-6 text-sm">
                    <div class="flex flex-col">
                        <span class="text-slate-400 text-xs">Duration</span>
                        <span class="font-medium text-slate-700 flex items-center gap-1 mt-0.5">
                            <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            ${e.duration} Mins
                        </span>
                    </div>
                    <div class="flex flex-col">
                        <span class="text-slate-400 text-xs">Passing</span>
                        <span class="font-medium text-slate-700 flex items-center gap-1 mt-0.5">
                            <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            ${e.passing}%
                        </span>
                    </div>
                </div>
                
                <div class="mt-auto pt-4 border-t border-slate-100 flex gap-2">
                    <button class="premium-btn-outline flex-1 text-xs py-2" onclick="alert('View questions')">Questions</button>
                    <button class="premium-btn-outline flex-1 text-xs py-2" onclick="alert('View Settings')">Settings</button>
                </div>
            </div>
        `).join('');
    },

    showCreateExam() {
        alert("Simulating Create Exam Form (Module 2). This will route to a dedicated form builder view in the next phase.");
    }
};
