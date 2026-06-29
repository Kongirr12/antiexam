/**
 * Module 6a: Student Dashboard
 */
window.StudentModule = {
    state: {
        exams: [],
        isLoading: true
    },
 
    async render() {
        App.container.innerHTML = `
            <div class="mb-8">
                <h1 class="text-3xl font-bold text-slate-800 tracking-tight">My Exams</h1>
                <p class="text-slate-500 mt-1">Select an exam to begin. Make sure you are in a quiet environment.</p>
            </div>

            <!-- Loader -->
            <div id="student-loader" class="flex justify-center items-center py-12">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>

            <!-- Exams Grid -->
            <div id="student-exams" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 hidden">
                <!-- Exam Cards will be injected here -->
            </div>
        `;

        await this.loadExams();
    },

    async loadExams() {
        try {
            // Reusing getExams mock for now, but pretending we only get 'Active' ones for the student
            const allExams = await API.post('getExams');
            this.state.exams = allExams.filter(e => e.status === 'Active' || e.status === 'Upcoming');
            
            document.getElementById('student-loader').classList.add('hidden');
            const grid = document.getElementById('student-exams');
            grid.classList.remove('hidden');
            
            this.renderGrid(grid);
        } catch (error) {
            console.error("Failed to load student exams", error);
            document.getElementById('student-loader').innerHTML = `<p class="text-danger-500">Failed to load exams.</p>`;
        }
    },

    renderGrid(gridElement) {
        if (this.state.exams.length === 0) {
            gridElement.innerHTML = `<div class="col-span-full text-center py-12 text-slate-500">No exams available for you right now.</div>`;
            return;
        }

        gridElement.innerHTML = this.state.exams.map(e => `
            <div class="glass-panel rounded-2xl p-6 hover-lift flex flex-col h-full border-t-4 ${e.status === 'Active' ? 'border-t-primary-500' : 'border-t-slate-300'}">
                <div class="flex justify-between items-start mb-4">
                    <div>
                        <span class="text-xs font-semibold ${e.status === 'Active' ? 'text-primary-600' : 'text-slate-500'} tracking-wider uppercase">${e.subject}</span>
                        <h3 class="text-lg font-bold text-slate-800 leading-tight mt-1">${e.name}</h3>
                    </div>
                </div>
                
                <div class="grid grid-cols-2 gap-4 mt-2 mb-6 text-sm">
                    <div class="flex flex-col">
                        <span class="text-slate-400 text-xs">Duration</span>
                        <span class="font-medium text-slate-700 mt-0.5">${e.duration} Mins</span>
                    </div>
                    <div class="flex flex-col">
                        <span class="text-slate-400 text-xs">Attempts</span>
                        <span class="font-medium text-slate-700 mt-0.5">1/1</span>
                    </div>
                </div>
                
                <div class="mt-auto pt-4 border-t border-slate-100 flex gap-2">
                    ${e.status === 'Active' ? 
                        `<button class="premium-btn w-full text-sm" onclick="StudentModule.takeExam('${e.id}')">Start Exam</button>` : 
                        `<button class="premium-btn-outline w-full text-sm opacity-50 cursor-not-allowed" disabled>Not Open Yet</button>`
                    }
                </div>
            </div>
        `).join('');
    },

    takeExam(examId) {
        const exam = this.state.exams.find(e => e.id === examId);
        
        // Anti-cheat prompt confirmation
        const confirmed = confirm("ExamGuard Anti-Cheat will be active.\\n- Do not switch tabs\\n- Do not exit fullscreen\\n- Do not use right-click or copy/paste\\n\\nAre you ready to begin?");
        
        if (confirmed) {
            App.navigate('take_exam', exam);
        }
    }
};
