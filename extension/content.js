// content.js - Injected into Google Search results

function getSearchQuery() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('q');
}

function injectSplitterUI(query) {
    // Check if it already exists
    if (document.getElementById('splitter-container')) return;

    // Instead of fighting Google's DOM, we append a floating overlay directly to the body
    const body = document.body;
    if (!body) return;

    const container = document.createElement('div');
    container.id = 'splitter-container';
    
    const header = document.createElement('div');
    header.className = 'splitter-header';
    header.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center;">
            <div class="splitter-title">⚡ Splitter</div>
            <button id="splitter-close" style="background: none; border: none; cursor: pointer; font-size: 16px; color: #5f6368;">&times;</button>
        </div>
        <div class="splitter-subtitle">Checking preferred accounts for: <strong>${query}</strong></div>
    `;
    
    const resultsArea = document.createElement('div');
    resultsArea.id = 'splitter-results';
    resultsArea.innerHTML = '<div class="splitter-loading">Searching suppliers...</div>';

    container.appendChild(header);
    container.appendChild(resultsArea);

    // Append to body as a floating widget
    body.appendChild(container);

    // Add close functionality
    document.getElementById('splitter-close').addEventListener('click', () => {
        container.remove();
    });

    // Send message to background script to perform the searches
    chrome.runtime.sendMessage({ action: 'searchSuppliers', query: query }, (response) => {
        if (response && response.results) {
            renderResults(response.results);
        } else {
            resultsArea.innerHTML = '<div class="splitter-error">Failed to fetch from suppliers.</div>';
        }
    });
}

function renderResults(results) {
    const resultsArea = document.getElementById('splitter-results');
    resultsArea.innerHTML = ''; // clear loading

    results.forEach(res => {
        const item = document.createElement('div');
        item.className = 'splitter-result-item';
        
        let priceHtml = res.price ? `<span class="splitter-price">${res.price}</span>` : `<span class="splitter-price-unknown">See site for price</span>`;
        let stockHtml = res.inStock ? `<span class="splitter-stock in-stock">✓ In Stock</span>` : `<span class="splitter-stock unknown">Check Stock</span>`;
        
        item.innerHTML = `
            <div class="splitter-vendor">${res.vendor}</div>
            <div class="splitter-details">
                ${priceHtml}
                ${stockHtml}
                <a href="${res.url}" target="_blank" class="splitter-btn">View on ${res.vendor}</a>
            </div>
        `;
        resultsArea.appendChild(item);
    });
}

const query = getSearchQuery();
if (query) {
    // Basic heuristics to see if this is a product search (e.g., contains specific words or part numbers).
    // For MVP, we'll just run it for all searches to prove the concept, or filter slightly.
    injectSplitterUI(query);
}
