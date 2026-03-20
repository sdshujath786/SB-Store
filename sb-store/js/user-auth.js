// ========== COMPLETE USER AUTHENTICATION SYSTEM ==========

class UserAuthSystem {
    constructor() {
        this.currentUser = null;
        this.users = this.loadUsers();
        this.init();
    }

    // Load users from localStorage
    loadUsers() {
        const users = localStorage.getItem('sbstore_users');
        return users ? JSON.parse(users) : [];
    }

    // Save users to localStorage
    saveUsers() {
        localStorage.setItem('sbstore_users', JSON.stringify(this.users));
    }

    // Initialize
    init() {
        this.checkCurrentUser();
        this.setupEventListeners();
    }

    // Check if user is logged in
    checkCurrentUser() {
        const userData = localStorage.getItem('sbstore_current_user');
        if (userData) {
            this.currentUser = JSON.parse(userData);
            this.updateUIForLoggedInUser();
        }
    }

    // Register new user
    register(userData) {
        // Validate email uniqueness
        if (this.users.find(u => u.email === userData.email)) {
            return { success: false, message: 'Email already registered' };
        }

        // Create new user
        const newUser = {
            id: 'user_' + Date.now(),
            name: userData.name,
            email: userData.email,
            password: this.hashPassword(userData.password), // Simple hash for demo
            phone: userData.phone || '',
            address: userData.address || '',
            createdAt: new Date().toISOString(),
            orders: [],
            wishlist: [],
            recentlyViewed: []
        };

        this.users.push(newUser);
        this.saveUsers();

        // Auto login after registration
        this.login(userData.email, userData.password);
        
        return { success: true, message: 'Registration successful!' };
    }

    // Login user
    login(email, password) {
        const user = this.users.find(u => u.email === email && u.password === this.hashPassword(password));
        
        if (user) {
            // Remove password before storing in session
            const userSession = { ...user };
            delete userSession.password;
            
            this.currentUser = userSession;
            localStorage.setItem('sbstore_current_user', JSON.stringify(userSession));
            
            // Update login timestamp
            user.lastLogin = new Date().toISOString();
            this.saveUsers();
            
            this.updateUIForLoggedInUser();
            return { success: true, message: 'Login successful!' };
        }
        
        return { success: false, message: 'Invalid email or password' };
    }

    // Logout user
    logout() {
        this.currentUser = null;
        localStorage.removeItem('sbstore_current_user');
        this.updateUIForLoggedOutUser();
        return { success: true, message: 'Logged out successfully' };
    }

    // Simple hash function (for demo only - in real app use bcrypt)
    hashPassword(password) {
        return btoa(password); // Base64 encoding (NOT secure, just for demo)
    }

    // Update user profile
    updateProfile(userId, updates) {
        const index = this.users.findIndex(u => u.id === userId);
        if (index !== -1) {
            this.users[index] = { ...this.users[index], ...updates };
            this.saveUsers();
            
            // Update current user if it's the same user
            if (this.currentUser && this.currentUser.id === userId) {
                this.currentUser = { ...this.currentUser, ...updates };
                localStorage.setItem('sbstore_current_user', JSON.stringify(this.currentUser));
            }
            
            return { success: true, message: 'Profile updated successfully' };
        }
        return { success: false, message: 'User not found' };
    }

    // Change password
    changePassword(userId, oldPassword, newPassword) {
        const user = this.users.find(u => u.id === userId);
        if (user && user.password === this.hashPassword(oldPassword)) {
            user.password = this.hashPassword(newPassword);
            this.saveUsers();
            return { success: true, message: 'Password changed successfully' };
        }
        return { success: false, message: 'Current password is incorrect' };
    }

    // Add to wishlist
    addToWishlist(productId) {
        if (!this.currentUser) {
            return { success: false, message: 'Please login first' };
        }

        const user = this.users.find(u => u.id === this.currentUser.id);
        if (user && !user.wishlist.includes(productId)) {
            user.wishlist.push(productId);
            this.saveUsers();
            
            // Update current user
            this.currentUser.wishlist = user.wishlist;
            localStorage.setItem('sbstore_current_user', JSON.stringify(this.currentUser));
            
            return { success: true, message: 'Added to wishlist' };
        }
        return { success: false, message: 'Already in wishlist' };
    }

    // Remove from wishlist
    removeFromWishlist(productId) {
        if (!this.currentUser) return;

        const user = this.users.find(u => u.id === this.currentUser.id);
        if (user) {
            user.wishlist = user.wishlist.filter(id => id !== productId);
            this.saveUsers();
            
            // Update current user
            this.currentUser.wishlist = user.wishlist;
            localStorage.setItem('sbstore_current_user', JSON.stringify(this.currentUser));
            
            return { success: true, message: 'Removed from wishlist' };
        }
    }

