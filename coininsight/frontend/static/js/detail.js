/**
 * CoinInsight — Detalle de Criptomoneda
 * RF07: Vista Detallada
 * RF08: Gráfica Histórica (Chart.js)
 * RF09: Análisis IA (Gemini)
 * RF10: Favoritos
 */

let cryptoChartInstance = null;
const cryptoId = document.getElementById("current-crypto-id").value;

// --- Utilidades de formateo (reutilizadas de main.js conceptualmente) ---
function formatPrice(value) {
    if (value == null) return "—";
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 }).format(value);
}
function formatLargeNumber(value) {
    if (value == null) return "—";
    if (value >= 1e12) return "$" + (value / 1e12).toFixed(2) + "T";
    if (value >= 1e9) return "$" + (value / 1e9).toFixed(2) + "B";
    if (value >= 1e6) return "$" + (value / 1e6).toFixed(2) + "M";
    return "$" + value.toLocaleString("en-US");
}
function formatChangeClass(value) {
    if (value == null) return "text-muted";
    return value >= 0 ? "text-success" : "text-danger";
}
function formatChangeText(value) {
    if (value == null) return "—";
    return (value >= 0 ? "+" : "") + value.toFixed(2) + "%";
}

// --- Carga de Detalle ---
async function loadDetail() {
    const loading = document.getElementById("detail-loading");
    const content = document.getElementById("detail-content");
    const errorMsg = document.getElementById("detail-error");
    
    try {
        const res = await fetch(`/api/crypto/${cryptoId}`);
        if (!res.ok) throw new Error("Error fetching detail");
        const data = await res.json();
        
        // Rellenar UI
        document.getElementById("detail-image").src = data.image || "";
        document.getElementById("detail-name").textContent = data.name;
        document.getElementById("detail-symbol").textContent = (data.symbol || "").toUpperCase();
        
        document.getElementById("detail-price").textContent = formatPrice(data.current_price);
        document.getElementById("detail-market-cap").textContent = formatLargeNumber(data.market_cap);
        document.getElementById("detail-volume").textContent = formatLargeNumber(data.total_volume);
        
        const change24 = document.getElementById("detail-change-24h");
        change24.textContent = formatChangeText(data.price_change_percentage_24h);
        change24.className = formatChangeClass(data.price_change_percentage_24h) + " fw-bold";
        
        const change7d = document.getElementById("detail-change-7d");
        change7d.textContent = formatChangeText(data.price_change_percentage_7d);
        change7d.className = formatChangeClass(data.price_change_percentage_7d) + " fw-bold";
        
        loading.style.display = "none";
        content.style.display = "block";
        
        // Cargar fav y chart después de mostrar contenido
        checkFavoriteStatus();
        loadChart(7);
    } catch (e) {
        console.error(e);
        loading.style.display = "none";
        errorMsg.style.display = "block";
    }
}

// --- Favoritos ---
async function checkFavoriteStatus() {
    try {
        const res = await fetch(`/api/favorites/${cryptoId}/status`);
        if (res.ok) {
            const data = await res.json();
            updateFavButton(data.is_favorite);
        }
    } catch (e) {
        console.error("Error check fav", e);
    }
}

async function toggleFavorite() {
    try {
        const btn = document.getElementById("favorite-btn");
        const isFav = btn.classList.contains("active");
        
        const res = await fetch(`/api/favorites/${cryptoId}`, {
            method: isFav ? "DELETE" : "POST"
        });
        
        if (res.ok) {
            const data = await res.json();
            updateFavButton(data.is_favorite);
        }
    } catch (e) {
        console.error("Error toggle fav", e);
    }
}

function updateFavButton(isFav) {
    const btn = document.getElementById("favorite-btn");
    const icon = btn.querySelector("i");
    if (isFav) {
        btn.classList.add("active");
        icon.classList.remove("bi-star");
        icon.classList.add("bi-star-fill");
        icon.style.color = "var(--ci-accent)";
    } else {
        btn.classList.remove("active");
        icon.classList.remove("bi-star-fill");
        icon.classList.add("bi-star");
        icon.style.color = "";
    }
}

