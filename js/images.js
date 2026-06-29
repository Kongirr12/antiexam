/**
 * Module 5: Image Library
 */ 
window.ImagesModule = {
    state: {
        images: [],
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
                        <h1 class="text-3xl font-bold text-slate-800 tracking-tight">Image Library</h1>
                        <p class="text-slate-500 text-sm">Upload and manage images for your questions.</p>
                    </div>
                </div>
                <button class="premium-btn gap-2" onclick="document.getElementById('file-upload').click()">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                    Upload Image
                    <input type="file" id="file-upload" class="hidden" accept="image/*" onchange="ImagesModule.handleUpload(event)">
                </button>
            </div>

            <!-- Upload Progress (Hidden by default) -->
            <div id="upload-progress" class="hidden glass-panel p-4 rounded-xl mb-6 flex items-center justify-between border-l-4 border-primary-500">
                <div class="flex items-center gap-3">
                    <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-600"></div>
                    <span class="text-sm font-medium text-slate-700" id="upload-filename">Uploading image.jpg...</span>
                </div>
                <span class="text-sm text-primary-600 font-bold" id="upload-percent">0%</span>
            </div>

            <!-- Loader -->
            <div id="images-loader" class="flex justify-center items-center py-12">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>

            <!-- Images Grid -->
            <div id="images-grid" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 hidden">
                <!-- Image Cards will be injected here -->
            </div>
            
            <!-- Empty State -->
            <div id="images-empty" class="hidden text-center py-20 glass-panel rounded-2xl">
                <div class="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                    <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                </div>
                <h3 class="text-lg font-medium text-slate-800">No Images Found</h3>
                <p class="text-slate-500 mt-1 mb-6">Upload your first image to get started.</p>
                <button class="premium-btn-outline" onclick="document.getElementById('file-upload').click()">Select Image File</button>
            </div>
        `;

        await this.loadImages();
    },

    async loadImages() {
        try {
            this.state.images = await API.post('getImages');
            document.getElementById('images-loader').classList.add('hidden');
            
            if (this.state.images.length === 0) {
                document.getElementById('images-empty').classList.remove('hidden');
            } else {
                const grid = document.getElementById('images-grid');
                grid.classList.remove('hidden');
                this.renderGrid(grid);
            }
        } catch (error) {
            console.error("Failed to load images", error);
            document.getElementById('images-loader').innerHTML = `<p class="text-danger-500">Failed to load images.</p>`;
        }
    },

    renderGrid(gridElement) {
        gridElement.innerHTML = this.state.images.map(img => `
            <div class="glass-panel rounded-xl overflow-hidden hover-lift group cursor-pointer border border-transparent hover:border-primary-200 transition-all flex flex-col h-48 relative">
                <div class="flex-grow bg-slate-100 relative overflow-hidden">
                    <img src="${img.url}" alt="${img.name}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
                    <div class="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button class="p-2 bg-white/20 hover:bg-white text-white hover:text-primary-600 rounded-full backdrop-blur-sm transition-all" title="Copy URL" onclick="ImagesModule.copyURL('${img.url}')">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                        </button>
                        <button class="p-2 bg-white/20 hover:bg-danger-500 text-white rounded-full backdrop-blur-sm transition-all" title="Delete">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                        </button>
                    </div>
                </div>
                <div class="p-3 bg-white/80 backdrop-blur-md">
                    <p class="text-xs font-medium text-slate-800 truncate" title="${img.name}">${img.name}</p>
                    <p class="text-[10px] text-slate-500 mt-0.5">${img.date}</p>
                </div>
            </div>
        `).join('');
    },

    handleUpload(e) {
        const file = e.target.files[0];
        if (!file) return;

        const progressDiv = document.getElementById('upload-progress');
        document.getElementById('upload-filename').innerText = `Uploading ${file.name}...`;
        progressDiv.classList.remove('hidden');

        // Simulate base64 reading and API upload
        let percent = 0;
        const interval = setInterval(() => {
            percent += 10;
            document.getElementById('upload-percent').innerText = `${percent}%`;
            
            if (percent >= 100) {
                clearInterval(interval);
                setTimeout(() => {
                    progressDiv.classList.add('hidden');
                    // Add mock image to state and re-render
                    this.state.images.unshift({
                        id: 'IMG_NEW',
                        name: file.name,
                        url: 'https://via.placeholder.com/150/10b981/ffffff?text=New+Upload',
                        date: new Date().toISOString().split('T')[0]
                    });
                    
                    document.getElementById('images-empty').classList.add('hidden');
                    const grid = document.getElementById('images-grid');
                    grid.classList.remove('hidden');
                    this.renderGrid(grid);
                }, 500);
            }
        }, 100);
    },

    copyURL(url) {
        navigator.clipboard.writeText(url);
        alert('Image URL copied to clipboard: ' + url);
    }
};
