// Pet names array
const PET_NAMES = [
    'Kitsune',
    'Raccon', 
    'Disco bee',
    'Trex',
    'Corupt kitsune',
    'Spino',
    'Dragon fly',
    'Butter fly',
    'Mimic octopus',
    'Queen bee',
    'Red fox',
    'Femeck fox',
    'Chikend zombie'
];

// Pet image mappings
const PET_IMAGES = {
    'Kitsune': 'https://files.catbox.moe/oa39a4.jpg',
    'Raccon': 'https://files.catbox.moe/8y5ejx.jpg',
    'Disco bee': 'https://files.catbox.moe/lcbwtc.jpg',
    'Trex': 'https://files.catbox.moe/gckkh4.jpg',
    'Corupt kitsune': 'https://files.catbox.moe/s333ef.jpg',
    'Spino': 'https://files.catbox.moe/dbkjwv.jpg',
    'Dragon fly': 'https://files.catbox.moe/kc5npt.jpg',
    'Butter fly': 'https://files.catbox.moe/r08r6w.jpg',
    'Mimic octopus': 'https://files.catbox.moe/63nj50.jpg',
    'Queen bee': 'https://files.catbox.moe/3xcyxl.jpg',
    'Red fox': 'https://files.catbox.moe/723up5.jpg',
    'Femeck fox': 'https://files.catbox.moe/p9yhvd.jpg',
    'Chikend zombie': 'https://files.catbox.moe/a2j8u3.jpg'
};

// Global variables
let petsData = [];
let currentOrderData = null;
let currentBanner = 0;
let isLightTheme = false;

// DOM elements
const loadingState = document.getElementById('loadingState');
const errorState = document.getElementById('errorState');
const productsGrid = document.getElementById('productsGrid');
const orderModal = document.getElementById('orderModal');

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    loadPets();
    setupEventListeners();
    
    // Auto-slide banner every 4 seconds
    setInterval(autoChangeBanner, 4000);
    
    // Load saved theme
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        toggleTheme();
    }
});

// Setup event listeners
function setupEventListeners() {
    // Mobile menu toggle
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const navMenu = document.getElementById('navMenu');
    
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', function() {
            navMenu.style.display = navMenu.style.display === 'flex' ? 'none' : 'flex';
        });
    }

    // Close modal when clicking outside
    orderModal.addEventListener('click', function(e) {
        if (e.target === orderModal) {
            closeOrderModal();
        }
    });

    // Quantity input change
    const quantityInput = document.getElementById('quantity');
    quantityInput.addEventListener('input', updateTotal);

    // Payment method change
    const paymentOptions = document.querySelectorAll('input[name="payment"]');
    paymentOptions.forEach(option => {
        option.addEventListener('change', clearPaymentError);
    });

    // Smooth scrolling for navigation links
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
}

// Load pets data from API
async function loadPets() {
    try {
        showLoadingState();
        
        const response = await fetch('./harga.json');
        
        if (!response.ok) {
            throw new Error('Failed to fetch pet data');
        }
        
        const pricingData = await response.json();
        
        // Create pets array with pricing data
        petsData = PET_NAMES.map(name => ({
            name: name,
            price: pricingData[name]?.price || 'Contact',
            stock: pricingData[name]?.stock || 0,
            image: PET_IMAGES[name] || 'https://images.unsplash.com/photo-1425082661705-1834bfd09dca?ixlib=rb-4.0.3&w=400&h=400&fit=crop'
        }));
        
        showProductsGrid();
        renderPets();
        
    } catch (error) {
        console.error('Error loading pets:', error);
        showErrorState();
    }
}

// Show loading state
function showLoadingState() {
    loadingState.style.display = 'block';
    errorState.style.display = 'none';
    productsGrid.style.display = 'none';
}

// Show error state
function showErrorState() {
    loadingState.style.display = 'none';
    errorState.style.display = 'block';
    productsGrid.style.display = 'none';
}

// Show products grid
function showProductsGrid() {
    loadingState.style.display = 'none';
    errorState.style.display = 'none';
    productsGrid.style.display = 'grid';
}

// Render pets in the grid
function renderPets() {
    productsGrid.innerHTML = '';
    
    petsData.forEach((pet, index) => {
        const petCard = createPetCard(pet, index);
        productsGrid.appendChild(petCard);
    });
}

