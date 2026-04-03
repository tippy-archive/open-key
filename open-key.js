const inputArea = document.getElementById('inputText');
const resultArea = document.getElementById('result');

inputArea.addEventListener('input', calculateHash);

async function calculateHash() {
    const text = inputArea.value;
    if (!text) {
        resultArea.innerText = '여기에 해시값이 표시됩니다.';
        return;
    }

    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const hashBuffer = await crypto.subtle.digest('SHA-384', data);

    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    resultArea.innerText = hashHex.toUpperCase();
}

function clearText() {
    inputArea.value = '';
    resultArea.innerText = '여기에 해시값이 표시됩니다.';
}

function copyHash() {
    const resultText = resultArea.innerText;
    const originalText = inputArea.value;

    if (resultText.startsWith('여기') || !originalText) return;

    navigator.clipboard.writeText(resultText).then(() => {
        const tempText = resultArea.innerText;
        resultArea.innerText = "복사 완료!";
        setTimeout(() => resultArea.innerText = tempText, 1000);
    });
}

async function loadCSV() {
    try {
        const response = await fetch('open-key.csv');
        const data = await response.text();

        const rows = data.split('\n').slice(1);
        const tableBody = document.getElementById('table-body');

        rows.forEach(row => {
            const columns = row.split(',');
            if (columns.length < 2) return;

            const name = columns[0].trim();
            const key = columns[1].trim();

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${name}</td>
                <td>
                    <span class="public-key" onclick="copyText('${key}', this)">${key}</span>
                </td>
            `;
            tableBody.appendChild(tr);
        });
    } catch (error) {
        console.error('CSV를 불러오는데 실패했습니다:', error);
    }
}

function copyText(text, element) {
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