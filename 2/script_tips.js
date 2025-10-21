const tips = [
    "Water your plants early in the morning to reduce evaporation and prevent fungal diseases. <i class='fas fa-tint'></i>",
    "Use mulch around plants to retain soil moisture and suppress weeds. <i class='fas fa-leaf'></i>",
    "Rotate crops annually to prevent soil depletion and reduce pest problems. <i class='fas fa-sync-alt'></i>",
    "Monitor soil pH regularly; most plants prefer a pH between 6.0 and 7.0. <i class='fas fa-flask'></i>",
    "Companion planting can help deter pests and improve plant health. <i class='fas fa-seedling'></i>",
    "Avoid over-fertilizing; excess nutrients can harm plants and the environment. <i class='fas fa-exclamation-triangle'></i>",
    "Prune dead or diseased branches to improve air circulation and plant health. <i class='fas fa-cut'></i>",
    "Use organic pest control methods like neem oil or beneficial insects. <i class='fas fa-bug'></i>",
    "Test your soil before planting to understand nutrient levels and deficiencies. <i class='fas fa-search'></i>",
    "Keep a garden journal to track planting dates, weather, and plant performance. <i class='fas fa-book'></i>",
    "Plant cover crops to prevent soil erosion and improve fertility. <i class='fas fa-shield-alt'></i>",
    "Use drip irrigation to conserve water and deliver it directly to plant roots. <i class='fas fa-water'></i>",
    "Apply compost to enrich soil with organic matter and beneficial microbes. <i class='fas fa-recycle'></i>",
    "Monitor for pests regularly and use integrated pest management techniques. <i class='fas fa-eye'></i>",
    "Harvest crops at the right time to maximize quality and yield. <i class='fas fa-clock'></i>"
];

let currentTipIndex = 0;

function showTip() {
    const tipCard = document.getElementById('tip-card');
    const tipText = document.getElementById('tip-text');

    // Fade out
    tipCard.style.opacity = '0';
    setTimeout(() => {
        tipText.innerHTML = tips[currentTipIndex];
        tipCard.style.opacity = '1';
        currentTipIndex = (currentTipIndex + 1) % tips.length;
    }, 500);
}

// Change tip every 10 seconds
setInterval(showTip, 10000);

// Refresh button to manually change tip
document.getElementById('refresh-btn').addEventListener('click', showTip);

// Initial tip
showTip();

// Farm Map Animation
const canvas = document.getElementById('farm-canvas');
const ctx = canvas.getContext('2d');

let animationFrameId;
let time = 0;

function drawFarmMap() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background (soil with gradient)
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#8B4513');
    gradient.addColorStop(1, '#A0522D');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw fields (rectangles with different crops)
    const cropColors = ['#228B22', '#32CD32', '#006400', '#9ACD32', '#6B8E23'];
    for (let i = 0; i < 5; i++) {
        for (let j = 0; j < 3; j++) {
            const x = 50 + i * 150;
            const y = 50 + j * 100;
            ctx.fillStyle = cropColors[(i + j) % cropColors.length];
            ctx.fillRect(x, y, 100, 60);
            // Add field borders
            ctx.strokeStyle = '#654321';
            ctx.lineWidth = 2;
            ctx.strokeRect(x, y, 100, 60);
        }
    }

    // Draw irrigation lines (dotted lines)
    ctx.strokeStyle = '#0000FF';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    for (let i = 0; i < 5; i++) {
        for (let j = 0; j < 3; j++) {
            const x = 50 + i * 150;
            const y = 50 + j * 100;
            ctx.beginPath();
            ctx.moveTo(x + 20, y + 30);
            ctx.lineTo(x + 80, y + 30);
            ctx.stroke();
        }
    }
    ctx.setLineDash([]);

    // Draw paths (lines with texture)
    ctx.strokeStyle = '#D2B48C';
    ctx.lineWidth = 8;
    for (let i = 0; i < 6; i++) {
        ctx.beginPath();
        ctx.moveTo(50 + i * 150, 0);
        ctx.lineTo(50 + i * 150, canvas.height);
        ctx.stroke();
    }
    for (let j = 0; j < 4; j++) {
        ctx.beginPath();
        ctx.moveTo(0, 50 + j * 100);
        ctx.lineTo(canvas.width, 50 + j * 100);
        ctx.stroke();
    }

    // Draw animated tractor with wheels
    const tractorX = 100 + Math.sin(time * 0.005) * 250;
    const tractorY = 150 + Math.cos(time * 0.003) * 80;
    // Tractor body
    ctx.fillStyle = '#FF4500';
    ctx.fillRect(tractorX, tractorY, 30, 15);
    // Wheels
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(tractorX + 5, tractorY + 15, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(tractorX + 25, tractorY + 15, 3, 0, Math.PI * 2);
    ctx.fill();

    // Draw trees with trunks
    for (let i = 0; i < 12; i++) {
        const x = 15 + i * 70;
        const y = 25;
        // Trunk
        ctx.fillStyle = '#654321';
        ctx.fillRect(x - 3, y + 10, 6, 15);
        // Leaves
        ctx.fillStyle = '#006400';
        ctx.beginPath();
        ctx.arc(x, y, 12, 0, Math.PI * 2);
        ctx.fill();
    }

    // Draw water sources (ponds)
    ctx.fillStyle = '#4682B4';
    ctx.beginPath();
    ctx.ellipse(400, 200, 25, 15, 0, 0, Math.PI * 2);
    ctx.fill();
    // Add reflection
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.beginPath();
    ctx.ellipse(400, 195, 20, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Draw farm buildings
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(700, 50, 60, 40);
    ctx.fillStyle = '#654321';
    ctx.beginPath();
    ctx.moveTo(700, 50);
    ctx.lineTo(730, 20);
    ctx.lineTo(760, 50);
    ctx.closePath();
    ctx.fill();

    // Draw windmill (animated)
    const windmillX = 50;
    const windmillY = 350;
    ctx.fillStyle = '#C0C0C0';
    ctx.fillRect(windmillX - 2, windmillY, 4, 50);
    ctx.fillStyle = '#8B4513';
    ctx.beginPath();
    ctx.arc(windmillX, windmillY, 8, 0, Math.PI * 2);
    ctx.fill();
    // Blades
    ctx.save();
    ctx.translate(windmillX, windmillY);
    ctx.rotate(time * 0.02);
    ctx.fillStyle = '#FFFFFF';
    for (let i = 0; i < 4; i++) {
        ctx.rotate(Math.PI / 2);
        ctx.fillRect(-1, -20, 2, 20);
    }
    ctx.restore();

    // Draw clouds
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.beginPath();
    ctx.arc(200 + Math.sin(time * 0.002) * 20, 80, 20, 0, Math.PI * 2);
    ctx.arc(220 + Math.sin(time * 0.002) * 20, 75, 25, 0, Math.PI * 2);
    ctx.arc(240 + Math.sin(time * 0.002) * 20, 80, 20, 0, Math.PI * 2);
    ctx.fill();

    time++;
    animationFrameId = requestAnimationFrame(drawFarmMap);
}

// Start animation
drawFarmMap();
