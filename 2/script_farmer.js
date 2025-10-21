// ThingSpeak API details
const apiKey = 'BVM5K715L90AUZM6';
const channelId = '3091950';
const apiUrl = `https://api.thingspeak.com/channels/${channelId}/feeds/last.json?api_key=${apiKey}`;

// Variables to store the last stored data
let lastStoredData = null;
let lastDailyReading = null;

// Function to fetch data from ThingSpeak
async function fetchData() {
    try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        return {
            temp: parseFloat(data.field3), // pH is now field3
            hum: parseFloat(data.field2),
            ph: parseFloat(data.field1)   // temp is now field1
        };
    } catch (error) {
        console.error('Error fetching data:', error);
        return null;
    }
}

// Function to predict rain using ML model
function predictRain(temp, hum, ph) {
    // Normalize inputs (assuming model expects normalized values)
    const normalizedTemp = temp / 50; // Assuming max temp ~50°C
    const normalizedHum = hum / 100; // Humidity 0-100%
    const normalizedPh = ph / 14; // pH 0-14

    const score = 0.07506625918375 + normalizedTemp * -0.6963794949554937 + normalizedHum * 0.9597133224539464 + normalizedPh * -1.0730148104819222;

    // Assuming score > 0 means rain likely
    if (score > 0) {
        return 'There is a chance of rain';
    } else {
        return 'No chance of rain';
    }
}

// Function to get irrigation advice
function getIrrigationAdvice(temp, hum, ph) {
    if (hum < 40) {
        return 'Immediate watering required!';
    } else if (hum >= 40 && hum < 60) {
        return 'Watering needed soon';
    } else if (hum >= 60 && hum < 80) {
        return 'Soil moisture adequate';
    } else {
        return 'Overwatering risk - reduce irrigation';
    }
}

// Function to check if data has changed significantly (more than 0.5 units)
function hasDataChanged(newData, oldData) {
    if (!oldData) return true;
    const tempDiff = Math.abs(newData.temp - oldData.temp);
    const humDiff = Math.abs(newData.hum - oldData.hum);
    const phDiff = Math.abs(newData.ph - oldData.ph);
    return tempDiff > 0.5 || humDiff > 0.5 || phDiff > 0.5;
}

// Function to update the UI
async function updateData() {
    const data = await fetchData();
    if (data) {
        const { temp, hum, ph } = data;

        // Update cards
        document.getElementById('temp-value').textContent = temp.toFixed(1) + ' °C';
        document.getElementById('hum-value').textContent = hum.toFixed(1) + ' %';
        document.getElementById('ph-value').textContent = ph.toFixed(1);

        // Update humidity status
        const humStatus = document.getElementById('hum-status');
        if (hum < 40) {
            humStatus.textContent = 'Needs watering!';
            humStatus.style.color = '#FF5722';
        } else if (hum >= 40 && hum < 60) {
            humStatus.textContent = 'Watering needed soon';
            humStatus.style.color = '#FF9800';
        } else {
            humStatus.textContent = 'Soil moisture good';
            humStatus.style.color = '#4CAF50';
        }

        // Update irrigation advice
        const irrigationAdvice = getIrrigationAdvice(temp, hum, ph);
        document.getElementById('advice-temp').textContent = temp.toFixed(1) + '°C';
        document.getElementById('advice-hum').textContent = hum.toFixed(1) + '%';
        document.getElementById('advice-ph').textContent = ph.toFixed(1);
        document.getElementById('advice-status').textContent = irrigationAdvice;

        // Update rain prediction
        const rainPrediction = predictRain(temp, hum, ph);
        document.getElementById('rain-temp').textContent = temp.toFixed(1) + '°C';
        document.getElementById('rain-hum').textContent = hum.toFixed(1) + '%';
        document.getElementById('rain-ph').textContent = ph.toFixed(1);
        document.getElementById('rain-status').textContent = rainPrediction;

        // Store in localStorage for history only if data has changed
        if (hasDataChanged(data, lastStoredData)) {
            const timestamp = new Date().toISOString();
            const history = JSON.parse(localStorage.getItem('agriHistory')) || [];
            history.push({ timestamp, temp, hum, ph });
            // Keep only last 100 entries
            if (history.length > 100) history.shift();
            localStorage.setItem('agriHistory', JSON.stringify(history));
            lastStoredData = { ...data }; // Update last stored data
        }
    }
}

// Function to store daily reading
async function storeDailyReading() {
    const data = await fetchData();
    if (data) {
        const timestamp = new Date().toISOString();
        const dailyHistory = JSON.parse(localStorage.getItem('dailyHistory')) || [];
        dailyHistory.push({ timestamp, ...data });
        // Keep only last 30 days
        if (dailyHistory.length > 30) dailyHistory.shift();
        localStorage.setItem('dailyHistory', JSON.stringify(dailyHistory));
        lastDailyReading = new Date().toDateString(); // Store today's date
        localStorage.setItem('lastDailyReading', lastDailyReading);
        console.log('Daily reading stored:', data);
    }
}

// Function to restore daily history if accidentally deleted
async function restoreDailyHistory() {
    const dailyHistory = JSON.parse(localStorage.getItem('dailyHistory')) || [];
    if (dailyHistory.length === 0) {
        // If no daily history, store current reading as today's
        await storeDailyReading();
        console.log('Daily history restored with current reading');
    }
}

// Check if we need to store daily reading
function checkDailyReading() {
    const today = new Date().toDateString();
    const storedLastDaily = localStorage.getItem('lastDailyReading');

    if (storedLastDaily !== today) {
        storeDailyReading();
    }
}

// Auto update every 15-20 seconds
setInterval(updateData, 17000); // 17 seconds average

// Check daily reading every hour
setInterval(checkDailyReading, 3600000); // 1 hour

// Refresh button
document.getElementById('refresh-btn').addEventListener('click', updateData);

// Log Out button
document.getElementById('logout-btn').addEventListener('click', function() {
    window.location.href = '../ma.html';
});

// Initial load
updateData();
checkDailyReading(); // Check on startup
restoreDailyHistory(); // Restore if accidentally deleted

// Force store daily reading for testing (remove this line after testing)
storeDailyReading();
