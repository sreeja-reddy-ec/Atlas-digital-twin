let machineData = [];
let chartInstances = {};
let historyMap = {};
let currentRole = 'engineer'; // engineer | technician

// Initialize machine history and populate pages
async function init() {
    try {
        const response = await fetch('data.json');
        machineData = await response.json();
        
        machineData.forEach(m => {
            historyMap[m.machine_id] = {
                temp: Array(30).fill(m.temperature),
                vib: Array(30).fill(m.vibration)
            };
        });

        populateAllPages();
        renderInsights();
        startSimulation();
        
        // Initial Role Setup
        loadDashboard();
    } catch (error) {
        console.error("Error loading machine data:", error);
    }
}

function loadDashboard() {
    const engDash = document.getElementById('engineerDashboard');
    const techDash = document.getElementById('technicianDashboard');
    const roleInd = document.getElementById('roleIndicator');

    if (currentRole === 'engineer') {
        engDash.style.display = 'block';
        techDash.style.display = 'none';
        roleInd.textContent = 'ENGINEER';
        roleInd.style.color = 'var(--accent-cyan)';
        
        document.getElementById('digitalTab').style.display = 'inline-block';
        document.getElementById('analyticsTab').style.display = 'inline-block';
        document.getElementById('alertsTab').style.display = 'inline-block';

        showPage('digitalTwinPage');
    } else {
        engDash.style.display = 'none';
        techDash.style.display = 'block';
        roleInd.textContent = 'TECHNICIAN';
        roleInd.style.color = 'var(--accent-red)';

        document.getElementById('digitalTab').style.display = 'none';
        document.getElementById('analyticsTab').style.display = 'none';
        document.getElementById('alertsTab').style.display = 'inline-block';

        showPage('alertStackPage');
    }
}

function switchRole() {
    currentRole = (currentRole === 'engineer') ? 'technician' : 'engineer';
    loadDashboard();
}

function showPage(pageId) {
    const pages = document.querySelectorAll(".page");
    pages.forEach(page => page.style.display = "none");

    const selectedPage = document.getElementById(pageId);
    if (selectedPage) selectedPage.style.display = "block";

    const tabs = {
        'digitalTwinPage': 'digitalTab',
        'alertStackPage': 'alertsTab',
        'analyticsPage': 'analyticsTab',
        'diagnosticsPage': 'diagnosticsTab'
    };
    
    document.querySelectorAll('.view-links a').forEach(tab => tab.classList.remove('active'));
    const activeTabId = tabs[pageId];
    if (activeTabId) document.getElementById(activeTabId).classList.add('active');

    if (pageId === 'digitalTwinPage') {
        setTimeout(renderDigitalTwinChart, 50);
    }
}

function handleSidebarScroll(targetId, btnId) {
    const target = document.getElementById(targetId);
    if (target) target.scrollIntoView({ behavior: 'smooth' });
    document.querySelectorAll('.nav-menu .nav-item').forEach(item => item.classList.remove('active'));
    document.getElementById(btnId).classList.add('active');
}

function populateAllPages() {
    renderDigitalTwinContent();
    renderAlertStackContent();
    renderAnalyticsContent();
    renderDiagnosticsContent();
}

/**
 * REVERTED TO 1ST IMAGE LAYOUT
 */
