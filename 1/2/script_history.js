// Global variables
let isEditMode = false;
let selectedRows = new Set();

// Function to load history from localStorage
function loadHistory() {
    const history = JSON.parse(localStorage.getItem('agriHistory')) || [];
    const tbody = document.getElementById('history-body');
    tbody.innerHTML = '';

    // Sort history by timestamp (newest first)
    history.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    history.forEach((entry, index) => {
        const row = document.createElement('tr');
        const date = new Date(entry.timestamp).toLocaleString();
        row.innerHTML = `
            <td><input type="checkbox" class="row-checkbox" data-index="${index}"></td>
            <td>${date}</td>
            <td>${entry.temp.toFixed(1)}</td>
            <td>${entry.hum.toFixed(1)}</td>
            <td>${entry.ph.toFixed(1)}</td>
            <td><button class="delete-single-btn" data-index="${index}"><i class="fas fa-trash"></i></button></td>
        `;
        tbody.appendChild(row);
    });

    // Update charts
    updateCharts(history);
}

// Function to calculate statistics
function calculateStats(data) {
    if (data.length === 0) return { min: 0, max: 0, avg: 0 };

    const values = data.map(d => parseFloat(d));
    const min = Math.min(...values);
    const max = Math.max(...values);
    const avg = values.reduce((a, b) => a + b, 0) / values.length;

    return { min: min.toFixed(1), max: max.toFixed(1), avg: avg.toFixed(1) };
}

// Function to update charts
function updateCharts(history) {
    const labels = history.map(entry => new Date(entry.timestamp).toLocaleTimeString());
    const tempData = history.map(entry => entry.temp);
    const humData = history.map(entry => entry.hum);
    const phData = history.map(entry => entry.ph);

    // Helper function to create point styles
    function createPointStyles(data) {
        return data.map((value, index) => {
            const nextValue = data[index + 1];
            if (nextValue !== undefined && value > nextValue) {
                return { radius: 6, style: 'triangle', rotation: 0 }; // Arrow up for higher than next
            } else if (nextValue !== undefined && value < nextValue) {
                return { radius: 6, style: 'triangle', rotation: 180 }; // Arrow down for lower than next
            } else {
                return { radius: 4, style: 'circle', rotation: 0 }; // Default
            }
        });
    }

    const tempPointStyles = createPointStyles(tempData);
    const humPointStyles = createPointStyles(humData);
    const phPointStyles = createPointStyles(phData);

    // Temperature Chart
    new Chart(document.getElementById('temp-chart'), {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Temperature (°C)',
                data: tempData,
                borderColor: '#4CAF50',
                backgroundColor: 'rgba(76, 175, 80, 0.2)',
                fill: true,
                pointRadius: tempPointStyles.map(p => p.radius),
                pointHoverRadius: 8,
                pointBackgroundColor: '#4CAF50',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointStyle: tempPointStyles.map(p => p.style),
                rotation: tempPointStyles.map(p => p.rotation)
            }]
        },
        options: {
            responsive: true,
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const date = new Date(history[context.dataIndex].timestamp);
                            const dateStr = date.toLocaleDateString();
                            const timeStr = date.toLocaleTimeString();
                            return [`Temp: ${context.parsed.y}°C`, `Date: ${dateStr}`, `Time: ${timeStr}`];
                        }
                    }
                }
            },
            scales: {
                x: {
                    display: true,
                    title: {
                        display: true,
                        text: 'Time'
                    }
                },
                y: {
                    display: true,
                    title: {
                        display: true,
                        text: 'Temperature (°C)'
                    }
                }
            }
        }
    });

    // Update temperature stats
    const tempStats = calculateStats(tempData);
    const latestTempTime = history.length > 0 ? new Date(history[history.length - 1].timestamp).toLocaleString() : 'N/A';
    document.getElementById('temp-stats').innerHTML = `
        <strong>Temperature Stats:</strong> Min: ${tempStats.min}°C, Max: ${tempStats.max}°C, Avg: ${tempStats.avg}°C<br>
        <strong>Latest Reading:</strong> ${latestTempTime}
    `;

    // Humidity Chart
    new Chart(document.getElementById('hum-chart'), {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Humidity (%)',
                data: humData,
                borderColor: '#A7C7E7',
                backgroundColor: 'rgba(167, 199, 231, 0.2)',
                fill: true,
                pointRadius: humPointStyles.map(p => p.radius),
                pointHoverRadius: 8,
                pointBackgroundColor: '#A7C7E7',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointStyle: humPointStyles.map(p => p.style),
                rotation: humPointStyles.map(p => p.rotation)
            }]
        },
        options: {
            responsive: true,
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const date = new Date(history[context.dataIndex].timestamp);
                            const dateStr = date.toLocaleDateString();
                            const timeStr = date.toLocaleTimeString();
                            return [`Humidity: ${context.parsed.y}%`, `Date: ${dateStr}`, `Time: ${timeStr}`];
                        }
                    }
                }
            },
            scales: {
                x: {
                    display: true,
                    title: {
                        display: true,
                        text: 'Time'
                    }
                },
                y: {
                    display: true,
                    title: {
                        display: true,
                        text: 'Humidity (%)'
                    }
                }
            }
        }
    });

    // Update humidity stats
    const humStats = calculateStats(humData);
    const latestHumTime = history.length > 0 ? new Date(history[history.length - 1].timestamp).toLocaleString() : 'N/A';
    document.getElementById('hum-stats').innerHTML = `
        <strong>Humidity Stats:</strong> Min: ${humStats.min}%, Max: ${humStats.max}%, Avg: ${humStats.avg}%<br>
        <strong>Latest Reading:</strong> ${latestHumTime}
    `;

    // pH Chart
    new Chart(document.getElementById('ph-chart'), {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'pH',
                data: phData,
                borderColor: '#8D6E63',
                backgroundColor: 'rgba(141, 110, 99, 0.2)',
                fill: true,
                pointRadius: phPointStyles.map(p => p.radius),
                pointHoverRadius: 8,
                pointBackgroundColor: '#8D6E63',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointStyle: phPointStyles.map(p => p.style),
                rotation: phPointStyles.map(p => p.rotation)
            }]
        },
        options: {
            responsive: true,
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const date = new Date(history[context.dataIndex].timestamp);
                            const dateStr = date.toLocaleDateString();
                            const timeStr = date.toLocaleTimeString();
                            return [`pH: ${context.parsed.y}`, `Date: ${dateStr}`, `Time: ${timeStr}`];
                        }
                    }
                }
            },
            scales: {
                x: {
                    display: true,
                    title: {
                        display: true,
                        text: 'Time'
                    }
                },
                y: {
                    display: true,
                    title: {
                        display: true,
                        text: 'pH'
                    }
                }
            }
        }
    });

    // Update pH stats
    const phStats = calculateStats(phData);
    const latestPhTime = history.length > 0 ? new Date(history[history.length - 1].timestamp).toLocaleString() : 'N/A';
    document.getElementById('ph-stats').innerHTML = `
        <strong>pH Stats:</strong> Min: ${phStats.min}, Max: ${phStats.max}, Avg: ${phStats.avg}<br>
        <strong>Latest Reading:</strong> ${latestPhTime}
    `;
}



