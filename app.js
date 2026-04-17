let machineData = [];
let currentView = 'engineer';

async function init() {
    try {
        const response = await fetch('data.json');
        machineData = await response.json();
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
    
    renderDashboard();
}

function renderDashboard() {
    updateHeroStats();
    renderMachineGrid();
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
    grid.innerHTML = machineData.map(m => {
        const risk = getRisk(m.temperature, m.vibration);
        const color = `var(--accent-${risk.toLowerCase()})`;

        return `
            <div class="m-card">
                <div class="m-card-top">
                    <span class="m-id">${m.machine_id}</span>
                    <span class="risk-tag" style="color: ${color}">${risk}</span>
                </div>

                <div class="m-data-grid">
                    <div class="data-node">
                        <span class="node-label">Temperature</span>
                        <span class="node-val">${m.temperature.toFixed(1)}°C</span>
                    </div>
                    <div class="data-node">
                        <span class="node-label">Vibration</span>
                        <span class="node-val">${m.vibration.toFixed(2)} mm/s</span>
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
            </div>
        `;
    }).join('');
}

function renderAlerts() {
    const list = document.getElementById('alerts-list');
    const anomalies = machineData.filter(m => getRisk(m.temperature, m.vibration) !== 'LOW');
    
    if (anomalies.length === 0) {
        list.innerHTML = '<div style="color: #555; font-size: 0.8rem; padding: 1rem;">No diagnostic alerts.</div>';
        return;
    }

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
    }).join('');
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
            const tempChange = (Math.random() - 0.5) * 5;
            const vibChange = (Math.random() - 0.5) * 0.4;
            return {
                ...m,
                temperature: Math.max(30, Math.min(100, m.temperature + tempChange)),
                vibration: Math.max(0.1, Math.min(5, m.vibration + vibChange))
            };
        });
        renderDashboard();
    }, 4000);
}

init();
