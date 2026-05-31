const inputArea = document.getElementById('inputText');
const resultArea = document.getElementById('result');

let currentHash = ''; 

inputArea.addEventListener('input', calculateHash);

async function calculateHash() {
    const text = inputArea.value;
    if (!text) {
        resultArea.innerText = '여기에 해시값이 표시됩니다.';
        currentHash = '';
        return;
    }

    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const hashBuffer = await crypto.subtle.digest('SHA-384', data);

    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    currentHash = hashHex.toUpperCase();
    resultArea.innerText = currentHash;
}

function clearText() {
    inputArea.value = '';
    resultArea.innerText = '여기에 해시값이 표시됩니다.';
    currentHash = '';
}

function copyHash() {
    if (!currentHash) return; 

    navigator.clipboard.writeText(currentHash).then(() => {
        if (resultArea.innerText === "복사 완료!") return;

        const tempText = resultArea.innerText;
        resultArea.innerText = "복사 완료!";
        
        setTimeout(() => {
            resultArea.innerText = currentHash || '여기에 해시값이 표시됩니다.';
        }, 1000);
    });
}

async function loadCSV() {
    try {
        const response = await fetch('open-key.csv');
        const data = await response.text();

        const rows = data.split('\n').slice(1);
        const container = document.getElementById('category-container');
        container.innerHTML = ''; 

        const groups = { '1': [], '2': [], '3': [], '4': [] };

        rows.forEach(row => {
            if (!row.trim()) return;
            const columns = row.split(',');
            if (columns.length < 3) return;

            const category = columns[0].trim();
            const name = columns[1].trim();
            const key = columns[2].trim();

            if (groups[category]) {
                groups[category].push({ name, key });
            }
        });

        const categoryNames = {
            '1': 'Tippy Archive',
            '2': 'Inori Archive',
            '3': 'Tippy Account',
            '4': 'korsugarrush'
        };

        Object.keys(groups).forEach(catId => {
            const list = groups[catId];
            if (list.length === 0) return;

            const btn = document.createElement('button');
            btn.className = 'category-btn';
            btn.innerHTML = `<span>${categoryNames[catId] || '그룹 ' + catId} (${list.length})</span> <span class="arrow">▼</span>`;

            const contentDiv = document.createElement('div');
            contentDiv.className = 'category-content';
            contentDiv.style.display = 'none';

            btn.onclick = () => {
                const isHidden = contentDiv.style.display === 'none';
                contentDiv.style.display = isHidden ? 'block' : 'none';
                btn.classList.toggle('active', isHidden);
                btn.querySelector('.arrow').innerText = isHidden ? '▲' : '▼';
            };

            const table = document.createElement('table');
            table.innerHTML = `
                <thead>
                    <tr>
                        <th style="width: 30%;">계정</th>
                        <th style="width: 70%;">공개키</th>
                    </tr>
                </thead>
                <tbody></tbody>
            `;
            const tbody = table.querySelector('tbody');

            list.forEach(item => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${item.name}</td>
                    <td>
                        <span class="public-key" onclick="copyText('${item.key}', this)">${item.key || '-'}</span>
                    </td>
                `;
                tbody.appendChild(tr);
            });

            contentDiv.appendChild(table);
            container.appendChild(btn);
            container.appendChild(contentDiv);
        });

    } catch (error) {
        console.error('CSV를 불러오는데 실패했습니다:', error);
    }
}

function copyText(text, element) {
    if (!text || text === '-') return;
    navigator.clipboard.writeText(text).then(() => {
        const originalText = element.innerText;
        element.innerText = "복사 완료!";
        element.style.color = "#28a745";

        setTimeout(() => {
            element.innerText = originalText;
            element.style.color = "";
        }, 1000);
    }).catch(err => {
        console.error('복사 실패:', err);
    });
}

loadCSV();