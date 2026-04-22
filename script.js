document.addEventListener('DOMContentLoaded', () => {
    // Custom Cursor Glow
    const cursorGlow = document.getElementById('cursor-glow');
    document.addEventListener('mousemove', (e) => {
        cursorGlow.style.left = e.clientX + 'px';
        cursorGlow.style.top = e.clientY + 'px';
    });

    // --- Data Model ---
    const mockData = [
        { id: 'REC-001', age: 'Adult', diagnosis: 'Diabetes' },
        { id: 'REC-002', age: 'Senior', diagnosis: 'Hypertension' },
        { id: 'REC-003', age: 'Adult', diagnosis: 'Hypertension' },
        { id: 'REC-004', age: 'Senior', diagnosis: 'Diabetes' },
        { id: 'REC-005', age: 'Child', diagnosis: 'Asthma' },
        { id: 'REC-006', age: 'Adult', diagnosis: 'Asthma' }
    ];

    let isEncrypted = false;
    let encryptedData = [];

    // --- UI Elements ---
    const dataTbody = document.getElementById('data-tbody');
    const btnEncrypt = document.getElementById('btn-encrypt');
    const panelQuery = document.getElementById('panel-query');
    const btnSearch = document.getElementById('btn-search');
    const terminalBody = document.getElementById('log-container');
    const resultContainer = document.getElementById('result-container');
    const resultTbody = document.getElementById('result-tbody');
    
    // Status Indicators
    const statusStorage = document.getElementById('status-storage');
    const statusQuery = document.getElementById('status-query');
    const statusPipeline = document.getElementById('status-pipeline');

    // --- Helper Functions ---
    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    const renderData = (tbody, dataList, enc) => {
        tbody.innerHTML = '';
        dataList.forEach(row => {
            const tr = document.createElement('tr');
            if(enc) {
                tr.innerHTML = `
                    <td class="enc-text">${row.id}</td>
                    <td class="enc-text">${row.age}</td>
                    <td class="enc-text">${row.diagnosis}</td>
                `;
            } else {
                tr.innerHTML = `
                    <td>${row.id}</td>
                    <td>${row.age}</td>
                    <td>${row.diagnosis}</td>
                `;
            }
            tbody.appendChild(tr);
        });
    };

    const addLog = (msg, type='info') => {
        const line = document.createElement('div');
        line.className = `log-entry log-${type}`;
        
        const time = new Date().toISOString().split('T')[1].substring(0, 8);
        line.innerHTML = `<span style="color:#6b6b80">[${time}]</span> ${msg}`;
        
        terminalBody.appendChild(line);
        terminalBody.scrollTop = terminalBody.scrollHeight;
    };

    // --- Initialization ---
    renderData(dataTbody, mockData, false);

    // --- Encrypt Action ---
    btnEncrypt.addEventListener('click', async () => {
        if(isEncrypted) return;
        
        btnEncrypt.disabled = true;
        btnEncrypt.innerHTML = '<span class="icon">⏳</span> Encrypting Data...';
        
        addLog('Initiating Paillier Encryption on Cloud Data Warehouse...', 'step');
        
        // Simulating Paillier encryption with hex transformation
        encryptedData = mockData.map(row => ({
            id: 'E_ID_' + btoa(row.id).substring(0, 8),
            age: '0x' + Array.from(row.age).map(c => c.charCodeAt(0).toString(16)).join(''),
            diagnosis: '0x' + Array.from(row.diagnosis).map(c => c.charCodeAt(0).toString(16)).join('')
        }));

        await sleep(800);
        addLog('Generating Hybrid Indexes (B+Tree, Inverted, Bitmap)...', 'info');
        
        await sleep(1000);
        isEncrypted = true;
        renderData(dataTbody, encryptedData, true);
        
        btnEncrypt.innerHTML = '<span class="icon">✅</span> Data Secured & Indexed';
        statusStorage.innerText = 'Status: Encrypted';
        statusStorage.style.color = 'var(--accent-cyan)';
        
        // Enable Query Panel
        panelQuery.classList.remove('disabled');
        btnSearch.disabled = false;
        statusQuery.innerText = 'Status: Ready for Search';
        statusQuery.style.color = 'var(--accent-purple)';
        
        addLog('Encryption & Indexing complete. Ready for secure queries.', 'success');
    });

    // --- Search Logic & Bitmap Computation ---
    btnSearch.addEventListener('click', async () => {
        btnSearch.disabled = true;
        resultContainer.classList.add('hidden');
        statusPipeline.innerText = 'Status: Executing Query';
        statusPipeline.style.color = 'var(--accent-green)';
        
        // Read Query Inputs
        const field1 = document.getElementById('q-field-1').value; // 'age' or 'diagnosis'
        const val1 = document.getElementById('q-val-1').value;
        const op = document.getElementById('q-op').value; // 'AND' or 'OR'
        const field2 = document.getElementById('q-field-2').value;
        const val2 = document.getElementById('q-val-2').value;

        addLog(`--- NEW QUERY REQUEST ---`, 'step');
        addLog(`Constructing Boolean Query: (${field1} = ${val1}) ${op} (${field2} = ${val2})`, 'info');
        
        await sleep(800);
        // Trapdoor Generation
        const trapdoorHash = 'T_' + Array.from(val1+val2).map(c => c.charCodeAt(0).toString(16)).join('');
        addLog(`Generating Encrypted Trapdoor: <span class="log-hash">${trapdoorHash}</span>`, 'info');
        
        await sleep(800);
        addLog(`Verifying Query Authentication via Blockchain Smart Contract...`, 'step');
        await sleep(800);
        addLog(`Signature Verified. Permission: GRANTED.`, 'success');

        await sleep(800);
        addLog(`Forwarding Trapdoor to Proxy Server for Hybrid Index Search...`, 'step');

        // Dynamic Bitmap Calculation Logic
        const generateBitmap = (field, targetVal) => {
            return mockData.map(record => record[field] === targetVal ? 1 : 0);
        };

        const bm1 = generateBitmap(field1, val1);
        const bm2 = generateBitmap(field2, val2);

        await sleep(1000);
        addLog(`[B+Tree] Narrowing multi-dimensional space bounds.`, 'info');
        await sleep(800);
        addLog(`[Inverted Index] Locating document mappings for Trapdoor keywords.`, 'info');
        
        await sleep(800);
        addLog(`[Bitmap Index] Executing Secure Boolean Math on Proxy:`, 'step');
        addLog(`Bitmap 1 (${val1}): [${bm1.join(', ')}]`, 'log-bit');
        addLog(`Bitmap 2 (${val2}): [${bm2.join(', ')}]`, 'log-bit');
        addLog(`Operator: ${op}`, 'log-bit');

        let resultBm = [];
        for(let i=0; i<mockData.length; i++) {
            if(op === 'AND') resultBm.push(bm1[i] & bm2[i]);
            else resultBm.push(bm1[i] | bm2[i]);
        }

        await sleep(1000);
        addLog(`Result Bitmap:    [${resultBm.join(', ')}]`, 'log-bit');

        let matchedIndices = [];
        for(let i=0; i<resultBm.length; i++){
            if(resultBm[i] === 1) matchedIndices.push(i);
        }

        await sleep(800);
        if(matchedIndices.length > 0) {
            addLog(`Found ${matchedIndices.length} matching encrypted records. Fetching from storage...`, 'info');
            
            await sleep(800);
            addLog(`Blockchain Integrity Check (SHA-256 validation)... ✓ PASSED`, 'success');
            
            await sleep(800);
            addLog(`Returning ciphertext to Data User for local decryption...`, 'step');
            
            await sleep(800);
            // Render Results
            const decryptedResults = matchedIndices.map(idx => mockData[idx]);
            renderData(resultTbody, decryptedResults, false);
            resultContainer.classList.remove('hidden');
            
            addLog(`Decryption successful. Displaying records.`, 'success');
        } else {
            addLog(`No records matched the provided Trapdoor.`, 'error');
        }

        statusPipeline.innerText = 'Status: Idle';
        statusPipeline.style.color = 'var(--text-muted)';
        btnSearch.disabled = false;
    });
});
