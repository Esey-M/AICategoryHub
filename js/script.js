// State management
let tools = [];
let categories = [];
let currentCategory = null;
let searchQuery = '';

// DOM Elements
const toolsGrid = document.getElementById('toolsGrid');
const categoriesGrid = document.getElementById('categoriesGrid');
const searchInput = document.getElementById('searchInput');
const darkModeToggle = document.getElementById('darkModeToggle');
const loadingSpinner = document.getElementById('loadingSpinner');
const toolsSection = document.getElementById('toolsSection');
const categoryTitle = document.getElementById('categoryTitle');
const backToCategories = document.getElementById('backToCategories');

// Mobile menu functionality
const mobileMenuButton = document.getElementById('mobileMenuButton');
const mobileMenu = document.getElementById('mobileMenu');

// Initialize the application
async function init() {
    try {
        console.log('Initializing application...');
        if (!loadingSpinner) {
            console.error('Loading spinner element not found');
            return;
        }
        showLoading();
        
        // Attempt to fetch tools
        try {
            await fetchTools();
            console.log('Tools fetched successfully');
        } catch (fetchError) {
            console.error('Error fetching tools:', fetchError);
            
            // Show a retry dialog
            const retry = confirm('Failed to load AI tools. Would you like to retry?');
            if (retry) {
                hideLoading();
                return init(); // Retry initialization
            } else {
                // Continue with potentially empty data, display limited UI
                console.warn('Continuing with potentially limited data');
            }
        }
        
        // Only proceed with UI setup if we have data
        if (tools.length > 0) {
            setupEventListeners();
            renderCategories();
            
            // Check URL for category parameter
            checkUrlForCategory();
            
            console.log('Application initialized successfully');
        } else {
            showError('Unable to load tools data. Please check your connection and refresh the page.');
            console.error('No tools data available');
        }
        
        // Initialize AdSense ads
        try {
            if (typeof adsbygoogle !== 'undefined') {
                (adsbygoogle = window.adsbygoogle || []).push({});
                console.log('AdSense initialized');
            }
        } catch (adError) {
            console.warn('AdSense initialization skipped:', adError);
        }
    } catch (error) {
        console.error('Error initializing application:', error);
        showError('Failed to initialize application. Please refresh the page and try again.');
    } finally {
        hideLoading();
    }
}

// Check URL for category parameter
function checkUrlForCategory() {
    const urlParams = new URLSearchParams(window.location.search);
    const categoryParam = urlParams.get('category');
    
    if (categoryParam) {
        // Find the category that matches the URL parameter (handle URL encoding)
        const decodedCategory = decodeURIComponent(categoryParam);
        const matchingCategory = categories.find(category => 
            category === decodedCategory || 
            category.toLowerCase() === decodedCategory.toLowerCase()
        );
        
        if (matchingCategory) {
            console.log(`Loading category from URL: ${matchingCategory}`);
            showTools(matchingCategory);
        } else {
            console.warn(`Category in URL not found: ${categoryParam}`);
            // Stay on the categories page if the category isn't valid
        }
    }
}

