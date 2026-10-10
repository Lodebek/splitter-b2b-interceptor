document.addEventListener('DOMContentLoaded', () => {
    loadSuppliers();

    document.getElementById('detectBtn').addEventListener('click', () => {
        document.getElementById('addForm').style.display = 'block';
        document.getElementById('detectBtn').style.display = 'none';
    });

    document.getElementById('saveSupplierBtn').addEventListener('click', () => {
        const storeName = document.getElementById('storeName').value;
        const searchTerm = document.getElementById('searchTerm').value;

        if (!storeName || !searchTerm) {
            alert('Please fill out both fields.');
            return;
        }

        // Get the current tab's URL
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            let currentUrl = tabs[0].url;
            
            if (!currentUrl.toLowerCase().includes(searchTerm.toLowerCase())) {
                alert(Could not find " + searchTerm + " in the current URL.\n\nMake sure you are on the search results page!);
                return;
            }

            // Replace search term with {query}
            const regex = new RegExp(searchTerm, "gi");
            const template = currentUrl.replace(regex, '{query}');

            const newSupplier = {
                id: 'custom_' + Date.now(),
                name: storeName,
                template: template
            };

            chrome.storage.sync.get({ customSuppliers: [] }, (data) => {
                const suppliers = data.customSuppliers;
                suppliers.push(newSupplier);
                chrome.storage.sync.set({ customSuppliers: suppliers }, () => {
                    document.getElementById('storeName').value = '';
                    document.getElementById('searchTerm').value = '';
                    document.getElementById('addForm').style.display = 'none';
                    document.getElementById('detectBtn').style.display = 'block';
                    loadSuppliers();
                });
            });
        });
    });
});

function loadSuppliers() {
    const list = document.getElementById('supplierList');
    list.innerHTML = '';

    list.innerHTML += 
        <div class="supplier-item">
            <span class="supplier-name">SupplyHouse</span>
            <span style="color: #188038; font-size: 11px; font-weight: bold;">Built-in</span>
        </div>
        <div class="supplier-item">
            <span class="supplier-name">Ferguson</span>
            <span style="color: #188038; font-size: 11px; font-weight: bold;">Built-in</span>
        </div>
    ;

    chrome.storage.sync.get({ customSuppliers: [] }, (data) => {
        data.customSuppliers.forEach(sup => {
            const div = document.createElement('div');
            div.className = 'supplier-item';
            
            const nameSpan = document.createElement('span');
            nameSpan.className = 'supplier-name';
            nameSpan.textContent = sup.name;

            const delBtn = document.createElement('button');
            delBtn.className = 'btn btn-danger';
            delBtn.textContent = 'Remove';
            delBtn.onclick = () => removeSupplier(sup.id);

            div.appendChild(nameSpan);
            div.appendChild(delBtn);
            list.appendChild(div);
        });
    });
}

function removeSupplier(id) {
    chrome.storage.sync.get({ customSuppliers: [] }, (data) => {
        const filtered = data.customSuppliers.filter(s => s.id !== id);
        chrome.storage.sync.set({ customSuppliers: filtered }, () => {
            loadSuppliers();
        });
    });
}
