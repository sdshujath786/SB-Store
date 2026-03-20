// ========== DATA BRIDGE BETWEEN ADMIN AND WEBSITE ==========
// This file ensures products added in admin appear instantly on the site

const SBStoreData = {
    // Get all products
    getProducts: function() {
        const products = localStorage.getItem('sbstore_products');
        return products ? JSON.parse(products) : [];
    },

    // Get products by category
    getProductsByCategory: function(category) {
        const products = this.getProducts();
        return products.filter(p => p.category === category);
    },

    // Get single product
    getProduct: function(id) {
        const products = this.getProducts();
        return products.find(p => p.id == id);
    },

    // Get featured products
    getFeaturedProducts: function(limit = 8) {
        const products = this.getProducts();
        return products.slice(0, limit);
    },

    // Get trending products (by clicks)
    getTrendingProducts: function(limit = 8) {
        const products = this.getProducts();
        const clicks = JSON.parse(localStorage.getItem('affiliate_clicks')) || [];
        
        // Count clicks per product
        const clickCount = {};
        clicks.forEach(c => {
            clickCount[c.productId] = (clickCount[c.productId] || 0) + 1;
        });
        
        // Sort by clicks
        return products.sort((a, b) => {
            const aClicks = clickCount[a.id] || 0;
            const bClicks = clickCount[b.id] || 0;
            return bClicks - aClicks;
        }).slice(0, limit);
    },

    // Get categories with product counts
    getCategories: function() {
        const products = this.getProducts();
        const categories = {};
        
        products.forEach(p => {
            if (!categories[p.category]) {
                categories[p.category] = {
                    name: p.category,
                    count: 0,
                    products: []
                };
            }
            categories[p.category].count++;
            categories[p.category].products.push(p);
        });
        
        return Object.values(categories);
    },

    // Search products
    searchProducts: function(query) {
        const products = this.getProducts();
        const searchTerm = query.toLowerCase();
        
        return products.filter(p => 
            p.name.toLowerCase().includes(searchTerm) ||
            p.description.toLowerCase().includes(searchTerm) ||
            p.category.toLowerCase().includes(searchTerm) ||
            (p.brand && p.brand.toLowerCase().includes(searchTerm))
        );
    },

    // Filter products
    filterProducts: function(filters) {
        let products = this.getProducts();
        
        if (filters.category) {
            products = products.filter(p => p.category === filters.category);
        }
        
        if (filters.minPrice) {
            products = products.filter(p => (p.salePrice || p.price) >= filters.minPrice);
        }
        
        if (filters.maxPrice) {
            products = products.filter(p => (p.salePrice || p.price) <= filters.maxPrice);
        }
        
        if (filters.rating) {
            products = products.filter(p => p.rating >= filters.rating);
        }
        
        if (filters.inStock) {
            products = products.filter(p => p.inStock);
        }
        
        return products;
    },

    // Track click
    trackClick: function(productId, productName, amazonUrl) {
        const clicks = JSON.parse(localStorage.getItem('affiliate_clicks')) || [];
        
        clicks.push({
            productId: productId,
            productName: productName,
            url: amazonUrl,
            timestamp: new Date().toISOString()
        });
        
        localStorage.setItem('affiliate_clicks', JSON.stringify(clicks));
        
        // Update product click count in admin stats
        this.updateProductStats(productId);
    },

    // Update product stats
    updateProductStats: function(productId) {
        // This will be used by admin panel
        const event = new CustomEvent('productClicked', { detail: { productId } });
        window.dispatchEvent(event);
    },

    // Format price
    formatPrice: function(price) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(price);
    },

    // Render stars
    renderStars: function(rating) {
        const fullStars = Math.floor(rating);
        const hasHalf = rating % 1 >= 0.5;
        let stars = '';
        
        for (let i = 0; i < fullStars; i++) {
            stars += '<i class="fas fa-star"></i>';
        }
        if (hasHalf) {
            stars += '<i class="fas fa-star-half-alt"></i>';
        }
        const emptyStars = 5 - Math.ceil(rating);
        for (let i = 0; i < emptyStars; i++) {
            stars += '<i class="far fa-star"></i>';
        }
        
        return stars;
    }
};

// Listen for storage changes (when admin adds/edits products)
window.addEventListener('storage', function(e) {
    if (e.key === 'sbstore_products') {
        // Products have been updated in another tab
        console.log('Products updated! Refreshing...');
        
        // Reload products on the page
        if (typeof loadProducts === 'function') {
            loadProducts();
        }
        
        // Show notification to user
        const notification = document.createElement('div');
        notification.className = 'notification notification-info';
        notification.innerHTML = `
            <i class="fas fa-sync-alt"></i>
            <span>New products added! Refreshing...</span>
        `;
        document.body.appendChild(notification);
        
        setTimeout(() => notification.classList.add('show'), 100);
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
            window.location.reload();
        }, 2000);
    }
});

// Expose to global scope
window.SBStoreData = SBStoreData;