/**
 * Module 1: User Management
 */
window.UsersModule = {
    state: {
        users: [],
        isLoading: true
    },

    async render() {
        App.container.innerHTML = `
            <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div class="flex items-center gap-4">
                    <button onclick="App.navigate('dashboard')" class="p-2 rounded-lg hover:bg-slate-200 transition-colors">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                    </button>
                    <div>
                        <h1 class="text-3xl font-bold text-slate-800 tracking-tight">จัดการผู้ใช้งาน (User Management)</h1>
                        <p class="text-slate-500 text-sm">จัดการข้อมูลนักเรียน ครู และผู้ดูแลระบบ</p>
                    </div>
                </div>
                <div class="flex flex-wrap gap-3">
                    <button class="premium-btn-outline gap-2" onclick="UsersModule.importCSV()">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                        นำเข้า CSV
                    </button>
                    <button class="premium-btn gap-2" onclick="UsersModule.showAddModal()">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
                        เพิ่มผู้ใช้งาน
                    </button>
                </div>
            </div>

            <!-- Toolbar (Search & Filter) -->
            <div class="glass-panel p-4 rounded-xl flex flex-col sm:flex-row gap-4 mb-6">
                <div class="relative flex-grow">
                    <svg class="w-5 h-5 absolute left-3 top-2.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                    <input type="text" placeholder="ค้นหาด้วยชื่อ, รหัส, หรืออีเมล..." class="premium-input !pl-10" id="searchUser">
                </div>
                <select class="premium-input sm:w-48">
                    <option value="">ทุกบทบาท</option>
                    <option value="Student">นักเรียน (Student)</option>
                    <option value="Teacher">ครู (Teacher)</option>
                    <option value="Admin">ผู้ดูแลระบบ (Admin)</option>
                </select>
                <select class="premium-input sm:w-48">
                    <option value="">ทุกสถานะ</option>
                    <option value="Active">เปิดใช้งาน (Active)</option>
                    <option value="Disabled">ปิดการใช้งาน (Disabled)</option>
                </select>
            </div>

            <!-- Users Table Container -->
            <div id="users-table-container" class="glass-panel rounded-xl overflow-hidden min-h-[400px] relative">
                <!-- Loader -->
                <div class="absolute inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-10" id="users-loader">
                    <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                </div>
                
                <div class="overflow-x-auto">
                    <table class="w-full text-left text-sm text-slate-600">
                        <thead class="bg-slate-50/80 text-slate-700 text-xs uppercase font-semibold border-b border-slate-200">
                            <tr>
                                <th class="px-6 py-4">ID</th>
                                <th class="px-6 py-4">Name</th>
                                <th class="px-6 py-4">Role</th>
                                <th class="px-6 py-4">Grade/Room</th>
                                <th class="px-6 py-4">Status</th>
                                <th class="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody id="users-tbody" class="divide-y divide-slate-100">
                            <!-- Rows will be injected here -->
                        </tbody>
                    </table>
                </div>
            </div>
            
            <!-- Hidden Modal (for Add/Edit) -->
            <div id="user-modal" class="fixed inset-0 z-[100] hidden items-center justify-center p-4">
                <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onclick="UsersModule.closeModal()"></div>
                <div class="glass-panel w-full max-w-lg rounded-2xl p-6 relative z-10 animate-fade-in shadow-2xl">
                    <div class="flex justify-between items-center mb-5">
                        <h3 class="text-xl font-bold text-slate-800" id="modal-title">Add New User</h3>
                        <button onclick="UsersModule.closeModal()" class="text-slate-400 hover:text-slate-600 transition-colors">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>
                    </div>
                    <form onsubmit="UsersModule.saveUser(event)" class="space-y-4">
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label class="block text-xs font-semibold text-slate-600 mb-1">User ID</label>
                                <input type="text" class="premium-input" required>
                            </div>
                            <div>
                                <label class="block text-xs font-semibold text-slate-600 mb-1">Role</label>
                                <select class="premium-input">
                                    <option>Student</option>
                                    <option>Teacher</option>
                                    <option>Admin</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label class="block text-xs font-semibold text-slate-600 mb-1">Full Name</label>
                            <input type="text" class="premium-input" required>
                        </div>
                        <div>
                            <label class="block text-xs font-semibold text-slate-600 mb-1">Email</label>
                            <input type="email" class="premium-input">
                        </div>
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label class="block text-xs font-semibold text-slate-600 mb-1">Grade</label>
                                <input type="text" class="premium-input">
                            </div>
                            <div>
                                <label class="block text-xs font-semibold text-slate-600 mb-1">Room</label>
                                <input type="text" class="premium-input">
                            </div>
                        </div>
                        <div class="pt-4 flex justify-end gap-3">
                            <button type="button" class="premium-btn-outline" onclick="UsersModule.closeModal()">Cancel</button>
                            <button type="submit" class="premium-btn">Save User</button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        await this.loadUsers();
    },

    async loadUsers() {
        try {
            this.state.users = await API.post('getUsers');
            this.renderTable();
        } catch (error) {
            console.error("Failed to load users", error);
            document.getElementById('users-tbody').innerHTML = `<tr><td colspan="6" class="p-6 text-center text-red-500">Error loading users.</td></tr>`;
        } finally {
            document.getElementById('users-loader').style.display = 'none';
        }
    },

    renderTable() {
        const tbody = document.getElementById('users-tbody');
        if (this.state.users.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" class="p-8 text-center text-slate-500">No users found.</td></tr>`;
            return;
        }

        tbody.innerHTML = this.state.users.map(u => `
            <tr class="hover:bg-slate-50/50 transition-colors group">
                <td class="px-6 py-4 font-medium text-slate-800">${u.id}</td>
                <td class="px-6 py-4">
                    <div class="font-medium text-slate-800">${u.name}</div>
                    <div class="text-xs text-slate-500">${u.email || '-'}</div>
                </td>
                <td class="px-6 py-4">
                    <span class="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${u.role === 'Admin' ? 'bg-purple-100 text-purple-700' : (u.role === 'Teacher' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700')}">
                        ${u.role}
                    </span>
                </td>
                <td class="px-6 py-4 text-slate-500">
                    ${u.grade ? `G${u.grade}/${u.room}` : '-'}
                </td>
                <td class="px-6 py-4">
                    <span class="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${u.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}">
                        <span class="w-1.5 h-1.5 rounded-full ${u.status === 'Active' ? 'bg-emerald-500' : 'bg-rose-500'}"></span>
                        ${u.status}
                    </span>
                </td>
                <td class="px-6 py-4 text-right">
                    <div class="opacity-0 group-hover:opacity-100 transition-opacity flex justify-end gap-2">
                        <button class="p-1.5 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors" title="Edit">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                        </button>
                        <button class="p-1.5 text-slate-400 hover:text-danger-600 hover:bg-danger-50 rounded-lg transition-colors" title="Reset PIN">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"></path></svg>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    },

    showAddModal() {
        const modal = document.getElementById('user-modal');
        modal.classList.remove('hidden');
        modal.classList.add('flex');
    },

    closeModal() {
        const modal = document.getElementById('user-modal');
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    },

    saveUser(e) {
        e.preventDefault();
        alert("Simulating Save User. API call goes here.");
        this.closeModal();
    },

    importCSV() {
        alert("Simulating CSV Import window.");
    }
};
