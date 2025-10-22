// ThingSpeak API details
const apiKey = 'BVM5K715L90AUZM6';
const channelId = '3091950';

// Global variables
let products = JSON.parse(localStorage.getItem('products')) || [];
let offers = JSON.parse(localStorage.getItem('offers')) || [];
let lineChart;
let profitLossChart;

// Initialize sample products if empty
if (products.length === 0) {
    products = [
        { id: 1, name: 'Tomatoes', date: '2023-10-01', quantity: 50, cost: 5, price: 8, sold: true },
        { id: 2, name: 'Potatoes', date: '2023-10-02', quantity: 30, cost: 3, price: 5, sold: true },
        { id: 3, name: 'Rice', date: '2023-10-03', quantity: 40, cost: 10, price: 12, sold: true },
        { id: 4, name: 'Banana', date: '2023-10-04', quantity: 25, cost: 8, price: 10, sold: true },
        { id: 5, name: 'Grapes', date: '2023-10-05', quantity: 35, cost: 15, price: 18, sold: true },
        { id: 6, name: 'Guava', date: '2023-10-06', quantity: 20, cost: 12, price: 15, sold: true },
        { id: 7, name: 'Tomatoes', date: '2023-10-07', quantity: 45, cost: 6, price: 9, sold: true },
        { id: 8, name: 'Potatoes', date: '2023-10-08', quantity: 40, cost: 4, price: 6, sold: true },
        { id: 9, name: 'Rice', date: '2023-10-09', quantity: 30, cost: 11, price: 13, sold: true },
        { id: 10, name: 'Banana', date: '2023-10-10', quantity: 50, cost: 9, price: 11, sold: true }
    ];
    localStorage.setItem('products', JSON.stringify(products));
}

// Initialize offers with 25 pending offers if empty
if (offers.length === 0) {
    for (let i = 1; i <= 25; i++) {
        offers.push({
            id: i,
            client: getOfferDetails(i).client,
            product: getOfferDetails(i).products[0].name, // Assuming first product as main
            quantity: getOfferDetails(i).products[0].quantity,
            price: getOfferDetails(i).products[0].price,
            status: 'pending'
        });
    }
    localStorage.setItem('offers', JSON.stringify(offers));
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('temp-value')) {
        fetchData();
        setInterval(fetchData, 17000); // Update every 17 seconds
    }

    if (document.getElementById('add-product-btn')) {
        setupProductModal();
    }

    if (document.getElementById('add-offer-btn')) {
        setupOfferModal();
    }

    if (document.getElementById('sales-table')) {
        loadHistory();
        setupFilters();
    }

    if (document.querySelector('.offers-tabs')) {
        setupOffersTabs();
        loadOffers();
    }

    if (document.getElementById('profit-loss-chart')) {
        setupProfitLossChart();
    }

    // Make modals draggable
    makeModalsDraggable();

});

