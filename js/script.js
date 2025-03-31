// State management
let tools = [];
let categories = [];
let currentCategory = null;
let searchQuery = '';

// DOM Elements
const toolsGrid = document.getElementById('toolsGrid');
const categoryFilters = document.getElementById('categoryFilters');
const searchInput = document.getElementById('searchInput');
const darkModeToggle = document.getElementById('darkModeToggle');
const loadingSpinner = document.getElementById('loadingSpinner');

// Initialize the application
async function init() {
    try {
        showLoading();
        await fetchTools();
        setupEventListeners();
        renderCategories();
        renderTools();
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
        const response = await fetch('tools.json');
        if (!response.ok) throw new Error('Failed to fetch tools');
        const data = await response.json();
        tools = data.tools;
        categories = data.categories;
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
        renderTools();
    });

    // Dark mode toggle
    darkModeToggle.addEventListener('click', toggleDarkMode);

    // Check for saved dark mode preference
    if (localStorage.getItem('darkMode') === 'true') {
        document.documentElement.classList.add('dark');
    }
}

// Render category filters
function renderCategories() {
    categoryFilters.innerHTML = `
        <button class="category-filter active px-4 py-2 rounded-full text-sm font-medium bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
                data-category="all">
            All Tools
        </button>
        ${categories.map(category => `
            <button class="category-filter px-4 py-2 rounded-full text-sm font-medium bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
                    data-category="${category}">
                ${category}
            </button>
        `).join('')}
    `;

    // Add click event listeners to category filters
    document.querySelectorAll('.category-filter').forEach(button => {
        button.addEventListener('click', () => {
            document.querySelectorAll('.category-filter').forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            currentCategory = button.dataset.category === 'all' ? null : button.dataset.category;
            renderTools();
        });
    });
}

// Create ad container HTML
function createAdContainer() {
    return `
        <div class="col-span-full my-8">
            <div class="ad-container text-center bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                <!-- AdSense Ad -->
                <ins class="adsbygoogle"
                     style="display:block"
                     data-ad-client="ca-pub-YOUR_PUBLISHER_ID"
                     data-ad-slot="YOUR_AD_SLOT_ID"
                     data-ad-format="auto"
                     data-full-width-responsive="true"></ins>
            </div>
        </div>
    `;
}

// Render tools grid
function renderTools() {
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
            <div class="tool-card bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700">
                <div class="p-4">
                    <div class="flex items-center space-x-4">
                        <img src="${tool.image}" alt="${tool.name}" class="w-12 h-12 rounded-lg object-contain">
                        <div>
                            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">${tool.name}</h3>
                            <span class="text-sm text-gray-500 dark:text-gray-400">${tool.category}</span>
                        </div>
                    </div>
                    <p class="mt-4 text-gray-600 dark:text-gray-300">${tool.description}</p>
                    <div class="mt-4">
                        <a href="${tool.link}" target="_blank" rel="noopener noreferrer"
                           class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
                            Visit Tool
                        </a>
                    </div>
                </div>
            </div>
        `;

        // Add ad container after every 5th tool
        if ((index + 1) % 5 === 0 && index < filteredTools.length - 1) {
            toolsHTML += createAdContainer();
        }
    });

    toolsGrid.innerHTML = toolsHTML;

    // Initialize new AdSense ads
    if (typeof adsbygoogle !== 'undefined') {
        (adsbygoogle = window.adsbygoogle || []).push({});
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