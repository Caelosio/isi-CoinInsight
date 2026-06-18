/**
 * CoinInsight — JavaScript principal
 * RF03: Carga y muestra top 20 criptomonedas
 * RF04: Búsqueda/filtrado por nombre
 */

// Estado global
let allCryptos = [];

// --- Utilidades de formateo ---

/**
 * Formatea un número como precio USD.
 * @param {number} value - Valor a formatear.
 * @returns {string} Precio formateado.
 */
function formatPrice(value) {
    if (value == null) return "—";

    if (value >= 1) {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(value);
    }

    // Para precios muy bajos (fracciones de centavo)
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 4,
        maximumFractionDigits: 6,
    }).format(value);
}

/**
 * Formatea números grandes (market cap, volumen).
 * @param {number} value - Valor a formatear.
 * @returns {string} Valor formateado con sufijo.
 */
function formatLargeNumber(value) {
    if (value == null) return "—";

    if (value >= 1e12) {
        return "$" + (value / 1e12).toFixed(2) + "T";
    }
    if (value >= 1e9) {
        return "$" + (value / 1e9).toFixed(2) + "B";
    }
    if (value >= 1e6) {
        return "$" + (value / 1e6).toFixed(2) + "M";
    }

    return "$" + value.toLocaleString("en-US");
}

/**
 * Formatea el porcentaje de cambio de precio.
 * @param {number} value - Porcentaje.
 * @returns {object} Texto formateado y clase CSS.
 */
function formatPriceChange(value) {
    if (value == null) return { text: "—", className: "" };

    const sign = value >= 0 ? "+" : "";
    const text = sign + value.toFixed(2) + "%";
    const className = value >= 0 ? "ci-change-positive" : "ci-change-negative";
    const icon = value >= 0 ? "▲" : "▼";

    return { text: icon + " " + text, className };
}

// --- Carga de datos ---

/**
 * Carga las top 20 criptomonedas desde el backend.
 * RF03: GET /api/cryptos
 */
async function loadCryptos() {
    const spinner = document.getElementById("loading-spinner");
    const errorMsg = document.getElementById("error-message");
    const tableContainer = document.getElementById("crypto-table-container");

    // Mostrar loading
    spinner.style.display = "block";
    errorMsg.style.display = "none";
    tableContainer.style.display = "none";

    try {
        const response = await fetch("/api/cryptos");

        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }

        allCryptos = await response.json();

        if (allCryptos.length === 0) {
            throw new Error("No se recibieron datos");
        }

        renderCryptoTable(allCryptos);

        spinner.style.display = "none";
        tableContainer.style.display = "block";
    } catch (error) {
        console.error("Error al cargar criptomonedas:", error);
        spinner.style.display = "none";
        errorMsg.style.display = "block";
    }
}

// --- Renderizado ---

/**
 * Renderiza la tabla de criptomonedas.
 * RF03: Nombre, precio, variación 24h, capitalización.
 * RF04: Nombre, símbolo, precio, volumen, market cap.
 * @param {Array} cryptos - Lista de criptomonedas.
 */
function renderCryptoTable(cryptos) {
    const tbody = document.getElementById("crypto-tbody");
    const resultsCount = document.getElementById("results-count");

    tbody.innerHTML = "";

    if (cryptos.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center py-4" style="color: var(--ci-text-muted);">
                    <i class="bi bi-search" style="font-size: 1.5rem;"></i>
                    <p class="mt-2 mb-0">No se encontraron resultados</p>
                </td>
            </tr>
        `;
        if (resultsCount) {
            resultsCount.textContent = "0 resultados";
        }
        return;
    }

    cryptos.forEach((crypto, index) => {
        const change = formatPriceChange(crypto.price_change_percentage_24h);

        const row = document.createElement("tr");
        row.setAttribute("data-crypto-id", crypto.id);
        row.style.cursor = "pointer";
        row.addEventListener("click", () => {
            window.location.href = `/crypto/${crypto.id}`;
        });
        row.innerHTML = `
            <td>
                <span class="ci-crypto-rank">${crypto.market_cap_rank || index + 1}</span>
            </td>
            <td>
                <div class="ci-crypto-name">
                    <img src="${crypto.image || ""}"
                         alt="${crypto.name}"
                         class="ci-crypto-icon"
                         loading="lazy"
                         onerror="this.style.display='none'">
                    <div>
                        <div class="ci-crypto-name-text">${crypto.name}</div>
                        <div class="ci-crypto-symbol">${crypto.symbol}</div>
                    </div>
                </div>
            </td>
            <td>
                <span class="ci-price">${formatPrice(crypto.current_price)}</span>
            </td>
            <td>
                <span class="${change.className}">${change.text}</span>
            </td>
            <td class="text-end">
                <span class="ci-market-cap">${formatLargeNumber(crypto.market_cap)}</span>
            </td>
            <td class="text-end">
                <span class="ci-volume">${formatLargeNumber(crypto.total_volume)}</span>
            </td>
        `;

        tbody.appendChild(row);
    });

    if (resultsCount) {
        resultsCount.textContent = `Mostrando ${cryptos.length} criptomoneda${cryptos.length !== 1 ? "s" : ""}`;
    }
}

// --- Búsqueda (RF04) ---

/**
 * Filtra las criptomonedas por nombre o símbolo.
 * RF04: Buscar una criptomoneda por nombre.
 * @param {string} query - Término de búsqueda.
 */
function filterCryptos(query) {
    const normalizedQuery = query.toLowerCase().trim();

    if (!normalizedQuery) {
        renderCryptoTable(allCryptos);
        return;
    }

    const filtered = allCryptos.filter(
        (crypto) =>
            crypto.name.toLowerCase().includes(normalizedQuery) ||
            crypto.symbol.toLowerCase().includes(normalizedQuery)
    );

    renderCryptoTable(filtered);
}

// --- Inicialización ---

document.addEventListener("DOMContentLoaded", function () {
    // Cargar criptomonedas al iniciar
    loadCryptos();

    // Búsqueda en tiempo real (RF04)
    const searchInput = document.getElementById("search-crypto");
    if (searchInput) {
        let searchTimeout;
        searchInput.addEventListener("input", function () {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                filterCryptos(this.value);
            }, 300); // Debounce de 300ms
        });
    }
});