// Fetch data from ThingSpeak
async function fetchData() {
    try {
        const response = await fetch(`https://api.thingspeak.com/channels/${channelId}/feeds/last.json?api_key=${apiKey}`);
        const data = await response.json();

        const ph = parseFloat(data.field1) || 0;
        const hum = parseFloat(data.field2) || 0;
        const temp = parseFloat(data.field3) || 0;

        document.getElementById('temp-value').textContent = `${temp.toFixed(1)} °C`;
        document.getElementById('hum-value').textContent = `${hum.toFixed(1)} %`;
        document.getElementById('ph-value').textContent = ph.toFixed(1);

        predictNutrients(temp, hum, ph);
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

// Predict nutrients
function predictNutrients(temp, hum, ph) {
    const mean = [27.46592323, 59.78342322, 6.74071226];
    const scale = [7.30344341, 17.31046447, 0.71967264];

    const input = [(temp - mean[0]) / scale[0], (hum - mean[1]) / scale[1], (ph - mean[2]) / scale[2]];
    const results = score(input);

    const names = ["Nitrogen", "Phosphorus", "Potassium", "Calcium", "Magnesium"];
    const ideal = [40, 30, 40, 50, 30];

    let html = "";
    for (let i = 0; i < 5; i++) {
        const value = results[i].toFixed(2);
        const percent = Math.min((value / ideal[i]) * 100, 100).toFixed(1);
        const status = getStatus(percent);

        html += `
            <div class="nutrient-row">
                <strong>${names[i]}:</strong> ${value} mg/kg — <em>${status.text}</em>
                <div class="progress-container">
                    <div class="progress-bar ${status.class}" style="width:${percent}%">${percent}%</div>
                </div>
                <div class="recommendation">${status.rec}</div>
            </div>
        `;
    }

    document.getElementById('nutrient-result').innerHTML = html;
}

function getStatus(percent) {
    if (percent >= 85) return {text: "Excellent 🟢", class: "good", rec: "No fertilization needed ✅"};
    if (percent >= 50) return {text: "Good 🟡", class: "medium", rec: "Monitor and analyze later 🧪"};
    return {text: "Low 🔴", class: "low", rec: "Urgent fertilization needed 🌱"};
}

// Predict soil type
function predictSoil() {
    const ph = parseFloat(document.getElementById('ph').value);
    const moisture = parseFloat(document.getElementById('moisture').value);

    const mean = [6.36456834, 36.96278016];
    const scale = [0.87530438, 12.91439144];

    const input = [(ph - mean[0]) / scale[0], (moisture - mean[1]) / scale[1]];
    const logits = score(input);

    const soilTypes = ["Clay", "Sandy Clay", "Organic", "Sandy", "Clay Sandy"];
    const cropSuggestions = {
        "Clay": ["Wheat", "Barley", "Corn", "Beans", "Beet", "Mustard", "Flax", "Cotton", "Tobacco", "Lettuce"],
        "Sandy Clay": ["Rice", "Cotton", "Peanut", "Sesame", "Corn", "Tobacco", "Watermelon", "Cucumber", "Tomato", "Eggplant"],
        "Organic": ["Leafy Vegetables", "Cabbage", "Cauliflower", "Carrot", "Beet", "Spinach", "Lettuce", "Celery", "Parsley", "Mint"],
        "Sandy": ["Watermelon", "Melon", "Cucumber", "Tomato", "Eggplant", "Pepper", "Corn", "Beans", "Sesame", "Peanut"],
        "Clay Sandy": ["Wheat", "Barley", "Corn", "Beans", "Beet", "Mustard", "Flax", "Cotton", "Tobacco", "Lettuce"]
    };

    const probs = softmax(logits);
    const maxIndex = probs.indexOf(Math.max(...probs));
    const predicted = soilTypes[maxIndex];

    document.getElementById('soil-result').innerText = `🌱 Predicted Soil Type: ${predicted}`;

    const suggestions = cropSuggestions[predicted];
    let cropHtml = `<h3>Crop Suggestions:</h3><div class="crop-list">`;
    suggestions.forEach(crop => {
        cropHtml += `<div class="crop-item">${crop}</div>`;
    });
    cropHtml += `</div>`;

    document.getElementById('crop-suggestions').innerHTML = cropHtml;
}

function softmax(arr) {
    const max = Math.max(...arr);
    const expArr = arr.map(x => Math.exp(x - max));
    const sum = expArr.reduce((a, b) => a + b, 0);
    return expArr.map(x => x / sum);
}

// Product management
function setupProductModal() {
    const modal = document.getElementById('add-product-modal');
    const btn = document.getElementById('add-product-btn');
    const span = modal.querySelector('.close');

    btn.onclick = () => modal.style.display = "block";
    span.onclick = () => modal.style.display = "none";
    window.onclick = (event) => {
        if (event.target == modal) modal.style.display = "none";
    };

    document.getElementById('add-product-form').addEventListener('submit', function(e) {
        e.preventDefault();
        const product = {
            id: Date.now(),
            name: document.getElementById('product-name').value,
            date: document.getElementById('product-date').value,
            quantity: parseFloat(document.getElementById('product-quantity').value),
            cost: parseFloat(document.getElementById('product-cost').value),
            price: parseFloat(document.getElementById('product-price').value),
            sold: true
        };
        products.push(product);
        localStorage.setItem('products', JSON.stringify(products));
        modal.style.display = "none";
        this.reset();
        loadProducts();
    });

    loadProducts();
}

function loadProducts() {
    const container = document.getElementById('products');
    if (!container) return;

    container.innerHTML = '';
    const soldProducts = products.filter(p => p.sold);
    soldProducts.forEach(product => {
        const profit = (product.price - product.cost) * product.quantity;
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <h3>${product.name}</h3>
            <div class="product-stats">Date: ${product.date}</div>
            <div class="product-stats">Quantity: ${product.quantity} kg</div>
            <div class="product-stats">Cost Price: ${product.cost} USD/kg</div>
            <div class="product-stats">Selling Price: ${product.price} USD/kg</div>
            <div class="product-stats ${profit >= 0 ? 'profit' : 'loss'}">Profit: ${profit.toFixed(2)} USD</div>
        `;
        container.appendChild(card);
    });
}

function sellProduct(id) {
    const product = products.find(p => p.id === id);
    if (product) {
        product.sold = true;
        localStorage.setItem('products', JSON.stringify(products));
        loadProducts();
    }
}

// History and charts
function loadHistory() {
    const tbody = document.getElementById('sales-body');
    if (!tbody) return;

    tbody.innerHTML = '';

    const productFilter = document.getElementById('product-filter').value;
    const periodFilter = document.getElementById('period-filter').value;
    const fromDate = document.getElementById('from-date').value;
    const toDate = document.getElementById('to-date').value;
    const yearSelect = document.getElementById('year-select');
    const monthSelect = document.getElementById('month-select').value;
    const monthYearSelect = document.getElementById('month-year-select').value;
    const daySelect = document.getElementById('day-select').value;

    let filteredProducts = products.filter(p => p.sold);

    // Filter by product
    if (productFilter !== 'all') {
        filteredProducts = filteredProducts.filter(p => p.name === productFilter);
    }

    // Filter based on period
    if (periodFilter === 'custom' && fromDate && toDate) {
        const startDate = new Date(fromDate);
        const endDate = new Date(toDate);
        filteredProducts = filteredProducts.filter(p => {
            const productDate = new Date(p.date);
            return productDate >= startDate && productDate <= endDate;
        });
    } else if (periodFilter === 'yearly' && yearSelect.selectedOptions.length > 0) {
        const selectedYears = Array.from(yearSelect.selectedOptions).map(option => parseInt(option.value));
        filteredProducts = filteredProducts.filter(p => {
            const productDate = new Date(p.date);
            return selectedYears.includes(productDate.getFullYear());
        });
    } else if (periodFilter === 'monthly' && monthSelect && monthYearSelect) {
        filteredProducts = filteredProducts.filter(p => {
            const productDate = new Date(p.date);
            return productDate.getMonth() + 1 == monthSelect && productDate.getFullYear() == monthYearSelect;
        });
    } else if (periodFilter === 'daily' && daySelect) {
        const selectedDate = new Date(daySelect);
        filteredProducts = filteredProducts.filter(p => {
            const productDate = new Date(p.date);
            return productDate.toDateString() === selectedDate.toDateString();
        });
    }
    // For 'all', no additional filtering

    filteredProducts.forEach(product => {
        const profit = (product.price - product.cost) * product.quantity;
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${product.name}</td>
            <td>${product.date}</td>
            <td>${product.quantity}</td>
            <td>${product.cost}</td>
            <td>${product.price}</td>
            <td class="${profit >= 0 ? 'profit' : 'loss'}">${profit.toFixed(2)}</td>
            <td>
                <button class="action-btn edit" onclick="editProduct(${product.id})">Edit</button>
                <button class="action-btn delete" onclick="deleteProduct(${product.id})">Delete</button>
            </td>
        `;
        tbody.appendChild(row);
    });

    updateChart();
}

function setupFilters() {
    const productFilter = document.getElementById('product-filter');
    const periodFilter = document.getElementById('period-filter');
    const fromDate = document.getElementById('from-date');
    const toDate = document.getElementById('to-date');
    const yearSelect = document.getElementById('year-select');
    const monthSelect = document.getElementById('month-select');
    const monthYearSelect = document.getElementById('month-year-select');
    const daySelect = document.getElementById('day-select');

    productFilter.addEventListener('change', function() {
        updateChart();
        updateSummaryStats();
        loadHistory();
    });

    periodFilter.addEventListener('change', function() {
        const dateRange = document.getElementById('date-range');
        const yearSelector = document.getElementById('year-selector');
        const monthSelector = document.getElementById('month-selector');
        const daySelector = document.getElementById('day-selector');

        dateRange.classList.add('hidden');
        yearSelector.classList.add('hidden');
        monthSelector.classList.add('hidden');
        daySelector.classList.add('hidden');

        if (this.value === 'custom') {
            dateRange.classList.remove('hidden');
        } else if (this.value === 'yearly') {
            populateYearSelect();
            yearSelector.classList.remove('hidden');
        } else if (this.value === 'monthly') {
            populateMonthYearSelect();
            monthSelector.classList.remove('hidden');
        } else if (this.value === 'daily') {
            daySelector.classList.remove('hidden');
        }

        updateChart();
        updateSummaryStats();
        loadHistory();
    });

    fromDate.addEventListener('change', function() {
        updateChart();
        updateSummaryStats();
        loadHistory();
    });
    toDate.addEventListener('change', function() {
        updateChart();
        updateSummaryStats();
        loadHistory();
    });
    yearSelect.addEventListener('change', function() {
        updateChart();
        updateSummaryStats();
        loadHistory();
    });
    monthSelect.addEventListener('change', function() {
        updateChart();
        updateSummaryStats();
        loadHistory();
    });
    monthYearSelect.addEventListener('change', function() {
        updateChart();
        updateSummaryStats();
        loadHistory();
    });
    daySelect.addEventListener('change', function() {
        updateChart();
        updateSummaryStats();
        loadHistory();
    });

    populateProductFilter();
    populateYearSelect();
    populateMonthYearSelect();
    updateSummaryStats(); // Initial call to display summary
}

function setupProfitLossFilters() {
    const periodFilter = document.getElementById('period-filter');
    const fromDate = document.getElementById('from-date');
    const toDate = document.getElementById('to-date');
    const yearSelect = document.getElementById('year-select');
    const monthSelect = document.getElementById('month-select');
    const monthYearSelect = document.getElementById('month-year-select');
    const daySelect = document.getElementById('day-select');

    periodFilter.addEventListener('change', function() {
        const dateRange = document.getElementById('date-range');
        const yearSelector = document.getElementById('year-selector');
        const monthSelector = document.getElementById('month-selector');
        const daySelector = document.getElementById('day-selector');

        dateRange.style.display = 'none';
        yearSelector.style.display = 'none';
        monthSelector.style.display = 'none';
        daySelector.style.display = 'none';

        if (this.value === 'custom') {
            dateRange.style.display = 'block';
        } else if (this.value === 'yearly') {
            populateYearSelect();
            yearSelector.style.display = 'block';
        } else if (this.value === 'monthly') {
            populateMonthYearSelect();
            monthSelector.style.display = 'block';
        } else if (this.value === 'daily') {
            daySelector.style.display = 'block';
        }

        updateProfitLossChart();
        updateSummaryStats();
    });

    fromDate.addEventListener('change', function() {
        updateProfitLossChart();
        updateSummaryStats();
    });
    toDate.addEventListener('change', function() {
        updateProfitLossChart();
        updateSummaryStats();
    });
    yearSelect.addEventListener('change', function() {
        updateProfitLossChart();
        updateSummaryStats();
    });
    monthSelect.addEventListener('change', function() {
        updateProfitLossChart();
        updateSummaryStats();
    });
    monthYearSelect.addEventListener('change', function() {
        updateProfitLossChart();
        updateSummaryStats();
    });
    daySelect.addEventListener('change', function() {
        updateProfitLossChart();
        updateSummaryStats();
    });

    populateYearSelect();
    populateMonthYearSelect();
}

function updateSummaryStats() {
    const productFilterEl = document.getElementById('product-filter');
    const productFilter = productFilterEl ? productFilterEl.value : 'all';
    const periodFilterEl = document.getElementById('period-filter');
    const periodFilter = periodFilterEl ? periodFilterEl.value : 'all';
    const fromDateEl = document.getElementById('from-date');
    const fromDate = fromDateEl ? fromDateEl.value : '';
    const toDateEl = document.getElementById('to-date');
    const toDate = toDateEl ? toDateEl.value : '';
    const yearSelect = document.getElementById('year-select');
    const monthSelectEl = document.getElementById('month-select');
    const monthSelect = monthSelectEl ? monthSelectEl.value : '';
    const monthYearSelectEl = document.getElementById('month-year-select');
    const monthYearSelect = monthYearSelectEl ? monthYearSelectEl.value : '';
    const daySelectEl = document.getElementById('day-select');
    const daySelect = daySelectEl ? daySelectEl.value : '';

    let filteredProducts = products.filter(p => p.sold);

    // Filter by product
    if (productFilter !== 'all') {
        filteredProducts = filteredProducts.filter(p => p.name === productFilter);
    }

    // Filter based on period
    if (periodFilter === 'custom' && fromDate && toDate) {
        const startDate = new Date(fromDate);
        const endDate = new Date(toDate);
        filteredProducts = filteredProducts.filter(p => {
            const productDate = new Date(p.date);
            return productDate >= startDate && productDate <= endDate;
        });
    } else if (periodFilter === 'yearly' && yearSelect && yearSelect.selectedOptions.length > 0) {
        const selectedYears = Array.from(yearSelect.selectedOptions).map(option => parseInt(option.value));
        filteredProducts = filteredProducts.filter(p => {
            const productDate = new Date(p.date);
            return selectedYears.includes(productDate.getFullYear());
        });
    } else if (periodFilter === 'monthly' && monthSelect && monthYearSelect) {
        filteredProducts = filteredProducts.filter(p => {
            const productDate = new Date(p.date);
            return productDate.getMonth() + 1 == monthSelect && productDate.getFullYear() == monthYearSelect;
        });
    } else if (periodFilter === 'daily' && daySelect) {
        const selectedDate = new Date(daySelect);
        filteredProducts = filteredProducts.filter(p => {
            const productDate = new Date(p.date);
            return productDate.toDateString() === selectedDate.toDateString();
        });
    }
    // For 'all', no additional filtering

    let totalProfit = 0;
    let totalLoss = 0;
    filteredProducts.forEach(product => {
        const profit = (product.price - product.cost) * product.quantity;
        if (profit >= 0) {
            totalProfit += profit;
        } else {
            totalLoss += Math.abs(profit);
        }
    });

    const totalTransactions = filteredProducts.length;
    const profitPercentage = totalTransactions > 0 ? (totalProfit / (totalProfit + totalLoss)) * 100 : 0;
    const lossPercentage = totalTransactions > 0 ? (totalLoss / (totalProfit + totalLoss)) * 100 : 0;

    const totalProfitEl = document.getElementById('total-profit');
    if (totalProfitEl) totalProfitEl.textContent = `${totalProfit.toFixed(2)} USD`;
    const profitPercentageEl = document.getElementById('profit-percentage');
    if (profitPercentageEl) profitPercentageEl.textContent = `${profitPercentage.toFixed(1)}%`;
    const totalLossEl = document.getElementById('total-loss');
    if (totalLossEl) totalLossEl.textContent = `${totalLoss.toFixed(2)} USD`;
    const lossPercentageEl = document.getElementById('loss-percentage');
    if (lossPercentageEl) lossPercentageEl.textContent = `${lossPercentage.toFixed(1)}%`;
}

function updateChart() {
    const productFilter = document.getElementById('product-filter').value;
    const periodFilter = document.getElementById('period-filter').value;
    const fromDate = document.getElementById('from-date').value;
    const toDate = document.getElementById('to-date').value;
    const yearSelect = document.getElementById('year-select');
    const monthSelect = document.getElementById('month-select').value;
    const monthYearSelect = document.getElementById('month-year-select').value;
    const daySelect = document.getElementById('day-select').value;

    let filteredProducts = products.filter(p => p.sold);
    if (productFilter !== 'all') {
        filteredProducts = filteredProducts.filter(p => p.name === productFilter);
    }

    // Filter based on period
    if (periodFilter === 'custom' && fromDate && toDate) {
        const startDate = new Date(fromDate);
        const endDate = new Date(toDate);
        filteredProducts = filteredProducts.filter(p => {
            const productDate = new Date(p.date);
            return productDate >= startDate && productDate <= endDate;
        });
    } else if (periodFilter === 'yearly' && yearSelect.selectedOptions.length > 0) {
        const selectedYears = Array.from(yearSelect.selectedOptions).map(option => parseInt(option.value));
        filteredProducts = filteredProducts.filter(p => {
            const productDate = new Date(p.date);
            return selectedYears.includes(productDate.getFullYear());
        });
    } else if (periodFilter === 'monthly' && monthSelect && monthYearSelect) {
        filteredProducts = filteredProducts.filter(p => {
            const productDate = new Date(p.date);
            return productDate.getMonth() + 1 == monthSelect && productDate.getFullYear() == monthYearSelect;
        });
    } else if (periodFilter === 'daily' && daySelect) {
        const selectedDate = new Date(daySelect);
        filteredProducts = filteredProducts.filter(p => {
            const productDate = new Date(p.date);
            return productDate.toDateString() === selectedDate.toDateString();
        });
    }
    // For 'all', no additional filtering

    // Line chart data
    const data = {};
    filteredProducts.forEach(product => {
        const date = new Date(product.date);
        let key;
        if (periodFilter === 'daily') {
            key = date.toDateString();
        } else if (periodFilter === 'monthly') {
            key = `${date.getFullYear()}-${date.getMonth() + 1}`;
        } else {
            key = date.getFullYear().toString();
        }

        if (!data[key]) data[key] = 0;
        data[key] += (product.price - product.cost) * product.quantity;
    });

    const labels = Object.keys(data).sort();
    const values = labels.map(label => data[label]);

    if (lineChart) {
        lineChart.destroy();
    }

    lineChart = new Chart(document.getElementById('profit-chart'), {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Profit/Loss',
                data: values,
                borderColor: '#4CAF50',
                backgroundColor: 'rgba(76, 175, 80, 0.1)',
                tension: 0.1,
                borderWidth: 3,
                pointBackgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#FF6384', '#C9CBCF', '#4BC0C0', '#FF6384'],
                pointBorderColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#FF6384', '#C9CBCF', '#4BC0C0', '#FF6384'],
                pointRadius: 6,
                pointHoverRadius: 8
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Profit and Loss Trends'
                }
            }
        }
    });

    // Bar chart for profit/loss per product
    const productData = {};
    filteredProducts.forEach(product => {
        if (!productData[product.name]) productData[product.name] = 0;
        productData[product.name] += (product.price - product.cost) * product.quantity;
    });

    const barLabels = Object.keys(productData);
    const barValues = barLabels.map(label => productData[label]);

    if (window.barChart) {
        window.barChart.destroy();
    }

    const barColors = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#FF6384', '#C9CBCF', '#4BC0C0', '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'];

    window.barChart = new Chart(document.getElementById('bar-chart'), {
        type: 'bar',
        data: {
            labels: barLabels,
            datasets: [{
                label: 'Profit/Loss per Product',
                data: barValues,
                backgroundColor: barLabels.map((_, i) => barColors[i % barColors.length]),
                borderColor: barLabels.map((_, i) => barColors[i % barColors.length]),
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Total Profit/Loss per Product'
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });

}

function setupChart() {
    updateChart();
    populateProductFilter();
}

function populateProductFilter() {
    const productFilter = document.getElementById('product-filter');
    if (!productFilter) return;

    const products = JSON.parse(localStorage.getItem('products')) || [];
    const uniqueProducts = [...new Set(products.filter(p => p.sold).map(p => p.name))];

    productFilter.innerHTML = '<option value="all">All Products</option>';
    uniqueProducts.forEach(product => {
        const option = document.createElement('option');
        option.value = product;
        option.textContent = product;
        productFilter.appendChild(option);
    });
}

function populateYearSelect() {
    const yearSelect = document.getElementById('year-select');
    if (!yearSelect) return;

    const products = JSON.parse(localStorage.getItem('products')) || [];
    const years = [...new Set(products.filter(p => p.sold).map(p => new Date(p.date).getFullYear()))].sort();

    yearSelect.innerHTML = '<option value="">Select Year</option>';
    years.forEach(year => {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        yearSelect.appendChild(option);
    });

    // Set default to first year if available
    if (years.length > 0) {
        const firstOption = yearSelect.querySelector(`option[value="${years[0]}"]`);
        if (firstOption) firstOption.selected = true;
        // Update filters directly since programmatic selection may not trigger change event
        if (document.getElementById('sales-table')) {
            updateChart();
            updateSummaryStats();
            loadHistory();
        } else if (document.getElementById('profit-loss-chart')) {
            updateProfitLossChart();
            updateSummaryStats();
        }
    }
}

function populateMonthYearSelect() {
    const monthYearSelect = document.getElementById('month-year-select');
    if (!monthYearSelect) return;

    const products = JSON.parse(localStorage.getItem('products')) || [];
    const years = [...new Set(products.filter(p => p.sold).map(p => new Date(p.date).getFullYear()))].sort();

    monthYearSelect.innerHTML = '';
    years.forEach(year => {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        monthYearSelect.appendChild(option);
    });
}

function editProduct(id) {
    // Implement edit functionality
    alert('Edit product - will be implemented soon');
}

function deleteProduct(id) {
    if (confirm('Are you sure you want to delete this product?')) {
        products = products.filter(p => p.id !== id);
        localStorage.setItem('products', JSON.stringify(products));
        loadHistory();
    }
}

// Offers management
function setupOfferModal() {
    const modal = document.getElementById('add-offer-modal');
    const btn = document.getElementById('add-offer-btn');
    const span = modal.querySelector('.close');

    btn.onclick = () => modal.style.display = "block";
    span.onclick = () => modal.style.display = "none";
    window.onclick = (event) => {
        if (event.target == modal) modal.style.display = "none";
    };

    document.getElementById('add-offer-form').addEventListener('submit', function(e) {
        e.preventDefault();
        const offer = {
            id: Date.now(),
            client: document.getElementById('client-name').value,
            product: document.getElementById('offer-product').value,
            quantity: parseFloat(document.getElementById('offer-quantity').value),
            price: parseFloat(document.getElementById('offer-price').value),
            status: 'pending'
        };
        offers.push(offer);
        localStorage.setItem('offers', JSON.stringify(offers));
        modal.style.display = "none";
        this.reset();
        loadOffers();
    });

    loadOffers();
}

function setupOffersTabs() {
    const tabs = document.querySelectorAll('.tab-btn');
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            tabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');

            const tabName = this.dataset.tab;
            document.querySelectorAll('.offers-list').forEach(list => {
                list.classList.add('hidden');
            });
            document.getElementById(`${tabName}-offers`).classList.remove('hidden');
        });
    });
}