function renderDigitalTwinContent() {
    const m = machineData[0] || { machine_id: "N/A", temperature: 106.8, vibration: 0.082 };
    const container = document.getElementById('digitalTwinPage');
    container.innerHTML = `
        <!-- Section: Overview -->
        <div id="overview" class="view-header">
            <div class="view-title">
                <h2>Digital Twin <span>Engine</span></h2>
                <div class="view-subtitle"><span>${m.machine_id} Hybrid Reality Sync</span> • <span>Latency 4ms</span></div>
            </div>
            <div class="view-metrics">
                <div class="metric-badge"><div class="m-label">Risk Score</div><div class="m-value">12<span>/100</span></div></div>
                <div class="metric-badge"><div class="m-label">Anomaly Timer</div><div class="m-value">00:04:12</div></div>
            </div>
        </div>

        <!-- Section: Telemetry -->
        <div id="telemetry" class="telemetry-focus">
            <div class="focus-header"><h3>VIBRATION BASELINE ANALYSIS</h3></div>
            <div class="big-chart-wrap"><canvas id="big-telemetry-chart"></canvas></div>
        </div>

        <!-- Section: Risk Matrix (Thermal, Torque, Drift) -->
        <div id="riskMatrix" class="metric-row" style="margin-bottom: 3rem;">
            <div class="metric-card">
                <div class="metric-icon">🌡️</div>
                <div class="card-data">
                    <h4>THERMAL BUFFER</h4>
                    <div class="val live-temp-${m.machine_id}">${m.temperature.toFixed(1)}°C</div>
                    <div class="sub"><span>NOMINAL</span><span>LIMIT: 95°C</span></div>
                </div>
            </div>
            <div class="metric-card">
                <div class="metric-icon">⚡</div>
                <div class="card-data">
                    <h4>LOAD TORQUE</h4>
                    <div class="val">1,240<span> Nm</span></div>
                    <div class="sub"><span>STABLE</span><span>PEAK: 1,800 Nm</span></div>
                </div>
            </div>
            <div class="metric-card" style="border-left: 2px solid var(--accent-red)">
                <div class="metric-icon" style="color: var(--accent-red)">📉</div>
                <div class="card-data">
                    <h4 style="color: var(--accent-red)">DRIFT FACTOR</h4>
                    <div class="val">0.082<span>σ</span></div>
                    <div class="sub"><span style="color:var(--accent-red); font-weight:800">ELEVATED VIBRATION DETECTED</span></div>
                </div>
            </div>
        </div>

        <!-- Section: AI Insights (Forecast) -->
        <div id="aiInsights" class="focus-header" style="margin-bottom: 2rem;">
            <h3>AI SENTINEL FORECAST</h3>
            <p style="color:var(--text-muted); font-size:0.75rem; margin-top:0.5rem; text-align: right; width: 100%;">"Spectral analysis indicates 94% probability of bearing fatigue in sector 7 within 22 operating hours."</p>
        </div>

        <!-- Section: System Log -->
        <div id="systemLog" class="telemetry-focus" style="padding: 2rem;">
            <div class="focus-header"><h3>DIAGNOSTIC EVENT LOG</h3></div>
            <div style="font-family: monospace; font-size: 0.75rem; color: var(--text-muted); line-height: 2;">
                [15:42:01] SECURE UPDATER: Node-09 heartbeat sync established.<br>
                [15:42:04] VIBRATION_DAEMON: Micro-spike detected in AXIS-Y (+0.4mm/s).<br>
                [15:42:15] THERMAL_SHIELD: Buffer recalibration successful.
            </div>
        </div>
    `;
}

function renderAlertStackContent() {
    const container = document.getElementById('alertStackPage');
    container.innerHTML = `
        <div id="overview" class="view-header">
            <div class="view-title">
                <h2>Smart <span>Prioritization</span></h2>
                <div class="view-subtitle"><span>Tactical overlay ranking critical system failures.</span></div>
            </div>
        </div>
        <div id="telemetry" class="threat-stack">
            <div class="stack-card critical">
                <div class="stack-info">
                    <div class="m-label" style="color: var(--accent-red)">CRITICAL ALERT • #telemetryAnchor</div>
                    <h3>Thermal Runaway Protection</h3>
                    <p>Immediate mitigation required.</p>
                </div>
                <div class="stack-actions"><button class="call-to-action primary">TRIGGER WORK ORDER</button></div>
            </div>
        </div>
        <div id="riskMatrix" style="height:200px"></div>
        <div id="aiInsights" style="height:200px"></div>
        <div id="systemLog" style="height:200px"></div>
    `;
}

function renderAnalyticsContent() {
    const container = document.getElementById('analyticsPage');
    container.innerHTML = `<div id="overview" class="view-header"><h2>Operational <span>Analytics</span></h2></div><div id="telemetry" style="height:400px"></div>`;
}

