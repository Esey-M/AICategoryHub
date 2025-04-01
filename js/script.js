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
        await fetchTools();
        setupEventListeners();
        renderCategories();
        // Initialize AdSense ads
        if (typeof adsbygoogle !== 'undefined') {
            (adsbygoogle = window.adsbygoogle || []).push({});
        }
    } catch (error) {
        console.error('Error initializing application:', error);
        showError('Failed to load AI tools. Please try again later.');
    } finally {
        hideLoading();
    }
}

// Fetch tools data from tools.json
async function fetchTools() {
    try {
        console.log('Fetching tools data...');
        const response = await fetch('tools.json');
        if (!response.ok) {
            console.error('Failed to fetch tools:', response.status, response.statusText);
            throw new Error(`Failed to fetch tools: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        if (!data.tools || !Array.isArray(data.tools)) {
            console.error('Invalid tools data structure:', data);
            throw new Error('Invalid tools data structure');
        }
        tools = data.tools;
        categories = data.categories || [];
        console.log(`Successfully loaded ${tools.length} tools and ${categories.length} categories`);
    } catch (error) {
        console.error('Error fetching tools:', error);
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
}

// Show categories
function showCategories() {
    currentCategory = null;
    toolsSection.classList.add('hidden');
    categoriesGrid.parentElement.classList.remove('hidden');
    searchQuery = '';
    searchInput.value = '';
}

// Create ad container HTML
function createAdContainer() {
    return `
        </div>
        <div class="w-full my-6">
            <div class="ad-container bg-gray-800/40 p-8 rounded-lg">
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

        let toolsHTML = '';
        
        filteredTools.forEach((tool, index) => {
            // Add tool card
            toolsHTML += `
                <div class="tool-card p-8 bg-gray-800/40 rounded-lg">
                    <div class="flex items-start gap-3">
                        <img src="${tool.image}" alt="${tool.name}" class="w-8 h-8">
                        <div>
                            <h3 class="text-white font-medium">${tool.name}</h3>
                            <p class="text-gray-400 text-sm">${tool.category}</p>
                        </div>
                    </div>
                    <p class="mt-4 text-gray-300">${tool.description}</p>
                    <a href="${tool.link}" target="_blank" rel="noopener noreferrer" 
                       class="inline-block mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors">
                        Visit Tool
                    </a>
                </div>
            `;

            // Add ad container after every 6th tool (except after the last tool)
            if ((index + 1) % 6 === 0 && index < filteredTools.length - 1) {
                toolsHTML += createAdContainer();
            }
        });

        if (filteredTools.length === 0) {
            toolsHTML = `
                <div class="text-center py-8">
                    <p class="text-gray-400">No tools found for this category${searchQuery ? ' and search query' : ''}.</p>
                </div>
            `;
        }

        // Add the tools HTML to the grid with the correct grid layout
        toolsGrid.innerHTML = `<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">${toolsHTML}</div>`;

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
            <div class="text-center py-8">
                <p class="text-red-600">Error loading tools. Please try again later.</p>
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

// Error handling
function showError(message) {
    // You can implement a more sophisticated error display here
    alert(message);
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', init); 