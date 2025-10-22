// Product management
let products = [];

// Load products from localStorage on page load
document.addEventListener('DOMContentLoaded', function() {
    loadProducts();
    setupForm();
});

function setupForm() {
    const form = document.getElementById('product-form');
    const imageFileInput = document.getElementById('product-image-file');
    const imageUrlInput = document.getElementById('product-image-url');

    // Disable URL input when file is selected and vice versa
    imageFileInput.addEventListener('change', function() {
        if (this.files.length > 0) {
            imageUrlInput.disabled = true;
        } else {
            imageUrlInput.disabled = false;
        }
    });

    imageUrlInput.addEventListener('input', function() {
        if (this.value.trim() !== '') {
            imageFileInput.disabled = true;
        } else {
            imageFileInput.disabled = false;
        }
    });

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        addProduct();
    });
}

function addProduct() {
    const name = document.getElementById('product-name').value.trim();
    const price = parseFloat(document.getElementById('product-price').value);
    const imageFile = document.getElementById('product-image-file').files[0];
    const imageUrl = document.getElementById('product-image-url').value.trim();

    if (!name || isNaN(price)) {
        return;
    }

    const product = {
        id: Date.now(),
        name: name,
        price: price,
        image: null
    };

    if (imageFile) {
        const reader = new FileReader();
        reader.onload = function(e) {
            product.image = e.target.result;
            saveProduct(product);
        };
        reader.readAsDataURL(imageFile);
    } else {
        product.image = imageUrl;
        saveProduct(product);
    }
}

function saveProduct(product) {
    products.push(product);
    saveProductsToStorage();
    displayProducts();
    resetForm();
}

function displayProducts() {
    const container = document.getElementById('products-container');
    container.innerHTML = '';

    products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';

        productCard.innerHTML = `
            ${product.image ? `<img src="${product.image}" alt="${product.name}" class="product-image">` : '<div class="product-image-placeholder"><i class="fas fa-image"></i></div>'}
            <div class="product-name">${product.name}</div>
            <div class="product-price">$${product.price.toFixed(2)}</div>
        `;

        container.appendChild(productCard);
    });
}

function resetForm() {
    document.getElementById('product-form').reset();
    document.getElementById('product-image-url').disabled = false;
    document.getElementById('product-image-file').disabled = false;
}

function saveProductsToStorage() {
    localStorage.setItem('agriculture-products', JSON.stringify(products));
}

function loadProducts() {
    const stored = localStorage.getItem('agriculture-products');
    if (stored) {
        products = JSON.parse(stored);
        displayProducts();
    }
}
