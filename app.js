let machineData = [];
let currentView = 'engineer';
let historyMap = {}; 
let chartInstances = {};

async function init() {
    try {
        const response = await fetch('data.json');
        machineData = await response.json();
        
        machineData.forEach(m => {
            historyMap[m.machine_id] = {
                temp: Array(15).fill(m.temperature),
                vib: Array(15).fill(m.vibration)
            };
        });

        renderDashboard();
        startSimulation();
    } catch (error) {
        console.error('Error loading machine data:', error);
    }
}

function getRisk(temp, vib) {
    if (temp > 80 || vib > 2) return 'HIGH';
    if (temp > 65 || vib > 1) return 'MEDIUM';
    return 'LOW';
}

function switchView(view) {
    currentView = view;
    document.getElementById('engineerBtn').classList.toggle('active', view === 'engineer');
    document.getElementById('technicianBtn').classList.toggle('active', view === 'technician');
    document.getElementById('role-tag').textContent = `ROLE: ${view.toUpperCase()}`;
    
    // Clear the grid to force a full re-render for the toggle
    document.getElementById('main-grid').innerHTML = '';
    Object.values(chartInstances).forEach(c => c.destroy());
    chartInstances = {};
    
    renderDashboard();
}

function renderDashboard() {
    updateHeroStats();
    renderMachineGrid();
    renderCharts();
    renderAlerts();
    renderPriority();
}

function updateHeroStats() {
    document.getElementById('stat-total').textContent = machineData.length;
    const critical = machineData.filter(m => getRisk(m.temperature, m.vibration) === 'HIGH').length;
    document.getElementById('stat-critical').textContent = critical;
    
    const healthy = machineData.filter(m => getRisk(m.temperature, m.vibration) === 'LOW').length;
    const healthPercent = Math.round((healthy / machineData.length) * 100);
    document.getElementById('stat-health').textContent = `${healthPercent}%`;
}

function renderMachineGrid() {
    const grid = document.getElementById('main-grid');
    
    machineData.forEach(m => {
        let card = document.querySelector(`.m-card[data-id="${m.machine_id}"]`);
        const risk = getRisk(m.temperature, m.vibration);
        const color = `var(--accent-${risk.toLowerCase()})`;

        if (!card) {
            const cardHtml = `
                <div class="m-card" data-id="${m.machine_id}">
                    <div class="m-card-top">
                        <span class="m-id">${m.machine_id}</span>
                        <span class="risk-tag" style="color: ${color}">${risk}</span>
                    </div>
                    <div class="m-data-grid">
                        <div class="data-node">
                            <span class="node-label">Temperature</span>
                            <span class="node-val val-temp">${m.temperature.toFixed(1)}°C</span>
                        </div>
                        <div class="data-node">
                            <span class="node-label">Vibration</span>
                            <span class="node-val val-vib">${m.vibration.toFixed(2)} mm/s</span>
                        </div>
                        <div class="data-node">
                            <span class="node-label">RPM</span>
                            <span class="node-val">${m.rpm}</span>
                        </div>
                        <div class="data-node">
                            <span class="node-label">Current</span>
                            <span class="node-val">${m.current}A</span>
                        </div>
                    </div>
                    ${currentView === 'engineer' ? `
                        <div class="chart-wrap">
                            <canvas id="chart-${m.machine_id}"></canvas>
                        </div>
                    ` : ''}
                </div>
            `;
            grid.insertAdjacentHTML('beforeend', cardHtml);
            card = document.querySelector(`.m-card[data-id="${m.machine_id}"]`);
        } else {
            // Update existing card values
            card.querySelector('.val-temp').textContent = `${m.temperature.toFixed(1)}°C`;
            card.querySelector('.val-vib').textContent = `${m.vibration.toFixed(2)} mm/s`;
            const tag = card.querySelector('.risk-tag');
            tag.textContent = risk;
            tag.style.color = color;
        }
    });
}

function renderCharts() {
    if (currentView !== 'engineer') return;

    machineData.forEach(m => {
        const canvas = document.getElementById(`chart-${m.machine_id}`);
        if (!canvas) return;
        
        const history = historyMap[m.machine_id];

        if (chartInstances[m.machine_id]) {
            const chart = chartInstances[m.machine_id];
            chart.data.datasets[0].data = history.temp;
            chart.data.datasets[1].data = history.vib;
            chart.update('none'); 
        } else {
            const ctx = canvas.getContext('2d');
            chartInstances[m.machine_id] = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: Array(15).fill(''),
                    datasets: [
                        {
                            label: 'Temp',
                            data: [...history.temp],
                            borderColor: '#00f2ff',
                            backgroundColor: 'rgba(0, 242, 255, 0.1)',
                            borderWidth: 3,
                            pointRadius: 0,
                            tension: 0.4,
                            fill: true
                        },
                        {
                            label: 'Vib',
                            data: [...history.vib],
                            borderColor: '#ffb4ab',
                            backgroundColor: 'rgba(255, 180, 171, 0.1)',
                            borderWidth: 3,
                            pointRadius: 0,
                            tension: 0.4,
                            fill: true,
                            yAxisID: 'y1'
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    animation: false,
                    plugins: { legend: { display: false } },
                    scales: {
                        x: { display: false },
                        y: { 
                            display: false,
                            min: 20,
                            max: 110
                        },
                        y1: { 
                            display: false, 
                            position: 'right',
                            min: 0,
                            max: 6
                        }
                    }
                }
            });
        }
    });
}

function renderAlerts() {
    const list = document.getElementById('alerts-list');
    const anomalies = machineData.filter(m => getRisk(m.temperature, m.vibration) !== 'LOW');
    
    list.innerHTML = anomalies.map(m => {
        const risk = getRisk(m.temperature, m.vibration);
        return `
            <div class="alert-row">
                <div class="alert-icon">⚠️</div>
                <div class="alert-body">
                    <h4 style="color: var(--accent-red)">${risk} PRIORITY</h4>
                    <p>${m.machine_id} exceeding threshold. Immediate inspection required.</p>
                </div>
            </div>
        `;
    }).join('') || '<div style="color: #555; font-size: 0.8rem; padding: 1rem;">No diagnostic alerts.</div>';
}

function renderPriority() {
    const list = document.getElementById('priority-list');
    const sorted = [...machineData].sort((a, b) => {
        const riskMap = { 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1 };
        return riskMap[getRisk(b.temperature, b.vibration)] - riskMap[getRisk(a.temperature, a.vibration)];
    });

    list.innerHTML = sorted.map(m => {
        const risk = getRisk(m.temperature, m.vibration);
        return `
            <div class="priority-row">
                <span>${m.machine_id}</span>
                <span style="color: var(--accent-${risk.toLowerCase()})">${risk}</span>
            </div>
        `;
    }).join('');
}

function startSimulation() {
    setInterval(() => {
        machineData = machineData.map(m => {
            const tShift = (Math.random() - 0.5) * 8;
            const vShift = (Math.random() - 0.5) * 0.5;
            
            const newT = Math.max(30, Math.min(100, m.temperature + tShift));
            const newV = Math.max(0.1, Math.min(5, m.vibration + vShift));

            historyMap[m.machine_id].temp.push(newT);
            historyMap[m.machine_id].vib.push(newV);
            
            if (historyMap[m.machine_id].temp.length > 15) {
                historyMap[m.machine_id].temp.shift();
                historyMap[m.machine_id].vib.shift();
            }

            return { ...m, temperature: newT, vibration: newV };
        });
        renderDashboard();
    }, 4000);
}

init();