// Toggle history table visibility
document.getElementById('toggle-history-btn').addEventListener('click', function() {
    const table = document.getElementById('history-table');
    const isVisible = table.style.display !== 'none';
    table.style.display = isVisible ? 'none' : 'table';
    this.innerHTML = isVisible ? '<i class="fas fa-eye"></i> Show History' : '<i class="fas fa-eye-slash"></i> Hide History';
});

// Edit mode toggle
document.getElementById('edit-history-btn').addEventListener('click', function() {
    isEditMode = !isEditMode;
    const editControls = document.getElementById('edit-controls');
    const checkboxes = document.querySelectorAll('.row-checkbox');
    const deleteButtons = document.querySelectorAll('.delete-single-btn');

    if (isEditMode) {
        editControls.style.display = 'block';
        checkboxes.forEach(cb => cb.style.display = 'block');
        deleteButtons.forEach(btn => btn.style.display = 'inline-block');
        this.innerHTML = '<i class="fas fa-times"></i> Exit Edit';
    } else {
        editControls.style.display = 'none';
        checkboxes.forEach(cb => cb.style.display = 'none');
        deleteButtons.forEach(btn => btn.style.display = 'none');
        selectedRows.clear();
        document.getElementById('select-all').checked = false;
        this.innerHTML = '<i class="fas fa-edit"></i> Edit History';
    }
});

// Select all checkbox
document.getElementById('select-all').addEventListener('change', function() {
    const checkboxes = document.querySelectorAll('.row-checkbox');
    checkboxes.forEach(cb => {
        cb.checked = this.checked;
        if (this.checked) {
            selectedRows.add(parseInt(cb.dataset.index));
        } else {
            selectedRows.delete(parseInt(cb.dataset.index));
        }
    });
});

// Individual row checkboxes
document.addEventListener('change', function(e) {
    if (e.target.classList.contains('row-checkbox')) {
        const index = parseInt(e.target.dataset.index);
        if (e.target.checked) {
            selectedRows.add(index);
        } else {
            selectedRows.delete(index);
        }
        // Update select all checkbox
        const allCheckboxes = document.querySelectorAll('.row-checkbox');
        const checkedBoxes = document.querySelectorAll('.row-checkbox:checked');
        document.getElementById('select-all').checked = allCheckboxes.length === checkedBoxes.length;
    }
});

// Delete selected rows
document.getElementById('delete-selected-btn').addEventListener('click', function() {
    if (selectedRows.size === 0) {
        alert('Please select rows to delete.');
        return;
    }

    if (confirm(`Are you sure you want to delete ${selectedRows.size} selected entries?`)) {
        let history = JSON.parse(localStorage.getItem('agriHistory')) || [];
        const indicesToDelete = Array.from(selectedRows).sort((a, b) => b - a); // Sort descending

        indicesToDelete.forEach(index => {
            history.splice(index, 1);
        });

        localStorage.setItem('agriHistory', JSON.stringify(history));
        selectedRows.clear();
        loadHistory(); // Reload the page data
    }
});

// Delete single row
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('delete-single-btn') || e.target.closest('.delete-single-btn')) {
        const button = e.target.closest('.delete-single-btn');
        const index = parseInt(button.dataset.index);

        if (confirm('Are you sure you want to delete this entry?')) {
            let history = JSON.parse(localStorage.getItem('agriHistory')) || [];
            history.splice(index, 1);
            localStorage.setItem('agriHistory', JSON.stringify(history));
            loadHistory(); // Reload the page data
        }
    }
});

// Cancel edit
document.getElementById('cancel-edit-btn').addEventListener('click', function() {
    isEditMode = false;
    const editControls = document.getElementById('edit-controls');
    const checkboxes = document.querySelectorAll('.row-checkbox');
    const deleteButtons = document.querySelectorAll('.delete-single-btn');

    editControls.style.display = 'none';
    checkboxes.forEach(cb => cb.style.display = 'none');
    deleteButtons.forEach(btn => btn.style.display = 'none');
    selectedRows.clear();
    document.getElementById('select-all').checked = false;
    document.getElementById('edit-history-btn').innerHTML = '<i class="fas fa-edit"></i> Edit History';
});

// Refresh button
document.getElementById('refresh-btn').addEventListener('click', loadHistory);

// Initial load
loadHistory();