function loadOffers() {
    const pendingList = document.getElementById('pending-list');
    const acceptedList = document.getElementById('accepted-list');
    const rejectedList = document.getElementById('rejected-list');

    if (!pendingList) return;

    pendingList.innerHTML = '';
    acceptedList.innerHTML = '';
    rejectedList.innerHTML = '';

    offers.forEach(offer => {
        const offerDetails = getOfferDetails(offer.id);
        const card = document.createElement('div');
        card.className = 'offer-card';
        card.innerHTML = `
            <div class="client-avatar">
                <i class="fas fa-crown" style="color: #FFD700; font-size: 1.5rem; margin-bottom: 0.5rem; filter: drop-shadow(0 1px 2px rgba(0,0,0,0.2));"></i>
                <i class="fas fa-user-circle client-icon"></i>
            </div>
            <h3>${offer.client}</h3>
            <div class="offer-products">
                ${offerDetails.products.map(product => `<span class="product-tag">${product.name} - ${product.quantity} kg @ $${product.price}/kg</span>`).join('')}
            </div>
        `;

        if (offer.status === 'pending') {
            card.innerHTML += `
                <div class="offer-actions">
                    ${offerDetails.products.map(product => `<button class="accept-btn" onclick="acceptProduct(${offer.id}, '${product.name}', ${product.quantity}, ${product.price})">Accept ${product.name}</button>`).join('')}
                    <button class="reject-btn" onclick="rejectOffer(${offer.id})">Reject</button>
                </div>
            `;
            pendingList.appendChild(card);
        } else if (offer.status === 'accepted') {
            card.innerHTML += `
                <div class="offer-actions">
                    <button class="edit-btn" onclick="editOffer(${offer.id})">Edit</button>
                </div>
            `;
            acceptedList.appendChild(card);
        } else if (offer.status === 'rejected') {
            card.innerHTML += `
                <div class="offer-actions">
                    <button class="edit-btn" onclick="editOffer(${offer.id})">Edit</button>
                </div>
            `;
            rejectedList.appendChild(card);
        }
    });
}

