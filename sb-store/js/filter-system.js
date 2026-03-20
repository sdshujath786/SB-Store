// ========== ENHANCED FILTER SYSTEM WITH DEBUGGING ==========

class FilterSystem {
    constructor() {
        console.log('🔧 Initializing FilterSystem...');
        this.products = [];
        this.filteredProducts = [];
        this.activeFilters = {
            categories: [],
            brands: [],
            minPrice: 0,
            maxPrice: 1000,
            minRating: null,
            inStockOnly: false,
            search: ''
        };
        this.sortBy = 'default';
        this.init();
    }

    init() {
        console.log('📦 Loading products...');
        this.loadProducts();
        this.setupFilters();
        this.setupEventListeners();
        console.log('✅ FilterSystem initialized');
    }

    loadProducts() {
        // Get products from ProductsDB
        if (!window.ProductsDB) {
            console.error('❌ ProductsDB not found!');
            return;
        }
        
        this.products = ProductsDB.getAllProducts();
        console.log(`📊 Loaded ${this.products.length} products`);
        
        this.filteredProducts = [...this.products];
        
        // Set initial price range
        const range = ProductsDB.getPriceRange();
        this.activeFilters.minPrice = range.min;
        this.activeFilters.maxPrice = range.max;
        
        this.renderProducts();
        this.updateResultsCount();
    }

    setupFilters() {
        console.log('🔧 Setting up filters...');
        
        // Load categories dynamically
        const categories = ProductsDB.getCategories();
        const categoryContainer = document.getElementById('categoryFilters');
        if (categoryContainer) {
            console.log('✅ Category container found');
            const checkboxes = categoryContainer.querySelectorAll('input[type="checkbox"]');
            
            // Update existing checkboxes with counts
            checkboxes.forEach(cb => {
                const cat = cb.value;
                const count = this.products.filter(p => p.category === cat).length;
                const label = cb.closest('label');
                if (label) {
                    let span = label.querySelector('.count');
                    if (!span) {
                        span = document.createElement('span');
                        span.className = 'count';
                        span.style.color = '#999';
                        span.style.marginLeft = '5px';
                        label.appendChild(span);
                    }
                    span.textContent = `(${count})`;
                }
                
                // Add change event if not present
                if (!cb.hasAttribute('onchange')) {
                    cb.addEventListener('change', (e) => {
                        if (e.target.checked) {
                            this.toggleCategory(cat);
                        } else {
                            this.toggleCategory(cat);
                        }
                    });
                }
            });
        } else {
            console.warn('❌ Category container not found');
        }

        // Load brands dynamically
        const brands = ProductsDB.getBrands();
        const brandContainer = document.getElementById('brandFilters');
        if (brandContainer) {
            console.log('✅ Brand container found');
            const checkboxes = brandContainer.querySelectorAll('input[type="checkbox"]');
            
            checkboxes.forEach(cb => {
                const brand = cb.value;
                const count = this.products.filter(p => p.brand === brand).length;
                const label = cb.closest('label');
                if (label) {
                    let span = label.querySelector('.count');
                    if (!span) {
                        span = document.createElement('span');
                        span.className = 'count';
                        span.style.color = '#999';
                        span.style.marginLeft = '5px';
                        label.appendChild(span);
                    }
                    span.textContent = `(${count})`;
                }
                
                if (!cb.hasAttribute('onchange')) {
                    cb.addEventListener('change', (e) => {
                        if (e.target.checked) {
                            this.toggleBrand(brand);
                        } else {
                            this.toggleBrand(brand);
                        }
                    });
                }
            });
        } else {
            console.warn('❌ Brand container not found');
        }

        // Set price range inputs
        const range = ProductsDB.getPriceRange();
        const minInput = document.getElementById('minPrice');
        const maxInput = document.getElementById('maxPrice');
        const priceMin = document.getElementById('priceMin');
        const priceMax = document.getElementById('priceMax');
        
        if (minInput) {
            minInput.value = range.min;
            minInput.min = range.min;
            minInput.max = range.max;
        }
        if (maxInput) {
            maxInput.value = range.max;
            maxInput.min = range.min;
            maxInput.max = range.max;
        }
        if (priceMin) {
            priceMin.min = range.min;
            priceMin.max = range.max;
            priceMin.value = range.min;
        }
        if (priceMax) {
            priceMax.min = range.min;
            priceMax.max = range.max;
            priceMax.value = range.max;
        }
        
        console.log('✅ Filters setup complete');
    }

