// ========== NAVIGATION AND ACCOUNT MANAGEMENT ==========

class NavigationManager {
    constructor() {
        this.init();
    }

    init() {
        this.loadCategories();
        this.highlightActiveLink();
        this.initAccountSystem();
        this.initSearch();
        this.initMobileMenu();
        this.updateCartCount();
        this.updateWishlistCount();
    }

    // Load categories in dropdown
    loadCategories() {
        const dropdown = document.getElementById('categoriesDropdown');
        if (!dropdown) return;

        // Get categories from your data
        const categories = [
            { name: 'Electronics', icon: 'fa-laptop', count: 156 },
            { name: 'Fashion', icon: 'fa-tshirt', count: 342 },
            { name: 'Home & Living', icon: 'fa-home', count: 89 },
            { name: 'Sports', icon: 'fa-futbol', count: 94 },
            { name: 'Books', icon: 'fa-book', count: 112 },
            { name: 'Beauty', icon: 'fa-spa', count: 78 },
            { name: 'Toys', icon: 'fa-gamepad', count: 45 },
            { name: 'Automotive', icon: 'fa-car', count: 67 }
        ];

        dropdown.innerHTML = categories.map(cat => `
            <a href="shop.html?category=${cat.name.toLowerCase().replace(' & ', '-')}">
                <i class="fas ${cat.icon}"></i>
                <span>${cat.name}</span>
                <small>(${cat.count})</small>
            </a>
        `).join('');
    }

