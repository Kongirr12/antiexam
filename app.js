/**
 * ExamGuard - Main Application Logic (Routing & State)
 */
const App = {
    state: {
        currentUser: null,
        currentRoute: 'login'
    },

    init() {
        this.container = document.getElementById('app-container');
        this.navActions = document.getElementById('nav-actions');
        
        // Check local storage for session
        const savedUser = localStorage.getItem('examguard_user');
        if (savedUser) {
            this.state.currentUser = JSON.parse(savedUser);
            this.navigate('dashboard');
        } else {
            this.navigate('login');
        }
    },

    navigate(route, data = null) {
        this.state.currentRoute = route;
        this.updateNav();
        
        // Add fade out animation
        this.container.style.opacity = 0;
        
        setTimeout(() => {
            this.renderRoute(route, data);
            // Add fade in
            this.container.classList.add('animate-fade-in');
            setTimeout(() => {
                this.container.classList.remove('animate-fade-in');
                this.container.style.opacity = 1;
            }, 400);
        }, 150);
    },

    updateNav() {
        if (!this.state.currentUser) {
            this.navActions.innerHTML = ``;
            return;
        }

        this.navActions.innerHTML = `
            <div class="flex items-center gap-4">
                <span class="text-sm font-medium text-slate-600 hidden sm:block">
                    Welcome, ${this.state.currentUser.name} 
                    <span class="ml-2 px-2 py-0.5 rounded-full bg-primary-100 text-primary-700 text-xs font-bold">${this.state.currentUser.role}</span>
                </span>
                <button onclick="App.logout()" class="text-sm text-slate-500 hover:text-danger-600 transition-colors font-medium">
                    Logout
                </button>
            </div>
        `;
    },

    logout() {
        this.state.currentUser = null;
        localStorage.removeItem('examguard_user');
        this.navigate('login');
    },

    renderRoute(route, data) {
        switch (route) {
            case 'login':
                this.renderLogin();
                break;
            case 'dashboard':
                if(this.state.currentUser.role === 'Admin' || this.state.currentUser.role === 'Teacher') {
                    this.renderAdminDashboard();
                } else {
                    this.renderStudentDashboard();
                }
                break;
            case 'users':
                this.renderUserManagement();
                break;
            case 'exams':
                this.renderExamManagement();
                break;
            case 'images':
                this.renderImageLibrary();
                break;
            case 'questions':
                this.renderQuestionBank();
                break;
            case 'take_exam':
                this.renderTakeExam(data);
                break;
            default:
                this.container.innerHTML = `<h2 class="text-2xl font-bold text-center mt-20">404 - Not Found</h2>`;
        }
    },

    // ====================================================
    // LOGIN VIEW
    // ====================================================
    renderLogin() {
        this.container.innerHTML = `
            <div class="flex min-h-[80vh] items-center justify-center">
                <div class="glass-panel w-full max-w-md rounded-2xl p-8 shadow-2xl relative overflow-hidden">
                    
                    <!-- Decorative background element -->
                    <div class="absolute -top-24 -right-24 w-48 h-48 bg-primary-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
                    <div class="absolute -bottom-24 -left-24 w-48 h-48 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
                    
                    <div class="relative z-10 text-center mb-8">
                        <div class="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center text-white font-bold text-3xl shadow-lg shadow-primary-500/30 mb-4">
                            E
                        </div>
                        <h1 class="text-2xl font-bold text-slate-800">Welcome to ExamGuard</h1>
                        <p class="text-slate-500 mt-2 text-sm">Sign in to continue</p>
                    </div>
                    
                    <form id="loginForm" class="relative z-10 space-y-5" onsubmit="App.handleLogin(event)">
                        <div>
                            <label class="block text-sm font-medium text-slate-700 mb-1">Email or User ID</label>
                            <input type="text" id="loginId" class="premium-input" placeholder="admin@examguard.com" required>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-slate-700 mb-1">PIN / Password</label>
                            <input type="password" id="loginPassword" class="premium-input" placeholder="••••••••" required>
                        </div>
                        <div class="pt-2">
                            <button type="submit" class="premium-btn w-full py-3 text-base" id="loginBtn">
                                Sign In
                            </button>
                        </div>
                    </form>

                    <!-- Demo hints -->
                    <div class="mt-8 pt-6 border-t border-slate-100 text-center">
                        <p class="text-xs text-slate-400">For demo, just click Sign In (simulates Admin login)</p>
                    </div>
                </div>
            </div>
        `;
    },

    async handleLogin(e) {
        e.preventDefault();
        const btn = document.getElementById('loginBtn');
        const originalText = btn.innerHTML;
        btn.innerHTML = `<div class="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>`;
        btn.disabled = true;

        try {
            const data = await API.post('login', {
                id: document.getElementById('loginId').value,
                password: document.getElementById('loginPassword').value
            });
            
            this.state.currentUser = data.user;
            localStorage.setItem('examguard_user', JSON.stringify(data.user));
            this.navigate('dashboard');
        } catch (error) {
            alert('Login failed: ' + error.message);
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    },

    // ====================================================
    // ADMIN DASHBOARD
    // ====================================================
    renderAdminDashboard() {
        this.container.innerHTML = `
            <div class="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 class="text-3xl font-bold text-slate-800 tracking-tight">Admin Dashboard</h1>
                    <p class="text-slate-500 mt-1">Manage users, exams, and settings.</p>
                </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <!-- Stats Cards -->
                <div class="glass-panel p-6 rounded-2xl hover-lift cursor-pointer" onclick="App.navigate('users')">
                    <div class="flex items-center gap-4">
                        <div class="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                        </div>
                        <div>
                            <p class="text-sm font-medium text-slate-500">Total Users</p>
                            <p class="text-2xl font-bold text-slate-800">1,248</p>
                        </div>
                    </div>
                </div>

                <div class="glass-panel p-6 rounded-2xl hover-lift cursor-pointer" onclick="App.navigate('exams')">
                    <div class="flex items-center gap-4">
                        <div class="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>
                        </div>
                        <div>
                            <p class="text-sm font-medium text-slate-500">Active Exams</p>
                            <p class="text-2xl font-bold text-slate-800">12</p>
                        </div>
                    </div>
                </div>

                <div class="glass-panel p-6 rounded-2xl hover-lift">
                    <div class="flex items-center gap-4">
                        <div class="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        </div>
                        <div>
                            <p class="text-sm font-medium text-slate-500">Submissions</p>
                            <p class="text-2xl font-bold text-slate-800">842</p>
                        </div>
                    </div>
                </div>

                <div class="glass-panel p-6 rounded-2xl hover-lift">
                    <div class="flex items-center gap-4">
                        <div class="w-12 h-12 rounded-xl bg-rose-100 flex items-center justify-center text-rose-600">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                        </div>
                        <div>
                            <p class="text-sm font-medium text-slate-500">Cheat Alerts</p>
                            <p class="text-2xl font-bold text-rose-600">3</p>
                        </div>
                    </div>
                </div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <!-- Quick Actions -->
                <div class="glass-panel rounded-2xl p-6">
                    <h3 class="text-lg font-bold text-slate-800 mb-4">Quick Actions</h3>
                    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <button onclick="App.navigate('users')" class="flex flex-col items-center justify-center gap-3 p-4 rounded-xl border border-slate-100 bg-white hover:border-primary-200 hover:shadow-md transition-all group">
                            <div class="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-primary-50 group-hover:text-primary-600 transition-colors">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path></svg>
                            </div>
                            <span class="text-sm font-medium text-slate-700">Add User</span>
                        </button>
                        <button onclick="App.navigate('exams')" class="flex flex-col items-center justify-center gap-3 p-4 rounded-xl border border-slate-100 bg-white hover:border-primary-200 hover:shadow-md transition-all group">
                            <div class="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-primary-50 group-hover:text-primary-600 transition-colors">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                            </div>
                            <span class="text-sm font-medium text-slate-700">Create Exam</span>
                        </button>
                        <button onclick="App.navigate('questions')" class="flex flex-col items-center justify-center gap-3 p-4 rounded-xl border border-slate-100 bg-white hover:border-primary-200 hover:shadow-md transition-all group">
                            <div class="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-primary-50 group-hover:text-primary-600 transition-colors">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            </div>
                            <span class="text-sm font-medium text-slate-700">Questions</span>
                        </button>
                        <button onclick="App.navigate('images')" class="flex flex-col items-center justify-center gap-3 p-4 rounded-xl border border-slate-100 bg-white hover:border-primary-200 hover:shadow-md transition-all group">
                            <div class="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-primary-50 group-hover:text-primary-600 transition-colors">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                            </div>
                            <span class="text-sm font-medium text-slate-700">Images</span>
                        </button>
                    </div>
                </div>

                <!-- Recent Activity -->
                <div class="glass-panel rounded-2xl p-6">
                    <h3 class="text-lg font-bold text-slate-800 mb-4">Live Activity</h3>
                    <div class="space-y-4">
                        <div class="flex items-center gap-3">
                            <div class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                            <p class="text-sm text-slate-600"><span class="font-medium text-slate-800">John Doe</span> submitted Midterm Math.</p>
                            <span class="text-xs text-slate-400 ml-auto">2 min ago</span>
                        </div>
                        <div class="flex items-center gap-3">
                            <div class="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></div>
                            <p class="text-sm text-slate-600"><span class="font-medium text-slate-800">Mike Smith</span> triggered Tab Switch alert!</p>
                            <span class="text-xs text-slate-400 ml-auto">5 min ago</span>
                        </div>
                        <div class="flex items-center gap-3">
                            <div class="w-2 h-2 rounded-full bg-blue-500"></div>
                            <p class="text-sm text-slate-600"><span class="font-medium text-slate-800">Jane Smith</span> started Physics Quiz.</p>
                            <span class="text-xs text-slate-400 ml-auto">12 min ago</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    // View stubs to be implemented next
    renderUserManagement() {
        this.container.innerHTML = `
            <div class="flex items-center gap-4 mb-8">
                <button onclick="App.navigate('dashboard')" class="p-2 rounded-lg hover:bg-slate-200 transition-colors">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                </button>
                <h1 class="text-3xl font-bold text-slate-800">User Management</h1>
            </div>
            <div class="flex justify-center items-center h-64 glass-panel rounded-2xl">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                <span class="ml-3 text-slate-500">Loading User Module...</span>
            </div>
        `;
        // We will load the users.js script dynamically later
        setTimeout(() => {
            if(window.UsersModule) {
                window.UsersModule.render();
            } else {
                const script = document.createElement('script');
                script.src = 'js/users.js';
                script.onload = () => window.UsersModule.render();
                document.body.appendChild(script);
            }
        }, 500);
    },

    renderExamManagement() {
        this.container.innerHTML = `
            <div class="flex items-center gap-4 mb-8">
                <button onclick="App.navigate('dashboard')" class="p-2 rounded-lg hover:bg-slate-200 transition-colors">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                </button>
                <h1 class="text-3xl font-bold text-slate-800">Exam Management</h1>
            </div>
            <div class="flex justify-center items-center h-64 glass-panel rounded-2xl">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                <span class="ml-3 text-slate-500">Loading Exam Module...</span>
            </div>
        `;
        setTimeout(() => {
            if(window.ExamsModule) {
                window.ExamsModule.render();
            } else {
                const script = document.createElement('script');
                script.src = 'js/exams.js';
                script.onload = () => window.ExamsModule.render();
                document.body.appendChild(script);
            }
        }, 500);
    },

    renderImageLibrary() {
        this.container.innerHTML = `
            <div class="flex items-center gap-4 mb-8">
                <button onclick="App.navigate('dashboard')" class="p-2 rounded-lg hover:bg-slate-200 transition-colors">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                </button>
                <h1 class="text-3xl font-bold text-slate-800">Image Library</h1>
            </div>
            <div class="flex justify-center items-center h-64 glass-panel rounded-2xl">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
        `;
        setTimeout(() => {
            if(window.ImagesModule) {
                window.ImagesModule.render();
            } else {
                const script = document.createElement('script');
                script.src = 'js/images.js';
                script.onload = () => window.ImagesModule.render();
                document.body.appendChild(script);
            }
        }, 500);
    },

    renderQuestionBank() {
        this.container.innerHTML = `
            <div class="flex items-center gap-4 mb-8">
                <button onclick="App.navigate('dashboard')" class="p-2 rounded-lg hover:bg-slate-200 transition-colors">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                </button>
                <h1 class="text-3xl font-bold text-slate-800">Question Bank</h1>
            </div>
            <div class="flex justify-center items-center h-64 glass-panel rounded-2xl">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
        `;
        setTimeout(() => {
            if(window.QuestionsModule) {
                window.QuestionsModule.render();
            } else {
                const script = document.createElement('script');
                script.src = 'js/questions.js';
                script.onload = () => window.QuestionsModule.render();
                document.body.appendChild(script);
            }
        }, 500);
    },

    renderStudentDashboard() {
        this.container.innerHTML = `
            <div class="flex items-center gap-4 mb-8">
                <h1 class="text-3xl font-bold text-slate-800">Student Dashboard</h1>
            </div>
            <div class="flex justify-center items-center h-64 glass-panel rounded-2xl">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
        `;
        setTimeout(() => {
            if(window.StudentModule) {
                window.StudentModule.render();
            } else {
                const script = document.createElement('script');
                script.src = 'js/student.js';
                script.onload = () => window.StudentModule.render();
                document.body.appendChild(script);
            }
        }, 500);
    },

    renderTakeExam(examData) {
        this.container.innerHTML = `
            <div class="flex justify-center items-center h-screen fixed inset-0 z-50 bg-slate-50">
                <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                <span class="ml-4 font-bold text-slate-700">Initializing Secure Exam Environment...</span>
            </div>
        `;
        
        // Hide navbar during exam
        document.getElementById('navbar').style.display = 'none';

        setTimeout(() => {
            if(window.ExamRunner) {
                window.ExamRunner.start(examData);
            } else {
                // Load anticheat engine first, then exam runner
                const acScript = document.createElement('script');
                acScript.src = 'js/anticheat.js';
                document.head.appendChild(acScript);
                
                const script = document.createElement('script');
                script.src = 'js/exam_runner.js';
                script.onload = () => window.ExamRunner.start(examData);
                document.body.appendChild(script);
            }
        }, 800);
    }
};

// Initialize App when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