    // Get wishlist products
    getWishlistProducts() {
        if (!this.currentUser) return [];
        const products = SBStoreData.getProducts();
        return products.filter(p => this.currentUser.wishlist.includes(p.id));
    }

    // Add to recently viewed
    addToRecentlyViewed(productId) {
        if (!this.currentUser) return;

        const user = this.users.find(u => u.id === this.currentUser.id);
        if (user) {
            // Remove if already exists
            user.recentlyViewed = user.recentlyViewed.filter(id => id !== productId);
            // Add to beginning
            user.recentlyViewed.unshift(productId);
            // Keep only last 10
            user.recentlyViewed = user.recentlyViewed.slice(0, 10);
            
            this.saveUsers();
            
            // Update current user
            this.currentUser.recentlyViewed = user.recentlyViewed;
            localStorage.setItem('sbstore_current_user', JSON.stringify(this.currentUser));
        }
    }

    // Get recently viewed products
    getRecentlyViewed() {
        if (!this.currentUser) return [];
        const products = SBStoreData.getProducts();
        return products.filter(p => this.currentUser.recentlyViewed?.includes(p.id));
    }

    // Update UI for logged in user
    updateUIForLoggedInUser() {
        const accountIcon = document.getElementById('accountIcon');
        const accountDropdown = document.getElementById('accountDropdown');
        
        if (accountIcon) {
            accountIcon.innerHTML = `<i class="fas fa-user-check"></i>`;
            accountIcon.title = this.currentUser.name || this.currentUser.email;
        }

        if (accountDropdown) {
            const header = accountDropdown.querySelector('.dropdown-header');
            const body = accountDropdown.querySelector('.dropdown-body');
            
            if (header) {
                header.innerHTML = `
                    <div class="user-info">
                        <i class="fas fa-user-circle"></i>
                        <div>
                            <strong>${this.currentUser.name || 'User'}</strong>
                            <small>${this.currentUser.email}</small>
                        </div>
                    </div>
                `;
            }
            
            if (body) {
                body.innerHTML = `
                    <a href="account/dashboard.html"><i class="fas fa-tachometer-alt"></i> Dashboard</a>
                    <a href="account/profile.html"><i class="fas fa-user-edit"></i> Profile</a>
                    <a href="account/orders.html"><i class="fas fa-box"></i> Orders</a>
                    <a href="account/wishlist.html"><i class="fas fa-heart"></i> Wishlist (${this.currentUser.wishlist?.length || 0})</a>
                    <a href="account/addresses.html"><i class="fas fa-map-marker-alt"></i> Addresses</a>
                    <a href="#" id="logoutBtn"><i class="fas fa-sign-out-alt"></i> Logout</a>
                `;
            }
        }

        // Update wishlist count
        this.updateWishlistCount();
    }

    // Update UI for logged out user
    updateUIForLoggedOutUser() {
        const accountIcon = document.getElementById('accountIcon');
        const accountDropdown = document.getElementById('accountDropdown');
        
        if (accountIcon) {
            accountIcon.innerHTML = `<i class="far fa-user-circle"></i>`;
            accountIcon.title = 'Account';
        }

        if (accountDropdown) {
            const header = accountDropdown.querySelector('.dropdown-header');
            const body = accountDropdown.querySelector('.dropdown-body');
            
            if (header) {
                header.innerHTML = `<h4>Welcome!</h4>`;
            }
            
            if (body) {
                body.innerHTML = `
                    <a href="login.html"><i class="fas fa-sign-in-alt"></i> Login</a>
                    <a href="register.html"><i class="fas fa-user-plus"></i> Register</a>
                `;
            }
        }

        // Reset wishlist count
        document.querySelectorAll('.wishlist-count').forEach(el => el.textContent = '0');
    }

    // Update wishlist count in header
    updateWishlistCount() {
        const count = this.currentUser?.wishlist?.length || 0;
        document.querySelectorAll('.wishlist-count').forEach(el => {
            el.textContent = count;
            el.style.display = count > 0 ? 'flex' : 'none';
        });
    }

    // Setup event listeners
    setupEventListeners() {
        // Handle logout clicks
        document.addEventListener('click', (e) => {
            if (e.target.id === 'logoutBtn' || e.target.closest('#logoutBtn')) {
                e.preventDefault();
                this.logout();
                window.location.reload();
            }
        });
    }
}

// Initialize user auth system
const UserAuth = new UserAuthSystem();