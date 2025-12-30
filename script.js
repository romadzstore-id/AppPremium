// script.js
// Main JavaScript for the Premium Stock Manager website
document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const loadingScreen = document.getElementById('loadingScreen');
    const stocksGrid = document.getElementById('stocksGrid');
    const accountSelect = document.getElementById('accountSelect');
    const stockQuantity = document.getElementById('stockQuantity');
    const thumbnailUrl = document.getElementById('thumbnailUrl');
    const accountPrice = document.getElementById('accountPrice');
    const accountStatus = document.getElementById('accountStatus');
    const updateStockBtn = document.getElementById('updateStockBtn');
    const formNotification = document.getElementById('formNotification');
    const totalStockElement = document.getElementById('totalStock');
    const totalAccountsElement = document.getElementById('totalAccounts');
    const updatedJustNowElement = document.getElementById('updatedJustNow');
    const menuToggle = document.getElementById('menuToggle');
    const navbar = document.querySelector('.navbar');
    const messageForm = document.getElementById('messageForm');
    
    // Hide loading screen after 1.5 seconds
    setTimeout(() => {
        loadingScreen.style.opacity = '0';
        loadingScreen.style.visibility = 'hidden';
        
        // Initialize the page after loading
        initializePage();
    }, 1500);
    
    // Initialize the page
    function initializePage() {
        loadStocks();
        populateAccountSelect();
        calculateTotalStats();
        setupEventListeners();
        updateLastUpdatedTime();
        
        // Smooth scrolling for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                e.preventDefault();
                const targetId = this.getAttribute('href');
                if (targetId === '#') return;
                
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    window.scrollTo({
                        top: targetElement.offsetTop - 80,
                        behavior: 'smooth'
                    });
                    
                    // Close mobile menu if open
                    navbar.classList.remove('active');
                }
            });
        });
        
        // Mobile menu toggle
        menuToggle.addEventListener('click', () => {
            navbar.classList.toggle('active');
        });
        
        // Close menu when clicking outside on mobile
        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 768 && 
                !navbar.contains(e.target) && 
                !menuToggle.contains(e.target) && 
                navbar.classList.contains('active')) {
                navbar.classList.remove('active');
            }
        });
        
        // Message form submission
        messageForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const name = document.getElementById('name').value;
            const subject = document.getElementById('subject').value;
            
            // Show success message
            formNotification.textContent = `Thank you ${name}! Your message about "${subject}" has been sent. We'll respond shortly.`;
            formNotification.className = 'form-notification notification-success';
            formNotification.style.display = 'block';
            
            // Reset form
            messageForm.reset();
            
            // Hide notification after 5 seconds
            setTimeout(() => {
                formNotification.style.display = 'none';
            }, 5000);
        });
    }
    
    // Load and display stocks from config
    function loadStocks() {
        stocksGrid.innerHTML = '';
        
        config.stocks.forEach(stock => {
            const stockCard = document.createElement('div');
            stockCard.className = 'stock-card';
            stockCard.dataset.id = stock.id;
            
            // Determine status class
            let statusClass = 'status-available';
            if (stock.status === 'low') statusClass = 'status-low';
            if (stock.status === 'out') statusClass = 'status-out';
            
            // Create card HTML
            stockCard.innerHTML = `
                <div class="stock-image">
                    <img src="${stock.thumbnail}" alt="${stock.name}">
                </div>
                <div class="stock-info">
                    <div class="stock-header">
                        <div class="stock-name">${stock.name}</div>
                        <div class="stock-status ${statusClass}">${stock.status.toUpperCase()}</div>
                    </div>
                    <p class="stock-description">${stock.description}</p>
                    <div class="stock-details">
                        <div class="stock-quantity">
                            <h4>${stock.stock}</h4>
                            <p>Available</p>
                        </div>
                        <div class="stock-price">$${stock.price.toFixed(2)}</div>
                    </div>
                </div>
            `;
            
            // Add click event to pre-fill form
            stockCard.addEventListener('click', () => {
                const account = config.stocks.find(a => a.id === stock.id);
                if (account) {
                    accountSelect.value = account.id;
                    stockQuantity.value = account.stock;
                    thumbnailUrl.value = account.thumbnail;
                    accountPrice.value = account.price;
                    accountStatus.value = account.status;
                    
                    // Scroll to config section
                    document.getElementById('config').scrollIntoView({ behavior: 'smooth' });
                }
            });
            
            stocksGrid.appendChild(stockCard);
        });
    }
    
    // Populate account select dropdown
    function populateAccountSelect() {
        accountSelect.innerHTML = '<option value="">Select an account</option>';
        
        config.stocks.forEach(stock => {
            const option = document.createElement('option');
            option.value = stock.id;
            option.textContent = stock.name;
            accountSelect.appendChild(option);
        });
        
        // Update form when account is selected
        accountSelect.addEventListener('change', function() {
            const selectedId = parseInt(this.value);
            if (!selectedId) return;
            
            const account = config.stocks.find(a => a.id === selectedId);
            if (account) {
                stockQuantity.value = account.stock;
                thumbnailUrl.value = account.thumbnail;
                accountPrice.value = account.price;
                accountStatus.value = account.status;
            }
        });
    }
    
    // Calculate total stats
    function calculateTotalStats() {
        let totalStock = 0;
        config.stocks.forEach(stock => {
            totalStock += stock.stock;
        });
        
        totalStockElement.textContent = totalStock;
        totalAccountsElement.textContent = config.stocks.length;
    }
    
    // Setup event listeners
    function setupEventListeners() {
        // Update stock button
        updateStockBtn.addEventListener('click', updateStock);
        
        // Auto-update status based on stock quantity
        stockQuantity.addEventListener('change', function() {
            const quantity = parseInt(this.value);
            if (quantity >= 10) {
                accountStatus.value = 'available';
            } else if (quantity > 0 && quantity < 10) {
                accountStatus.value = 'low';
            } else {
                accountStatus.value = 'out';
            }
        });
    }
    
    // Update stock function
    function updateStock() {
        const selectedId = parseInt(accountSelect.value);
        
        if (!selectedId) {
            showNotification('Please select an account first!', 'error');
            return;
        }
        
        const quantity = parseInt(stockQuantity.value);
        const thumbnail = thumbnailUrl.value;
        const price = parseFloat(accountPrice.value);
        const status = accountStatus.value;
        
        if (isNaN(quantity) || quantity < 0) {
            showNotification('Please enter a valid stock quantity!', 'error');
            return;
        }
        
        if (!thumbnail) {
            showNotification('Please enter a thumbnail URL!', 'error');
            return;
        }
        
        if (isNaN(price) || price < 0) {
            showNotification('Please enter a valid price!', 'error');
            return;
        }
        
        // Find and update the account
        const accountIndex = config.stocks.findIndex(a => a.id === selectedId);
        if (accountIndex !== -1) {
            config.stocks[accountIndex].stock = quantity;
            config.stocks[accountIndex].thumbnail = thumbnail;
            config.stocks[accountIndex].price = price;
            config.stocks[accountIndex].status = status;
            
            // Update the display
            loadStocks();
            calculateTotalStats();
            updateLastUpdatedTime();
            
            // Show success message
            showNotification(`${config.stocks[accountIndex].name} stock updated successfully!`, 'success');
            
            // In a real application, you would save to a backend here
            console.log('Updated config:', config.stocks[accountIndex]);
        }
    }
    
    // Show notification
    function showNotification(message, type) {
        formNotification.textContent = message;
        formNotification.className = `form-notification notification-${type}`;
        formNotification.style.display = 'block';
        
        // Hide after 3 seconds
        setTimeout(() => {
            formNotification.style.display = 'none';
        }, 3000);
    }
    
    // Update last updated time
    function updateLastUpdatedTime() {
        const now = new Date();
        const timeString = now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        updatedJustNowElement.textContent = `${timeString} Today`;
        
        // Add a subtle animation
        updatedJustNowElement.style.transform = 'scale(1.1)';
        setTimeout(() => {
            updatedJustNowElement.style.transform = 'scale(1)';
        }, 300);
    }
    
    // Add active class to navbar links on scroll
    window.addEventListener('scroll', () => {
        const sections = document.querySelectorAll('section');
        const navLinks = document.querySelectorAll('.navbar a');
        
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (scrollY >= sectionTop - 100) {
                current = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });
});