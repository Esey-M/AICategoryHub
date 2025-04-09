// Dark mode functionality
document.addEventListener('DOMContentLoaded', function() {
    const darkModeToggle = document.getElementById('darkModeToggle');
    
    if (darkModeToggle) {
        // Function to set dark mode
        function setDarkMode(isDark) {
            if (isDark) {
                document.documentElement.classList.add('dark');
                localStorage.setItem('darkMode', 'enabled');
            } else {
                document.documentElement.classList.remove('dark');
                localStorage.setItem('darkMode', 'disabled');
            }
        }
        
        // Check for saved dark mode preference or system preference
        if (localStorage.getItem('darkMode') === 'enabled' || 
            (localStorage.getItem('darkMode') === null && 
             window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            setDarkMode(true);
        }
        
        // Toggle dark mode on button click
        darkModeToggle.addEventListener('click', function() {
            setDarkMode(!document.documentElement.classList.contains('dark'));
        });
        
        // Also handle mobile dark mode toggle if it exists
        const mobileDarkModeToggle = document.getElementById('mobileDarkModeToggle');
        if (mobileDarkModeToggle) {
            mobileDarkModeToggle.addEventListener('click', function() {
                setDarkMode(!document.documentElement.classList.contains('dark'));
            });
        }
    }
}); 