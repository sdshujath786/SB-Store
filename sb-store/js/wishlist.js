// ========== COMPLETE WISHLIST SYSTEM ==========

class WishlistManager {
    constructor() {
        this.wishlist = this.loadWishlist();
        this.init();
    }

    // Load wishlist from localStorage
    loadWishlist() {
        // Check if user is logged in
        const user = this.getCurrentUser();
        
        if (user) {
            // User-specific wishlist
            const userWishlist = localStorage.getItem(`wishlist_${user.id}`);
            return userWishlist ? JSON.parse(userWishlist) : [];
        } else {
            // Guest wishlist
            const guestWishlist = localStorage.getItem('guest_wishlist');
            return guestWishlist ? JSON.parse(guestWishlist) : [];
        }
    }

    // Save wishlist to storage
    saveWishlist() {
        const user = this.getCurrentUser();
        
        if (user) {
            localStorage.setItem(`wishlist_${user.id}`, JSON.stringify(this.wishlist));
        } else {
            localStorage.setItem('guest_wishlist', JSON.stringify(this.wishlist));
        }
        
        this.updateWishlistCount();
        this.updateWishlistPage(); // Update wishlist page if open
    }

    // Initialize
    init() {
        this.updateWishlistCount();
        this.updateAllHeartIcons();
        this.setupEventListeners();
    }

    // Get current user from account system
    getCurrentUser() {
        if (window.AccountSystem) {
            return AccountSystem.currentUser;
        }
        // Fallback - check storage directly
        const localUser = localStorage.getItem('sbstore_current_user');
        const sessionUser = sessionStorage.getItem('sbstore_current_user');
        return localUser ? JSON.parse(localUser) : sessionUser ? JSON.parse(sessionUser) : null;
    }

    // Add item to wishlist
    addItem(product) {
        // Check if already in wishlist
        if (this.isInWishlist(product.id)) {
            this.showNotification('Already in wishlist', 'info');
            return false;
        }

        // Add to wishlist
        this.wishlist.push({
            id: product.id,
            name: product.name,
            price: product.salePrice || product.price,
            originalPrice: product.price,
            image: product.image,
            category: product.category,
            brand: product.brand,
            amazonUrl: product.amazonUrl,
            addedAt: new Date().toISOString()
        });

        this.saveWishlist();
        this.updateAllHeartIcons();
        this.showNotification(`${product.name} added to wishlist!`, 'success');
        this.animateWishlistIcon();
        return true;
    }

    // Remove item from wishlist
    removeItem(productId) {
        const item = this.wishlist.find(item => item.id === productId);
        this.wishlist = this.wishlist.filter(item => item.id !== productId);
        this.saveWishlist();
        this.updateAllHeartIcons();
        this.showNotification(`${item?.name || 'Item'} removed from wishlist`, 'info');
        return true;
    }

    // Toggle wishlist item
    toggleItem(product) {
        if (this.isInWishlist(product.id)) {
            return this.removeItem(product.id);
        } else {
            return this.addItem(product);
        }
    }

    // Check if product is in wishlist
    isInWishlist(productId) {
        return this.wishlist.some(item => item.id === productId);
    }

    // Get all wishlist items
    getWishlist() {
        return this.wishlist;
    }

    // Get wishlist count
    getCount() {
        return this.wishlist.length;
    }

    // Clear entire wishlist
    clearWishlist() {
        if (this.wishlist.length > 0) {
            this.wishlist = [];
            this.saveWishlist();
            this.updateAllHeartIcons();
            this.showNotification('Wishlist cleared', 'info');
        }
    }

    // Move item to cart
    moveToCart(productId) {
        const item = this.wishlist.find(item => item.id === productId);
        if (item && window.cart) {
            // Add to cart
            cart.addItem({
                id: item.id,
                name: item.name,
                price: item.price,
                image: item.image,
                category: item.category,
                brand: item.brand
            });
            
            // Remove from wishlist
            this.removeItem(productId);
            this.showNotification('Moved to cart', 'success');
        }
    }

    // Update wishlist count in header
    updateWishlistCount() {
        const count = this.getCount();
        const badges = document.querySelectorAll('.wishlist-count, .wishlist-badge');
        
        badges.forEach(badge => {
            badge.textContent = count;
            badge.style.display = count > 0 ? 'flex' : 'none';
        });
    }

