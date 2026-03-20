// ========== ACCOUNT LINKS FIXER ==========

class AccountLinksFixer {
    constructor() {
        this.fixAllLinks();
    }

    fixAllLinks() {
        // Determine current path
        const currentPath = window.location.pathname;
        const isInAccountFolder = currentPath.includes('/account/');
        
        // Fix all navigation links
        this.fixNavigationLinks(isInAccountFolder);
        
        // Fix account dropdown links
        this.fixDropdownLinks(isInAccountFolder);
        
        // Fix any hardcoded links
        this.fixHardcodedLinks(isInAccountFolder);
    }

    fixNavigationLinks(isInAccountFolder) {
        const navLinks = document.querySelectorAll('.nav-menu a, .nav-links a');
        const prefix = isInAccountFolder ? '../' : '';
        
        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            
            // Skip external links and anchor links
            if (href.startsWith('http') || href.startsWith('#')) return;
            
            // Fix common pages
            if (href === 'index.html' || href === '/' || href === '') {
                link.href = prefix + 'index.html';
            } else if (href === 'shop.html') {
                link.href = prefix + 'shop.html';
            } else if (href === 'cart.html') {
                link.href = prefix + 'cart.html';
            } else if (href === 'wishlist.html') {
                link.href = prefix + 'wishlist.html';
            } else if (href === 'login.html') {
                link.href = prefix + 'login.html';
            } else if (href === 'register.html') {
                link.href = prefix + 'register.html';
            }
        });
    }

    fixDropdownLinks(isInAccountFolder) {
        const dropdown = document.getElementById('accountDropdown');
        if (!dropdown) return;

        const prefix = isInAccountFolder ? '../' : '';
        const links = dropdown.querySelectorAll('a');
        
        links.forEach(link => {
            let href = link.getAttribute('href');
            
            // Fix account dashboard links
            if (href.includes('account/')) {
                if (isInAccountFolder) {
                    // Already in account folder, just keep the filename
                    const fileName = href.split('/').pop();
                    link.href = fileName;
                } else {
                    // Need to add account/ prefix
                    if (!href.startsWith('account/')) {
                        link.href = 'account/' + href.split('/').pop();
                    }
                }
            }
            
            // Fix login/register links from account pages
            if (isInAccountFolder && (href === 'login.html' || href === 'register.html')) {
                link.href = '../' + href;
            }
        });
    }

    fixHardcodedLinks(isInAccountFolder) {
        // Fix any hardcoded account links in the page
        const allLinks = document.querySelectorAll('a[href*="account/"]');
        const prefix = isInAccountFolder ? '' : 'account/';
        
        allLinks.forEach(link => {
            let href = link.getAttribute('href');
            if (href.includes('account/')) {
                const fileName = href.split('account/')[1];
                if (isInAccountFolder) {
                    link.href = fileName;
                } else {
                    link.href = 'account/' + fileName;
                }
            }
        });
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    new AccountLinksFixer();
});

// Also fix when content changes (like after login)
window.fixAccountLinks = function() {
    new AccountLinksFixer();
};