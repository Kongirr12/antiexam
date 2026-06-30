/**
 * Module 10 & 11: Results, Statistics & Export
 */
window.ResultsModule = {
    state: {
        stats: null,
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
                        <h1 class="text-3xl font-bold text-slate-800 tracking-tight">ผลสอบและสถิติ (Results & Statistics)</h1>
                        <p class="text-slate-500 text-sm">วิเคราะห์ผลคะแนนและส่งออกรายงาน</p>
                    </div>
                </div>
                <div class="flex flex-wrap gap-3">
                    <button class="premium-btn-outline gap-2" onclick="ResultsModule.exportData('csv')">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                        ส่งออก CSV
                    </button>
                    <button class="premium-btn gap-2 bg-indigo-600 hover:bg-indigo-700" onclick="ResultsModule.exportData('pdf')">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
                        สร้าง PDF
                    </button>
                </div>
            </div>

            <!-- Loader -->
            <div id="results-loader" class="flex justify-center items-center py-12">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>

            <div id="results-content" class="hidden space-y-6">
                
                <!-- Filters -->
                <div class="glass-panel p-4 rounded-xl flex gap-4">
                    <select class="premium-input w-full md:w-64" id="res-exam-select" onchange="ResultsModule.updateDashboard()">
                        <option value="E01">Midterm Math</option>
                        <option value="E02">Physics Quiz</option>
                    </select>
                </div>

                <!-- Score Overview Cards -->
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4" id="stats-overview">
                    <!-- Injected -->
                </div>

                <!-- Charts Area -->
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div class="glass-panel p-6 rounded-2xl">
                        <h3 class="text-lg font-bold text-slate-800 mb-4">Score Distribution</h3>
                        <div class="relative h-64 w-full">
                            <canvas id="distChart"></canvas>
                        </div>
                    </div>
                    <div class="glass-panel p-6 rounded-2xl">
                        <h3 class="text-lg font-bold text-slate-800 mb-4">Item Analysis (Difficulty)</h3>
                        <div class="relative h-64 w-full">
                            <canvas id="itemChart"></canvas>
                        </div>
                    </div>
                </div>

                <!-- Student List -->
                <div class="glass-panel p-6 rounded-2xl">
                    <h3 class="text-lg font-bold text-slate-800 mb-4">Individual Results</h3>
                    <div class="overflow-x-auto">
                        <table class="w-full text-left text-sm text-slate-600">
                            <thead class="text-xs uppercase bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                                <tr>
                                    <th class="px-4 py-3 rounded-tl-lg">Student ID</th>
                                    <th class="px-4 py-3">Name</th>
                                    <th class="px-4 py-3">Score</th>
                                    <th class="px-4 py-3">Status</th>
                                    <th class="px-4 py-3 rounded-tr-lg">Action</th>
                                </tr>
                            </thead>
                            <tbody id="student-results-list" class="divide-y divide-slate-100">
                                <!-- Injected -->
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;

        await this.loadStats();
    },

    async loadStats() {
        try {
            // Simulated fetch
            this.state.stats = {
                overview: { avg: 72, max: 98, min: 45, passRate: 85 },
                distribution: [5, 12, 25, 40, 18], // Grades F, D, C, B, A
                itemDifficulty: [80, 45, 90, 30, 60], // Pass rate per question
                students: [
                    { id: 'S01', name: 'John Student', score: 88, max: 100, status: 'Passed' },
                    { id: 'S02', name: 'Alice Smith', score: 45, max: 100, status: 'Failed' },
                    { id: 'S03', name: 'Bob Jones', score: 95, max: 100, status: 'Passed' }
                ]
            };

            document.getElementById('results-loader').classList.add('hidden');
            document.getElementById('results-content').classList.remove('hidden');

            this.renderOverview();
            this.renderCharts();
            this.renderStudentList();
        } catch (e) {
            console.error(e);
        }
    },

    renderOverview() {
        const data = this.state.stats.overview;
        document.getElementById('stats-overview').innerHTML = `
            <div class="bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
                <p class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Average Score</p>
                <p class="text-3xl font-bold text-slate-800">${data.avg}%</p>
            </div>
            <div class="bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
                <p class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Highest Score</p>
                <p class="text-3xl font-bold text-emerald-600">${data.max}%</p>
            </div>
            <div class="bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
                <p class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Lowest Score</p>
                <p class="text-3xl font-bold text-rose-600">${data.min}%</p>
            </div>
            <div class="bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
                <p class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Pass Rate</p>
                <p class="text-3xl font-bold text-primary-600">${data.passRate}%</p>
            </div>
        `;
    },

    renderCharts() {
        if (typeof Chart === 'undefined') {
            console.warn("Chart.js not loaded.");
            return;
        }

        // Distribution Chart
        const ctxDist = document.getElementById('distChart').getContext('2d');
        new Chart(ctxDist, {
            type: 'bar',
            data: {
                labels: ['0-49 (F)', '50-59 (D)', '60-69 (C)', '70-79 (B)', '80-100 (A)'],
                datasets: [{
                    label: 'Number of Students',
                    data: this.state.stats.distribution,
                    backgroundColor: 'rgba(14, 165, 233, 0.7)',
                    borderColor: 'rgba(14, 165, 233, 1)',
                    borderWidth: 1,
                    borderRadius: 4
                }]
            },
            options: { responsive: true, maintainAspectRatio: false }
        });

        // Item Analysis Chart
        const ctxItem = document.getElementById('itemChart').getContext('2d');
        new Chart(ctxItem, {
            type: 'line',
            data: {
                labels: ['Q1', 'Q2', 'Q3', 'Q4', 'Q5'],
                datasets: [{
                    label: '% Correct (Difficulty)',
                    data: this.state.stats.itemDifficulty,
                    borderColor: 'rgba(16, 185, 129, 1)',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.3
                }]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                scales: { y: { min: 0, max: 100 } }
            }
        });
    },

    renderStudentList() {
        document.getElementById('student-results-list').innerHTML = this.state.stats.students.map(s => `
            <tr class="hover:bg-slate-50 transition-colors">
                <td class="px-4 py-3 font-medium text-slate-700">${s.id}</td>
                <td class="px-4 py-3">${s.name}</td>
                <td class="px-4 py-3 font-bold">${s.score}/${s.max}</td>
                <td class="px-4 py-3">
                    <span class="px-2 py-1 rounded text-xs font-bold ${s.status === 'Passed' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}">${s.status}</span>
                </td>
                <td class="px-4 py-3">
                    <button class="text-primary-600 hover:underline font-medium text-sm">View Sheet</button>
                </td>
            </tr>
        `).join('');
    },

    exportData(type) {
        if (type === 'pdf') {
            alert('Generating PDF Report... \\n(In a real app, this will trigger jsPDF or a backend PDF generator and download the file).');
        } else {
            alert('Downloading CSV Export... \\n(In a real app, this will convert data to CSV and trigger a file download).');
        }
    }
};