    // Update all heart icons on the page
    updateAllHeartIcons() {
        document.querySelectorAll('.wishlist-btn, .wishlist-icon').forEach(btn => {
            const productId = this.getProductIdFromElement(btn);
            if (productId) {
                const icon = btn.querySelector('i');
                if (this.isInWishlist(productId)) {
                    icon.className = 'fas fa-heart';
                    btn.classList.add('active');
                    btn.setAttribute('title', 'Remove from wishlist');
                } else {
                    icon.className = 'far fa-heart';
                    btn.classList.remove('active');
                    btn.setAttribute('title', 'Add to wishlist');
                }
            }
        });
    }

    // Get product ID from element
    getProductIdFromElement(element) {
        // Try data attribute
        let id = element.getAttribute('data-product-id');
        if (id) return parseInt(id);
        
        // Try parent with data attribute
        const parent = element.closest('[data-product-id]');
        if (parent) {
            id = parent.getAttribute('data-product-id');
            return parseInt(id);
        }
        
        // Try to extract from onclick
        const onclick = element.getAttribute('onclick');
        if (onclick) {
            const match = onclick.match(/[0-9]+/);
            if (match) return parseInt(match[0]);
        }
        
        return null;
    }

    // Animate wishlist icon
    animateWishlistIcon() {
        const wishlistIcon = document.querySelector('.wishlist-icon, .header-icon[href*="wishlist"]');
        if (wishlistIcon) {
            wishlistIcon.classList.add('wishlist-bounce');
            setTimeout(() => {
                wishlistIcon.classList.remove('wishlist-bounce');
            }, 500);
        }
    }

