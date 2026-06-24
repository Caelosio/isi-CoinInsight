/**
 * CoinInsight — Comparador de Criptomonedas
 * Permite seleccionar dos criptomonedas y generar una comparación con IA.
 */

// --- Utilidades de formateo (reutilizadas de main.js / detail.js) ---

function formatPrice(value) {
    if (value == null) return "—";
    if (value >= 1) {
        return new Intl.NumberFormat("en-US", {
            style: "currency", currency: "USD",
            minimumFractionDigits: 2, maximumFractionDigits: 2,
        }).format(value);
    }
    return new Intl.NumberFormat("en-US", {
        style: "currency", currency: "USD",
        minimumFractionDigits: 4, maximumFractionDigits: 6,
    }).format(value);
}

function formatLargeNumber(value) {
    if (value == null) return "—";
    if (value >= 1e12) return "$" + (value / 1e12).toFixed(2) + "T";
    if (value >= 1e9) return "$" + (value / 1e9).toFixed(2) + "B";
    if (value >= 1e6) return "$" + (value / 1e6).toFixed(2) + "M";
    return "$" + value.toLocaleString("en-US");
}

function formatChangeText(value) {
    if (value == null) return "—";
    return (value >= 0 ? "+" : "") + value.toFixed(2) + "%";
}

function formatChangeClass(value) {
    if (value == null) return "";
    return value >= 0 ? "ci-change-positive" : "ci-change-negative";
}

// --- Carga de opciones en los selectores ---

async function loadCryptoOptions() {
    const selectA = document.getElementById("select-crypto-a");
    const selectB = document.getElementById("select-crypto-b");

    try {
        const response = await fetch("/api/cryptos");
        if (!response.ok) throw new Error("Error al cargar criptomonedas");

        const cryptos = await response.json();

        if (cryptos.length === 0) throw new Error("No se recibieron datos");

        // Limpiar opciones previas
        selectA.innerHTML = '<option value="">Selecciona una moneda</option>';
        selectB.innerHTML = '<option value="">Selecciona una moneda</option>';

        cryptos.forEach((crypto) => {
            const optionA = document.createElement("option");
            optionA.value = crypto.id;
            optionA.textContent = `${crypto.name} (${crypto.symbol.toUpperCase()})`;
            selectA.appendChild(optionA);

            const optionB = optionA.cloneNode(true);
            selectB.appendChild(optionB);
        });

        selectA.disabled = false;
        selectB.disabled = false;
    } catch (error) {
        console.error("Error al cargar opciones:", error);
        selectA.innerHTML = '<option value="">Error al cargar</option>';
        selectB.innerHTML = '<option value="">Error al cargar</option>';
    }
}

// --- Validación de selectores ---

function validateSelectors() {
    const selectA = document.getElementById("select-crypto-a");
    const selectB = document.getElementById("select-crypto-b");
    const warning = document.getElementById("same-coin-warning");
    const btnCompare = document.getElementById("btn-compare");

    const valA = selectA.value;
    const valB = selectB.value;

    // Ambos deben estar seleccionados
    if (!valA || !valB) {
        warning.style.display = "none";
        btnCompare.disabled = true;
        return;
    }

    // No pueden ser la misma moneda
    if (valA === valB) {
        warning.style.display = "flex";
        btnCompare.disabled = true;
        return;
    }

    warning.style.display = "none";
    btnCompare.disabled = false;
}

// --- Renderizar tarjeta de datos ---

function renderCryptoCard(data, suffix) {
    const img = document.getElementById(`compare-img-${suffix}`);
    img.src = data.image || "";
    img.alt = data.name || "";

    document.getElementById(`compare-name-${suffix}`).textContent = data.name || "—";
    document.getElementById(`compare-symbol-${suffix}`).textContent = (data.symbol || "").toUpperCase();
    document.getElementById(`compare-price-${suffix}`).textContent = formatPrice(data.current_price);
    document.getElementById(`compare-mcap-${suffix}`).textContent = formatLargeNumber(data.market_cap);
    document.getElementById(`compare-vol-${suffix}`).textContent = formatLargeNumber(data.total_volume);

    const change24 = document.getElementById(`compare-change24-${suffix}`);
    change24.textContent = formatChangeText(data.price_change_percentage_24h);
    change24.className = "ci-metric-value " + formatChangeClass(data.price_change_percentage_24h);

    const change7d = document.getElementById(`compare-change7d-${suffix}`);
    change7d.textContent = formatChangeText(data.price_change_percentage_7d);
    change7d.className = "ci-metric-value " + formatChangeClass(data.price_change_percentage_7d);
}

// --- Comparar criptomonedas ---

async function compareCryptos() {
    const selectA = document.getElementById("select-crypto-a");
    const selectB = document.getElementById("select-crypto-b");
    const loading = document.getElementById("compare-loading");
    const errorContainer = document.getElementById("compare-error");
    const results = document.getElementById("compare-results");
    const btnCompare = document.getElementById("btn-compare");

    // Resetear estado
    results.style.display = "none";
    errorContainer.style.display = "none";
    loading.style.display = "block";
    btnCompare.disabled = true;

    try {
        const response = await fetch("/api/compare", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                crypto_a: selectA.value,
                crypto_b: selectB.value,
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Error al generar la comparación");
        }

        // Renderizar tarjetas de datos
        renderCryptoCard(data.crypto_a, "a");
        renderCryptoCard(data.crypto_b, "b");

        // Renderizar análisis IA (convertir párrafos en HTML)
        const iaText = document.getElementById("compare-ia-text");
        const paragraphs = (data.comparacion || "").split("\n").filter(p => p.trim());
        iaText.innerHTML = paragraphs.map(p => `<p>${p}</p>`).join("");

        loading.style.display = "none";
        results.style.display = "block";

        // Animar la aparición
        results.style.animation = "none";
        results.offsetHeight; // Trigger reflow
        results.style.animation = "fadeSlideUp 0.5s ease-out";

    } catch (error) {
        console.error("Error en comparación:", error);
        loading.style.display = "none";
        document.getElementById("compare-error-text").textContent = error.message;
        errorContainer.style.display = "block";
    } finally {
        // Rehabilitar botón si la validación sigue OK
        validateSelectors();
    }
}

// --- Inicialización ---

document.addEventListener("DOMContentLoaded", function () {
    loadCryptoOptions();

    const selectA = document.getElementById("select-crypto-a");
    const selectB = document.getElementById("select-crypto-b");
    const btnCompare = document.getElementById("btn-compare");

    selectA.addEventListener("change", validateSelectors);
    selectB.addEventListener("change", validateSelectors);
    btnCompare.addEventListener("click", compareCryptos);
});