// --- Gráfica Chart.js ---
async function loadChart(days) {
    try {
        const res = await fetch(`/api/crypto/${cryptoId}/history?days=${days}`);
        if (!res.ok) throw new Error("Error fetching history");
        const data = await res.json();
        
        const prices = data.prices || [];
        const labels = prices.map(p => {
            const date = new Date(p[0]);
            return days <= 1 ? date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : date.toLocaleDateString();
        });
        const values = prices.map(p => p[1]);
        
        const ctx = document.getElementById("cryptoChart").getContext("2d");
        
        // Colores según si sube o baja (comparar inicio y fin)
        const isPositive = values[values.length - 1] >= values[0];
        const lineColor = isPositive ? "#22c55e" : "#ef4444";
        const bgColor = isPositive ? "rgba(34, 197, 94, 0.1)" : "rgba(239, 68, 68, 0.1)";

        if (cryptoChartInstance) {
            cryptoChartInstance.destroy();
        }

        cryptoChartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Precio (USD)',
                    data: values,
                    borderColor: lineColor,
                    backgroundColor: bgColor,
                    borderWidth: 2,
                    pointRadius: 0,
                    pointHitRadius: 10,
                    fill: true,
                    tension: 0.2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        callbacks: {
                            label: function(context) {
                                return formatPrice(context.parsed.y);
                            }
                        }
                    }
                },
                scales: {
                    x: { display: false },
                    y: {
                        display: true,
                        position: 'right',
                        grid: { color: 'rgba(255, 255, 255, 0.05)' },
                        ticks: { color: '#9ca3af' }
                    }
                },
                interaction: {
                    mode: 'nearest',
                    axis: 'x',
                    intersect: false
                }
            }
        });
    } catch (e) {
        console.error("Error chart", e);
    }
}

// --- Análisis IA ---
async function analyzeCrypto() {
    const loading = document.getElementById("ia-loading");
    const result = document.getElementById("ia-result");
    const placeholder = document.getElementById("ia-placeholder");
    
    placeholder.style.display = "none";
    result.style.display = "none";
    loading.style.display = "block";
    
    try {
        const res = await fetch("/api/analysis", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ crypto: cryptoId })
        });
        
        const data = await res.json();
        
        if (!res.ok) throw new Error(data.error || "Error al analizar");
        
        document.getElementById("ia-summary").textContent = data.resumen || "No disponible";
        
        const trend = (data.tendencia || "").toLowerCase();
        const trendBadge = document.getElementById("ia-trend");
        trendBadge.textContent = "Tendencia: " + data.tendencia;
        trendBadge.className = "badge border " + (trend.includes("alcista") ? "bg-success" : (trend.includes("bajista") ? "bg-danger" : "bg-secondary"));
        
        const risk = (data.riesgo || "").toLowerCase();
        const riskBadge = document.getElementById("ia-risk");
        riskBadge.textContent = "Riesgo: " + data.riesgo;
        riskBadge.className = "badge border " + (risk.includes("alto") ? "bg-danger" : (risk.includes("bajo") ? "bg-success" : "bg-warning"));
        
        document.getElementById("ia-factors").textContent = data.factores || "Ninguno destacado.";
        
        loading.style.display = "none";
        result.style.display = "block";
    } catch (e) {
        console.error(e);
        loading.style.display = "none";
        placeholder.style.display = "block";
        alert("Error: " + e.message);
    }
}

// --- Inicialización ---
document.addEventListener("DOMContentLoaded", () => {
    loadDetail();
    
    document.getElementById("favorite-btn").addEventListener("click", toggleFavorite);
    document.getElementById("btn-analyze").addEventListener("click", analyzeCrypto);
    
    document.querySelectorAll(".ci-btn-period").forEach(btn => {
        btn.addEventListener("click", (e) => {
            document.querySelectorAll(".ci-btn-period").forEach(b => b.classList.remove("active"));
            e.target.classList.add("active");
            loadChart(e.target.getAttribute("data-days"));
        });
    });
});
