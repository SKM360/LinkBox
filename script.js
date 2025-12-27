class LinkBox {
    constructor() {
        this.bookmarks = [];
        this.categories = [
            { id: 1, name: 'Development', color: '#4f46e5', icon: 'fas fa-code' },
            { id: 2, name: 'Design', color: '#8b5cf6', icon: 'fas fa-paint-brush' },
            { id: 3, name: 'Productivity', color: '#10b981', icon: 'fas fa-check-circle' },
            { id: 4, name: 'Learning', color: '#f59e0b', icon: 'fas fa-graduation-cap' },
            { id: 5, name: 'Entertainment', color: '#ef4444', icon: 'fas fa-gamepad' }
        ];

        this.settings = {
            theme: 'blue',
            sortBy: 'date',
            showStats: true
        };

        this.init();
    }

    init() {
        // Load data from localStorage
        this.loadData();

        // Initialize UI
        this.initUI();

        // Setup event listeners
        this.setupEventListeners();

        // Load initial view
        this.renderAllLinks();
        this.renderCategories();
        this.updateStats();
        this.updateStorageInfo();

        // Show welcome message
        setTimeout(() => {
            this.showToast('Welcome to LinkBox! 📦', 'info');
        }, 500);
    }

    loadData() {
        // Load bookmarks
        const savedBookmarks = localStorage.getItem('linkbox_bookmarks');
        if (savedBookmarks) {
            this.bookmarks = JSON.parse(savedBookmarks);
        }

        // Load categories
        const savedCategories = localStorage.getItem('linkbox_categories');
        if (savedCategories) {
            this.categories = JSON.parse(savedCategories);
        }

        // Load settings
        const savedSettings = localStorage.getItem('linkbox_settings');
        if (savedSettings) {
            this.settings = JSON.parse(savedSettings);
        }
    }

    saveData() {
        localStorage.setItem('linkbox_bookmarks', JSON.stringify(this.bookmarks));
        localStorage.setItem('linkbox_categories', JSON.stringify(this.categories));
        localStorage.setItem('linkbox_settings', JSON.stringify(this.settings));
    }

    // UI Initialization
    initUI() {
        // Apply saved theme
        this.applyTheme(this.settings.theme);

        // Set active theme color
        document.querySelectorAll('.theme-color').forEach(color => {
            color.classList.remove('active');
            if (color.dataset.theme === this.settings.theme) {
                color.classList.add('active');
            }
        });

        // Populate category dropdown
        this.updateCategoryDropdown();
    }

    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        this.settings.theme = theme;
        this.saveData();
    }

    // Event Listeners
    setupEventListeners() {
        // Tab navigation
        document.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', () => this.switchTab(tab.dataset.tab));
        });

        // Theme switching
        document.querySelectorAll('.theme-color').forEach(color => {
            color.addEventListener('click', () => {
                const theme = color.dataset.theme;
                this.applyTheme(theme);

                // Update active state
                document.querySelectorAll('.theme-color').forEach(c => {
                    c.classList.remove('active');
                });
                color.classList.add('active');

                this.showToast(`Theme changed to ${theme}`, 'success');
            });
        });

        // Quick actions
        document.getElementById('quickAdd').addEventListener('click', () => {
            this.switchTab('add');
        });

        document.getElementById('saveCurrentPage').addEventListener('click', () => {
            this.saveCurrentPage();
        });

        document.getElementById('refreshView').addEventListener('click', () => {
            this.renderAllLinks();
            this.updateStats();
            this.showToast('View refreshed', 'info');
        });

        document.getElementById('statsBtn').addEventListener('click', () => {
            this.updateStats();
            this.showToast('Stats updated', 'info');
        });

        // Form submission
        document.getElementById('saveLink').addEventListener('click', () => {
            this.saveNewLink();
        });

        document.getElementById('clearForm').addEventListener('click', () => {
            this.clearAddForm();
        });

        // Category management
        document.getElementById('addCategoryBtn').addEventListener('click', () => {
            this.openCategoryModal();
        });

        // Search functionality
        document.getElementById('searchInput').addEventListener('input', (e) => {
            this.searchLinks(e.target.value);
        });

        // Data management
        document.getElementById('exportData').addEventListener('click', () => {
            this.exportData();
        });

        document.getElementById('importData').addEventListener('click', () => {
            document.getElementById('importFile').click();
        });

        document.getElementById('importFile').addEventListener('change', (e) => {
            this.importData(e.target.files[0]);
        });

        document.getElementById('clearData').addEventListener('click', () => {
            this.clearAllData();
        });

        document.getElementById('resetSettings').addEventListener('click', () => {
            this.resetSettings();
        });

        // Modal
        document.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', () => {
                document.getElementById('categoryModal').classList.remove('active');
            });
        });

        document.getElementById('saveCategory').addEventListener('click', () => {
            this.saveNewCategory();
        });

        // Close modal on outside click
        document.getElementById('categoryModal').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) {
                e.currentTarget.classList.remove('active');
            }
        });
    }

    // Tab Management
    switchTab(tabName) {
        // Update active tab
        document.querySelectorAll('.tab').forEach(tab => {
            tab.classList.remove('active');
            if (tab.dataset.tab === tabName) {
                tab.classList.add('active');
            }
        });

        // Show corresponding content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`tab-${tabName}`).classList.add('active');

        // Update content for specific tabs
        if (tabName === 'categories') {
            this.renderCategories();
        } else if (tabName === 'settings') {
            this.updateStorageInfo();
        }
    }

    // Bookmark Management
    saveNewLink() {
        const url = document.getElementById('linkUrl').value.trim();
        const title = document.getElementById('linkTitle').value.trim();
        const category = document.getElementById('linkCategory').value;
        const newCategory = document.getElementById('newCategory').value.trim();
        const tags = document.getElementById('linkTags').value;
        const notes = document.getElementById('linkNotes').value.trim();

        // Validate required fields
        if (!url || !title) {
            this.showToast('Please fill in required fields (URL and Title)', 'error');
            return;
        }

        // Create bookmark object
        const bookmark = {
            id: Date.now(),
            url: url,
            title: title,
            category: newCategory || category,
            tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag),
            notes: notes,
            createdAt: new Date().toISOString(),
            clicks: 0,
            favorite: false
        };

        // Add to bookmarks array
        this.bookmarks.unshift(bookmark);
        this.saveData();

        // If new category was added, add it to categories list
        if (newCategory && !this.categories.some(cat => cat.name === newCategory)) {
            const categoryColors = ['#4f46e5', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#6b7280'];
            const randomColor = categoryColors[Math.floor(Math.random() * categoryColors.length)];

            this.categories.push({
                id: Date.now(),
                name: newCategory,
                color: randomColor,
                icon: 'fas fa-folder'
            });
            this.saveData();
            this.updateCategoryDropdown();
        }

        // Clear form
        this.clearAddForm();

        // Update UI
        this.renderAllLinks();
        this.updateStats();
        this.showToast('Link saved successfully!', 'success');

        // Switch to all links tab
        this.switchTab('all');
    }

    clearAddForm() {
        document.getElementById('linkUrl').value = '';
        document.getElementById('linkTitle').value = '';
        document.getElementById('linkCategory').value = '';
        document.getElementById('newCategory').value = '';
        document.getElementById('linkTags').value = '';
        document.getElementById('linkNotes').value = '';
    }

    saveCurrentPage() {
        if (window.location.href.startsWith('file://') || window.location.href === 'about:blank') {
            this.showToast('Cannot save current page in this context', 'error');
            return;
        }

        // Auto-fill the form with current page info
        document.getElementById('linkUrl').value = window.location.href;
        document.getElementById('linkTitle').value = document.title;

        // Switch to add tab
        this.switchTab('add');

        this.showToast('Current page details loaded', 'info');
    }

    deleteBookmark(id) {
        if (!confirm('Are you sure you want to delete this bookmark?')) {
            return;
        }

        this.bookmarks = this.bookmarks.filter(bookmark => bookmark.id !== id);
        this.saveData();
        this.renderAllLinks();
        this.updateStats();
        this.showToast('Bookmark deleted', 'warning');
    }

    openBookmark(id) {
        const bookmark = this.bookmarks.find(b => b.id === id);
        if (!bookmark) return;

        // Update click count
        bookmark.clicks = (bookmark.clicks || 0) + 1;
        this.saveData();

        // Open in new tab
        window.open(bookmark.url, '_blank');
        this.showToast('Opening link...', 'info');
    }

    toggleFavorite(id) {
        const bookmark = this.bookmarks.find(b => b.id === id);
        if (bookmark) {
            bookmark.favorite = !bookmark.favorite;
            this.saveData();
            this.renderAllLinks();
            this.showToast(bookmark.favorite ? 'Added to favorites' : 'Removed from favorites', 'success');
        }
    }

    // Rendering
    renderAllLinks() {
        const container = document.getElementById('linksContainer');

        if (this.bookmarks.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-bookmark"></i>
                    <h3>No bookmarks yet</h3>
                    <p>Add your first link to get started</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.bookmarks.map(bookmark => `
            <div class="link-card">
                <div class="link-header">
                    <div>
                        <h3 class="link-title">${this.escapeHTML(bookmark.title)}</h3>
                        <a href="${bookmark.url}" target="_blank" class="link-url">${this.shortenURL(bookmark.url)}</a>
                    </div>
                    <button class="btn-icon favorite-btn" onclick="linkBox.toggleFavorite(${bookmark.id})">
                        <i class="${bookmark.favorite ? 'fas fa-star' : 'far fa-star'}"></i>
                    </button>
                </div>
                
                ${bookmark.notes ? `<p class="link-notes">${this.escapeHTML(bookmark.notes)}</p>` : ''}
                
                <div class="link-meta">
                    <span class="link-category" style="background-color: ${this.getCategoryColor(bookmark.category)}">
                        ${bookmark.category || 'Uncategorized'}
                    </span>
                    <div class="link-actions">
                        <button class="btn-icon" onclick="linkBox.openBookmark(${bookmark.id})" title="Open">
                            <i class="fas fa-external-link-alt"></i>
                        </button>
                        <button class="btn-icon" onclick="linkBox.deleteBookmark(${bookmark.id})" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    renderCategories() {
        const container = document.getElementById('categoriesContainer');

        // Count bookmarks per category
        const categoryCounts = {};
        this.bookmarks.forEach(bookmark => {
            const category = bookmark.category || 'Uncategorized';
            categoryCounts[category] = (categoryCounts[category] || 0) + 1;
        });

        // Add uncategorized if not in categories list but has bookmarks
        if (categoryCounts['Uncategorized'] && !this.categories.some(cat => cat.name === 'Uncategorized')) {
            this.categories.push({
                id: 'uncategorized',
                name: 'Uncategorized',
                color: '#6b7280',
                icon: 'fas fa-folder'
            });
        }

        container.innerHTML = this.categories.map(category => {
            const count = categoryCounts[category.name] || 0;
            return `
                <div class="category-card">
                    <div class="category-icon" style="background-color: ${category.color}">
                        <i class="${category.icon}"></i>
                    </div>
                    <span class="category-name">${category.name}</span>
                    <span class="category-count">${count} link${count !== 1 ? 's' : ''}</span>
                </div>
            `;
        }).join('');
    }

    updateStats() {
        document.getElementById('totalLinks').textContent = this.bookmarks.length;
        document.getElementById('totalCategories').textContent = this.categories.length;

        // Count unique tags
        const allTags = this.bookmarks.flatMap(bookmark => bookmark.tags || []);
        const uniqueTags = [...new Set(allTags)];
        document.getElementById('totalTags').textContent = uniqueTags.length;
    }

    // Category Management
    updateCategoryDropdown() {
        const select = document.getElementById('linkCategory');
        select.innerHTML = `
            <option value="">Select category</option>
            ${this.categories.map(cat => `
                <option value="${cat.name}">${cat.name}</option>
            `).join('')}
        `;
    }

    openCategoryModal() {
        document.getElementById('categoryModal').classList.add('active');
    }

    saveNewCategory() {
        const name = document.getElementById('categoryName').value.trim();
        const color = document.getElementById('categoryColor').value;

        if (!name) {
            this.showToast('Please enter a category name', 'error');
            return;
        }

        // Check if category already exists
        if (this.categories.some(cat => cat.name.toLowerCase() === name.toLowerCase())) {
            this.showToast('Category already exists', 'error');
            return;
        }

        // Add new category
        this.categories.push({
            id: Date.now(),
            name: name,
            color: color,
            icon: 'fas fa-folder'
        });

        this.saveData();
        this.updateCategoryDropdown();
        this.renderCategories();
        this.updateStats();

        // Close modal and clear form
        document.getElementById('categoryModal').classList.remove('active');
        document.getElementById('categoryName').value = '';

        this.showToast('Category added successfully!', 'success');
    }

    getCategoryColor(categoryName) {
        const category = this.categories.find(cat => cat.name === categoryName);
        return category ? category.color : '#6b7280';
    }

    // Search
    searchLinks(query) {
        if (!query.trim()) {
            this.renderAllLinks();
            return;
        }

        const filtered = this.bookmarks.filter(bookmark => {
            const searchText = `${bookmark.title} ${bookmark.url} ${bookmark.notes} ${bookmark.category} ${bookmark.tags.join(' ')}`.toLowerCase();
            return searchText.includes(query.toLowerCase());
        });

        const container = document.getElementById('linksContainer');

        if (filtered.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-search"></i>
                    <h3>No results found</h3>
                    <p>Try a different search term</p>
                </div>
            `;
            return;
        }

        container.innerHTML = filtered.map(bookmark => `
            <div class="link-card">
                <div class="link-header">
                    <div>
                        <h3 class="link-title">${this.escapeHTML(bookmark.title)}</h3>
                        <a href="${bookmark.url}" target="_blank" class="link-url">${this.shortenURL(bookmark.url)}</a>
                    </div>
                    <button class="btn-icon favorite-btn" onclick="linkBox.toggleFavorite(${bookmark.id})">
                        <i class="${bookmark.favorite ? 'fas fa-star' : 'far fa-star'}"></i>
                    </button>
                </div>
                
                ${bookmark.notes ? `<p class="link-notes">${this.escapeHTML(bookmark.notes)}</p>` : ''}
                
                <div class="link-meta">
                    <span class="link-category" style="background-color: ${this.getCategoryColor(bookmark.category)}">
                        ${bookmark.category || 'Uncategorized'}
                    </span>
                    <div class="link-actions">
                        <button class="btn-icon" onclick="linkBox.openBookmark(${bookmark.id})">
                            <i class="fas fa-external-link-alt"></i>
                        </button>
                        <button class="btn-icon" onclick="linkBox.deleteBookmark(${bookmark.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    // Data Management
    exportData() {
        const data = {
            bookmarks: this.bookmarks,
            categories: this.categories,
            settings: this.settings,
            exportedAt: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `linkbox-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        this.showToast('Data exported successfully!', 'success');
    }

    importData(file) {
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);

                if (confirm('This will replace all current data. Continue?')) {
                    if (data.bookmarks) this.bookmarks = data.bookmarks;
                    if (data.categories) this.categories = data.categories;
                    if (data.settings) {
                        this.settings = data.settings;
                        this.applyTheme(this.settings.theme);
                    }

                    this.saveData();
                    this.renderAllLinks();
                    this.renderCategories();
                    this.updateStats();
                    this.updateCategoryDropdown();

                    this.showToast('Data imported successfully!', 'success');
                }
            } catch (error) {
                this.showToast('Error importing file. Invalid format.', 'error');
            }
        };
        reader.readAsText(file);
    }

    clearAllData() {
        if (!confirm('This will delete ALL bookmarks and categories. This cannot be undone. Continue?')) {
            return;
        }

        this.bookmarks = [];
        this.categories = [
            { id: 1, name: 'Development', color: '#4f46e5', icon: 'fas fa-code' },
            { id: 2, name: 'Design', color: '#8b5cf6', icon: 'fas fa-paint-brush' },
            { id: 3, name: 'Productivity', color: '#10b981', icon: 'fas fa-check-circle' },
            { id: 4, name: 'Learning', color: '#f59e0b', icon: 'fas fa-graduation-cap' },
            { id: 5, name: 'Entertainment', color: '#ef4444', icon: 'fas fa-gamepad' }
        ];

        this.saveData();
        this.renderAllLinks();
        this.renderCategories();
        this.updateStats();
        this.updateCategoryDropdown();

        this.showToast('All data cleared', 'warning');
    }

    resetSettings() {
        if (!confirm('Reset all settings to default?')) {
            return;
        }

        this.settings = {
            theme: 'blue',
            sortBy: 'date',
            showStats: true
        };

        this.applyTheme('blue');
        this.saveData();

        this.showToast('Settings reset to default', 'success');
    }

    updateStorageInfo() {
        // Calculate storage used
        const dataSize = JSON.stringify(this.bookmarks).length +
            JSON.stringify(this.categories).length +
            JSON.stringify(this.settings).length;

        const usedKB = (dataSize / 1024).toFixed(2);
        const totalKB = 5120; // 5MB in KB
        const percentage = (usedKB / totalKB * 100).toFixed(1);

        document.getElementById('storageUsed').textContent = `${usedKB} KB`;
        document.getElementById('storageAvailable').textContent = `${(totalKB - usedKB).toFixed(2)} KB`;
        document.getElementById('storageFill').style.width = `${percentage}%`;
    }

    // Helper Functions
    escapeHTML(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    shortenURL(url) {
        try {
            const urlObj = new URL(url);
            return urlObj.hostname + (urlObj.pathname !== '/' ? urlObj.pathname.substring(0, 20) + '...' : '');
        } catch {
            return url.substring(0, 30) + (url.length > 30 ? '...' : '');
        }
    }

    showToast(message, type = 'info') {
        const container = document.getElementById('toastContainer');
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;

        const icon = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            warning: 'fas fa-exclamation-triangle',
            info: 'fas fa-info-circle'
        }[type] || 'fas fa-info-circle';

        toast.innerHTML = `
            <i class="${icon}"></i>
            <div class="toast-content">${message}</div>
        `;

        container.appendChild(toast);

        // Auto-remove after 3 seconds
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
}

// Initialize the app
let linkBox;

document.addEventListener('DOMContentLoaded', () => {
    linkBox = new LinkBox();
    window.linkBox = linkBox; // Make it available globally
});