// ========== REAL-TIME SYNC MANAGER ==========
const SyncManager = {
    // Listen for admin updates
    init: function() {
        // Check for updates every 30 seconds
        setInterval(() => this.checkForUpdates(), 30000);
        
        // Listen for storage events (updates from admin in same browser)
        window.addEventListener('storage', (e) => {
            if (e.key === 'sbstore_products') {
                this.handleUpdate();
            }
        });
        
        console.log('Sync Manager initialized');
    },
    
    // Check if products have been updated
    checkForUpdates: function() {
        const lastUpdate = localStorage.getItem('sbstore_last_update');
        const lastCheck = localStorage.getItem('sbstore_last_check') || 0;
        
        if (lastUpdate && lastUpdate > lastCheck) {
            this.handleUpdate();
        }
        
        localStorage.setItem('sbstore_last_check', Date.now().toString());
    },
    
    // Handle product updates
    handleUpdate: function() {
        console.log('Products updated from admin!');
        
        // Show notification
        this.showNotification('Products updated!');
        
        // Reload product data
        if (typeof refreshProducts === 'function') {
            refreshProducts();
        }
        
        // Reload current page if on shop or product page
        const currentPage = window.location.pathname;
        if (currentPage.includes('shop') || currentPage.includes('product')) {
            setTimeout(() => window.location.reload(), 2000);
        }
    },
    
    // Show notification
    showNotification: function(message) {
        const notification = document.createElement('div');
        notification.className = 'sync-notification';
        notification.innerHTML = `
            <i class="fas fa-sync-alt fa-spin"></i>
            <span>${message}</span>
        `;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
};

// Add notification styles
const style = document.createElement('style');
style.textContent = `
    .sync-notification {
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: var(--purple-primary);
        color: white;
        padding: 15px 25px;
        border-radius: 10px;
        box-shadow: 0 5px 20px rgba(0,0,0,0.2);
        display: flex;
        align-items: center;
        gap: 10px;
        transform: translateY(100px);
        opacity: 0;
        transition: all 0.3s;
        z-index: 9999;
    }
    
    .sync-notification.show {
        transform: translateY(0);
        opacity: 1;
    }
    
    .sync-notification i {
        font-size: 18px;
    }
`;
document.head.appendChild(style);

// Initialize sync manager
document.addEventListener('DOMContentLoaded', () => {
    SyncManager.init();
});

// Expose to global
window.SyncManager = SyncManager;