function renderDiagnosticsContent() {
    const container = document.getElementById('diagnosticsPage');
    container.innerHTML = `<div id="overview" class="view-header"><h2>System <span>Diagnostics</span></h2></div><div id="telemetry" style="height:400px"></div>`;
}

function renderInsights() {
    const feed = document.getElementById('insight-feed');
    if (!feed) return;
    feed.innerHTML = `
        <div class="insight-card predictive">
            <div class="card-meta"><span class="tag-predictive">PREDICTIVE</span><span>2m ago</span></div>
            <h4>CNC_01: Vibration +12%</h4>
            <button class="action-btn">REQUEST DIAGNOSTICS</button>
        </div>
    `;
}

function updateCharts() {
    if (document.getElementById('digitalTwinPage').style.display === 'none') return;
    renderDigitalTwinChart();
}

function renderDigitalTwinChart() {
    const canvas = document.getElementById('big-telemetry-chart');
    if (!canvas) return;
    const m = machineData[0];
    const h = historyMap[m.machine_id];
    if (chartInstances['big']) {
        const c = chartInstances['big'];
        c.data.datasets[0].data = h.vib.map(v => v + Math.sin(Date.now()/800) * 0.3);
        c.update('none');
    } else {
        const ctx = canvas.getContext('2d');
        chartInstances['big'] = new Chart(ctx, {
            type: 'line',
            data: {
                labels: Array(30).fill(''),
                datasets: [{ label: 'VIB', data: [...h.vib], borderColor: '#00f2ff', borderWidth: 2, pointRadius: 0, tension: 0.6, fill: false }]
            },
            options: { responsive: true, maintainAspectRatio: false, animation: false, plugins: { legend: { display: false } }, scales: { x: { display: false }, y: { display: false, min: 0, max: 9 } } }
        });
    }
}

function startSimulation() {
    setInterval(() => {
        machineData.forEach(m => {
            m.temperature += (Math.random() - 0.5) * 2;
            m.vibration += (Math.random() - 0.5) * 0.4;
            const h = historyMap[m.machine_id];
            h.temp.push(m.temperature); h.vib.push(m.vibration);
            if (h.temp.length > 30) { h.temp.shift(); h.vib.shift(); }
        });
        updateLiveValues(); updateCharts();
    }, 2000);
}

function updateLiveValues() {
    machineData.forEach(m => {
        document.querySelectorAll(`.live-temp-${m.machine_id}`).forEach(el => el.textContent = `${m.temperature.toFixed(1)}°C`);
    });
}

function initEventListeners() {
    document.getElementById('overviewBtn').addEventListener('click', () => handleSidebarScroll('overview', 'overviewBtn'));
    document.getElementById('telemetryBtn').addEventListener('click', () => handleSidebarScroll('telemetry', 'telemetryBtn'));
    document.getElementById('riskMatrixBtn').addEventListener('click', () => handleSidebarScroll('riskMatrix', 'riskMatrixBtn'));
    document.getElementById('aiInsightsBtn').addEventListener('click', () => handleSidebarScroll('aiInsights', 'aiInsightsBtn'));
    document.getElementById('systemLogBtn').addEventListener('click', () => handleSidebarScroll('systemLog', 'systemLogBtn'));

    document.addEventListener('click', (e) => {
        const btn = e.target.closest('button');
        if (!btn) return;
        const text = btn.textContent.trim().toUpperCase();
        if (text === 'REQUEST DIAGNOSTICS') alert("Diagnostics requested");
        else if (text === 'TRIGGER WORK ORDER') alert("Work order created");
    });

    const emergencyBtn = document.querySelector('.emergency-btn');
    if (emergencyBtn) {
        emergencyBtn.addEventListener('click', () => {
            if (confirm("ACTIVATE EMERGENCY STOP?")) {
                document.body.classList.add('emergency-halt');
                alert("SYSTEM HALTED.");
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    init();
    initEventListeners();
});
window.showPage = showPage;
window.switchRole = switchRole;
window.handleSidebarScroll = handleSidebarScroll;
