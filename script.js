document.addEventListener('DOMContentLoaded', () => {
    // Custom Cursor Glow Effect
    const cursorGlow = document.getElementById('cursor-glow');
    
    document.addEventListener('mousemove', (e) => {
        cursorGlow.style.left = e.clientX + 'px';
        cursorGlow.style.top = e.clientY + 'px';
    });

    // Interactive element hover effect for cursor
    const interactiveElements = document.querySelectorAll('a, .glass');
    
    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursorGlow.style.background = 'radial-gradient(circle, var(--glow-purple) 0%, transparent 70%)';
            cursorGlow.style.transform = 'translate(-50%, -50%) scale(1.5)';
        });
        
        el.addEventListener('mouseleave', () => {
            cursorGlow.style.background = 'radial-gradient(circle, var(--glow-cyan) 0%, transparent 70%)';
            cursorGlow.style.transform = 'translate(-50%, -50%) scale(1)';
        });
    });

    // Scroll Reveal Animation
    const reveals = document.querySelectorAll('.reveal');

    const revealOnScroll = () => {
        const windowHeight = window.innerHeight;
        const elementVisible = 150;

        reveals.forEach(reveal => {
            const elementTop = reveal.getBoundingClientRect().top;
            
            if (elementTop < windowHeight - elementVisible) {
                reveal.classList.add('active');
            }
        });
    };

    window.addEventListener('scroll', revealOnScroll);
    
    // Trigger once on load
    revealOnScroll();

    // Glitch Text Effect
    const glitchText = document.querySelector('.glitch');
    
    setInterval(() => {
        if(Math.random() > 0.95) {
            glitchText.style.transform = `translate(${Math.random() * 4 - 2}px, ${Math.random() * 4 - 2}px)`;
            glitchText.style.textShadow = `
                ${Math.random() * 10 - 5}px 0 rgba(0, 240, 255, 0.5),
                ${Math.random() * 10 - 5}px 0 rgba(138, 43, 226, 0.5)
            `;
            
            setTimeout(() => {
                glitchText.style.transform = 'translate(0, 0)';
                glitchText.style.textShadow = 'none';
            }, 100);
        }
    // --- Interactive Demo Simulation Logic ---
    const mockData = [
        { id: 'REC-001', age: 'Adult', diagnosis: 'Diabetes' },
        { id: 'REC-002', age: 'Senior', diagnosis: 'Hypertension' },
        { id: 'REC-003', age: 'Adult', diagnosis: 'Hypertension' },
        { id: 'REC-004', age: 'Senior', diagnosis: 'Diabetes' }
    ];

    let isEncrypted = false;
    let encryptedData = [];
    
    // UI Elements
    const tbody = document.getElementById('demo-tbody');
    const btnEncrypt = document.getElementById('btn-encrypt');
    const btnSearch = document.getElementById('btn-search');
    const pipeline = document.getElementById('execution-pipeline');
    const logContainer = document.getElementById('log-container');

    // Render Table
    const renderTable = (data, isEnc) => {
        tbody.innerHTML = '';
        data.forEach(row => {
            const tr = document.createElement('tr');
            if(isEnc) {
                tr.innerHTML = `
                    <td class="log-enc">${row.id}</td>
                    <td class="log-enc">${row.age}</td>
                    <td class="log-enc">${row.diagnosis}</td>
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

    renderTable(mockData, false);

    // Helper: Delay for animation
    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    // Helper: Log message
    const addLog = (msg, type='info') => {
        const p = document.createElement('div');
        p.className = `log-entry log-${type}`;
        p.innerHTML = `> ${msg}`;
        logContainer.appendChild(p);
        logContainer.scrollTop = logContainer.scrollHeight;
    };

    // Encrypt Action
    btnEncrypt.addEventListener('click', async () => {
        btnEncrypt.disabled = true;
        btnEncrypt.innerText = "Encrypting...";
        
        // Simulate Paillier Encryption
        encryptedData = mockData.map(row => ({
            id: 'E_ID_' + btoa(row.id).substring(0, 8),
            age: '0x' + Array.from(row.age).map(c => c.charCodeAt(0).toString(16)).join(''),
            diagnosis: '0x' + Array.from(row.diagnosis).map(c => c.charCodeAt(0).toString(16)).join('')
        }));

        await sleep(1000);
        isEncrypted = true;
        renderTable(encryptedData, true);
        btnEncrypt.innerText = "Data Encrypted & Indexed";
        btnSearch.disabled = false;
    });

    // Search Action
    btnSearch.addEventListener('click', async () => {
        if(!isEncrypted) return;
        
        btnSearch.disabled = true;
        pipeline.classList.remove('hidden');
        logContainer.innerHTML = '';

        const field1 = document.getElementById('query-field-1').value;
        const val1 = document.getElementById('query-val-1').value;
        const op = document.getElementById('query-op').value;
        const field2 = document.getElementById('query-field-2').value;
        const val2 = document.getElementById('query-val-2').value;

        addLog(`User submitted Boolean Query: (${field1} = ${val1}) ${op} (${field2} = ${val2})`, 'info');
        
        await sleep(800);
        addLog(`Generating Encrypted Trapdoor using Paillier Public Key...`, 'info');
        const trapdoor = 'T_REQ_' + Math.random().toString(36).substring(2, 10).toUpperCase();
        addLog(`Trapdoor sent to Proxy: <span class="log-enc">${trapdoor}</span>`, 'enc');

        await sleep(1000);
        addLog(`Blockchain Smart Contract verifying Query Auth...`, 'info');
        addLog(`✓ Identity & Query Format Verified (Hash matched)`, 'success');

        await sleep(1000);
        addLog(`Proxy initiating Hybrid Index Search...`, 'info');
        
        await sleep(800);
        addLog(`[B+Tree] Narrowing search space... (Range verified)`, 'info');
        
        await sleep(800);
        addLog(`[Inverted Index] Locating Document IDs for keywords...`, 'info');
        
        // Hardcoded bitwise maps mapping exactly to the 4 mock records
        // index 0: REC-001 (Adult, Diabetes)
        // index 1: REC-002 (Senior, Hypertension)
        // index 2: REC-003 (Adult, Hypertension)
        // index 3: REC-004 (Senior, Diabetes)
        const getBitMap = (val) => {
            if(val === 'Adult') return [1,0,1,0];
            if(val === 'Senior') return [0,1,0,1];
            if(val === 'Diabetes') return [1,0,0,1];
            if(val === 'Hypertension') return [0,1,1,0];
            return [0,0,0,0];
        };

        const bm1 = getBitMap(val1);
        const bm2 = getBitMap(val2);
        
        await sleep(800);
        addLog(`[Bitmap Index] Processing Boolean ${op}...`, 'bit');
        addLog(`Bitmap 1 (${val1}): [${bm1.join(', ')}]`, 'bit');
        addLog(`Bitmap 2 (${val2}): [${bm2.join(', ')}]`, 'bit');
        
        let resBm = [];
        for(let i=0; i<4; i++){
            if(op === 'AND') resBm.push(bm1[i] & bm2[i]);
            else resBm.push(bm1[i] | bm2[i]);
        }
        
        await sleep(1000);
        addLog(`Result Bitmap:    [${resBm.join(', ')}]`, 'bit');

        let matchedIds = [];
        for(let i=0; i<4; i++){
            if(resBm[i] === 1) matchedIds.push(mockData[i].id);
        }

        await sleep(800);
        if(matchedIds.length > 0) {
            addLog(`Found ${matchedIds.length} encrypted record(s). Retrieving from cloud...`, 'info');
            await sleep(800);
            addLog(`Blockchain verifying Result Integrity (SHA-256)... ✓ Verified`, 'success');
            await sleep(800);
            addLog(`Decrypting results using Private Key...`, 'info');
            await sleep(800);
            matchedIds.forEach(id => {
                const rec = mockData.find(m => m.id === id);
                addLog(`Result: ID: ${rec.id} | Age: ${rec.age} | Diagnosis: ${rec.diagnosis}`, 'success');
            });
        } else {
            addLog(`No records matched the query.`, 'warn');
        }
        
        btnSearch.disabled = false;
    });
});