// Create individual pet card
function createPetCard(pet, index) {
    const card = document.createElement('div');
    card.className = 'pet-card';
    card.style.animationDelay = `${index * 100}ms`;
    
    const isOutOfStock = pet.stock <= 0;
    const isPriceContact = typeof pet.price === 'string';
    const priceDisplay = isPriceContact ? pet.price : `Rp ${pet.price.toLocaleString('id-ID')}`;
    
    card.innerHTML = `
        <div class="pet-image-container">
            <img src="${pet.image}" alt="${pet.name}" class="pet-image" loading="lazy">
            <div class="stock-badge ${isOutOfStock ? 'out-of-stock' : 'in-stock'}">
                Stock: ${pet.stock}
            </div>
        </div>
        <div class="pet-info">
            <h4 class="pet-name">${pet.name}</h4>
            <div class="pet-details">
                <span class="pet-price">${priceDisplay}</span>
                <span class="pet-quality">Premium Quality</span>
            </div>
            <button 
                class="order-btn" 
                onclick="openOrderModal('${pet.name}', '${pet.price}', ${pet.stock})"
                ${isOutOfStock || isPriceContact ? 'disabled' : ''}
            >
                ${isOutOfStock ? 'Out of Stock' : isPriceContact ? 'Contact for Price' : 'Order Now'}
            </button>
        </div>
    `;
    
    return card;
}

