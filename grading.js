/**
 * Module 9: Grading System
 */
window.GradingModule = {
    state: {
        pending: [],
        isLoading: true
    },

    async render() {
        App.container.innerHTML = `
            <div class="flex items-center gap-4 mb-8">
                <button onclick="App.navigate('dashboard')" class="p-2 rounded-lg hover:bg-slate-200 transition-colors">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                </button>
                <div>
                    <h1 class="text-3xl font-bold text-slate-800 tracking-tight">Manual Grading</h1>
                    <p class="text-slate-500 text-sm">Review and grade subjective questions (Essays/Fill-in-the-blanks).</p>
                </div>
            </div>

            <!-- Loader -->
            <div id="grading-loader" class="flex justify-center items-center py-12">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>

            <!-- Content -->
            <div id="grading-content" class="hidden">
                <div class="glass-panel p-4 rounded-xl mb-6 flex justify-between items-center bg-blue-50/50 border border-blue-100">
                    <p class="text-blue-800 text-sm font-medium">Auto-grading for Objective questions is completed instantly upon submission.</p>
                </div>

                <div class="space-y-6" id="grading-list">
                    <!-- Grading cards injected here -->
                </div>
            </div>
        `;

        await this.loadPendingGrades();
    },

    async loadPendingGrades() {
        try {
            this.state.pending = await API.post('getPendingGrades');
            document.getElementById('grading-loader').classList.add('hidden');
            
            const content = document.getElementById('grading-content');
            content.classList.remove('hidden');
            
            this.renderList(document.getElementById('grading-list'));
            
            // Render Math inside questions
            if (window.renderMathInElement) {
                renderMathInElement(content, {
                    delimiters: [ {left: '$$', right: '$$', display: true}, {left: '$', right: '$', display: false} ]
                });
            }
        } catch (error) {
            console.error("Failed to load grades", error);
            document.getElementById('grading-loader').innerHTML = `<p class="text-danger-500">Failed to load pending grades.</p>`;
        }
    },

    renderList(listElement) {
        if (this.state.pending.length === 0) {
            listElement.innerHTML = `<div class="glass-panel p-12 text-center text-slate-500 rounded-2xl"><p class="text-lg">No pending answers to grade.</p><p class="text-sm mt-1">All caught up!</p></div>`;
            return;
        }

        listElement.innerHTML = this.state.pending.map((p, index) => `
            <div class="glass-panel p-6 rounded-2xl relative" id="grade-card-${index}">
                <div class="flex justify-between items-start mb-4 border-b border-slate-100 pb-4">
                    <div>
                        <span class="text-xs font-bold text-slate-400 tracking-wider uppercase">${p.examName}</span>
                        <h3 class="font-bold text-slate-700 text-lg">${p.studentName}</h3>
                    </div>
                    <span class="text-sm font-bold text-slate-400">Max Score: <span class="text-primary-600">${p.maxScore}</span></span>
                </div>
                
                <div class="mb-6">
                    <p class="text-sm font-bold text-slate-600 mb-2">Question:</p>
                    <div class="bg-slate-50 p-4 rounded-xl text-slate-800 text-sm latex-content border border-slate-100">${p.question}</div>
                </div>
                
                <div class="mb-6">
                    <p class="text-sm font-bold text-slate-600 mb-2">Student's Answer:</p>
                    <div class="bg-white p-4 rounded-xl text-slate-800 text-sm border border-slate-200 whitespace-pre-wrap">${p.answer}</div>
                </div>
                
                <div class="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <label class="text-sm font-bold text-slate-700">Award Score:</label>
                    <input type="number" min="0" max="${p.maxScore}" step="0.5" class="premium-input w-24 text-center font-bold text-primary-600" id="score-input-${index}">
                    <button class="premium-btn ml-auto" onclick="GradingModule.saveGrade(${index}, '${p.id}')">Submit Grade</button>
                </div>
            </div>
        `).join('');
    },

    saveGrade(index, answerId) {
        const input = document.getElementById(`score-input-${index}`);
        const score = input.value;
        if (score === '') {
            alert('Please enter a score before submitting.');
            return;
        }

        const card = document.getElementById(`grade-card-${index}`);
        card.innerHTML = `
            <div class="flex items-center justify-center h-40 text-emerald-600 font-bold gap-3">
                <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                Grade saved successfully! (${score} pts)
            </div>
        `;
        
        // Hide card after a short delay
        setTimeout(() => {
            card.style.display = 'none';
        }, 2000);
    }
};
