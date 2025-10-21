let cart = [];
let cartCount = 0;
let purchaseHistory = JSON.parse(localStorage.getItem('purchaseHistory')) || [];

// Function to update cart count
function updateCartCount() {
    document.getElementById('cart-count').textContent = cartCount;
}

// Function to add item to cart
function addToCart(product, price, quantity) {
    const existingItem = cart.find(item => item.product === product);
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({ product, price: parseFloat(price), quantity });
    }
    cartCount += quantity;
    updateCartCount();
    showNotification(`${quantity} ${product}(s) added to cart!`, 'success');
}

// Function to display cart
function displayCart() {
    const cartItems = document.getElementById('cart-items');
    cartItems.innerHTML = '';
    let total = 0;
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        cartItems.innerHTML += `<p>${item.product} x${item.quantity} - $${itemTotal.toFixed(2)}</p>`;
    });
    document.getElementById('cart-total').textContent = total.toFixed(2);
}

// Function to filter products by category
function filterProducts(category) {
    const products = document.querySelectorAll('.product-card');
    products.forEach(product => {
        if (category === 'all' || product.getAttribute('data-category') === category) {
            product.style.display = 'block';
        } else {
            product.style.display = 'none';
        }
    });
}

// Function to show notification
function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Event listeners for category buttons
document.querySelectorAll('.category-btn').forEach(button => {
    button.addEventListener('click', function() {
        document.querySelectorAll('.category-btn').forEach(btn => btn.classList.remove('active'));
        this.classList.add('active');
        const category = this.getAttribute('data-category');
        filterProducts(category);
    });
});

// Event listeners for add to cart buttons
document.querySelectorAll('.add-to-cart').forEach(button => {
    button.addEventListener('click', function() {
        const product = this.getAttribute('data-product');
        const price = this.getAttribute('data-price');
        const quantity = parseInt(this.previousElementSibling.value);
        addToCart(product, price, quantity);
    });
});

// Cart modal
const modal = document.getElementById('cart-modal');
const cartBtn = document.getElementById('cart-btn');
const closeBtn = document.querySelector('.close');

cartBtn.addEventListener('click', function() {
    displayCart();
    modal.style.display = 'block';
});

closeBtn.addEventListener('click', function() {
    modal.style.display = 'none';
});

window.addEventListener('click', function(event) {
    if (event.target === modal) {
        modal.style.display = 'none';
    }
});

// Checkout
document.getElementById('checkout-btn').addEventListener('click', function() {
    if (cart.length === 0) {
        showNotification('Your cart is empty!', 'error');
        return;
    }
    const total = parseFloat(document.getElementById('cart-total').textContent);
    const purchase = {
        date: new Date().toISOString(),
        items: [...cart],
        total: total
    };
    purchaseHistory.push(purchase);
    localStorage.setItem('purchaseHistory', JSON.stringify(purchaseHistory));
    showNotification('Purchase successful! Thank you for shopping.', 'success');
    cart = [];
    cartCount = 0;
    updateCartCount();
    modal.style.display = 'none';
});

// History modal
const historyModal = document.getElementById('history-modal');
const historyCloseBtn = document.getElementById('history-close');

function displayPurchaseHistory() {
    const historyContainer = document.getElementById('purchase-history');
    historyContainer.innerHTML = '';
    if (purchaseHistory.length === 0) {
        historyContainer.innerHTML = '<p>No purchase history available.</p>';
        return;
    }
    purchaseHistory.forEach((purchase, index) => {
        const purchaseDiv = document.createElement('div');
        purchaseDiv.className = 'purchase-item';
        purchaseDiv.innerHTML = `
            <h3>Purchase ${index + 1} - ${new Date(purchase.date).toLocaleDateString()}</h3>
            <ul>
                ${purchase.items.map(item => `<li>${item.product} x${item.quantity} - $${(item.price * item.quantity).toFixed(2)}</li>`).join('')}
            </ul>
            <p><strong>Total: $${purchase.total.toFixed(2)}</strong></p>
        `;
        historyContainer.appendChild(purchaseDiv);
    });
}

document.addEventListener('DOMContentLoaded', function() {
    const historyBtn = document.createElement('button');
    historyBtn.id = 'history-btn';
    historyBtn.className = 'refresh-btn';
    historyBtn.innerHTML = '<i class="fas fa-history"></i> History';
    historyBtn.style.right = '120px'; // Adjust position
    document.querySelector('header').appendChild(historyBtn);

    historyBtn.addEventListener('click', function() {
        displayPurchaseHistory();
        historyModal.style.display = 'block';
    });

    historyCloseBtn.addEventListener('click', function() {
        historyModal.style.display = 'none';
    });

    window.addEventListener('click', function(event) {
        if (event.target === historyModal) {
            historyModal.style.display = 'none';
        }
    });
});
