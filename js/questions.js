/**
 * Module 3 & 4: Question Bank Builder and AI Prompt Generator
 */
window.QuestionsModule = {
    state: {
        questions: [],
        isLoading: true
    },
 
    async render() {
        App.container.innerHTML = `
            <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div class="flex items-center gap-4">
                    <button onclick="App.navigate('dashboard')" class="p-2 rounded-lg hover:bg-slate-200 transition-colors">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                    </button>
                    <div>
                        <h1 class="text-3xl font-bold text-slate-800 tracking-tight">Question Bank</h1>
                        <p class="text-slate-500 text-sm">Create and manage questions with LaTeX & images.</p>
                    </div>
                </div>
                <div class="flex flex-wrap gap-3">
                    <button class="premium-btn-outline gap-2" onclick="QuestionsModule.showAIPrompt()">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                        AI Prompt Gen
                    </button>
                    <button class="premium-btn gap-2" onclick="QuestionsModule.showCreateQuestion()">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
                        Add Question
                    </button>
                </div>
            </div>

            <!-- Loader -->
            <div id="questions-loader" class="flex justify-center items-center py-12">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>

            <!-- List -->
            <div id="questions-list" class="space-y-4 hidden">
                <!-- Items injected here -->
            </div>
            
            <!-- Hidden Modal (for AI Prompt Generator) -->
            <div id="ai-modal" class="fixed inset-0 z-[100] hidden items-center justify-center p-4">
                <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onclick="QuestionsModule.closeModals()"></div>
                <div class="glass-panel w-full max-w-2xl rounded-2xl p-6 relative z-10 shadow-2xl">
                    <h3 class="text-xl font-bold text-slate-800 mb-4">AI Prompt Generator (Bloom's Taxonomy)</h3>
                    <div class="space-y-4">
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label class="block text-xs font-semibold text-slate-600 mb-1">Subject / Topic</label>
                                <input type="text" id="ai-topic" class="premium-input" placeholder="e.g. World War II">
                            </div>
                            <div>
                                <label class="block text-xs font-semibold text-slate-600 mb-1">Bloom's Level</label>
                                <select id="ai-level" class="premium-input">
                                    <option>Remembering</option>
                                    <option>Understanding</option>
                                    <option>Applying</option>
                                    <option>Analyzing</option>
                                    <option>Evaluating</option>
                                    <option>Creating</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <button class="premium-btn w-full" onclick="QuestionsModule.generatePrompt()">Generate Prompt Template</button>
                        </div>
                        <div>
                            <label class="block text-xs font-semibold text-slate-600 mb-1">Generated Prompt (Copy and paste to ChatGPT)</label>
                            <textarea id="ai-output" class="premium-input h-32 font-mono text-xs" readonly></textarea>
                        </div>
                    </div>
                </div>
            </div>
        `;

        await this.loadQuestions();
    },

    async loadQuestions() {
        try {
            this.state.questions = await API.post('getQuestions');
            document.getElementById('questions-loader').classList.add('hidden');
            
            const list = document.getElementById('questions-list');
            list.classList.remove('hidden');
            this.renderList(list);
            
            // Re-render math inside list
            if (window.renderMathInElement) {
                renderMathInElement(list, {
                    delimiters: [
                        {left: '$$', right: '$$', display: true},
                        {left: '$', right: '$', display: false}
                    ]
                });
            }
        } catch (error) {
            console.error("Failed to load questions", error);
            document.getElementById('questions-loader').innerHTML = `<p class="text-danger-500">Failed to load questions.</p>`;
        }
    },

    renderList(listElement) {
        if (this.state.questions.length === 0) {
            listElement.innerHTML = `<div class="glass-panel p-8 text-center text-slate-500 rounded-2xl">No questions found.</div>`;
            return;
        }

        listElement.innerHTML = this.state.questions.map(q => `
            <div class="glass-panel p-5 rounded-xl hover-lift flex flex-col md:flex-row gap-4 border-l-4 border-l-primary-500">
                <div class="flex-grow">
                    <div class="flex items-center gap-2 mb-2">
                        <span class="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-slate-100 text-slate-600">${q.type}</span>
                        <span class="text-xs text-slate-400">ID: ${q.id}</span>
                        <span class="text-xs font-bold text-primary-600 ml-auto">${q.score} Points</span>
                    </div>
                    <div class="text-slate-800 text-sm font-medium latex-content">
                        ${q.content}
                    </div>
                </div>
                <div class="flex flex-row md:flex-col gap-2 items-center md:items-end justify-center border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-4">
                    <button class="text-slate-400 hover:text-primary-600 p-2 rounded-lg hover:bg-primary-50 transition-colors" title="Edit">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                    </button>
                    <button class="text-slate-400 hover:text-danger-600 p-2 rounded-lg hover:bg-danger-50 transition-colors" title="Delete">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    </button>
                </div>
            </div>
        `).join('');
    },

    showCreateQuestion() {
        alert("Simulating Create Question Form. Supports: Single Choice, Multiple Choice, True/False, Matching, Ordering, Grid, Fill-in-the-blanks, Essay.");
    },
    
    showAIPrompt() {
        const modal = document.getElementById('ai-modal');
        modal.classList.remove('hidden');
        modal.classList.add('flex');
    },

    closeModals() {
        document.getElementById('ai-modal').classList.add('hidden');
        document.getElementById('ai-modal').classList.remove('flex');
    },

    generatePrompt() {
        const topic = document.getElementById('ai-topic').value || '[Topic]';
        const level = document.getElementById('ai-level').value;
        const prompt = \`Act as an expert educator. Create 5 multiple-choice questions about "\${topic}" aimed at the "\${level}" level of Bloom's Taxonomy. Format the output clearly with the question, 4 options (A,B,C,D), and specify the correct answer with a brief explanation.\`;
        document.getElementById('ai-output').value = prompt;
    }
};
