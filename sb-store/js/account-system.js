// ========== SINGLE CLEAN ACCOUNT SYSTEM ==========

class AccountSystem {
    constructor() {
        this.currentUser = null;
        this.users = this.loadUsers();
        this.init();
    }

    // Load users from storage
    loadUsers() {
        const users = localStorage.getItem('sbstore_users');
        return users ? JSON.parse(users) : [];
    }

    // Save users to storage
    saveUsers() {
        localStorage.setItem('sbstore_users', JSON.stringify(this.users));
    }

    // Initialize
    init() {
        this.checkCurrentUser();
        this.setupEventListeners();
        this.updateUI();
    }

    // Check if user is logged in
    checkCurrentUser() {
        const localUser = localStorage.getItem('sbstore_current_user');
        const sessionUser = sessionStorage.getItem('sbstore_current_user');
        
        if (localUser) {
            this.currentUser = JSON.parse(localUser);
        } else if (sessionUser) {
            this.currentUser = JSON.parse(sessionUser);
        }
    }

    // Validate email
    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    // Register new user
    register(userData) {
        // Validate
        if (!userData.name || !userData.email || !userData.password) {
            return { success: false, message: 'All fields are required' };
        }

        if (!this.validateEmail(userData.email)) {
            return { success: false, message: 'Invalid email format' };
        }

        if (userData.password.length < 6) {
            return { success: false, message: 'Password must be at least 6 characters' };
        }

        // Check if email exists
        if (this.users.find(u => u.email === userData.email)) {
            return { success: false, message: 'Email already registered' };
        }

        // Create new user (simple storage, no password hashing for demo)
        const newUser = {
            id: 'user_' + Date.now(),
            name: userData.name,
            email: userData.email,
            password: userData.password, // In real app, hash this!
            createdAt: new Date().toISOString(),
            wishlist: []
        };

        this.users.push(newUser);
        this.saveUsers();

        // Auto login
        return this.login(userData.email, userData.password);
    }

    // Login user
    login(email, password, rememberMe = false) {
        const user = this.users.find(u => u.email === email && u.password === password);

        if (!user) {
            return { success: false, message: 'Invalid email or password' };
        }

        // Create session (remove password)
        const userSession = {
            id: user.id,
            name: user.name,
            email: user.email,
            wishlist: user.wishlist || []
        };

        if (rememberMe) {
            localStorage.setItem('sbstore_current_user', JSON.stringify(userSession));
        } else {
            sessionStorage.setItem('sbstore_current_user', JSON.stringify(userSession));
        }

        this.currentUser = userSession;
        this.updateUI();
        
        return { success: true, message: 'Login successful!', user: userSession };
    }

    // Logout user
    logout() {
        localStorage.removeItem('sbstore_current_user');
        sessionStorage.removeItem('sbstore_current_user');
        this.currentUser = null;
        this.updateUI();
        return { success: true, message: 'Logged out successfully' };
    }

    // Check if logged in
    isLoggedIn() {
        return this.currentUser !== null;
    }

    // Get current user
    getCurrentUser() {
        return this.currentUser;
    }

    // Update UI based on login state
    updateUI() {
        const accountIcon = document.getElementById('accountIcon');
        const accountDropdown = document.getElementById('accountDropdown');
        const accountHeader = document.getElementById('accountHeader');
        const accountBody = document.getElementById('accountBody');
        
        // If elements don't exist, page doesn't have account section
        if (!accountIcon || !accountDropdown) return;

        if (this.currentUser) {
            // Logged in state
            accountIcon.innerHTML = '<i class="fas fa-user-check"></i><span>My Account</span>';
            
            if (accountHeader) {
                accountHeader.innerHTML = `
                    <div class="user-info">
                        <i class="fas fa-user-circle"></i>
                        <strong>${this.currentUser.name}</strong>
                    </div>
                `;
            }
            
            if (accountBody) {
                accountBody.innerHTML = `
                    <a href="account/dashboard.html"><i class="fas fa-tachometer-alt"></i> Dashboard</a>
                    <a href="account/profile.html"><i class="fas fa-user-edit"></i> Profile</a>
                    <a href="account/wishlist.html"><i class="fas fa-heart"></i> Wishlist</a>
                    <hr>
                    <a href="#" id="logoutBtn"><i class="fas fa-sign-out-alt"></i> Logout</a>
                `;
            }

            // Add logout handler
            const logoutBtn = document.getElementById('logoutBtn');
            if (logoutBtn) {
                logoutBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.logout();
                    window.location.reload();
                });
            }

        } else {
            // Logged out state
            accountIcon.innerHTML = '<i class="far fa-user-circle"></i><span>Account</span>';
            
            if (accountHeader) {
                accountHeader.innerHTML = '<h4>Welcome to SB Store!</h4>';
            }
            
            if (accountBody) {
                accountBody.innerHTML = `
                    <a href="login.html"><i class="fas fa-sign-in-alt"></i> Login</a>
                    <a href="register.html"><i class="fas fa-user-plus"></i> Register</a>
                `;
            }
        }
    }

    // Setup event listeners
    setupEventListeners() {
        // Account icon click
        const accountIcon = document.getElementById('accountIcon');
        const accountDropdown = document.getElementById('accountDropdown');

        if (accountIcon && accountDropdown) {
            accountIcon.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                accountDropdown.classList.toggle('active');
            });

            // Close dropdown when clicking outside
            document.addEventListener('click', (e) => {
                if (!accountIcon.contains(e.target) && !accountDropdown.contains(e.target)) {
                    accountDropdown.classList.remove('active');
                }
            });
        }
    }
}

// Initialize account system
const AccountSystem = new AccountSystem();