function acceptOffer(id) {
    const offerDetails = getOfferDetails(id);
    if (offerDetails) {
        // Move offer from pending to accepted
        const offer = offers.find(o => o.id === id);
        if (offer) {
            offer.status = 'accepted';
            localStorage.setItem('offers', JSON.stringify(offers));
        }

        // Add to products
        const product = {
            id: Date.now(),
            name: offerDetails.product,
            date: new Date().toISOString().split('T')[0],
            quantity: offerDetails.quantity,
            cost: 0,
            price: offerDetails.price,
            sold: false
        };
        products.push(product);
        localStorage.setItem('products', JSON.stringify(products));

        loadOffers();
        alert(`Offer from ${offerDetails.client} accepted and added to products!`);
    }
}

function acceptProduct(offerId, productName, quantity, price) {
    const offerDetails = getOfferDetails(offerId);
    if (offerDetails) {
        // Add the specific product to products
        const product = {
            id: Date.now(),
            name: productName,
            date: new Date().toISOString().split('T')[0],
            quantity: quantity,
            cost: 0,
            price: price,
            sold: false
        };
        products.push(product);
        localStorage.setItem('products', JSON.stringify(products));

        // Move offer to accepted
        const offer = offers.find(o => o.id === offerId);
        if (offer) {
            offer.status = 'accepted';
            localStorage.setItem('offers', JSON.stringify(offers));
        }

        loadOffers();
        alert(`${productName} from ${offerDetails.client} accepted and added to products!`);
    }
}