// Fetch tools data from tools.json
async function fetchTools() {
    try {
        console.log('Fetching tools data...');
        
        // Use the full path to tools.json to ensure it's found
        const toolsUrl = window.location.origin + '/tools.json';
        console.log('Attempting to fetch from:', toolsUrl);
        
        const response = await fetch(toolsUrl, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Cache-Control': 'no-cache'
            }
        });
        
        // Log detailed response information
        console.log('Response status:', response.status);
        console.log('Response ok:', response.ok);
        
        if (!response.ok) {
            console.error('Failed to fetch tools:', response.status, response.statusText);
            throw new Error(`Failed to fetch tools: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        
        console.log('Data received:', data ? 'Yes' : 'No');
        
        if (!data || !data.tools || !Array.isArray(data.tools)) {
            console.error('Invalid tools data structure:', data);
            throw new Error('Invalid tools data structure');
        }
        
        tools = data.tools;
        categories = data.categories || [];
        
        console.log(`Successfully loaded ${tools.length} tools and ${categories.length} categories`);
        
        // Save to localStorage as a backup for future loads
        try {
            localStorage.setItem('toolsData', JSON.stringify(data));
            console.log('Saved tools data to localStorage');
        } catch (storageError) {
            console.warn('Failed to save tools data to localStorage:', storageError);
        }
    } catch (error) {
        console.error('Error fetching tools:', error);
        
        // Try to load from localStorage if available
        try {
            const cachedData = localStorage.getItem('toolsData');
            if (cachedData) {
                console.log('Attempting to load tools from localStorage');
                const data = JSON.parse(cachedData);
                tools = data.tools;
                categories = data.categories || [];
                console.log(`Loaded ${tools.length} tools and ${categories.length} categories from localStorage`);
                return;
            }
        } catch (localStorageError) {
            console.error('Failed to load from localStorage:', localStorageError);
        }
        
        throw error;
    }
}

// Setup event listeners
function setupEventListeners() {
    // Search input
    searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value.toLowerCase();
        if (currentCategory) {
            renderTools();
        }
    });

    // Dark mode toggle
    darkModeToggle.addEventListener('click', toggleDarkMode);

    // Back to categories button
    backToCategories.addEventListener('click', () => {
        showCategories();
    });

    // Check for saved dark mode preference
    if (localStorage.getItem('darkMode') === 'true') {
        document.documentElement.classList.add('dark');
    }

    // Mobile menu functionality
    mobileMenuButton.addEventListener('click', () => {
        mobileMenu.classList.toggle('hidden');
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!mobileMenuButton.contains(e.target) && !mobileMenu.contains(e.target)) {
            mobileMenu.classList.add('hidden');
        }
    });
    
    // Handle browser back/forward navigation
    window.addEventListener('popstate', (event) => {
        if (event.state && event.state.category) {
            // User navigated back to a category page
            showTools(event.state.category);
        } else {
            // User navigated back to the main page
            showCategories();
        }
    });
}

// Render category cards
function renderCategories() {
    const categoryCards = categories.map(category => {
        const toolCount = tools.filter(tool => tool.category === category).length;
        return `
            <div class="category-card bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700 cursor-pointer hover:shadow-lg transition-shadow duration-200"
                 data-category="${category}">
                <div class="p-6">
                    <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">${category}</h3>
                    <p class="text-gray-600 dark:text-gray-300 mb-4">${getCategoryDescription(category)}</p>
                    <div class="flex justify-between items-center">
                        <span class="text-sm text-gray-500 dark:text-gray-400">${toolCount} tools</span>
                        <span class="text-primary">View Tools →</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    categoriesGrid.innerHTML = categoryCards;

    // Add click event listeners to category cards
    document.querySelectorAll('.category-card').forEach(card => {
        card.addEventListener('click', () => {
            const category = card.dataset.category;
            showTools(category);
        });
    });
}

// Get category description
function getCategoryDescription(category) {
    const descriptions = {
        "Chatbots & Conversational AI": "Tools for building intelligent chatbots and virtual assistants",
        "Image Generation & Editing": "AI tools for creating and enhancing images",
        "Text Generation & Writing Assistance": "Tools that assist with writing and content creation",
        "Speech Recognition & Synthesis": "Tools for transcribing speech and generating synthetic voices",
        "Code Generation & Development Assistance": "Tools that aid in coding and software development",
        "Marketing & SEO": "AI tools for marketing and search engine optimization",
        "Video Editing & Generation": "Tools for creating and editing videos",
        "Data Analysis & Visualization": "AI tools for analyzing and visualizing data",
        "Predictive Analytics & Forecasting": "Tools for making predictions and forecasts",
        "Virtual Reality & Augmented Reality": "AI tools for VR and AR development",
        "Healthcare & Medicine": "AI tools for healthcare and medical applications",
        "Voice Assistants & Automation": "Tools for voice-based automation",
        "Robotics & Automation": "AI tools for robotics and automation",
        "Finance & Trading": "AI tools for financial analysis and trading",
        "Sentiment Analysis & Opinion Mining": "Tools for analyzing sentiment and opinions",
        "Language Translation & Localization": "AI tools for translation and localization",
        "Facial Recognition & Computer Vision": "Tools for processing images and detecting faces",
        "AI for Education & E-Learning": "AI tools for education and online learning",
        "AI for Cybersecurity & Fraud Detection": "Tools for security and fraud prevention",
        "Ethical AI & Bias Detection": "Tools for promoting fairness and detecting bias"
    };
    return descriptions[category] || "AI tools for various applications";
}

// Show tools for a specific category
function showTools(category) {
    currentCategory = category;
    categoryTitle.textContent = category;
    toolsSection.classList.remove('hidden');
    categoriesGrid.parentElement.classList.add('hidden');
    
    renderTools();
    
    // Update URL with the category parameter
    const encodedCategory = encodeURIComponent(category);
    const url = `${window.location.pathname}?category=${encodedCategory}`;
    
    // Update browser history without reloading the page
    window.history.pushState({ category: category }, `${category} - AI Category Hub`, url);
    
    // Update document title
    document.title = `${category} - AI Category Hub`;
}

// Show categories
function showCategories() {
    currentCategory = null;
    toolsSection.classList.add('hidden');
    categoriesGrid.parentElement.classList.remove('hidden');
    searchQuery = '';
    searchInput.value = '';
    
    // Update URL to remove the category parameter
    const url = window.location.pathname;
    window.history.pushState({}, 'AI Category Hub - Discover AI Tools', url);
    
    // Update document title
    document.title = 'AI Category Hub - Discover AI Tools';
}

// Create ad container HTML
function createAdContainer() {
    return `
        </div>
        <div class="w-full my-6">
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700 p-6">
                <!-- AdSense Ad -->
                <ins class="adsbygoogle"
                     style="display:block"
                     data-ad-format="auto"
                     data-full-width-responsive="true"></ins>
            </div>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    `;
}

// Render tools grid
function renderTools() {
    try {
        const filteredTools = tools.filter(tool => {
            const matchesSearch = tool.name.toLowerCase().includes(searchQuery) ||
                                tool.description.toLowerCase().includes(searchQuery);
            const matchesCategory = !currentCategory || tool.category === currentCategory;
            return matchesSearch && matchesCategory;
        });

        // Add the tools HTML to the grid with the correct grid layout and center it
        toolsGrid.innerHTML = `
            <div class="w-[90%] mx-auto">
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full">
                    ${filteredTools.map((tool, index) => `
                        <div class="category-card bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-200">
                            <div class="p-6">
                                <div class="flex items-center mb-4">
                                    <div class="w-20 h-20 mr-4 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
                                        <img src="${tool.image}" 
                                             alt="${tool.name}" 
                                             class="w-full h-full object-contain p-1"
                                             onerror="this.onerror=null; this.src='https://placehold.co/200x200/222/fff?text=${encodeURIComponent(tool.name.charAt(0))}'; this.classList.add('fallback-img');">
                                    </div>
                                    <div>
                                        <h3 class="text-xl font-semibold text-gray-900 dark:text-white">${tool.name}</h3>
                                        <p class="text-sm text-gray-600 dark:text-gray-300">${tool.category}</p>
                                    </div>
                                </div>
                                <p class="text-gray-600 dark:text-gray-300 mb-4">${tool.description}</p>
                                <div class="flex justify-between items-center">
                                    <span class="text-sm text-gray-500 dark:text-gray-400">AI Tool</span>
                                    <a href="${tool.link}" target="_blank" rel="noopener noreferrer" 
                                       class="text-primary hover:text-primary-dark transition-colors">
                                        Visit Tool →
                                    </a>
                                </div>
                            </div>
                        </div>
                        ${(index + 1) % 6 === 0 && index < filteredTools.length - 1 ? `
                            </div>
                            <div class="w-full my-2">
                                <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700 p-2">
                                    <!-- AdSense Ad -->
                                    <ins class="adsbygoogle"
                                         style="display:block; height:60px;"
                                         data-ad-format="horizontal"
                                         data-ad-client="ca-pub-7154813783212995"
                                         data-ad-slot="YOUR_AD_SLOT"></ins>
                                </div>
                            </div>
                            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full">
                        ` : ''}
                    `).join('')}
                </div>
            </div>
        `;

        if (filteredTools.length === 0) {
            toolsGrid.innerHTML = `
                <div class="w-[90%] mx-auto">
                    <div class="text-center py-8">
                        <p class="text-gray-600 dark:text-gray-400">No tools found for this category${searchQuery ? ' and search query' : ''}.</p>
                    </div>
                </div>
            `;
        }

        // Initialize new AdSense ads if available
        try {
            if (typeof adsbygoogle !== 'undefined') {
                (adsbygoogle = window.adsbygoogle || []).push({});
            }
        } catch (adError) {
            console.log('AdSense initialization skipped');
        }
    } catch (error) {
        console.error('Error rendering tools:', error);
        toolsGrid.innerHTML = `
            <div class="w-[90%] mx-auto">
                <div class="text-center py-8">
                    <p class="text-red-600 dark:text-red-400">Error loading tools. Please try again later.</p>
                </div>
            </div>
        `;
    }
}

// Toggle dark mode
function toggleDarkMode() {
    document.documentElement.classList.toggle('dark');
    localStorage.setItem('darkMode', document.documentElement.classList.contains('dark'));
}

// Loading state management
function showLoading() {
    loadingSpinner.classList.remove('hidden');
}

function hideLoading() {
    loadingSpinner.classList.add('hidden');
}

// Show error message
function showError(message) {
    console.error('Showing error message:', message);
    
    // Create error element if it doesn't exist
    let errorElement = document.getElementById('errorMessage');
    if (!errorElement) {
        errorElement = document.createElement('div');
        errorElement.id = 'errorMessage';
        errorElement.className = 'fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50';
        document.body.appendChild(errorElement);
    }
    
    // Create error message content
    errorElement.innerHTML = `
        <div class="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md mx-auto shadow-xl">
            <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">Error</h3>
            <p class="text-gray-600 dark:text-gray-300 mb-6">${message}</p>
            <div class="flex justify-end">
                <button id="retryButton" class="px-4 py-2 bg-primary text-white rounded-md mr-2 hover:bg-primary-dark">
                    Retry
                </button>
                <button id="closeErrorButton" class="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-md hover:bg-gray-300 dark:hover:bg-gray-600">
                    OK
                </button>
            </div>
        </div>
    `;
    
    // Add event listeners
    document.getElementById('closeErrorButton').addEventListener('click', () => {
        errorElement.classList.add('hidden');
    });
    
    document.getElementById('retryButton').addEventListener('click', () => {
        errorElement.classList.add('hidden');
        location.reload();
    });
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', init); 