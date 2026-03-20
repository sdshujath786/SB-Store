// ========== PRODUCT DETAIL PAGE FUNCTIONALITY ==========
class ProductDetailManager {
    constructor() {
        this.product = null;
        this.quantity = 1;
        this.currentImage = 0;
        this.images = [];
        this.init();
    }

    init() {
        // Get product ID from URL
        const urlParams = new URLSearchParams(window.location.search);
        const productId = parseInt(urlParams.get('id'));
        
        if (!productId) {
            window.location.href = 'shop.html';
            return;
        }

        this.loadProduct(productId);
        this.setupEventListeners();
    }

    // UPDATED: Use data bridge to get product
    loadProduct(productId) {
        // Use data bridge to get product
        this.product = SBStoreData.getProduct(productId);
        
        if (!this.product) {
            window.location.href = 'shop.html';
            return;
        }

        // Set up images array
        this.images = [
            this.product.image,
            this.product.image.replace('?w=500', '?w=500&q=80'),
            this.product.image.replace('?w=500', '?w=500&blur=200'),
            this.product.image.replace('?w=500', '?w=500&sat=-100'),
            this.product.image.replace('?w=500', '?w=500&rot=90')
        ];

        this.renderProduct();
        this.loadRelatedProducts();
    }

    renderProduct() {
        // Set breadcrumb
        document.getElementById('breadcrumbCategory').textContent = this.product.category;
        document.getElementById('breadcrumbCategory').href = `shop.html?category=${this.product.category.toLowerCase()}`;
        document.getElementById('breadcrumbProduct').textContent = this.product.name;

        // Set main image
        document.getElementById('mainProductImage').src = this.product.image;
        document.getElementById('mainProductImage').alt = this.product.name;

        // Set badge
        const badge = document.getElementById('productBadge');
        if (this.product.discount) {
            badge.textContent = `-${this.product.discount}% OFF`;
            badge.classList.add('sale');
        } else {
            badge.style.display = 'none';
        }

        // Render thumbnails
        this.renderThumbnails();

        // Set product info
        document.getElementById('productCategory').textContent = this.product.category;
        document.getElementById('productName').textContent = this.product.name;
        document.getElementById('productSku').textContent = `SB${this.product.id}`;

        // Set rating
        const ratingStars = '★'.repeat(Math.floor(this.product.rating)) + 
                           (this.product.rating % 1 ? '½' : '');
        document.getElementById('productRating').textContent = ratingStars;
        document.getElementById('reviewCount').textContent = `(${this.product.reviews} reviews)`;

        // Set price
        const currentPrice = this.product.salePrice || this.product.price;
        document.getElementById('currentPrice').textContent = `$${currentPrice.toFixed(2)}`;
        
        if (this.product.salePrice) {
            document.getElementById('oldPrice').textContent = `$${this.product.price.toFixed(2)}`;
            document.getElementById('discountBadge').textContent = `Save $${(this.product.price - this.product.salePrice).toFixed(2)}`;
        } else {
            document.getElementById('oldPrice').style.display = 'none';
            document.getElementById('discountBadge').style.display = 'none';
        }

        // Set stock status
        const stockEl = document.getElementById('stockStatus');
        if (this.product.inStock) {
            stockEl.textContent = 'In Stock';
            stockEl.style.color = '#10b981';
        } else {
            stockEl.textContent = 'Out of Stock';
            stockEl.style.color = '#ef4444';
            document.getElementById('addToCartBtn').disabled = true;
            document.getElementById('buyNowBtn').disabled = true;
        }

        // Set description
        document.getElementById('productDescription').textContent = this.product.description;

        // Set features
        if (this.product.features) {
            const featuresList = document.createElement('ul');
            featuresList.className = 'feature-list';
            this.product.features.forEach(feature => {
                const li = document.createElement('li');
                li.innerHTML = `<i class="fas fa-check-circle"></i> ${feature}`;
                featuresList.appendChild(li);
            });
            document.getElementById('productFeatures').appendChild(featuresList);
        }

        // Set full description
        document.getElementById('fullDescription').innerHTML = `
            <p>${this.product.description}</p>
            <p>The ${this.product.name} is designed to provide the best experience. 
            With premium quality and advanced features, it's perfect for your needs.</p>
        `;

        // Set specifications
        this.renderSpecifications();
        
        // Set reviews
        this.renderReviews();
    }

    renderThumbnails() {
        const gallery = document.getElementById('thumbnailGallery');
        gallery.innerHTML = this.images.map((img, index) => `
            <div class="thumbnail ${index === 0 ? 'active' : ''}" onclick="productDetail.changeImage(${index})">
                <img src="${img}" alt="Thumbnail ${index + 1}">
            </div>
        `).join('');
    }

    changeImage(index) {
        this.currentImage = index;
        document.getElementById('mainProductImage').src = this.images[index];
        
        // Update active thumbnail
        document.querySelectorAll('.thumbnail').forEach((thumb, i) => {
            if (i === index) {
                thumb.classList.add('active');
            } else {
                thumb.classList.remove('active');
            }
        });
    }

    renderSpecifications() {
        const specs = [
            { label: 'Brand', value: this.product.brand || 'SB Store' },
            { label: 'Model', value: this.product.name.split(' ').slice(0,2).join(' ') },
            { label: 'Category', value: this.product.category },
            { label: 'Warranty', value: '1 Year' },
            { label: 'Country of Origin', value: 'USA' },
            { label: 'Manufacturer', value: this.product.brand || 'SB Store' }
        ];

        const table = document.getElementById('specificationsTable');
        table.innerHTML = specs.map(spec => `
            <tr>
                <td>${spec.label}</td>
                <td>${spec.value}</td>
            </tr>
        `).join('');
    }