function rejectOffer(id) {
    const offerDetails = getOfferDetails(id);
    if (offerDetails) {
        // Move offer from pending to rejected
        const offer = offers.find(o => o.id === id);
        if (offer) {
            offer.status = 'rejected';
            localStorage.setItem('offers', JSON.stringify(offers));
        }

        loadOffers();
        alert(`Offer from ${offerDetails.client} rejected.`);
    }
}

function getOfferDetails(id) {
    const offerData = {
        1: { client: 'Client 1', products: [{name: 'Tomatoes', quantity: 25, price: 30}, {name: 'Rice', quantity: 30, price: 10}] },
        2: { client: 'Client 2', products: [{name: 'Tomatoes', quantity: 20, price: 28}, {name: 'Potatoes', quantity: 15, price: 12}] },
        3: { client: 'Client 3', products: [{name: 'Tomatoes', quantity: 30, price: 32}, {name: 'Banana', quantity: 10, price: 25}] },
        4: { client: 'Client 4', products: [{name: 'Tomatoes', quantity: 22, price: 26}, {name: 'Grapes', quantity: 18, price: 35}] },
        5: { client: 'Client 5', products: [{name: 'Tomatoes', quantity: 28, price: 29}, {name: 'Guava', quantity: 12, price: 40}] },
        6: { client: 'Client 6', products: [{name: 'Tomatoes', quantity: 35, price: 31}, {name: 'Rice', quantity: 20, price: 11}] },
        7: { client: 'Client 7', products: [{name: 'Tomatoes', quantity: 18, price: 27}, {name: 'Potatoes', quantity: 25, price: 13}] },
        8: { client: 'Client 8', products: [{name: 'Tomatoes', quantity: 40, price: 33}, {name: 'Banana', quantity: 15, price: 26}] },
        9: { client: 'Client 9', products: [{name: 'Tomatoes', quantity: 24, price: 30}, {name: 'Grapes', quantity: 22, price: 36}] },
        10: { client: 'Client 10', products: [{name: 'Tomatoes', quantity: 32, price: 28}, {name: 'Guava', quantity: 18, price: 38}] },
        11: { client: 'Client 11', products: [{name: 'Tomatoes', quantity: 26, price: 29}, {name: 'Rice', quantity: 28, price: 9}] },
        12: { client: 'Client 12', products: [{name: 'Tomatoes', quantity: 38, price: 34}, {name: 'Potatoes', quantity: 20, price: 14}] },
        13: { client: 'Client 13', products: [{name: 'Tomatoes', quantity: 21, price: 25}, {name: 'Banana', quantity: 30, price: 27}] },
        14: { client: 'Client 14', products: [{name: 'Tomatoes', quantity: 29, price: 31}, {name: 'Grapes', quantity: 16, price: 37}] },
        15: { client: 'Client 15', products: [{name: 'Tomatoes', quantity: 33, price: 32}, {name: 'Guava', quantity: 14, price: 39}] },
        16: { client: 'Client 16', products: [{name: 'Tomatoes', quantity: 27, price: 30}, {name: 'Rice', quantity: 25, price: 10}] },
        17: { client: 'Client 17', products: [{name: 'Tomatoes', quantity: 36, price: 35}, {name: 'Potatoes', quantity: 22, price: 15}] },
        18: { client: 'Client 18', products: [{name: 'Tomatoes', quantity: 23, price: 26}, {name: 'Banana', quantity: 28, price: 28}] },
        19: { client: 'Client 19', products: [{name: 'Tomatoes', quantity: 31, price: 33}, {name: 'Grapes', quantity: 19, price: 38}] },
        20: { client: 'Client 20', products: [{name: 'Tomatoes', quantity: 34, price: 29}, {name: 'Guava', quantity: 21, price: 41}] },
        21: { client: 'Client 21', products: [{name: 'Tomatoes', quantity: 19, price: 27}, {name: 'Rice', quantity: 32, price: 11}] },
        22: { client: 'Client 22', products: [{name: 'Tomatoes', quantity: 37, price: 33}, {name: 'Potatoes', quantity: 17, price: 13}] },
        23: { client: 'Client 23', products: [{name: 'Tomatoes', quantity: 24, price: 28}, {name: 'Banana', quantity: 22, price: 26}] },
        24: { client: 'Client 24', products: [{name: 'Tomatoes', quantity: 31, price: 30}, {name: 'Grapes', quantity: 20, price: 36}] },
        25: { client: 'Client 25', products: [{name: 'Tomatoes', quantity: 29, price: 31}, {name: 'Guava', quantity: 16, price: 39}] }
    };
    return offerData[id];
}

