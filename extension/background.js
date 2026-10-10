// background.js

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'searchSuppliers') {
        const query = request.query;
        
        // MVP: Simulate searching across configured accounts.
        // In a real production extension, we would use fetch() to request the search pages
        // of SupplyHouse, Ferguson, etc., and parse the HTML to find the top result.
        // For MVP, construct the correct search URLs and simulate a delay
        const encodedQuery = encodeURIComponent(query);
        
        const supplyHouseUrl = `https://www.supplyhouse.com/search?q=${encodedQuery}`;
        const fergusonUrl = `https://www.ferguson.com/search?q=${encodedQuery}`;
        const amazonUrl = `https://www.amazon.com/s?k=${encodedQuery}`;

        // Get the custom suppliers the user has added
        chrome.storage.sync.get({ customSuppliers: [] }, (data) => {
            const customSuppliers = data.customSuppliers;
            
            // Generate universal mock results for the custom suppliers
            const customResults = customSuppliers.map(sup => {
                return {
                    vendor: sup.name,
                    price: "Check site", // Universal parsing via JSON-LD in real app
                    inStock: true,
                    url: sup.template.replace('{query}', encodedQuery)
                };
            });

            // Simulate network delay
            setTimeout(() => {
                let results;

                if (query.toLowerCase().includes('90-370')) {
                    results = [
                        { vendor: "SupplyHouse", price: "$8.95", inStock: true, url: "https://www.supplyhouse.com/White-Rodgers-90-370-Fan-Relay-Type-184-24-VAC-Coil-14301000-p" },
                        { vendor: "Ferguson", price: "$12.50", inStock: true, url: "https://www.ferguson.com/product/white-rodgers-90-370-fan-relay-type-184-24-vac-coil/14301000.html" },
                        { vendor: "Amazon Biz", price: "$13.65", inStock: true, url: amazonUrl }
                    ];
                } else {
                    results = [
                        { vendor: "SupplyHouse", price: "$134.50", inStock: true, url: supplyHouseUrl },
                        { vendor: "Ferguson", price: "$142.00", inStock: true, url: fergusonUrl },
                        { vendor: "Amazon Biz", price: null, inStock: false, url: amazonUrl }
                    ];
                }

                // Merge the custom added suppliers!
                results = [...results, ...customResults];

                sendResponse({ results: results });
            }, 800);
        });

        // Return true to indicate we wish to send a response asynchronously
        return true; 
    }
});
