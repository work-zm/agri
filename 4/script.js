// Product data
const products = [
    { id: 1, name: 'Rice', description: 'Premium long-grain rice, perfect for daily meals.', image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400', minPrice: 30 },
    { id: 2, name: 'Potatoes', description: 'Fresh, organic potatoes ideal for roasting or mashing.', image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400', minPrice: 25 },
    { id: 5, name: 'Apples', description: 'Crisp, red apples with a sweet and tart flavor.', image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400', minPrice: 35 },
    { id: 6, name: 'Oranges', description: 'Citrusy oranges full of vitamin C.', image: 'https://images.unsplash.com/photo-1547514701-42782101795e?w=400', minPrice: 30 },
    { id: 7, name: 'Carrots', description: 'Crunchy carrots, great for snacking or cooking.', image: 'https://images.unsplash.com/photo-1582515073490-39981397c445?w=400', minPrice: 20 },
    { id: 8, name: 'Onions', description: 'Versatile onions for flavoring dishes.', image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400', minPrice: 18 },
    { id: 9, name: 'Lettuce', description: 'Fresh green lettuce for salads.', image: 'https://images.unsplash.com/photo-1556801712-76c8eb07bbc9?w=400', minPrice: 22 },
    { id: 10, name: 'Spinach', description: 'Nutrient-rich spinach leaves.', image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400', minPrice: 28 },
    { id: 11, name: 'Broccoli', description: 'Healthy broccoli florets.', image: 'https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?w=400', minPrice: 32 },
    { id: 12, name: 'Grapes', description: 'Sweet seedless grapes.', image: 'https://images.unsplash.com/photo-1537640538966-79f369143f8f?w=400', minPrice: 40 },
    { id: 13, name: 'Strawberries', description: 'Juicy red strawberries.', image: 'https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2?w=400', minPrice: 45 },
    { id: 14, name: 'Mangoes', description: 'Tropical mangoes bursting with flavor.', image: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=400', minPrice: 38 },
    { id: 15, name: 'Pineapples', description: 'Sweet and tangy pineapples.', image: 'https://images.unsplash.com/photo-1550258987-190a2d41a8ba?w=400', minPrice: 35 },
    { id: 16, name: 'Peppers', description: 'Colorful bell peppers for cooking.', image: 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=400', minPrice: 25 },
    { id: 17, name: 'Cucumbers', description: 'Cool and refreshing cucumbers.', image: 'https://images.unsplash.com/photo-1604977042946-1eecc30f269e?w=400', minPrice: 20 },
    { id: 18, name: 'Eggplants', description: 'Versatile eggplants for various dishes.', image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400', minPrice: 22 }
];

// Cart functionality
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Render featured carousel
function renderFeaturedCarousel() {
    const carouselInner = document.querySelector('#featured-carousel .carousel-inner');
    const featuredProducts = products.slice(0, 2); // Rice, Potatoes (since Bananas removed)
    carouselInner.innerHTML = '';
    featuredProducts.forEach((product, index) => {
        const item = document.createElement('div');
        item.className = `carousel-item ${index === 0 ? 'active' : ''}`;
        item.innerHTML = `
            <img src="${product.image}" class="d-block w-100" alt="${product.name}">
            <div class="carousel-caption d-none d-md-block">
                <h5>${product.name}</h5>
                <p>${product.description}</p>
            </div>
        `;
        carouselInner.appendChild(item);
    });
}

// Render products with show more functionality
function renderProducts() {
    const productsContainer = document.getElementById('products');
    const showMoreBtn = document.getElementById('show-more-btn');
    productsContainer.innerHTML = '';
    let visibleProducts = 6; // Show first 6 initially

    function displayProducts(limit) {
        productsContainer.innerHTML = '';
        products.slice(0, limit).forEach(product => {
            const card = document.createElement('div');
            card.className = 'col-md-4 col-sm-6 fade-in';
            if (product.id === 1) card.classList.add('featured'); // Feature Rice
            card.innerHTML = `
                <div class="product-card">
                    <img src="${product.image}" alt="${product.name}" class="img-fluid">
                    <div class="p-3">
                        <h5>${product.name}</h5>
                        <p>${product.description}</p>
                        <div class="mb-2">
                            <label>Quantity (kg):</label>
                            <input type="number" class="form-control quantity-input" min="0.1" step="0.1" placeholder="0.0">
                        </div>
                        <div class="mb-2">
                            <label>Price per kg ($):</label>
                            <input type="number" class="form-control price-input" min="${product.minPrice}" step="0.01" placeholder="${product.minPrice}">
                        </div>
                        <button class="btn btn-success add-to-cart" data-id="${product.id}">Add to Cart</button>
                    </div>
                </div>
            `;
            productsContainer.appendChild(card);
        });

        // Add event listeners
        document.querySelectorAll('.add-to-cart').forEach(btn => {
            btn.addEventListener('click', addToCart);
        });

        // Show/hide show more button
        if (limit >= products.length) {
            showMoreBtn.style.display = 'none';
        } else {
            showMoreBtn.style.display = 'block';
        }
    }

    displayProducts(visibleProducts);

    showMoreBtn.addEventListener('click', () => {
        visibleProducts += 6;
        displayProducts(visibleProducts);
        // Add slide-down animation to new products
        const newCards = productsContainer.querySelectorAll('.product-card:not(.fade-in)');
        newCards.forEach(card => {
            card.classList.add('slide-down');
        });
    });
}

// Add to cart
function addToCart(e) {
    const productId = parseInt(e.target.dataset.id);
    const card = e.target.closest('.product-card');
    const quantity = parseFloat(card.querySelector('.quantity-input').value);
    const price = parseFloat(card.querySelector('.price-input').value);
    const product = products.find(p => p.id === productId);

    if (!quantity || quantity <= 0) {
        alert('Please enter a valid quantity.');
        return;
    }

    if (!price || price <= 0) {
        alert('Please enter a valid price.');
        return;
    }

    const cartItem = { ...product, quantity, price, total: quantity * price };
    cart.push(cartItem);
    localStorage.setItem('cart', JSON.stringify(cart));
    e.target.classList.add('bounce');
    setTimeout(() => e.target.classList.remove('bounce'), 600);
    alert(`${product.name} added to cart!`);
}

// Render cart
function renderCart() {
    const cartContainer = document.getElementById('cart-items');
    const checkoutForm = document.getElementById('checkout-form');
    cartContainer.innerHTML = '';

    if (cart.length === 0) {
        cartContainer.innerHTML = '<p>Your cart is empty.</p>';
        checkoutForm.classList.add('d-none');
        return;
    }

    let total = 0;
    cart.forEach((item, index) => {
        total += item.total;
        const itemDiv = document.createElement('div');
        itemDiv.className = 'cart-item';
        itemDiv.innerHTML = `
            <h6>${item.name}</h6>
            <p>Quantity: ${item.quantity} kg</p>
            <p>Price: $${item.price}/kg</p>
            <p>Total: $${item.total.toFixed(2)}</p>
            <button class="btn btn-danger btn-sm remove-item" data-index="${index}">Remove</button>
        `;
        cartContainer.appendChild(itemDiv);
    });

    cartContainer.innerHTML += `<h4>Total: $${total.toFixed(2)}</h4>`;
    checkoutForm.classList.remove('d-none');

    // Add remove event listeners
    document.querySelectorAll('.remove-item').forEach(btn => {
        btn.addEventListener('click', removeFromCart);
    });
}

// Remove from cart
function removeFromCart(e) {
    const index = parseInt(e.target.dataset.index);
    cart.splice(index, 1);
    localStorage.setItem('cart', JSON.stringify(cart));
    renderCart();
}

// Handle checkout
function handleCheckout(e) {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const address = document.getElementById('address').value;

    if (!name || !email || !phone || !address) {
        alert('Please fill in all fields.');
        return;
    }

    // Process order
    const acceptedOrders = JSON.parse(localStorage.getItem('acceptedOrders')) || [];
    const rejectedOrders = JSON.parse(localStorage.getItem('rejectedOrders')) || [];

    cart.forEach(item => {
        if (item.price >= item.minPrice) {
            acceptedOrders.push({ ...item, user: { name, email, phone, address } });
        } else {
            rejectedOrders.push({ ...item, reason: `Price too low for ${item.name}`, user: { name, email, phone, address } });
        }
    });

    localStorage.setItem('acceptedOrders', JSON.stringify(acceptedOrders));
    localStorage.setItem('rejectedOrders', JSON.stringify(rejectedOrders));
    localStorage.removeItem('cart');
    cart = [];

    alert('Order processed! Check your orders page.');
    window.location.href = 'orders.html';
}

// Render orders
function renderOrders() {
    const acceptedContainer = document.getElementById('accepted-orders');
    const rejectedContainer = document.getElementById('rejected-orders');

    const acceptedOrders = JSON.parse(localStorage.getItem('acceptedOrders')) || [];
    const rejectedOrders = JSON.parse(localStorage.getItem('rejectedOrders')) || [];

    acceptedContainer.innerHTML = acceptedOrders.length === 0 ? '<p>No accepted orders yet.</p>' : '';
    rejectedContainer.innerHTML = rejectedOrders.length === 0 ? '<p>No rejected orders yet.</p>' : '';

    acceptedOrders.forEach(order => {
        const orderDiv = document.createElement('div');
        orderDiv.className = 'order-item';
        orderDiv.innerHTML = `
            <h6>${order.name}</h6>
            <p>Quantity: ${order.quantity} kg</p>
            <p>Price: $${order.price}/kg</p>
            <p>Total: $${order.total.toFixed(2)}</p>
            <p>User: ${order.user.name} (${order.user.email})</p>
        `;
        acceptedContainer.appendChild(orderDiv);
    });

    rejectedOrders.forEach(order => {
        const orderDiv = document.createElement('div');
        orderDiv.className = 'order-item';
        orderDiv.innerHTML = `
            <h6>${order.name}</h6>
            <p>Quantity: ${order.quantity} kg</p>
            <p>Reason: ${order.reason}</p>
            <button class="btn btn-warning btn-sm edit-order" data-index="${rejectedOrders.indexOf(order)}">Edit & Resubmit</button>
        `;
        rejectedContainer.appendChild(orderDiv);
    });

    // Add edit event listeners
    document.querySelectorAll('.edit-order').forEach(btn => {
        btn.addEventListener('click', editRejectedOrder);
    });
}

// Edit rejected order
function editRejectedOrder(e) {
    const index = parseInt(e.target.dataset.index);
    const rejectedOrders = JSON.parse(localStorage.getItem('rejectedOrders')) || [];
    const order = rejectedOrders[index];
    // Remove from rejected and redirect to cart to re-add
    rejectedOrders.splice(index, 1);
    localStorage.setItem('rejectedOrders', JSON.stringify(rejectedOrders));
    alert('Item removed from rejected orders. Please go back to the home page to re-add this item with a valid price.');
    window.location.href = 'index.html';
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('products')) {
        renderProducts();
    }
    if (document.getElementById('cart-items')) {
        renderCart();
        document.getElementById('order-form').addEventListener('submit', handleCheckout);
    }
    if (document.getElementById('accepted-orders')) {
        renderOrders();
    }
});
