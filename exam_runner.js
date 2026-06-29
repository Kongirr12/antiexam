/**
 * Module 6b: Student Exam Interface & Runner
 */
window.ExamRunner = {
    exam: null,
    questions: [],
    currentQIndex: 0,
    answers: {},
    timerInterval: null,
    timeLeft: 0,

    async start(examData) {
        this.exam = examData;
        this.timeLeft = this.exam.duration * 60; // Convert to seconds
        
        // Mock load questions for this exam
        this.questions = await API.post('getQuestions');
        
        this.renderLayout();
        this.startTimer();
        
        // Initialize Anti-Cheat
        if(window.AntiCheat) {
            window.AntiCheat.init(3);
        }
    },

    renderLayout() {
        // Clear main container styling to take full screen
        App.container.className = 'w-full h-screen fixed inset-0 z-40 bg-slate-50 flex flex-col overflow-hidden';
        
        App.container.innerHTML = `
            <!-- Header -->
            <header class="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-6 shrink-0 z-10 shadow-sm">
                <div>
                    <h1 class="text-lg font-bold text-slate-800">${this.exam.name}</h1>
                    <p class="text-xs text-slate-500">${this.exam.subject} | ID: ${this.exam.id}</p>
                </div>
                <div class="flex items-center gap-6">
                    <div class="text-center">
                        <span class="text-[10px] uppercase font-bold tracking-widest text-slate-400 block mb-0.5">Time Remaining</span>
                        <div id="exam-timer" class="text-2xl font-mono font-bold text-slate-800 tabular-nums leading-none">
                            00:00:00
                        </div>
                    </div>
                    <button class="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white px-6 py-2 rounded-lg font-bold shadow-md shadow-emerald-500/20 transition-all" onclick="ExamRunner.confirmSubmit()">
                        Submit Exam
                    </button>
                </div>
            </header>

            <div class="flex flex-1 overflow-hidden">
                <!-- Main Question Area -->
                <main class="flex-1 overflow-y-auto p-6 md:p-10 relative" id="question-container">
                    <!-- Rendered by renderQuestion() -->
                </main>

                <!-- Navigation Sidebar -->
                <aside class="w-64 lg:w-80 bg-white border-l border-slate-200 flex flex-col shrink-0">
                    <div class="p-4 border-b border-slate-100">
                        <h3 class="font-bold text-slate-700">Question Palette</h3>
                        <div class="flex items-center gap-3 mt-2 text-xs text-slate-500">
                            <span class="flex items-center gap-1"><div class="w-3 h-3 rounded-full bg-primary-500"></div> Answered</span>
                            <span class="flex items-center gap-1"><div class="w-3 h-3 rounded-full border-2 border-slate-200"></div> Unanswered</span>
                        </div>
                    </div>
                    <div class="flex-1 overflow-y-auto p-4">
                        <div class="grid grid-cols-5 gap-2" id="palette-grid">
                            ${this.questions.map((_, i) => `
                                <button id="nav-btn-${i}" onclick="ExamRunner.goToQuestion(${i})" class="w-10 h-10 rounded-lg text-sm font-medium transition-colors border-2 border-slate-200 text-slate-600 hover:border-primary-400">
                                    ${i + 1}
                                </button>
                            `).join('')}
                        </div>
                    </div>
                </aside>
            </div>
        `;
        
        this.goToQuestion(0);
    },

    goToQuestion(index) {
        this.currentQIndex = index;
        const q = this.questions[index];
        const container = document.getElementById('question-container');
        
        // Highlight active nav button
        document.querySelectorAll('#palette-grid button').forEach((btn, i) => {
            if (i === index) {
                btn.classList.add('ring-2', 'ring-primary-500', 'ring-offset-1');
            } else {
                btn.classList.remove('ring-2', 'ring-primary-500', 'ring-offset-1');
            }
        });

        // Determine input UI based on question type
        let inputUI = '';
        if (q.type === 'SingleChoice' || q.type === 'MultipleChoice') {
            const inputType = q.type === 'SingleChoice' ? 'radio' : 'checkbox';
            const options = ['Option A', 'Option B', 'Option C', 'Option D']; // Mock
            inputUI = options.map((opt, i) => `
                <label class="flex items-center p-4 border border-slate-200 rounded-xl mb-3 cursor-pointer hover:bg-slate-50 transition-colors ${this.answers[q.id] === opt ? 'border-primary-500 bg-primary-50/30' : ''}">
                    <input type="${inputType}" name="q_${q.id}" value="${opt}" class="w-5 h-5 text-primary-600 focus:ring-primary-500 border-gray-300 ${inputType === 'radio' ? 'rounded-full' : 'rounded'}" onchange="ExamRunner.saveAnswer('${q.id}', this.value)" ${this.answers[q.id] === opt ? 'checked' : ''}>
                    <span class="ml-3 text-slate-700 font-medium latex-content">${opt}</span>
                </label>
            `).join('');
        } else if (q.type === 'Essay') {
            inputUI = `
                <textarea rows="8" class="w-full p-4 border border-slate-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none resize-y" placeholder="Write your answer here..." onchange="ExamRunner.saveAnswer('${q.id}', this.value)">${this.answers[q.id] || ''}</textarea>
            `;
        } else {
            inputUI = `<p class="text-slate-500 italic">Input UI for ${q.type} to be implemented.</p>`;
        }

        container.innerHTML = `
            <div class="max-w-3xl mx-auto pb-20 animate-fade-in">
                <div class="mb-8">
                    <div class="flex justify-between items-center mb-4">
                        <span class="text-sm font-bold text-slate-400 tracking-widest uppercase">Question ${index + 1} of ${this.questions.length}</span>
                        <span class="text-sm font-bold text-primary-600 bg-primary-50 px-3 py-1 rounded-full">${q.score} Points</span>
                    </div>
                    <h2 class="text-xl md:text-2xl font-semibold text-slate-800 leading-snug latex-content">${q.content}</h2>
                </div>
                
                <div class="mb-12">
                    ${inputUI}
                </div>
                
                <!-- Bottom Prev/Next Controls -->
                <div class="flex justify-between items-center border-t border-slate-200 pt-6 mt-8">
                    <button class="premium-btn-outline" onclick="ExamRunner.goToQuestion(${index - 1})" ${index === 0 ? 'disabled style="opacity:0.3"' : ''}>
                        Previous
                    </button>
                    ${index === this.questions.length - 1 ? 
                        `<button class="premium-btn" onclick="ExamRunner.confirmSubmit()">Review & Submit</button>` :
                        `<button class="premium-btn" onclick="ExamRunner.goToQuestion(${index + 1})">Next Question</button>`
                    }
                </div>
            </div>
        `;

        if (window.renderMathInElement) {
            renderMathInElement(container, {
                delimiters: [ {left: '$$', right: '$$', display: true}, {left: '$', right: '$', display: false} ]
            });
        }
    },

    saveAnswer(qId, val) {
        this.answers[qId] = val;
        // Update palette visual
        const btn = document.getElementById(`nav-btn-${this.currentQIndex}`);
        if(btn) {
            btn.classList.remove('border-slate-200', 'text-slate-600');
            btn.classList.add('bg-primary-500', 'text-white', 'border-primary-500');
        }
    },

    startTimer() {
        const timerDisplay = document.getElementById('exam-timer');
        this.timerInterval = setInterval(() => {
            if (this.timeLeft <= 0) {
                clearInterval(this.timerInterval);
                this.submitExam(true);
                return;
            }
            
            this.timeLeft--;
            const h = Math.floor(this.timeLeft / 3600);
            const m = Math.floor((this.timeLeft % 3600) / 60);
            const s = this.timeLeft % 60;
            
            const format = num => num.toString().padStart(2, '0');
            timerDisplay.innerText = \`\${format(h)}:\${format(m)}:\${format(s)}\`;
            
            if (this.timeLeft < 300) { // Less than 5 mins
                timerDisplay.classList.remove('text-slate-800');
                timerDisplay.classList.add('text-rose-600', 'animate-pulse');
            }
        }, 1000);
    },

    confirmSubmit() {
        const answered = Object.keys(this.answers).length;
        const total = this.questions.length;
        const msg = answered < total ? 
            \`You have only answered \${answered} out of \${total} questions. Are you sure you want to submit?\` : 
            \`Are you sure you want to submit your exam?\`;
            
        if (confirm(msg)) {
            this.submitExam(false);
        }
    },

    submitExam(isAuto = false) {
        clearInterval(this.timerInterval);
        if(window.AntiCheat) window.AntiCheat.unbindEvents();
        
        // Show submission overlay
        App.container.innerHTML = `
            <div class="flex flex-col justify-center items-center h-screen bg-slate-50 relative z-50">
                <div class="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
                    <svg class="w-10 h-10 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                </div>
                <h1 class="text-3xl font-bold text-slate-800 mb-2">Exam Submitted Successfully</h1>
                <p class="text-slate-500 mb-8">${isAuto ? 'Time ran out or cheat limit reached.' : 'You have completed the exam.'}</p>
                <button class="premium-btn" onclick="ExamRunner.exitExam()">Return to Dashboard</button>
            </div>
        `;
    },

    exitExam() {
        // Restore layout
        document.getElementById('navbar').style.display = 'block';
        App.container.className = 'flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative';
        App.navigate('dashboard');
    }
};