    setupEventListeners() {
        console.log('🔧 Setting up event listeners...');
        
        // Price range sliders
        const priceMin = document.getElementById('priceMin');
        const priceMax = document.getElementById('priceMax');
        const minInput = document.getElementById('minPrice');
        const maxInput = document.getElementById('maxPrice');

        if (priceMin) {
            priceMin.addEventListener('input', (e) => {
                if (minInput) minInput.value = e.target.value;
                this.activeFilters.minPrice = parseInt(e.target.value);
                this.applyFilters();
            });
        }

        if (priceMax) {
            priceMax.addEventListener('input', (e) => {
                if (maxInput) maxInput.value = e.target.value;
                this.activeFilters.maxPrice = parseInt(e.target.value);
                this.applyFilters();
            });
        }

        if (minInput) {
            minInput.addEventListener('change', () => {
                const val = parseInt(minInput.value) || 0;
                if (priceMin) priceMin.value = val;
                this.activeFilters.minPrice = val;
                this.applyFilters();
            });
        }

        if (maxInput) {
            maxInput.addEventListener('change', () => {
                const val = parseInt(maxInput.value) || 1000;
                if (priceMax) priceMax.value = val;
                this.activeFilters.maxPrice = val;
                this.applyFilters();
            });
        }

        // Rating filters
        const ratingFilters = document.getElementById('ratingFilters');
        if (ratingFilters) {
            ratingFilters.querySelectorAll('input[type="checkbox"]').forEach(cb => {
                cb.addEventListener('change', (e) => {
                    if (e.target.checked) {
                        // Uncheck others
                        ratingFilters.querySelectorAll('input[type="checkbox"]').forEach(other => {
                            if (other !== e.target) other.checked = false;
                        });
                        this.activeFilters.minRating = parseInt(e.target.value);
                    } else {
                        this.activeFilters.minRating = null;
                    }
                    this.applyFilters();
                });
            });
        }

        // Apply filters button
        const applyBtn = document.getElementById('applyFilters');
        if (applyBtn) {
            applyBtn.addEventListener('click', () => this.applyFilters());
        }

        // Clear filters button
        const clearBtn = document.getElementById('clearFilters');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => this.clearAllFilters());
        }

        // Sort select
        const sortSelect = document.getElementById('sortBy');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                this.sortBy = e.target.value;
                this.applyFilters();
            });
        }
        
        console.log('✅ Event listeners setup complete');
    }

    toggleCategory(category) {
        console.log(`📁 Toggling category: ${category}`);
        const index = this.activeFilters.categories.indexOf(category);
        if (index === -1) {
            this.activeFilters.categories.push(category);
        } else {
            this.activeFilters.categories.splice(index, 1);
        }
        this.applyFilters();
    }

    toggleBrand(brand) {
        console.log(`🏷️ Toggling brand: ${brand}`);
        const index = this.activeFilters.brands.indexOf(brand);
        if (index === -1) {
            this.activeFilters.brands.push(brand);
        } else {
            this.activeFilters.brands.splice(index, 1);
        }
        this.applyFilters();
    }

    applyFilters() {
        console.log('🎯 Applying filters:', this.activeFilters);
        
        // Apply all filters
        this.filteredProducts = ProductsDB.filterProducts(this.activeFilters);
        console.log(`📊 Filtered products: ${this.filteredProducts.length}`);
        
        // Apply sorting
        this.filteredProducts = ProductsDB.sortProducts(this.filteredProducts, this.sortBy);
        
        // Update UI
        this.renderProducts();
        this.updateResultsCount();
    }

    renderProducts() {
        const grid = document.getElementById('shopProductsGrid');
        if (!grid) {
            console.error('❌ Products grid not found');
            return;
        }

        if (this.filteredProducts.length === 0) {
            grid.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 60px;">
                    <i class="fas fa-search" style="font-size: 50px; color: #ddd; margin-bottom: 20px;"></i>
                    <h3>No products found</h3>
                    <p>Try adjusting your filters</p>
                    <button onclick="filterSystem.clearAllFilters()" class="btn btn-primary" style="margin-top: 20px;">
                        Clear Filters
                    </button>
                </div>
            `;
            return;
        }

        grid.innerHTML = this.filteredProducts.map(product => {
            const price = product.salePrice || product.price;
            const oldPrice = product.salePrice ? product.price : null;
            const discount = product.discount ? 
                `<span class="product-badge sale">-${product.discount}%</span>` : '';

            return `
                <div class="product-card" onclick="viewProduct(${product.id})">
                    ${discount}
                    <div class="product-image">
                        <img src="${product.image}" alt="${product.name}" loading="lazy">
                        <button class="wishlist-btn ${window.AccountSystem && AccountSystem.isInWishlist(product.id) ? 'active' : ''}" 
                                onclick="event.stopPropagation(); toggleWishlist(${product.id}, this)">
                            <i class="${window.AccountSystem && AccountSystem.isInWishlist(product.id) ? 'fas' : 'far'} fa-heart"></i>
                        </button>
                        <button class="quick-view-btn" onclick="event.stopPropagation(); quickView(${product.id})">
                            <i class="far fa-eye"></i>
                        </button>
                    </div>
                    <div class="product-info">
                        <div class="product-category">${product.category}</div>
                        <h3 class="product-title">${product.name}</h3>
                        <div class="product-rating">
                            <span class="stars">${ProductsDB.getStarRating(product.rating)}</span>
                            <span class="review-count">(${product.reviews || 0})</span>
                        </div>
                        <div class="product-price">
                            <span class="current-price">$${price.toFixed(2)}</span>
                            ${oldPrice ? `<span class="old-price">$${oldPrice.toFixed(2)}</span>` : ''}
                        </div>
                        <button class="add-to-cart-btn" onclick="event.stopPropagation(); viewProduct(${product.id})">
                            View Details
                        </button>
                    </div>
                </div>
            `;
        }).join('');
        
        console.log(`✅ Rendered ${this.filteredProducts.length} products`);
    }

    updateResultsCount() {
        const countEl = document.getElementById('resultsCount');
        if (countEl) {
            countEl.textContent = `Showing ${this.filteredProducts.length} of ${this.products.length} products`;
        }
    }

    clearAllFilters() {
        console.log('🧹 Clearing all filters');
        
        // Reset all filters
        this.activeFilters = {
            categories: [],
            brands: [],
            minPrice: 0,
            maxPrice: 1000,
            minRating: null,
            inStockOnly: false,
            search: ''
        };

        // Reset UI
        document.querySelectorAll('#categoryFilters input').forEach(cb => cb.checked = false);
        document.querySelectorAll('#brandFilters input').forEach(cb => cb.checked = false);
        document.querySelectorAll('#ratingFilters input').forEach(cb => cb.checked = false);
        
        const range = ProductsDB.getPriceRange();
        const minInput = document.getElementById('minPrice');
        const maxInput = document.getElementById('maxPrice');
        const priceMin = document.getElementById('priceMin');
        const priceMax = document.getElementById('priceMax');
        
        if (minInput) minInput.value = range.min;
        if (maxInput) maxInput.value = range.max;
        if (priceMin) priceMin.value = range.min;
        if (priceMax) priceMax.value = range.max;
        
        this.activeFilters.minPrice = range.min;
        this.activeFilters.maxPrice = range.max;
        
        const sortSelect = document.getElementById('sortBy');
        if (sortSelect) sortSelect.value = 'default';
        this.sortBy = 'default';
        
        this.applyFilters();
    }
}

// Initialize filter system
let filterSystem;

// Wait for DOM to load
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 DOM loaded, initializing filter system...');
    // Small delay to ensure ProductsDB is loaded
    setTimeout(() => {
        if (typeof ProductsDB !== 'undefined') {
            filterSystem = new FilterSystem();
            window.filterSystem = filterSystem;
        } else {
            console.error('❌ ProductsDB not available');
        }
    }, 100);
});