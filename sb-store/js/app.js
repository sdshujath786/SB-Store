
// Wait for DOM to load
document.addEventListener('DOMContentLoaded', function() {
    console.log('SB Store loaded successfully!');
    
    // Initialize all components
    initMobileMenu();
    initSearch();
    loadCategories();
    loadProducts();
    initCart();
    initWishlist();
    initNewsletter();
});

// ========== MOBILE MENU ==========
function initMobileMenu() {
    const menuBtn = document.getElementById('mobileMenuBtn');
    const navMenu = document.getElementById('navMenu');
    
    if (menuBtn && navMenu) {
        menuBtn.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            
            // Change icon
            const icon = menuBtn.querySelector('i');
            if (navMenu.classList.contains('active')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
    }
}

// ========== SEARCH FUNCTIONALITY ==========
function initSearch() {
    const searchBtn = document.getElementById('searchBtn');
    const searchInput = document.getElementById('searchInput');
    
    if (searchBtn && searchInput) {
        searchBtn.addEventListener('click', function() {
            performSearch(searchInput.value);
        });
        
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                performSearch(searchInput.value);
            }
        });
    }
}

function performSearch(query) {
    if (query && query.trim() !== '') {
        showNotification(`Searching for: ${query}`, 'info');
        // In real app, redirect to search results page
        // window.location.href = `/search.html?q=${encodeURIComponent(query)}`;
    }
}

// ========== CATEGORIES ==========
function loadCategories() {
    const grid = document.getElementById('categoriesGrid');
    if (!grid) return;
    
    const categories = [
        { name: 'Electronics', icon: 'fa-laptop', count: 156 },
        { name: 'Fashion', icon: 'fa-tshirt', count: 342 },
        { name: 'Home & Living', icon: 'fa-home', count: 89 },
        { name: 'Sports', icon: 'fa-futbol', count: 94 },
        { name: 'Books', icon: 'fa-book', count: 112 },
        { name: 'Beauty', icon: 'fa-spa', count: 78 },
        { name: 'Toys', icon: 'fa-gamepad', count: 45 },
        { name: 'Accessories', icon: 'fa-clock', count: 67 }
    ];
    
    grid.innerHTML = categories.map(cat => `
        <div class="category-card" onclick="browseCategory('${cat.name}')">
            <i class="fas ${cat.icon}"></i>
            <h3>${cat.name}</h3>
            <p>${cat.count} Products</p>
        </div>
    `).join('');
}

// Category click handler
window.browseCategory = function(category) {
    showNotification(`Browsing ${category} category`, 'info');
    // In real app: window.location.href = `/category/${category.toLowerCase()}`;
};

// ========== PRODUCTS ==========
function loadProducts() {
    const grid = document.getElementById('productsGrid');
    if (!grid) return;
    
    const products = [
        { name: 'Wireless Headphones', price: 79.99, icon: 'fa-headphones' },
        { name: 'Smart Watch', price: 199.99, icon: 'fa-clock' },
        { name: 'Laptop Backpack', price: 49.99, icon: 'fa-bag' },
        { name: 'Bluetooth Speaker', price: 59.99, icon: 'fa-music' },
        { name: 'Gaming Mouse', price: 39.99, icon: 'fa-mouse' },
        { name: 'USB-C Hub', price: 29.99, icon: 'fa-plug' },
        { name: 'Phone Stand', price: 19.99, icon: 'fa-mobile-alt' },
        { name: 'Power Bank', price: 34.99, icon: 'fa-battery-full' }
    ];
    
    grid.innerHTML = products.map((product, index) => `
        <div class="product-card">
            <div class="product-image">
                <i class="fas ${product.icon}"></i>
            </div>
            <div class="product-info">
                <h3 class="product-title">${product.name}</h3>
                <div class="product-price">$${product.price}</div>
                <button class="add-to-cart" onclick="addToCart('${product.name}', ${product.price})">
                    Add to Cart
                </button>
            </div>
        </div>
    `).join('');
}

