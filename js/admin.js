// Admin password (this should be replaced with a more secure method in production)
const ADMIN_PASSWORD = 'admin123'; // This is just for demonstration

// DOM Elements
const loginForm = document.getElementById('loginForm');
const adminPanel = document.getElementById('adminPanel');
const loginFormElement = document.getElementById('loginFormElement');
const addToolForm = document.getElementById('addToolForm');
const toolsTableBody = document.getElementById('toolsTableBody');
const jsonOutput = document.getElementById('jsonOutput');
const copyJsonButton = document.getElementById('copyJson');

// State management
let tools = [];
let categories = [];

// Initialize the admin panel
async function init() {
    try {
        await fetchTools();
        setupEventListeners();
        renderToolsTable();
        updateJsonOutput();
    } catch (error) {
        console.error('Error initializing admin panel:', error);
        showError('Failed to load tools data');
    }
}

// Fetch tools data
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
    // Login form
    loginFormElement.addEventListener('submit', handleLogin);

    // Add tool form
    addToolForm.addEventListener('submit', handleAddTool);

    // Copy JSON button
    copyJsonButton.addEventListener('click', copyJsonToClipboard);
}

// Handle login
function handleLogin(e) {
    e.preventDefault();
    const password = document.getElementById('password').value;
    
    if (password === ADMIN_PASSWORD) {
        loginForm.classList.add('hidden');
        adminPanel.classList.remove('hidden');
    } else {
        showError('Invalid password');
    }
}

// Handle adding a new tool
function handleAddTool(e) {
    e.preventDefault();
    const formData = new FormData(addToolForm);
    const newTool = {
        id: Date.now().toString(),
        name: formData.get('name'),
        description: formData.get('description'),
        category: formData.get('category'),
        image: formData.get('image'),
        link: formData.get('link')
    };

    tools.push(newTool);
    renderToolsTable();
    updateJsonOutput();
    addToolForm.reset();
}

// Handle deleting a tool
function handleDeleteTool(id) {
    if (confirm('Are you sure you want to delete this tool?')) {
        tools = tools.filter(tool => tool.id !== id);
        renderToolsTable();
        updateJsonOutput();
    }
}

// Handle editing a tool
function handleEditTool(id) {
    const tool = tools.find(t => t.id === id);
    if (!tool) return;

    // Populate form with tool data
    addToolForm.name.value = tool.name;
    addToolForm.description.value = tool.description;
    addToolForm.category.value = tool.category;
    addToolForm.image.value = tool.image;
    addToolForm.link.value = tool.link;

    // Remove the old tool
    tools = tools.filter(t => t.id !== id);
    renderToolsTable();
    updateJsonOutput();
}

// Render tools table
function renderToolsTable() {
    toolsTableBody.innerHTML = tools.map(tool => `
        <tr>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                    <img src="${tool.image}" alt="${tool.name}" class="h-10 w-10 rounded-lg object-contain">
                    <div class="ml-4">
                        <div class="text-sm font-medium text-gray-900">${tool.name}</div>
                        <div class="text-sm text-gray-500">${tool.description}</div>
                    </div>
                </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                    ${tool.category}
                </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button onclick="handleEditTool('${tool.id}')" class="text-primary hover:text-primary-dark mr-3">
                    Edit
                </button>
                <button onclick="handleDeleteTool('${tool.id}')" class="text-red-600 hover:text-red-900">
                    Delete
                </button>
            </td>
        </tr>
    `).join('');
}

// Update JSON output
function updateJsonOutput() {
    const data = {
        tools: tools,
        categories: categories
    };
    jsonOutput.textContent = JSON.stringify(data, null, 2);
}

// Copy JSON to clipboard
async function copyJsonToClipboard() {
    try {
        await navigator.clipboard.writeText(jsonOutput.textContent);
        showSuccess('JSON copied to clipboard!');
    } catch (error) {
        showError('Failed to copy JSON to clipboard');
    }
}

// Error handling
function showError(message) {
    alert(message); // You can implement a more sophisticated error display here
}

function showSuccess(message) {
    alert(message); // You can implement a more sophisticated success display here
}

// Initialize the admin panel when the DOM is loaded
document.addEventListener('DOMContentLoaded', init); 