    // Show notification
    showNotification(message, type = 'success') {
        // Use existing notification system if available
        if (window.showNotification) {
            window.showNotification(message, type);
            return;
        }
        
        // Fallback notification
        const notification = document.createElement('div');
        notification.className = `wishlist-notification ${type}`;
        notification.innerHTML = `
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-info-circle'}"></i>
            <span>${message}</span>
        `;
        document.body.appendChild(notification);
        
        setTimeout(() => notification.classList.add('show'), 100);
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // Update wishlist page
    updateWishlistPage() {
        const container = document.getElementById('wishlist-items');
        if (!container) return; // Not on wishlist page

        if (this.wishlist.length === 0) {
            container.innerHTML = `
                <div class="empty-wishlist">
                    <i class="far fa-heart"></i>
                    <h3>Your wishlist is empty</h3>
                    <p>Save your favorite products and they'll appear here</p>
                    <a href="shop.html" class="btn btn-primary">Start Shopping</a>
                </div>
            `;
            return;
        }

        container.innerHTML = this.wishlist.map(item => `
            <div class="wishlist-item" data-id="${item.id}">
                <div class="wishlist-item-image">
                    <img src="${item.image}" alt="${item.name}">
                </div>
                <div class="wishlist-item-details">
                    <h4>${item.name}</h4>
                    <div class="wishlist-item-category">${item.category || 'General'}</div>
                    <div class="wishlist-item-price">
                        $${item.price.toFixed(2)}
                        ${item.originalPrice && item.originalPrice > item.price ? 
                            `<span class="old-price">$${item.originalPrice.toFixed(2)}</span>` : ''}
                    </div>
                    <div class="wishlist-item-actions">
                        <button class="btn btn-primary" onclick="wishlist.moveToCart(${item.id})">
                            <i class="fas fa-shopping-cart"></i> Add to Cart
                        </button>
                        <a href="${item.amazonUrl || '#'}" target="_blank" class="btn btn-outline">
                            <i class="fab fa-amazon"></i> View on Amazon
                        </a>
                        <button class="btn btn-danger" onclick="wishlist.removeItem(${item.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    // Setup event listeners
    setupEventListeners() {
        // Listen for login/logout events to sync wishlist
        window.addEventListener('storage', (e) => {
            if (e.key === 'sbstore_current_user' || e.key?.startsWith('wishlist_')) {
                this.wishlist = this.loadWishlist();
                this.updateWishlistCount();
                this.updateAllHeartIcons();
                this.updateWishlistPage();
            }
        });
    }
}

// Initialize wishlist
const wishlist = new WishlistManager();
window.wishlist = wishlist;

// Global toggle function for product cards
window.toggleWishlist = function(productId, element) {
    // Get product details from the page
    const productCard = element?.closest('.product-card') || 
                       document.querySelector(`.product-card[data-id="${productId}"]`);
    
    if (productCard) {
        const product = {
            id: productId,
            name: productCard.querySelector('.product-title')?.textContent || 'Product',
            price: parseFloat(productCard.querySelector('.current-price')?.textContent?.replace('$', '') || '0'),
            image: productCard.querySelector('img')?.src || '',
            category: productCard.querySelector('.product-category')?.textContent || '',
            amazonUrl: productCard.querySelector('.amazon-btn, .view-btn')?.href || '#'
        };
        
        wishlist.toggleItem(product);
    } else {
        // Fallback - try to get from ProductsDB
        const allProducts = window.ProductsDB?.getAllProducts() || [];
        const product = allProducts.find(p => p.id === productId);
        if (product) {
            wishlist.toggleItem(product);
        }
    }
};

// Global check function
window.isInWishlist = function(productId) {
    return wishlist.isInWishlist(productId);
};

// Add CSS for wishlist
const wishlistStyle = document.createElement('style');
wishlistStyle.textContent = `
    .wishlist-btn {
        position: absolute;
        top: 10px;
        right: 10px;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: white;
        border: none;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        cursor: pointer;
        z-index: 10;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    .wishlist-btn i {
        font-size: 18px;
        color: #ff6b6b;
        transition: all 0.3s ease;
    }
    
    .wishlist-btn:hover {
        transform: scale(1.1);
        background: #ff6b6b;
    }
    
    .wishlist-btn:hover i {
        color: white;
    }
    
    .wishlist-btn.active {
        background: #ff6b6b;
    }
    
    .wishlist-btn.active i {
        color: white;
    }
    
    .wishlist-notification {
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 25px;
        border-radius: 10px;
        color: white;
        font-weight: 500;
        z-index: 9999;
        transform: translateX(400px);
        opacity: 0;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        gap: 10px;
        box-shadow: 0 5px 20px rgba(0,0,0,0.2);
    }
    
    .wishlist-notification.show {
        transform: translateX(0);
        opacity: 1;
    }
    
    .wishlist-notification.success {
        background: linear-gradient(135deg, #10b981, #059669);
    }
    
    .wishlist-notification.info {
        background: linear-gradient(135deg, #3b82f6, #2563eb);
    }
    
    .wishlist-notification i {
        font-size: 20px;
    }
    
    @keyframes wishlistBounce {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.2); }
    }
    
    .wishlist-bounce {
        animation: wishlistBounce 0.5s ease;
    }
    
    /* Wishlist page styles */
    .wishlist-item {
        display: flex;
        gap: 20px;
        padding: 20px;
        border: 1px solid #eee;
        border-radius: 10px;
        margin-bottom: 15px;
        background: white;
    }
    
    .wishlist-item-image {
        width: 120px;
        height: 120px;
        flex-shrink: 0;
    }
    
    .wishlist-item-image img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        border-radius: 8px;
    }
    
    .wishlist-item-details {
        flex: 1;
    }
    
    .wishlist-item-details h4 {
        font-size: 18px;
        margin-bottom: 5px;
    }
    
    .wishlist-item-category {
        font-size: 13px;
        color: #999;
        margin-bottom: 10px;
    }
    
    .wishlist-item-price {
        font-size: 20px;
        font-weight: 700;
        color: var(--purple-primary);
        margin-bottom: 15px;
    }
    
    .wishlist-item-price .old-price {
        font-size: 14px;
        color: #999;
        text-decoration: line-through;
        margin-left: 8px;
    }
    
    .wishlist-item-actions {
        display: flex;
        gap: 10px;
        flex-wrap: wrap;
    }
    
    .btn-danger {
        background: #ef4444;
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 5px;
        cursor: pointer;
        transition: all 0.3s;
    }
    
    .btn-danger:hover {
        background: #dc2626;
        transform: translateY(-2px);
    }
    
    .empty-wishlist {
        text-align: center;
        padding: 60px 20px;
    }
    
    .empty-wishlist i {
        font-size: 80px;
        color: #ff6b6b;
        margin-bottom: 20px;
    }
    
    .empty-wishlist h3 {
        font-size: 24px;
        margin-bottom: 10px;
    }
    
    .empty-wishlist p {
        color: #999;
        margin-bottom: 30px;
    }
`;
document.head.appendChild(wishlistStyle);