// ========== ENHANCED SHOP PAGE WITH AMAZON INTEGRATION ==========

class ShopManager {
    constructor() {
        this.products = [];
        this.filteredProducts = [];
        this.currentPage = 1;
        this.itemsPerPage = 12;
        this.filters = {
            categories: [],
            priceRange: { min: 0, max: 1000 },
            ratings: [],
            brands: []
        };
        this.sortBy = 'default';
        
        this.init();
    }

    init() {
        this.loadProducts();
        this.setupEventListeners();
        this.loadAmazonBanner();
    }

    loadProducts() {
        // Use the data bridge to get products
        this.products = SBStoreData.getProducts();
        this.filteredProducts = [...this.products];
        this.renderProducts();
        this.updateResultsCount();
    }

    renderProducts() {
        const grid = document.getElementById('shopProductsGrid');
        if (!grid) return;

        const start = (this.currentPage - 1) * this.itemsPerPage;
        const end = start + this.itemsPerPage;
        const pageProducts = this.filteredProducts.slice(start, end);

        if (pageProducts.length === 0) {
            grid.innerHTML = `
                <div class="no-products">
                    <i class="fas fa-box-open"></i>
                    <h3>No products yet</h3>
                    <p>Check back soon for amazing deals!</p>
                </div>
            `;
            return;
        }

        grid.innerHTML = pageProducts.map(product => {
            const price = product.salePrice || product.price;
            const oldPrice = product.salePrice ? product.price : null;
            
            return `
                <div class="product-card" data-product-id="${product.id}">
                    ${product.discount ? `<span class="product-badge sale">-${product.discount}%</span>` : ''}
                    ${product.prime ? '<span class="prime-badge"><i class="fab fa-amazon"></i> Prime</span>' : ''}
                    <div class="product-image">
                        <img src="${product.image}" alt="${product.name}" loading="lazy">
                        <button class="wishlist-btn" onclick="event.stopPropagation(); toggleWishlist(${product.id}, this)">
                            <i class="${window.AccountSystem && window.AccountSystem.isInWishlist ? (window.AccountSystem.isInWishlist(product.id) ? 'fas' : 'far') : 'far'} fa-heart"></i>
                        </button>
                        <button class="quick-view-btn" onclick="event.stopPropagation(); quickView(${product.id})">
                            <i class="far fa-eye"></i>
                        </button>
                    </div>
                    <div class="product-info">
                        <div class="product-category">${product.category}</div>
                        <h3 class="product-title">${product.name}</h3>
                        <div class="product-rating">
                            <div class="stars">${SBStoreData.renderStars(product.rating || 4.5)}</div>
                            <span class="review-count">(${product.reviews || 0})</span>
                        </div>
                        <div class="product-price">
                            <span class="current-price">$${price.toFixed(2)}</span>
                            ${oldPrice ? `<span class="old-price">$${oldPrice.toFixed(2)}</span>` : ''}
                        </div>
                        <a href="${product.amazonUrl || '#'}" target="_blank" class="buy-btn" 
                           onclick="event.stopPropagation(); SBStoreData.trackClick(${product.id}, '${product.name}', '${product.amazonUrl}')">
                            <i class="fab fa-amazon"></i> View on Amazon
                        </a>
                    </div>
                </div>
            `;
        }).join('');

        this.renderPagination();
    }

    loadAmazonBanner() {
        // Add Amazon promo banner
        const bannerHtml = `
            <div class="amazon-promo-banner">
                <div class="container">
                    <div class="banner-content">
                        <div class="banner-text">
                            <i class="fab fa-amazon"></i>
                            <span>Millions of products with fast delivery</span>
                        </div>
                        <a href="#" class="btn btn-primary" onclick="window.open('https://amazon.com', '_blank')">
                            Shop on Amazon <i class="fas fa-external-link-alt"></i>
                        </a>
                    </div>
                </div>
            </div>
        `;
        
        const header = document.querySelector('.page-header');
        if (header) {
            header.insertAdjacentHTML('afterend', bannerHtml);
        }
    }

