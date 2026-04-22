document.addEventListener('DOMContentLoaded', () => {
    // Custom Cursor Glow
    const cursorGlow = document.getElementById('cursor-glow');
    document.addEventListener('mousemove', (e) => {
        cursorGlow.style.left = e.clientX + 'px';
        cursorGlow.style.top = e.clientY + 'px';
    });

    // --- Data Model ---
    const generateMockData = (count) => {
        const ages = ['Adult', 'Senior', 'Child', 'Teenager'];
        const diagnoses = ['Diabetes', 'Hypertension', 'Asthma', 'Healthy', 'Anemia', 'Migraine'];
        let data = [];
        for(let i = 1; i <= count; i++) {
            data.push({
                id: 'REC-' + i.toString().padStart(3, '0'),
                age: ages[Math.floor(Math.random() * ages.length)],
                diagnosis: diagnoses[Math.floor(Math.random() * diagnoses.length)]
            });
        }
        return data;
    };
    
    const TOTAL_DATASET_SIZE = 38000;
    const SAMPLE_SIZE = 50;
    // Keep an interactive sample visible while reflecting research-scale metadata.
    const mockData = generateMockData(SAMPLE_SIZE);

    let isEncrypted = false;
    let isShowingPlaintext = true;
    let encryptedData = [];

    // --- UI Elements ---
    const dataTbody = document.getElementById('data-tbody');
    const btnEncrypt = document.getElementById('btn-encrypt');
    const btnToggleData = document.getElementById('btn-toggle-data');
    const panelQuery = document.getElementById('panel-query');
    const btnSearch = document.getElementById('btn-search');
    const terminalBody = document.getElementById('log-container');
    const resultContainer = document.getElementById('result-container');
    const resultTbody = document.getElementById('result-tbody');
    const datasetFilter = document.getElementById('dataset-filter');
    const btnExportCsv = document.getElementById('btn-export-csv');
    const recordCount = document.getElementById('record-count');
    const metaTotalRecords = document.getElementById('meta-total-records');
    const metaSampleSize = document.getElementById('meta-sample-size');
    const metaDistinctDiagnosis = document.getElementById('meta-distinct-diagnosis');
    const metaAdultSeniorShare = document.getElementById('meta-adult-senior-share');
    
    // Status Indicators
    const statusStorage = document.getElementById('status-storage');
    const statusQuery = document.getElementById('status-query');
    const statusPipeline = document.getElementById('status-pipeline');
    let activeDataView = [...mockData];

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

    const updateDatasetStats = (dataList) => {
        const distinctDiagnosisCount = new Set(dataList.map((item) => item.diagnosis)).size;
        const adultSeniorCount = dataList.filter((item) => item.age === 'Adult' || item.age === 'Senior').length;
        const adultSeniorShare = dataList.length === 0 ? 0 : Math.round((adultSeniorCount / dataList.length) * 100);

        recordCount.innerText = `Showing: ${dataList.length} / ${TOTAL_DATASET_SIZE}`;
        metaTotalRecords.innerText = TOTAL_DATASET_SIZE.toLocaleString();
        metaSampleSize.innerText = SAMPLE_SIZE.toString();
        metaDistinctDiagnosis.innerText = distinctDiagnosisCount.toString();
        metaAdultSeniorShare.innerText = `${adultSeniorShare}%`;
    };

    const populateDatasetFilter = () => {
        const uniqueDiagnoses = [...new Set(mockData.map((item) => item.diagnosis))].sort();
        uniqueDiagnoses.forEach((diagnosis) => {
            const opt = document.createElement('option');
            opt.value = diagnosis;
            opt.innerText = diagnosis;
            datasetFilter.appendChild(opt);
        });
    };

    const applyDatasetFilter = () => {
        const filterValue = datasetFilter.value;
        const sourceData = (isEncrypted && !isShowingPlaintext) ? encryptedData : mockData;
        if (filterValue === 'ALL') {
            activeDataView = [...sourceData];
        } else {
            activeDataView = sourceData.filter((item) => (item.originalDiagnosis || item.diagnosis) === filterValue);
        }
        renderData(dataTbody, activeDataView, isEncrypted && !isShowingPlaintext);
        updateDatasetStats(activeDataView);
    };

    const exportCurrentViewAsCsv = () => {
        if (activeDataView.length === 0) {
            addLog('CSV export skipped: current dataset view is empty.', 'error');
            return;
        }
        const rows = [
            ['Record ID', 'Age Group', 'Diagnosis'],
            ...activeDataView.map((row) => [row.id, row.age, row.diagnosis])
        ];
        const csvString = rows.map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n');
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `simulated-medical-records-${Date.now()}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        addLog(`Exported ${activeDataView.length} records to CSV from current view.`, 'success');
    };

    // --- Initialization ---
    renderData(dataTbody, mockData, false);
    populateDatasetFilter();
    updateDatasetStats(mockData);

    // --- Dynamic Dropdowns Logic ---
    const field1 = document.getElementById('q-field-1');
    const val1 = document.getElementById('q-val-1');
    const field2 = document.getElementById('q-field-2');
    const val2 = document.getElementById('q-val-2');

    const populateValues = (fieldSelect, valSelect) => {
        const field = fieldSelect.value;
        valSelect.innerHTML = '';
        const uniqueValues = [...new Set(mockData.map(item => item[field]))];
        uniqueValues.forEach(val => {
            const opt = document.createElement('option');
            opt.value = val;
            opt.innerText = val;
            valSelect.appendChild(opt);
        });
    };

    field1.addEventListener('change', () => populateValues(field1, val1));
    field2.addEventListener('change', () => populateValues(field2, val2));
    datasetFilter.addEventListener('change', applyDatasetFilter);
    btnExportCsv.addEventListener('click', exportCurrentViewAsCsv);
    
    // Initialize default dropdown options
    populateValues(field1, val1);
    populateValues(field2, val2);

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
            diagnosis: '0x' + Array.from(row.diagnosis).map(c => c.charCodeAt(0).toString(16)).join(''),
            originalDiagnosis: row.diagnosis
        }));

        await sleep(800);
        addLog('Generating Hybrid Indexes (B+Tree, Inverted, Bitmap)...', 'info');
        
        await sleep(1000);
        isEncrypted = true;
        isShowingPlaintext = false;
        applyDatasetFilter();
        
        btnEncrypt.innerHTML = '<span class="icon">✅</span> Data Secured & Indexed';
        btnEncrypt.disabled = true; // completely disable encrypt once done
        
        btnToggleData.classList.remove('hidden');
        
        statusStorage.innerText = 'Status: Encrypted';
        statusStorage.style.color = 'var(--accent-cyan)';
        
        // Enable Query Panel
        panelQuery.classList.remove('disabled');
        btnSearch.disabled = false;
        statusQuery.innerText = 'Status: Ready for Search';
        statusQuery.style.color = 'var(--accent-purple)';
        
        addLog('Encryption & Indexing complete. Ready for secure queries.', 'success');
    });

    // --- Toggle Plaintext/Encrypted Action ---
    btnToggleData.addEventListener('click', () => {
        if (!isEncrypted) return;
        
        isShowingPlaintext = !isShowingPlaintext;
        if (isShowingPlaintext) {
            applyDatasetFilter();
            btnToggleData.innerHTML = '<span class="icon">🔒</span> View Encrypted State';
            statusStorage.innerText = 'Status: Plaintext Mode (Viewer)';
            statusStorage.style.color = 'var(--text-muted)';
        } else {
            applyDatasetFilter();
            btnToggleData.innerHTML = '<span class="icon">👁️</span> View Original Plaintext';
            statusStorage.innerText = 'Status: Encrypted';
            statusStorage.style.color = 'var(--accent-cyan)';
        }
    });

    // --- Search Logic & Bitmap Computation ---
    btnSearch.addEventListener('click', async () => {
        btnSearch.disabled = true;
        resultContainer.classList.add('hidden');
        statusPipeline.innerText = 'Status: Executing Query';
        statusPipeline.style.color = 'var(--accent-green)';
        
        // Auto-scroll to pipeline on smaller screens
        document.getElementById('panel-pipeline').scrollIntoView({ behavior: 'smooth', block: 'start' });

        // Read Query Inputs
        const field1Val = document.getElementById('q-field-1').value; // 'age' or 'diagnosis'
        const targetVal1 = document.getElementById('q-val-1').value;
        const op = document.getElementById('q-op').value; // 'AND' or 'OR'
        const field2Val = document.getElementById('q-field-2').value;
        const targetVal2 = document.getElementById('q-val-2').value;

        addLog(`--- NEW QUERY REQUEST ---`, 'step');
        addLog(`Constructing Boolean Query: (${field1Val} = ${targetVal1}) ${op} (${field2Val} = ${targetVal2})`, 'info');
        
        await sleep(800);
        // Trapdoor Generation
        const trapdoorHash = 'T_' + Array.from(targetVal1+targetVal2).map(c => c.charCodeAt(0).toString(16)).join('');
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

        const bm1 = generateBitmap(field1Val, targetVal1);
        const bm2 = generateBitmap(field2Val, targetVal2);

        await sleep(1000);
        addLog(`[B+Tree] Narrowing multi-dimensional space bounds.`, 'info');
        await sleep(800);
        addLog(`[Inverted Index] Locating document mappings for Trapdoor keywords.`, 'info');
        
        await sleep(800);
        addLog(`[Bitmap Index] Executing Secure Boolean Math on Proxy:`, 'step');
        addLog(`Bitmap 1 (${targetVal1}): [${bm1.join(', ')}]`, 'log-bit');
        addLog(`Bitmap 2 (${targetVal2}): [${bm2.join(', ')}]`, 'log-bit');
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
