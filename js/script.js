// State management
let tools = [];
let categories = [];
let currentCategory = null;
let searchQuery = '';

// DOM Elements - will be initialized properly in the init function
let toolsGrid;
let categoriesGrid;
let searchInput;
let darkModeToggle;
let loadingSpinner;
let toolsSection;
let categoryTitle;
let mobileMenuButton;
let mobileMenu;
let backButton;

// Initialize the application
async function init() {
    try {
        console.log('Initializing application...');
        
        // Initialize DOM elements safely
        initializeDOMElements();
        
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
            
            generateStructuredData(tools);
            
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

// Initialize DOM element references safely
function initializeDOMElements() {
    console.log('Initializing DOM elements...');
    
    // Essential elements
    toolsGrid = document.getElementById('toolsContainer');
    categoriesGrid = document.getElementById('categoriesGrid');
    searchInput = document.getElementById('searchInput');
    darkModeToggle = document.getElementById('darkModeToggle');
    loadingSpinner = document.getElementById('loadingSpinner');
    toolsSection = document.getElementById('toolsSection');
    categoryTitle = document.getElementById('categoryTitle');
    backButton = document.getElementById('backButton');
    
    // Mobile menu elements - update to match the actual HTML IDs
    mobileMenuButton = document.getElementById('mobileMenuBtn');
    mobileMenu = document.getElementById('mobileMenu');
    
    // Log missing critical elements
    if (!toolsGrid) console.warn('toolsContainer element not found');
    if (!categoriesGrid) console.warn('categoriesGrid element not found');
    if (!searchInput) console.warn('searchInput element not found');
    if (!darkModeToggle) console.warn('darkModeToggle element not found');
    if (!loadingSpinner) console.warn('loadingSpinner element not found');
    if (!toolsSection) console.warn('toolsSection element not found');
    if (!categoryTitle) console.warn('categoryTitle element not found');
    if (!backButton) console.warn('backButton element not found');
    if (!mobileMenuButton) console.warn('mobileMenuBtn element not found');
    if (!mobileMenu) console.warn('mobileMenu element not found');
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

// Set up event listeners
function setupEventListeners() {
    try {
        console.log('Setting up event listeners...');
        
        // Back button
        if (backButton) {
            backButton.addEventListener('click', showCategories);
            console.log('Back button listener added');
        } else {
            console.warn('Back button element not found');
        }

        // Guide link
        const guideLink = document.getElementById('guideLink');
        if (guideLink) {
            guideLink.classList.add('hidden'); // Hide by default
            console.log('Guide link hidden by default');
        } else {
            console.warn('Guide link element not found');
        }

        // Search input
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                searchQuery = e.target.value.toLowerCase();
                if (currentCategory) {
                    renderTools();
                }
            });
            console.log('Search input listener added');
        } else {
            console.warn('Search input element not found');
        }

        // Dark mode toggle
        if (darkModeToggle) {
            darkModeToggle.addEventListener('click', toggleDarkMode);
            console.log('Dark mode toggle listener added');
        } else {
            console.warn('Dark mode toggle element not found');
        }

        // Check for saved dark mode preference
        if (localStorage.getItem('darkMode') === 'true') {
            document.documentElement.classList.add('dark');
            console.log('Dark mode enabled from local storage');
        }

        // Mobile menu functionality
        if (mobileMenuButton && mobileMenu) {
            mobileMenuButton.addEventListener('click', () => {
                mobileMenu.classList.toggle('hidden');
            });
            console.log('Mobile menu button listener added');
            
            // Close mobile menu when clicking outside - with improved error handling
            document.addEventListener('click', (e) => {
                try {
                    // Check that all elements still exist and e.target is valid
                    if (!e || !e.target) return;
                    if (!mobileMenuButton || !mobileMenu) return;
                    
                    // Only proceed if the mobile menu is actually visible
                    if (mobileMenu.classList.contains('hidden')) return;
                    
                    // Check if click is outside menu and button
                    if (!mobileMenuButton.contains(e.target) && !mobileMenu.contains(e.target)) {
                        mobileMenu.classList.add('hidden');
                    }
                } catch (error) {
                    console.warn('Error in mobile menu click handler:', error);
                    // Don't show an error to the user for this non-critical feature
                }
            });
            console.log('Document click listener for mobile menu added');
        } else {
            console.warn('Mobile menu elements not found');
        }
        
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
        console.log('Popstate listener added');
        
        console.log('All event listeners set up successfully');
    } catch (error) {
        console.error('Error in setupEventListeners:', error);
        showError('Failed to initialize event listeners. Please refresh the page and try again.');
    }
}