    renderProductsFull() {
        const grid = document.getElementById('shopProductsGrid');
        if (!grid) return;

        const start = (this.currentPage - 1) * this.itemsPerPage;
        const end = start + this.itemsPerPage;
        const pageProducts = this.filteredProducts.slice(start, end);

        if (pageProducts.length === 0) {
            grid.innerHTML = `
                <div class="no-products">
                    <i class="fas fa-search"></i>
                    <h3>No products found</h3>
                    <p>Try adjusting your filters</p>
                </div>
            `;
            return;
        }

        grid.innerHTML = pageProducts.map(product => {
            const price = product.salePrice || product.price;
            const oldPrice = product.salePrice ? product.price : null;
            const discount = product.discount ? 
                `<span class="product-badge sale">-${product.discount}%</span>` : '';
            const amazonPrice = product.amazonPrice || price;
            const savings = product.price && product.salePrice ? 
                (product.price - product.salePrice).toFixed(2) : 0;

            return `
                <div class="product-card" data-product-id="${product.id}">
                    ${discount}
                    ${product.prime ? '<span class="prime-badge"><i class="fab fa-amazon"></i> Prime</span>' : ''}
                    <div class="product-image">
                        <img src="${product.image}" alt="${product.name}" loading="lazy">
                        <button class="wishlist-btn" onclick="event.stopPropagation(); toggleWishlist(${product.id}, this)">
                            <i class="${window.AccountSystem && window.AccountSystem.isInWishlist ? (window.AccountSystem.isInWishlist(product.id) ? 'fas' : 'far') : 'far'} fa-heart"></i>
                        </button>
                        <button class="quick-view-btn" onclick="event.stopPropagation(); quickView(${product.id})">
                            <i class="far fa-eye"></i>
                        </button>
                    </div>
                    <div class="product-info">
                        <div class="product-category">${product.category}</div>
                        <h3 class="product-title">${product.name}</h3>
                        
                        <div class="product-rating">
                            <div class="stars">
                                ${this.renderStars(product.rating)}
                            </div>
                            <span class="review-count">(${product.reviews || 0})</span>
                        </div>
                        
                        <div class="price-comparison">
                            <div class="amazon-price">
                                <i class="fab fa-amazon"></i>
                                <span class="price">$${amazonPrice.toFixed(2)}</span>
                            </div>
                            ${savings > 0 ? `
                                <div class="savings-badge">
                                    Save $${savings}
                                </div>
                            ` : ''}
                        </div>
                        
                        <div class="delivery-info">
                            <i class="fas fa-truck"></i>
                            <span>Free delivery by Amazon</span>
                        </div>
                        
                        <a href="${product.amazonUrl || '#'}" target="_blank" class="buy-btn" onclick="trackClick(${product.id})">
                            <i class="fab fa-amazon"></i> View on Amazon
                            <span class="btn-hint">Opens new tab</span>
                        </a>
                        
                        <div class="product-meta">
                            <span class="seller"><i class="fas fa-store"></i> Amazon.com</span>
                            ${product.inStock ? 
                                '<span class="stock in-stock"><i class="fas fa-check-circle"></i> In Stock</span>' : 
                                '<span class="stock out-of-stock"><i class="fas fa-times-circle"></i> Out of Stock</span>'
                            }
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        this.renderPagination();
        this.initProductHover();
    }

    renderStars(rating) {
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

    initProductHover() {
        document.querySelectorAll('.product-card').forEach(card => {
            card.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-10px)';
            });
            
            card.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0)';
            });
        });
    }

    renderPagination() {
        const totalPages = Math.ceil(this.filteredProducts.length / this.itemsPerPage);
        const pagination = document.getElementById('pagination');
        
        if (!pagination) return;

        let html = '';
        for (let i = 1; i <= totalPages; i++) {
            html += `
                <button class="page-btn ${i === this.currentPage ? 'active' : ''}" 
                        onclick="shopManager.goToPage(${i})">
                    ${i}
                </button>
            `;
        }
        pagination.innerHTML = html;
    }

    goToPage(page) {
        this.currentPage = page;
        this.renderProducts();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    updateResultsCount() {
        const countEl = document.getElementById('resultsCount');
        if (countEl) {
            const start = (this.currentPage - 1) * this.itemsPerPage + 1;
            const end = Math.min(this.currentPage * this.itemsPerPage, this.filteredProducts.length);
            countEl.textContent = `Showing ${start}-${end} of ${this.filteredProducts.length} results`;
        }
    }
}

// Global functions
window.toggleWishlist = function(productId, button) {
    if (window.AccountSystem) {
        const result = AccountSystem.toggleWishlist(productId);
        
        // Show notification
        showNotification(result.message, result.success ? 'success' : 'info');
        
        // Update button icon
        const icon = button.querySelector('i');
        if (icon) {
            if (AccountSystem.isInWishlist(productId)) {
                icon.classList.remove('far');
                icon.classList.add('fas');
                button.classList.add('active');
            } else {
                icon.classList.remove('fas');
                icon.classList.add('far');
                button.classList.remove('active');
            }
        }
    } else {
        // Fallback to localStorage if AccountSystem not available
        let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
        const index = wishlist.indexOf(productId);
        
        if (index === -1) {
            wishlist.push(productId);
            showNotification('❤️ Added to wishlist!', 'success');
            
            const icon = button.querySelector('i');
            if (icon) {
                icon.classList.remove('far');
                icon.classList.add('fas');
            }
        } else {
            wishlist.splice(index, 1);
            showNotification('💔 Removed from wishlist', 'info');
            
            const icon = button.querySelector('i');
            if (icon) {
                icon.classList.remove('fas');
                icon.classList.add('far');
            }
        }
        
        localStorage.setItem('wishlist', JSON.stringify(wishlist));
    }
    
    updateWishlistCount();
};

window.addToWishlist = function(productId) {
    // Find the button for this product
    const button = document.querySelector(`.product-card[data-product-id="${productId}"] .wishlist-btn`);
    if (button) {
        toggleWishlist(productId, button);
    } else {
        // Fallback if button not found
        if (window.AccountSystem) {
            const result = AccountSystem.toggleWishlist(productId);
            showNotification(result.message, result.success ? 'success' : 'info');
        } else {
            let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
            const index = wishlist.indexOf(productId);
            
            if (index === -1) {
                wishlist.push(productId);
                showNotification('❤️ Added to wishlist!', 'success');
            } else {
                wishlist.splice(index, 1);
                showNotification('💔 Removed from wishlist', 'info');
            }
            
            localStorage.setItem('wishlist', JSON.stringify(wishlist));
        }
        updateWishlistCount();
    }
};

window.shareProduct = function(productId) {
    const product = shopManager.products.find(p => p.id === productId);
    if (product) {
        if (navigator.share) {
            navigator.share({
                title: product.name,
                text: `Check out ${product.name} on SB Store!`,
                url: window.location.origin + `/product.html?id=${productId}`
            });
        } else {
            // Fallback
            navigator.clipboard.writeText(window.location.origin + `/product.html?id=${productId}`);
            showNotification('Link copied to clipboard!', 'success');
        }
    }
};

window.trackClick = function(productId) {
    const product = shopManager.products.find(p => p.id === productId);
    if (product) {
        // Track clicks for analytics
        let clicks = JSON.parse(localStorage.getItem('affiliate_clicks')) || [];
        clicks.push({
            productId: productId,
            productName: product.name,
            timestamp: new Date().toISOString(),
            url: product.amazonUrl
        });
        localStorage.setItem('affiliate_clicks', JSON.stringify(clicks));
        
        // Update click count in admin stats
        if (window.updateClickStats) {
            updateClickStats(productId);
        }
    }
};

window.quickView = function(productId) {
    // Create quick view modal
    const product = shopManager.products.find(p => p.id === productId);
    if (!product) return;
    
    const modal = document.createElement('div');
    modal.className = 'quick-view-modal';
    modal.innerHTML = `
        <div class="modal-overlay"></div>
        <div class="modal-content">
            <button class="modal-close" onclick="this.closest('.quick-view-modal').remove()">&times;</button>
            <div class="modal-body">
                <div class="modal-image">
                    <img src="${product.image}" alt="${product.name}">
                </div>
                <div class="modal-details">
                    <h2>${product.name}</h2>
                    <div class="rating">${shopManager.renderStars(product.rating)} (${product.reviews || 0})</div>
                    <div class="price">$${(product.salePrice || product.price).toFixed(2)}</div>
                    <p class="description">${product.description || 'No description available.'}</p>
                    <div class="modal-actions">
                        <button class="wishlist-btn" onclick="toggleWishlist(${product.id}, this)">
                            <i class="${window.AccountSystem && window.AccountSystem.isInWishlist ? (window.AccountSystem.isInWishlist(product.id) ? 'fas' : 'far') : 'far'} fa-heart"></i>
                            ${window.AccountSystem && window.AccountSystem.isInWishlist && window.AccountSystem.isInWishlist(product.id) ? 'In Wishlist' : 'Add to Wishlist'}
                        </button>
                        <a href="${product.amazonUrl}" target="_blank" class="buy-btn" onclick="trackClick(${product.id})">
                            <i class="fab fa-amazon"></i> View on Amazon
                        </a>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Close on overlay click
    modal.querySelector('.modal-overlay').addEventListener('click', () => modal.remove());
};

function updateWishlistCount() {
    if (window.AccountSystem) {
        AccountSystem.updateWishlistCount();
    } else {
        const wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
        document.querySelectorAll('.wishlist-count').forEach(el => {
            el.textContent = wishlist.length;
            el.style.display = wishlist.length > 0 ? 'flex' : 'none';
        });
    }
}

function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
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

// Helper function to check if product is in wishlist
window.isInWishlist = function(productId) {
    return window.AccountSystem ? AccountSystem.isInWishlist(productId) : false;
};

// Initialize shop manager
const shopManager = new ShopManager();