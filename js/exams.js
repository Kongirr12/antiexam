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
        App.container.innerHTML = `
            <div class="flex items-center gap-4 mb-8">
                <button onclick="ExamsModule.render()" class="p-2 rounded-lg hover:bg-slate-200 transition-colors">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                </button>
                <h1 class="text-3xl font-bold text-slate-800">Create New Exam</h1>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <!-- Main Form -->
                <div class="lg:col-span-2 space-y-6">
                    <div class="glass-panel p-6 rounded-2xl">
                        <h3 class="text-lg font-bold text-slate-800 mb-4">Basic Information</h3>
                        <form id="createExamForm" class="space-y-4" onsubmit="ExamsModule.saveExam(event)">
                            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div class="sm:col-span-2">
                                    <label class="block text-sm font-medium text-slate-700 mb-1">Exam Name</label>
                                    <input type="text" id="examName" class="premium-input" placeholder="e.g. Midterm Mathematics" required>
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-slate-700 mb-1">Subject</label>
                                    <input type="text" id="examSubject" class="premium-input" placeholder="e.g. Math 101" required>
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-slate-700 mb-1">Status</label>
                                    <select id="examStatus" class="premium-input">
                                        <option value="Draft">Draft</option>
                                        <option value="Active">Active</option>
                                    </select>
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-slate-700 mb-1">Duration (Minutes)</label>
                                    <input type="number" id="examDuration" class="premium-input" value="60" min="5" required>
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-slate-700 mb-1">Passing Score (%)</label>
                                    <input type="number" id="examPassing" class="premium-input" value="50" min="1" max="100" required>
                                </div>
                            </div>
                        </form>
                    </div>

                    <div class="glass-panel p-6 rounded-2xl">
                        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
                            <h3 class="text-lg font-bold text-slate-800">Select Questions</h3>
                            <div class="flex gap-2">
                                <button type="button" class="premium-btn-outline text-xs py-1.5 px-3" onclick="ExamsModule.showQuickAddModal()">+ New Question</button>
                                <button type="button" class="text-primary-600 text-sm font-semibold hover:text-primary-700" onclick="ExamsModule.loadQuestions()">Refresh</button>
                            </div>
                        </div>
                        <div id="questionSelectionList" class="space-y-2 max-h-96 overflow-y-auto pr-2">
                            <div class="text-center py-8 text-slate-500">
                                <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600 mx-auto mb-2"></div>
                                Loading question bank...
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Summary Sidebar -->
                <div class="lg:col-span-1">
                    <div class="glass-panel p-6 rounded-2xl sticky top-24">
                        <h3 class="text-lg font-bold text-slate-800 mb-4">Summary</h3>
                        <div class="space-y-4 mb-6">
                            <div class="flex justify-between text-sm">
                                <span class="text-slate-500">Selected Questions:</span>
                                <span class="font-bold text-slate-800" id="selectedQCount">0</span>
                            </div>
                            <div class="flex justify-between text-sm">
                                <span class="text-slate-500">Total Points:</span>
                                <span class="font-bold text-primary-600" id="selectedQPoints">0</span>
                            </div>
                        </div>
                        <button type="submit" form="createExamForm" class="premium-btn w-full py-3" id="saveExamBtn">
                            Create Exam
                        </button>
                    </div>
                </div>
            </div>

            <!-- Quick Add Question Modal -->
            <div id="quick-add-modal" class="fixed inset-0 z-[100] hidden items-center justify-center p-4">
                <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onclick="ExamsModule.closeQuickAddModal()"></div>
                <div class="glass-panel w-full max-w-2xl rounded-2xl p-6 relative z-10 shadow-2xl animate-fade-in max-h-[90vh] overflow-y-auto">
                    <h3 class="text-xl font-bold text-slate-800 mb-4">Quick Add Question</h3>
                    <form id="quickAddForm" onsubmit="ExamsModule.saveQuickQuestion(event)" class="space-y-4">
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-slate-700 mb-1">Type</label>
                                <select id="qaType" class="premium-input" onchange="ExamsModule.toggleQuickAddType()" required>
                                    <option value="Multiple Choice">Multiple Choice</option>
                                    <option value="True/False">True/False</option>
                                    <option value="Essay">Essay</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-slate-700 mb-1">Points</label>
                                <input type="number" id="qaScore" class="premium-input" value="1" min="1" step="0.5" required>
                            </div>
                        </div>
                        <div>
                            <div class="flex justify-between items-center mb-1">
                                <label class="block text-sm font-medium text-slate-700">Question Content</label>
                                <label class="cursor-pointer text-xs font-bold text-primary-600 hover:text-primary-700 flex items-center gap-1">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                    Insert Image
                                    <!-- Use QuestionsModule if loaded, otherwise fallback or duplicate -->
                                    <input type="file" accept="image/*" class="hidden" onchange="window.QuestionsModule ? window.QuestionsModule.handleImageUpload(event, 'qaContent') : ExamsModule.handleImageUpload(event, 'qaContent')">
                                </label>
                            </div>
                            <textarea id="qaContent" class="premium-input min-h-[80px]" required></textarea>
                        </div>
                        <div id="qaDynamicFields" class="p-4 bg-slate-50/50 rounded-xl border border-slate-100"></div>
                        <div class="flex justify-end gap-3 pt-4 border-t border-slate-100">
                            <button type="button" class="premium-btn-outline" onclick="ExamsModule.closeQuickAddModal()">Cancel</button>
                            <button type="submit" class="premium-btn" id="saveQuickQuestionBtn">Save & Select</button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        this.loadQuestions();
    },

    async loadQuestions() {
        const container = document.getElementById('questionSelectionList');
        try {
            const questions = await API.post('getQuestions');
            if (questions.length === 0) {
                container.innerHTML = `<p class="text-center text-slate-500 py-4">No questions found in the Question Bank.</p>`;
                return;
            }

            container.innerHTML = questions.map(q => `
                <label class="flex items-start gap-3 p-3 rounded-xl border border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors">
                    <input type="checkbox" class="mt-1 w-4 h-4 text-primary-600 rounded border-slate-300 exam-question-checkbox" 
                           value="${q.id}" data-score="${q.score}" onchange="ExamsModule.updateSummary()">
                    <div class="flex-grow">
                        <div class="flex justify-between items-center mb-1">
                            <span class="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">${q.type}</span>
                            <span class="text-xs font-bold text-primary-600">${q.score} pts</span>
                        </div>
                        <p class="text-sm text-slate-700 line-clamp-2">${q.content}</p>
                    </div>
                </label>
            `).join('');
            this.updateSummary();
        } catch(e) {
            container.innerHTML = `<p class="text-center text-danger-500 py-4">Failed to load questions.</p>`;
        }
    },

    updateSummary() {
        const checkboxes = document.querySelectorAll('.exam-question-checkbox:checked');
        let totalPoints = 0;
        checkboxes.forEach(cb => {
            totalPoints += parseFloat(cb.dataset.score || 0);
        });
        
        document.getElementById('selectedQCount').innerText = checkboxes.length;
        document.getElementById('selectedQPoints').innerText = totalPoints;
    },

    // --- Quick Add Question Logic ---
    showQuickAddModal() {
        const modal = document.getElementById('quick-add-modal');
        modal.classList.remove('hidden');
        modal.classList.add('flex');
        this.toggleQuickAddType();
    },

    closeQuickAddModal() {
        const modal = document.getElementById('quick-add-modal');
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    },

    toggleQuickAddType() {
        const type = document.getElementById('qaType').value;
        const container = document.getElementById('qaDynamicFields');
        let html = '';

        if (type === 'Multiple Choice') {
            html = `
                <div class="space-y-2">
                    <div class="flex items-center gap-2"><input type="radio" name="qaMcqCorrect" value="A" required class="w-4 h-4"><span class="font-bold text-xs">A</span><input type="text" class="premium-input py-2 text-sm qa-mcq-option" required></div>
                    <div class="flex items-center gap-2"><input type="radio" name="qaMcqCorrect" value="B"><span class="font-bold text-xs">B</span><input type="text" class="premium-input py-2 text-sm qa-mcq-option" required></div>
                    <div class="flex items-center gap-2"><input type="radio" name="qaMcqCorrect" value="C"><span class="font-bold text-xs">C</span><input type="text" class="premium-input py-2 text-sm qa-mcq-option" required></div>
                    <div class="flex items-center gap-2"><input type="radio" name="qaMcqCorrect" value="D"><span class="font-bold text-xs">D</span><input type="text" class="premium-input py-2 text-sm qa-mcq-option" required></div>
                </div>
            `;
        } else if (type === 'True/False') {
            html = `
                <div class="flex gap-4">
                    <label class="flex items-center gap-2"><input type="radio" name="qaTfCorrect" value="True" required class="w-4 h-4"><span class="font-bold text-sm">True</span></label>
                    <label class="flex items-center gap-2"><input type="radio" name="qaTfCorrect" value="False"><span class="font-bold text-sm">False</span></label>
                </div>
            `;
        } else if (type === 'Essay') {
            html = `<textarea id="qaEssayKeywords" class="premium-input min-h-[60px] text-sm" placeholder="Grading keywords..."></textarea>`;
        }
        container.innerHTML = html;
    },

    async saveQuickQuestion(e) {
        e.preventDefault();
        const btn = document.getElementById('saveQuickQuestionBtn');
        btn.innerHTML = `<div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mx-auto"></div>`;
        btn.disabled = true;

        const type = document.getElementById('qaType').value;
        const payload = {
            type: type,
            content: document.getElementById('qaContent').value,
            score: document.getElementById('qaScore').value,
            options: null,
            correctAnswer: null
        };

        if (type === 'Multiple Choice') {
            const opts = document.querySelectorAll('.qa-mcq-option');
            payload.options = [opts[0].value, opts[1].value, opts[2].value, opts[3].value];
            const correctRadio = document.querySelector('input[name="qaMcqCorrect"]:checked');
            if (correctRadio) {
                const map = {'A':0, 'B':1, 'C':2, 'D':3};
                payload.correctAnswer = payload.options[map[correctRadio.value]];
            }
        } else if (type === 'True/False') {
            payload.options = ['True', 'False'];
            const correctRadio = document.querySelector('input[name="qaTfCorrect"]:checked');
            if (correctRadio) payload.correctAnswer = correctRadio.value;
        } else if (type === 'Essay') {
            payload.correctAnswer = document.getElementById('qaEssayKeywords').value;
        }

        try {
            const newQuestion = await API.post('createQuestion', payload);
            
            // Reload questions list
            await this.loadQuestions();
            
            // Auto-check the newly created question
            setTimeout(() => {
                const checkbox = document.querySelector(`.exam-question-checkbox[value="${newQuestion.id}"]`);
                if (checkbox) {
                    checkbox.checked = true;
                    this.updateSummary();
                    
                    // Flash effect to show it was added
                    checkbox.closest('label').classList.add('bg-primary-50', 'border-primary-300');
                    setTimeout(() => {
                        checkbox.closest('label').classList.remove('bg-primary-50', 'border-primary-300');
                    }, 2000);
                }
            }, 500);

            this.closeQuickAddModal();
            document.getElementById('quickAddForm').reset();
        } catch (error) {
            alert('Failed to save question: ' + error.message);
        } finally {
            btn.innerHTML = `Save & Select`;
            btn.disabled = false;
        }
    },

    handleImageUpload(event, targetId) {
        const file = event.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 600;
                let width = img.width;
                let height = img.height;
                
                if (width > MAX_WIDTH) {
                    height *= MAX_WIDTH / width;
                    width = MAX_WIDTH;
                }
                
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                
                const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
                const textarea = document.getElementById(targetId);
                const imageMarkdown = `\n<img src="${dataUrl}" class="max-w-full rounded-lg mt-3 border border-slate-200">\n`;
                textarea.value = textarea.value + imageMarkdown;
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
        event.target.value = ''; 
    },
    // -----------------------------

    async saveExam(e) {
        e.preventDefault();
        const btn = document.getElementById('saveExamBtn');
        btn.innerHTML = `<div class="animate-spin rounded-full h-5 w-5 border-b-2 border-white mx-auto"></div>`;
        btn.disabled = true;

        const selectedQ = Array.from(document.querySelectorAll('.exam-question-checkbox:checked')).map(cb => cb.value);
        
        if (selectedQ.length === 0 && !confirm("You haven't selected any questions. Create exam anyway?")) {
            btn.innerHTML = `Create Exam`;
            btn.disabled = false;
            return;
        }

        const data = {
            name: document.getElementById('examName').value,
            subject: document.getElementById('examSubject').value,
            status: document.getElementById('examStatus').value,
            duration: document.getElementById('examDuration').value,
            passing: document.getElementById('examPassing').value,
            questionIds: selectedQ
        };

        try {
            await API.post('createExam', data);
            App.navigate('exams');
        } catch (error) {
            alert('Failed to create exam: ' + error.message);
            btn.innerHTML = `Create Exam`;
            btn.disabled = false;
        }
    }
};