// Open order modal
function openOrderModal(petName, price, stock) {
    currentOrderData = {
        petName: petName,
        price: parseFloat(price),
        stock: stock
    };
    
    // Update modal content
    document.getElementById('orderPetImage').src = PET_IMAGES[petName];
    document.getElementById('orderPetImage').alt = petName;
    document.getElementById('orderPetName').textContent = petName;
    document.getElementById('orderPetPrice').textContent = `Rp ${parseFloat(price).toLocaleString('id-ID')}`;
    
    // Reset form
    document.getElementById('quantity').value = 1;
    document.getElementById('quantity').max = stock;
    
    // Clear payment selection
    const paymentOptions = document.querySelectorAll('input[name="payment"]');
    paymentOptions.forEach(option => option.checked = false);
    
    // Clear errors
    clearErrors();
    
    // Update total
    updateTotal();
    
    // Show modal
    orderModal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

// Close order modal
function closeOrderModal() {
    orderModal.style.display = 'none';
    document.body.style.overflow = 'auto';
    currentOrderData = null;
}

// Update total price
function updateTotal() {
    if (!currentOrderData) return;
    
    const quantity = parseInt(document.getElementById('quantity').value) || 1;
    const total = quantity * currentOrderData.price;
    
    document.getElementById('totalPrice').textContent = `Rp ${total.toLocaleString('id-ID')}`;
}

// Clear errors
function clearErrors() {
    document.getElementById('quantityError').textContent = '';
    document.getElementById('paymentError').textContent = '';
}

// Clear payment error
function clearPaymentError() {
    document.getElementById('paymentError').textContent = '';
}

// Validate form
function validateForm() {
    clearErrors();
    
    let isValid = true;
    const quantity = parseInt(document.getElementById('quantity').value);
    const selectedPayment = document.querySelector('input[name="payment"]:checked');
    
    // Validate quantity
    if (!quantity || quantity <= 0) {
        document.getElementById('quantityError').textContent = 'Please enter a valid quantity';
        isValid = false;
    } else if (quantity > currentOrderData.stock) {
        document.getElementById('quantityError').textContent = `Maximum available: ${currentOrderData.stock}`;
        isValid = false;
    }
    
    // Validate payment method
    if (!selectedPayment) {
        document.getElementById('paymentError').textContent = 'Please select a payment method';
        isValid = false;
    }
    
    return isValid;
}

// Submit order
function submitOrder() {
    if (!currentOrderData || !validateForm()) {
        return;
    }
    
    const quantity = parseInt(document.getElementById('quantity').value);
    const paymentMethod = document.querySelector('input[name="payment"]:checked').value;
    const total = quantity * currentOrderData.price;
    
    // Create WhatsApp message
    const message = `🛒 *New Order from ApparelZx*

📦 *Pet:* ${currentOrderData.petName}
💰 *Price:* Rp ${currentOrderData.price.toLocaleString('id-ID')} each
📊 *Quantity:* ${quantity}
💳 *Payment Method:* ${paymentMethod}
💵 *Total:* Rp ${total.toLocaleString('id-ID')}

*Store:* ApparelZx - Premium Roblox Pets
*Game:* Grow A Garden

Please confirm this order and provide payment instructions.

Thank you for choosing ApparelZx! 🎮`;
    
    // Open WhatsApp
    const whatsappUrl = `https://wa.me/6285608790822?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    
    // Close modal
    closeOrderModal();
    
    // Show success message (optional)
    showNotification('Order sent to WhatsApp successfully!', 'success');
}

// Show notification
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#10b981' : '#6366f1'};
        color: white;
        padding: 15px 20px;
        border-radius: 10px;
        z-index: 3000;
        animation: slideIn 0.3s ease-out;
        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
    `;
    notification.textContent = message;
    
    // Add styles for animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
    `;
    document.head.appendChild(style);
    
    // Add to page
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideIn 0.3s ease-out reverse';
        setTimeout(() => {
            document.body.removeChild(notification);
            document.head.removeChild(style);
        }, 300);
    }, 3000);
}

// Scroll to products section
function scrollToProducts() {
    document.getElementById('products').scrollIntoView({ behavior: 'smooth' });
}

// Auto-refresh data every 30 seconds
setInterval(() => {
    loadPets();
}, 30000);

// Handle mobile menu
window.addEventListener('resize', function() {
    const navMenu = document.getElementById('navMenu');
    if (window.innerWidth > 768) {
        navMenu.style.display = 'flex';
    } else {
        navMenu.style.display = 'none';
    }
});

// Add scroll effect to header
window.addEventListener('scroll', function() {
    const header = document.querySelector('.header');
    if (window.scrollY > 50) {
        header.style.background = 'rgba(10, 10, 10, 0.98)';
        header.style.backdropFilter = 'blur(15px)';
    } else {
        header.style.background = 'rgba(10, 10, 10, 0.95)';
        header.style.backdropFilter = 'blur(10px)';
    }
});

// Lazy loading for images
document.addEventListener('DOMContentLoaded', function() {
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                }
            });
        });

        const images = document.querySelectorAll('img[data-src]');
        images.forEach(img => imageObserver.observe(img));
    }
});

// Banner slider functionality
function changeBanner(index) {
    const bannerItems = document.querySelectorAll('.banner-item');
    const bannerDots = document.querySelectorAll('.banner-dot');
    
    // Remove active class from all items and dots
    bannerItems.forEach(item => item.classList.remove('active'));
    bannerDots.forEach(dot => dot.classList.remove('active'));
    
    // Add active class to selected item and dot
    if (bannerItems[index] && bannerDots[index]) {
        bannerItems[index].classList.add('active');
        bannerDots[index].classList.add('active');
        currentBanner = index;
    }
}

function autoChangeBanner() {
    const bannerItems = document.querySelectorAll('.banner-item');
    if (bannerItems.length > 0) {
        currentBanner = (currentBanner + 1) % bannerItems.length;
        changeBanner(currentBanner);
    }
}

// Theme toggle functionality
function toggleTheme() {
    isLightTheme = !isLightTheme;
    const body = document.body;
    const themeIcon = document.getElementById('theme-icon');
    
    if (isLightTheme) {
        body.classList.add('light-theme');
        // Change to moon icon for light theme
        themeIcon.innerHTML = `
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
        `;
        localStorage.setItem('theme', 'light');
    } else {
        body.classList.remove('light-theme');
        // Change to sun icon for dark theme  
        themeIcon.innerHTML = `
            <circle cx="12" cy="12" r="5"></circle>
            <line x1="12" y1="1" x2="12" y2="3"></line>
            <line x1="12" y1="21" x2="12" y2="23"></line>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
            <line x1="1" y1="12" x2="3" y2="12"></line>
            <line x1="21" y1="12" x2="23" y2="12"></line>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
        `;
        localStorage.setItem('theme', 'dark');
    }
}
