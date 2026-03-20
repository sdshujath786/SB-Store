// ========== EMERGENCY ACCOUNT ICON FIX ==========
(function() {
    console.log('🔧 Running emergency account icon fix...');
    
    function fixAccountSystem() {
        const accountIcon = document.getElementById('accountIcon');
        const accountDropdown = document.getElementById('accountDropdown');
        
        if (!accountIcon || !accountDropdown) {
            console.log('Elements not found, retrying...');
            setTimeout(fixAccountSystem, 500);
            return;
        }
        
        // Remove existing handlers
        const newIcon = accountIcon.cloneNode(true);
        accountIcon.parentNode.replaceChild(newIcon, accountIcon);
        
        // Add click handler
        newIcon.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            accountDropdown.classList.toggle('active');
        });
        
        // Close on outside click
        document.addEventListener('click', function(e) {
            if (!newIcon.contains(e.target) && !accountDropdown.contains(e.target)) {
                accountDropdown.classList.remove('active');
            }
        });
        
        console.log('✅ Account icon fixed!');
    }
    
    // Run after page loads
    if (document.readyState === 'complete') {
        fixAccountSystem();
    } else {
        window.addEventListener('load', fixAccountSystem);
    }
})();