// Render category cards
function renderCategories() {
    const categoryIcons = {
        "Video Editing & Generation": "fas fa-video",
        "Chatbots & Conversational AI": "fas fa-robot",
        "Image Generation & Editing": "fas fa-image",
        "Text Generation & Writing Assistance": "fas fa-pen-fancy",
        "Speech Recognition & Synthesis": "fas fa-microphone",
        "Code Generation & Development Assistance": "fas fa-code",
        "Marketing & SEO": "fas fa-bullhorn",
        "Data Analysis & Visualization": "fas fa-chart-bar",
        "Predictive Analytics & Forecasting": "fas fa-chart-line",
        "Virtual Reality & Augmented Reality": "fas fa-vr-cardboard",
        "Healthcare & Medicine": "fas fa-heartbeat",
        "Voice Assistants & Automation": "fas fa-microphone-alt",
        "Robotics & Automation": "fas fa-robot",
        "Finance & Trading": "fas fa-coins",
        "Sentiment Analysis & Opinion Mining": "fas fa-smile",
        "Language Translation & Localization": "fas fa-language",
        "Facial Recognition & Computer Vision": "fas fa-eye",
        "AI for Education & E-Learning": "fas fa-graduation-cap",
        "AI for Cybersecurity & Fraud Detection": "fas fa-shield-alt",
        "Ethical AI & Bias Detection": "fas fa-balance-scale"
    };
    
    const iconColors = {
        "Video Editing & Generation": "#ef4444",
        "Chatbots & Conversational AI": "#3b82f6",
        "Image Generation & Editing": "#10b981",
        "Text Generation & Writing Assistance": "#8b5cf6",
        "Speech Recognition & Synthesis": "#f59e0b",
        "Code Generation & Development Assistance": "#6366f1",
        "Marketing & SEO": "#ec4899",
        "Data Analysis & Visualization": "#14b8a6",
        "Predictive Analytics & Forecasting": "#84cc16",
        "Virtual Reality & Augmented Reality": "#9333ea",
        "Healthcare & Medicine": "#ef4444",
        "Voice Assistants & Automation": "#0ea5e9",
        "Robotics & Automation": "#3b82f6",
        "Finance & Trading": "#f59e0b",
        "Sentiment Analysis & Opinion Mining": "#ec4899",
        "Language Translation & Localization": "#6366f1",
        "Facial Recognition & Computer Vision": "#10b981",
        "AI for Education & E-Learning": "#3b82f6",
        "AI for Cybersecurity & Fraud Detection": "#ef4444",
        "Ethical AI & Bias Detection": "#8b5cf6"
    };
    
    const categoryCards = categories.map(category => {
        const toolCount = tools.filter(tool => tool.category === category).length;
        const iconClass = categoryIcons[category] || "fas fa-cube";
        const iconColor = iconColors[category] || "#3b82f6";
        
        return `
            <div class="category-card bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700 cursor-pointer hover:shadow-lg transition-shadow duration-200"
                 data-category="${category}">
                <div class="p-6">
                    <div class="text-center mb-4" style="min-height: 60px; display: flex; align-items: center; justify-content: center;">
                        <i class="${iconClass} fa-3x" style="color: ${iconColor}; font-size: 48px;"></i>
                    </div>
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
    console.log('showTools called with category:', category);
    currentCategory = category;
    
    const categoryTitle = document.getElementById('categoryTitle');
    const categoryDescription = document.getElementById('categoryDescription');
    const toolsSection = document.getElementById('toolsSection');
    const categoriesSection = document.getElementById('categoriesSection');
    const guideLink = document.getElementById('guideLink');
    const backButton = document.getElementById('backButton');

    if (!categoryTitle || !categoryDescription || !toolsSection || !categoriesSection) {
        console.error('Required elements not found');
        showError('Error loading category view');
        return;
    }

    // Hide categories and show tools section
    categoriesSection.style.display = 'none';
    toolsSection.classList.remove('hidden');
    toolsSection.style.display = 'block';

    // Update category title and description
    categoryTitle.textContent = category;
    categoryDescription.textContent = getCategoryDescription(category);

    // Update URL with category parameter
    const urlParams = new URLSearchParams(window.location.search);
    urlParams.set('category', encodeURIComponent(category));
    const newUrl = `${window.location.pathname}?${urlParams.toString()}`;
    history.pushState({ category }, '', newUrl);

    // Update page title
    document.title = `${category} - AI Category Hub`;

    // Show or hide guide link based on category
    if (guideLink) {
        const guideMap = {
            "Chatbots & Conversational AI": "chatbots",
            "Image Generation & Editing": "image-generation",
            "Text Generation & Writing Assistance": "text-generation",
            "Speech Recognition & Synthesis": "speech-recognition",
            "Code Generation & Development Assistance": "code-generation",
            "Video Editing & Generation": "video-editing"
        };

        const guideSlug = guideMap[category];
        if (guideSlug) {
            guideLink.href = `guides/${guideSlug}.html`;
            guideLink.textContent = `Read our comprehensive guide on ${category}`;
            guideLink.style.display = 'inline-block';
            guideLink.parentElement.parentElement.style.display = 'block';
            console.log('Guide link updated:', guideLink.href);
        } else {
            guideLink.style.display = 'none';
            guideLink.parentElement.parentElement.style.display = 'none';
            console.log('Guide link hidden for category:', category);
        }
    } else {
        console.error('Guide link element not found');
    }

    // Ensure back button is visible and clickable
    if (backButton) {
        backButton.style.display = 'inline-block';
        backButton.style.cursor = 'pointer';
        console.log('Back button made visible');
    } else {
        console.error('Back button element not found');
    }

    // Render the tools for this category
    renderTools();
}

// Show categories
function showCategories() {
    console.log('showCategories called');
    
    const toolsSection = document.getElementById('toolsSection');
    const categoriesSection = document.getElementById('categoriesSection');
    const guideLink = document.getElementById('guideLink');

    if (!toolsSection || !categoriesSection) {
        console.error('Required sections not found');
        return;
    }

    // Hide tools and show categories
    toolsSection.style.display = 'none';
    categoriesSection.style.display = 'block';

    // Reset URL
    history.pushState({}, '', window.location.pathname);

    // Reset page title
    document.title = 'AI Category Hub';

    // Hide guide link container
    if (guideLink) {
        guideLink.style.display = 'none';
        guideLink.parentElement.parentElement.style.display = 'none';
        console.log('Guide link hidden');
    }

    // Reset current category
    currentCategory = null;
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
        console.log('Rendering tools for category:', currentCategory);
        console.log('Total tools available:', tools.length);
        
        const filteredTools = tools.filter(tool => {
            const matchesCategory = tool.category === currentCategory;
            console.log(`Tool ${tool.name}: category match = ${matchesCategory}`);
            return matchesCategory;
        });

        console.log('Filtered tools count:', filteredTools.length);

        if (!toolsGrid) {
            console.error('Tools grid element not found');
            return;
        }

        // Add the tools HTML to the grid - since we already have a 90% width container
        toolsGrid.innerHTML = `
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                ${filteredTools.map((tool, index) => `
                    <div class="category-card bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow duration-200">
                        <div class="p-6">
                            <div class="flex items-center mb-4">
                                <div class="w-16 h-16 mr-4 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
                                    <img src="${tool.image}" 
                                         alt="${tool.name}" 
                                         class="w-full h-full object-contain p-1"
                                         onerror="this.onerror=null; this.src='https://placehold.co/200x200/222/fff?text=${encodeURIComponent(tool.name.charAt(0))}'; this.classList.add('fallback-img');">
                                </div>
                                <div>
                                    <h3 class="text-xl font-semibold text-gray-900 dark:text-white">${tool.name}</h3>
                                    <p class="text-sm text-gray-500 dark:text-gray-400">${tool.category}</p>
                                </div>
                            </div>
                            <p class="text-gray-600 dark:text-gray-300 mb-4">${tool.description}</p>
                            <div class="flex justify-between items-center w-full">
                                <span class="text-sm text-gray-500 dark:text-gray-400">AI Tool</span>
                                <a href="${tool.link}" target="_blank" rel="noopener noreferrer" 
                                   class="text-primary hover:underline">
                                    Use Tool →
                                </a>
                            </div>
                        </div>
                    </div>
                    ${(index + 1) % 6 === 0 && index < filteredTools.length - 1 ? `
                        </div>
                        <div class="w-full my-4">
                            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700 p-4">
                                <!-- AdSense Ad -->
                                <ins class="adsbygoogle"
                                     style="display:block"
                                     data-ad-format="horizontal"
                                     data-ad-client=""
                                     data-ad-slot="YOUR_AD_SLOT"></ins>
                            </div>
                        </div>
                        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    ` : ''}
                `).join('')}
            </div>
        `;

        if (filteredTools.length === 0) {
            toolsGrid.innerHTML = `
                <div class="text-center py-8">
                    <p class="text-gray-600 dark:text-gray-400">No tools found for this category${searchQuery ? ' and search query' : ''}.</p>
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
        if (toolsGrid) {
            toolsGrid.innerHTML = `
                <div class="text-center py-8">
                    <p class="text-red-600 dark:text-red-400">Error loading tools. Please try again later.</p>
                </div>
            `;
        }
    }
}

// Toggle dark mode
function toggleDarkMode() {
    document.documentElement.classList.toggle('dark');
    localStorage.setItem('darkMode', document.documentElement.classList.contains('dark'));
}

// Loading state management
function showLoading() {
    if (loadingSpinner) {
        loadingSpinner.classList.remove('hidden');
    }
}

function hideLoading() {
    if (loadingSpinner) {
        loadingSpinner.classList.add('hidden');
    }
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

function generateStructuredData(tools) {
    const categories = {};
    tools.forEach(tool => {
        if (!categories[tool.category]) {
            categories[tool.category] = [];
        }
        categories[tool.category].push({
            "@type": "SoftwareApplication",
            "name": tool.name,
            "description": tool.description,
            "applicationCategory": "AIApplication",
            "applicationSubCategory": tool.category,
            "url": tool.link,
            "image": tool.image,
            "offers": {
                "@type": "Offer",
                "category": "Software License",
                "availability": "https://schema.org/OnlineOnly",
                "url": tool.link
            },
            "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "4.5",
                "ratingCount": "100",
                "bestRating": "5",
                "worstRating": "1"
            }
        });
    });

    // Generate breadcrumbs structured data
    const breadcrumbsData = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": Object.keys(categories).map((category, index) => ({
            "@type": "ListItem",
            "position": index + 1,
            "name": category,
            "item": `https://aicategoryhub.net/?category=${encodeURIComponent(category)}`
        }))
    };

    // Category list structured data
    const structuredData = {
        "@context": "https://schema.org",
        "@type": "ItemList",
        "itemListElement": Object.entries(categories).map(([category, tools], index) => ({
            "@type": "ListItem",
            "position": index + 1,
            "item": {
                "@type": "CategoryCode",
                "name": category,
                "description": `AI tools for ${category.toLowerCase()}`,
                "url": `https://aicategoryhub.net/?category=${encodeURIComponent(category)}`,
                "hasOfferCatalog": {
                    "@type": "OfferCatalog",
                    "name": `${category} AI Tools`,
                    "itemListElement": tools
                }
            }
        }))
    };

    // Organization structured data
    const organizationData = {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "AI Category Hub",
        "url": "https://aicategoryhub.net",
        "logo": "https://aicategoryhub.net/images/logo.png",
        "sameAs": [
            "https://twitter.com/aicategoryhub",
            "https://www.linkedin.com/company/aicategoryhub"
        ],
        "contactPoint": {
            "@type": "ContactPoint",
            "contactType": "customer support",
            "email": "support@aicategoryhub.net"
        }
    };

    // Remove existing structured data scripts
    document.querySelectorAll('script[type="application/ld+json"]').forEach(script => {
        script.remove();
    });

    // Add new structured data scripts
    const addStructuredData = (data) => {
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.text = JSON.stringify(data);
        document.head.appendChild(script);
    };

    addStructuredData(structuredData);
    addStructuredData(breadcrumbsData);
    addStructuredData(organizationData);
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', init);