function editOffer(id) {
    const offer = offers.find(o => o.id === id);
    if (offer) {
        offer.status = 'pending';
        localStorage.setItem('offers', JSON.stringify(offers));
        loadOffers();
        alert('Offer returned to pending.');
    }
}

// Refresh button
document.addEventListener('click', function(e) {
    if (e.target.id === 'refresh-btn') {
        if (document.getElementById('temp-value')) {
            fetchData();
        } else if (document.getElementById('sales-table')) {
            loadHistory();
        } else if (document.querySelector('.offers-tabs')) {
            loadOffers();
        }
    }
});

function setupProfitLossChart() {
    updateProfitLossChart();
    setupProfitLossFilters();
    updateSummaryStats();
    updateChart(); // For the pie chart
}

function updateProfitLossChart() {
    const periodFilter = document.getElementById('period-filter').value;
    const fromDate = document.getElementById('from-date').value;
    const toDate = document.getElementById('to-date').value;
    const yearSelect = document.getElementById('year-select');
    const monthSelect = document.getElementById('month-select').value;
    const monthYearSelect = document.getElementById('month-year-select').value;
    const daySelect = document.getElementById('day-select').value;

    let filteredProducts = products.filter(p => p.sold);

    // Filter based on period
    if (periodFilter === 'custom' && fromDate && toDate) {
        const startDate = new Date(fromDate);
        const endDate = new Date(toDate);
        filteredProducts = filteredProducts.filter(p => {
            const productDate = new Date(p.date);
            return productDate >= startDate && productDate <= endDate;
        });
    } else if (periodFilter === 'yearly' && yearSelect.selectedOptions.length > 0) {
        const selectedYears = Array.from(yearSelect.selectedOptions).map(option => parseInt(option.value));
        filteredProducts = filteredProducts.filter(p => {
            const productDate = new Date(p.date);
            return selectedYears.includes(productDate.getFullYear());
        });
    } else if (periodFilter === 'monthly' && monthSelect && monthYearSelect) {
        filteredProducts = filteredProducts.filter(p => {
            const productDate = new Date(p.date);
            return productDate.getMonth() + 1 == monthSelect && productDate.getFullYear() == monthYearSelect;
        });
    } else if (periodFilter === 'daily' && daySelect) {
        const selectedDate = new Date(daySelect);
        filteredProducts = filteredProducts.filter(p => {
            const productDate = new Date(p.date);
            return productDate.toDateString() === selectedDate.toDateString();
        });
    }
    // For 'all', no additional filtering

    // Group data by product
    const productData = {};
    filteredProducts.forEach(product => {
        if (!productData[product.name]) {
            productData[product.name] = { profit: 0, loss: 0 };
        }
        const profit = (product.price - product.cost) * product.quantity;
        if (profit >= 0) {
            productData[product.name].profit += profit;
        } else {
            productData[product.name].loss += Math.abs(profit);
        }
    });

    const labels = Object.keys(productData);
    const profitData = labels.map(label => productData[label].profit);
    const lossData = labels.map(label => productData[label].loss);

    if (profitLossChart) {
        profitLossChart.destroy();
    }

    profitLossChart = new Chart(document.getElementById('profit-loss-chart'), {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Profit',
                data: profitData,
                backgroundColor: '#2196F3', // Blue for profit
                borderColor: '#0D47A1',
                borderWidth: 1
            }, {
                label: 'Loss',
                data: lossData,
                backgroundColor: '#F44336', // Red for loss
                borderColor: '#D32F2F',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Profit and Loss per Product'
                },
                legend: {
                    position: 'top'
                }
            },
            scales: {
                x: {
                    stacked: false
                },
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// Make modals draggable
function makeModalsDraggable() {
    const modals = document.querySelectorAll('.modal-content');
    modals.forEach(modal => {
        let isDragging = false;
        let startX, startY, initialX, initialY;

        modal.addEventListener('mousedown', (e) => {
            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;
            initialX = modal.offsetLeft;
            initialY = modal.offsetTop;
            modal.style.cursor = 'grabbing';
        });

        document.addEventListener('mousemove', (e) => {
            if (isDragging) {
                const dx = e.clientX - startX;
                const dy = e.clientY - startY;
                modal.style.left = `${initialX + dx}px`;
                modal.style.top = `${initialY + dy}px`;
            }
        });

        document.addEventListener('mouseup', () => {
            isDragging = false;
            modal.style.cursor = 'move';
        });
    });
}