// ========== CART FUNCTIONALITY ==========
let cart = JSON.parse(localStorage.getItem('cart')) || [];

function initCart() {
    updateCartCount();
}

window.addToCart = function(name, price) {
    cart.push({ name, price, id: Date.now() });
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    showNotification(`${name} added to cart!`, 'success');
    
    // Animate cart icon
    const cartIcon = document.getElementById('cartIcon');
    if (cartIcon) {
        cartIcon.style.transform = 'scale(1.2)';
        setTimeout(() => {
            cartIcon.style.transform = 'scale(1)';
        }, 200);
    }
};

function updateCartCount() {
    const badges = document.querySelectorAll('.icon .badge');
    badges.forEach(badge => {
        if (badge.closest('#cartIcon')) {
            badge.textContent = cart.length;
        }
    });
}

// ========== WISHLIST ==========
let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];

function initWishlist() {
    updateWishlistCount();
    
    const wishlistIcon = document.getElementById('wishlistIcon');
    if (wishlistIcon) {
        wishlistIcon.addEventListener('click', function(e) {
            e.preventDefault();
            showNotification(`You have ${wishlist.length} items in wishlist`, 'info');
        });
    }
}

function updateWishlistCount() {
    const badges = document.querySelectorAll('.icon .badge');
    badges.forEach(badge => {
        if (badge.closest('#wishlistIcon')) {
            badge.textContent = wishlist.length;
        }
    });
}

// ========== NEWSLETTER ==========
function initNewsletter() {
    const newsletterBtn = document.getElementById('newsletterBtn');
    const newsletterInput = document.getElementById('newsletterEmail');
    
    if (newsletterBtn && newsletterInput) {
        newsletterBtn.addEventListener('click', function() {
            const email = newsletterInput.value.trim();
            if (email && email.includes('@') && email.includes('.')) {
                showNotification('Thanks for subscribing!', 'success');
                newsletterInput.value = '';
            } else {
                showNotification('Please enter a valid email', 'error');
            }
        });
    }
}

// ========== NOTIFICATION SYSTEM ==========
function showNotification(message, type = 'success') {
    // Remove existing notification
    const existing = document.querySelector('.notification');
    if (existing) {
        existing.remove();
    }
    
    // Create new notification
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    // Show notification
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    // Hide after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// ========== USER MENU ==========
const userIcon = document.getElementById('userIcon');
if (userIcon) {
    userIcon.addEventListener('click', function(e) {
        e.preventDefault();
        // Check if user is logged in (you can implement actual login later)
        const isLoggedIn = localStorage.getItem('userLoggedIn');
        
        if (isLoggedIn) {
            window.location.href = 'account.html';
        } else {
            window.location.href = 'login.html';
        }
    });
}

// ========== CART ICON CLICK ==========
const cartIcon = document.getElementById('cartIcon');
if (cartIcon) {
    cartIcon.addEventListener('click', function(e) {
        e.preventDefault();
        window.location.href = 'cart.html';
    });
}

// ========== SCROLL ANIMATIONS ==========
window.addEventListener('scroll', function() {
    const header = document.querySelector('.header');
    if (window.scrollY > 100) {
        header.style.boxShadow = '0 4px 20px rgba(0,0,0,0.1)';
    } else {
        header.style.boxShadow = 'var(--shadow-sm)';
    }
});

// ========== ADD SOME CSS FOR NOTIFICATIONS ==========
const style = document.createElement('style');
style.textContent = `
    .notification {
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 25px;
        border-radius: 10px;
        color: white;
        font-weight: 500;
        z-index: 9999;
        transform: translateX(400px);
        transition: transform 0.3s ease;
        display: flex;
        align-items: center;
        gap: 10px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.2);
    }
    
    .notification.show {
        transform: translateX(0);
    }
    
    .notification-success {
        background: #10b981;
    }
    
    .notification-error {
        background: #ef4444;
    }
    
    .notification-info {
        background: #3b82f6;
    }
    
    .notification i {
        font-size: 20px;
    }
`;
document.head.appendChild(style);