    renderReviews() {
        const reviews = [
            {
                name: 'John Doe',
                date: '2025-03-10',
                rating: 5,
                title: 'Excellent product!',
                text: 'This is exactly what I was looking for. Great quality and fast shipping.'
            },
            {
                name: 'Jane Smith',
                date: '2025-03-08',
                rating: 4,
                title: 'Very good, but...',
                text: 'Product is great, but packaging could be better.'
            },
            {
                name: 'Mike Johnson',
                date: '2025-03-05',
                rating: 5,
                title: 'Best purchase ever',
                text: 'Exceeded my expectations. Highly recommended!'
            }
        ];

        const reviewsList = document.getElementById('reviewsList');
        reviewsList.innerHTML = reviews.map(review => `
            <div class="review-card">
                <div class="review-header">
                    <div class="reviewer-avatar">${review.name.charAt(0)}</div>
                    <div class="reviewer-info">
                        <h4>${review.name}</h4>
                        <div class="review-date">${review.date}</div>
                    </div>
                </div>
                <div class="review-rating">${'★'.repeat(review.rating)}${'☆'.repeat(5-review.rating)}</div>
                <h5 class="review-title">${review.title}</h5>
                <p class="review-text">${review.text}</p>
            </div>
        `).join('');

        // Update average rating
        document.getElementById('avgRating').textContent = this.product.rating;
        document.getElementById('avgRatingStars').textContent = '★'.repeat(Math.floor(this.product.rating)) + 
                                                               (this.product.rating % 1 ? '½' : '');
        document.getElementById('totalReviews').textContent = this.product.reviews + ' Reviews';
    }

    loadRelatedProducts() {
        const grid = document.getElementById('relatedProductsGrid');
        const related = [];
        
        // Get products from same category
        for (let category in productsData) {
            if (category.toLowerCase() === this.product.category.toLowerCase()) {
                related.push(...productsData[category].filter(p => p.id !== this.product.id).slice(0, 4));
            }
        }

        if (related.length === 0) {
            // If no related products, get any products
            for (let category in productsData) {
                related.push(...productsData[category].filter(p => p.id !== this.product.id));
                if (related.length >= 4) break;
            }
        }

        grid.innerHTML = related.slice(0, 4).map(product => {
            const price = product.salePrice || product.price;
            return `
                <div class="product-card" onclick="window.location.href='product.html?id=${product.id}'">
                    <div class="product-image">
                        <img src="${product.image}" alt="${product.name}">
                    </div>
                    <div class="product-info">
                        <h3 class="product-title">${product.name}</h3>
                        <div class="product-price">$${price.toFixed(2)}</div>
                        <button class="add-to-cart-btn" onclick="event.stopPropagation(); cart.addItem(${JSON.stringify(product).replace(/"/g, '&quot;')})">
                            Add to Cart
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    setupEventListeners() {
        // Quantity buttons
        document.getElementById('decreaseQty').addEventListener('click', () => {
            if (this.quantity > 1) {
                this.quantity--;
                document.getElementById('quantity').value = this.quantity;
            }
        });

        document.getElementById('increaseQty').addEventListener('click', () => {
            if (this.quantity < 99) {
                this.quantity++;
                document.getElementById('quantity').value = this.quantity;
            }
        });

        document.getElementById('quantity').addEventListener('change', (e) => {
            const val = parseInt(e.target.value);
            if (val >= 1 && val <= 99) {
                this.quantity = val;
            } else {
                e.target.value = this.quantity;
            }
        });

        // Add to cart
        document.getElementById('addToCartBtn').addEventListener('click', () => {
            const productToAdd = {
                id: this.product.id,
                name: this.product.name,
                price: this.product.salePrice || this.product.price,
                image: this.product.image,
                quantity: this.quantity
            };
            
            for (let i = 0; i < this.quantity; i++) {
                cart.addItem(productToAdd);
            }
        });

        // Buy now
        document.getElementById('buyNowBtn').addEventListener('click', () => {
            const productToAdd = {
                id: this.product.id,
                name: this.product.name,
                price: this.product.salePrice || this.product.price,
                image: this.product.image,
                quantity: this.quantity
            };
            
            for (let i = 0; i < this.quantity; i++) {
                cart.addItem(productToAdd);
            }
            
            window.location.href = 'checkout.html';
        });

        // Wishlist button
        document.getElementById('productWishlistBtn').addEventListener('click', function() {
            this.classList.toggle('active');
            const icon = this.querySelector('i');
            if (this.classList.contains('active')) {
                icon.classList.remove('far');
                icon.classList.add('fas');
                showNotification('Added to wishlist!', 'success');
            } else {
                icon.classList.remove('fas');
                icon.classList.add('far');
                showNotification('Removed from wishlist', 'info');
            }
        });

        // UPDATED: Track click on Amazon button
        document.getElementById('amazonBtn')?.addEventListener('click', function() {
            SBStoreData.trackClick(productDetail.product.id, productDetail.product.name, productDetail.product.amazonUrl);
        });

        // Tabs
        document.querySelectorAll('.tab-header').forEach(tab => {
            tab.addEventListener('click', () => {
                // Remove active from all tabs
                document.querySelectorAll('.tab-header').forEach(t => t.classList.remove('active'));
                document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
                
                // Add active to clicked tab
                tab.classList.add('active');
                const tabId = tab.getAttribute('data-tab');
                document.getElementById(`tab-${tabId}`).classList.add('active');
            });
        });
    }
}

// Initialize product detail
const productDetail = new ProductDetailManager();

// Helper function for notifications
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