    // Highlight current page in navigation
    highlightActiveLink() {
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        const navLinks = document.querySelectorAll('.nav-menu a');
        
        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href === currentPage) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }

    // Account System (Login/Logout)
    initAccountSystem() {
        const accountIcon = document.getElementById('accountIcon');
        const accountDropdown = document.getElementById('accountDropdown');
        
        if (accountIcon && accountDropdown) {
            // Toggle dropdown on click
            accountIcon.addEventListener('click', (e) => {
                e.preventDefault();
                accountDropdown.classList.toggle('active');
            });

            // Close dropdown when clicking outside
            document.addEventListener('click', (e) => {
                if (!accountIcon.contains(e.target) && !accountDropdown.contains(e.target)) {
                    accountDropdown.classList.remove('active');
                }
            });

            this.updateAccountUI();
        }

        // Handle deals link
        const dealsLink = document.getElementById('dealsLink');
        if (dealsLink) {
            dealsLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.showDeals();
            });
        }

        // Handle new arrivals link
        const newArrivalsLink = document.getElementById('newArrivalsLink');
        if (newArrivalsLink) {
            newArrivalsLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.showNewArrivals();
            });
        }

        // Handle best sellers link
        const bestSellersLink = document.getElementById('bestSellersLink');
        if (bestSellersLink) {
            bestSellersLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.showBestSellers();
            });
        }
    }

    // Update account UI based on login status
    updateAccountUI() {
        const isLoggedIn = localStorage.getItem('userLoggedIn') === 'true';
        const userEmail = localStorage.getItem('userEmail');
        const header = document.getElementById('accountHeader');
        const body = document.getElementById('accountBody');

        if (!header || !body) return;

        if (isLoggedIn && userEmail) {
            // User is logged in
            header.innerHTML = `
                <div class="user-info">
                    <i class="fas fa-user-circle"></i>
                    <span>${userEmail}</span>
                </div>
            `;
            body.innerHTML = `
                <a href="account.html"><i class="fas fa-user"></i> My Account</a>
                <a href="orders.html"><i class="fas fa-box"></i> My Orders</a>
                <a href="wishlist.html"><i class="fas fa-heart"></i> Wishlist</a>
                <a href="#" id="logoutBtn"><i class="fas fa-sign-out-alt"></i> Logout</a>
            `;

            // Add logout handler
            document.getElementById('logoutBtn')?.addEventListener('click', (e) => {
                e.preventDefault();
                this.logout();
            });
        } else {
            // User is not logged in
            header.innerHTML = '<h4>Welcome!</h4>';
            body.innerHTML = `
                <a href="login.html"><i class="fas fa-sign-in-alt"></i> Login</a>
                <a href="register.html"><i class="fas fa-user-plus"></i> Register</a>
            `;
        }
    }

    // Login function
    login(email, password) {
        // In a real app, this would validate against a backend
        // For demo, we'll accept any email with password length > 5
        if (email && email.includes('@') && password.length >= 6) {
            localStorage.setItem('userLoggedIn', 'true');
            localStorage.setItem('userEmail', email);
            this.updateAccountUI();
            this.showNotification('Login successful!', 'success');
            return true;
        }
        this.showNotification('Invalid credentials', 'error');
        return false;
    }

    // Register function
    register(name, email, password) {
        if (name && email && email.includes('@') && password.length >= 6) {
            localStorage.setItem('userLoggedIn', 'true');
            localStorage.setItem('userEmail', email);
            localStorage.setItem('userName', name);
            this.updateAccountUI();
            this.showNotification('Registration successful!', 'success');
            return true;
        }
        this.showNotification('Please fill all fields correctly', 'error');
        return false;
    }

    // Logout function
    logout() {
        localStorage.removeItem('userLoggedIn');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userName');
        this.updateAccountUI();
        this.showNotification('Logged out successfully', 'success');
        
        // Close dropdown
        document.getElementById('accountDropdown')?.classList.remove('active');
    }

    // Show deals page
    showDeals() {
        // Get products with discounts
        const products = SBStoreData?.getProducts() || [];
        const deals = products.filter(p => p.discount > 0);
        
        // Store deals in session for deals page
        sessionStorage.setItem('deals', JSON.stringify(deals));
        window.location.href = 'deals.html';
    }

    // Show new arrivals (last 7 days)
    showNewArrivals() {
        const products = SBStoreData?.getProducts() || [];
        // In a real app, you'd use product creation date
        // For demo, we'll just show first 10 products
        const newArrivals = products.slice(0, 10);
        
        sessionStorage.setItem('newArrivals', JSON.stringify(newArrivals));
        window.location.href = 'new-arrivals.html';
    }

    // Show best sellers (by clicks)
    showBestSellers() {
        const products = SBStoreData?.getProducts() || [];
        const clicks = JSON.parse(localStorage.getItem('affiliate_clicks')) || [];
        
        // Count clicks per product
        const clickCount = {};
        clicks.forEach(c => {
            clickCount[c.productId] = (clickCount[c.productId] || 0) + 1;
        });
        
        // Sort by clicks
        const bestSellers = [...products].sort((a, b) => {
            const aClicks = clickCount[a.id] || 0;
            const bClicks = clickCount[b.id] || 0;
            return bClicks - aClicks;
        }).slice(0, 10);
        
        sessionStorage.setItem('bestSellers', JSON.stringify(bestSellers));
        window.location.href = 'best-sellers.html';
    }

    // Search functionality
    initSearch() {
        const searchBtn = document.getElementById('searchBtn');
        const searchInput = document.getElementById('searchInput');
        
        if (searchBtn && searchInput) {
            searchBtn.addEventListener('click', () => {
                this.performSearch(searchInput.value);
            });
            
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.performSearch(searchInput.value);
                }
            });
        }
    }

    performSearch(query) {
        if (!query || query.trim() === '') {
            this.showNotification('Please enter a search term', 'warning');
            return;
        }
        
        // Store search query and redirect to shop page
        sessionStorage.setItem('searchQuery', query);
        window.location.href = `shop.html?search=${encodeURIComponent(query)}`;
    }

    // Mobile menu
    initMobileMenu() {
        const menuBtn = document.getElementById('mobileMenuBtn');
        const navMenu = document.getElementById('navMenu');
        
        if (menuBtn && navMenu) {
            menuBtn.addEventListener('click', () => {
                navMenu.classList.toggle('active');
                menuBtn.classList.toggle('active');
            });
        }
    }

    // Update cart count
    updateCartCount() {
        const cart = JSON.parse(localStorage.getItem('sbstore_cart')) || { items: [] };
        const count = cart.items.reduce((sum, item) => sum + item.quantity, 0);
        
        document.querySelectorAll('.cart-count').forEach(el => {
            el.textContent = count;
            if (count > 0) {
                el.style.display = 'flex';
            } else {
                el.style.display = 'none';
            }
        });
    }

    // Update wishlist count
    updateWishlistCount() {
        const wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
        document.querySelectorAll('.wishlist-count').forEach(el => {
            el.textContent = wishlist.length;
            if (wishlist.length > 0) {
                el.style.display = 'flex';
            } else {
                el.style.display = 'none';
            }
        });
    }

    // Show notification
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
            <span>${message}</span>
        `;
        document.body.appendChild(notification);
        
        setTimeout(() => notification.classList.add('show'), 100);
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// Initialize navigation
const navigation = new NavigationManager();