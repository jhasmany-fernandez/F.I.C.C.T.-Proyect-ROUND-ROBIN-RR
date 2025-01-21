// Frontend: script.js
document.getElementById('generate-table').addEventListener('click', () => {
    const processCount = parseInt(document.getElementById('process-count').value);
    const table = document.getElementById('process-table');
    const tbody = table.querySelector('tbody');

    tbody.innerHTML = '';

    for (let i = 0; i < processCount; i++) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>P${i + 1}</td>
            <td><input type="number" class="arrival-time" required></td>
            <td><input type="number" class="burst-time" required></td>
        `;
        tbody.appendChild(row);
    }

    table.style.display = 'table';
    document.getElementById('calculate').style.display = 'inline-block';
});

document.getElementById('calculate').addEventListener('click', async () => {
    const rows = document.querySelectorAll('#process-table tbody tr');
    const processes = [];
    const quantum = parseInt(document.getElementById('quantum').value);

    rows.forEach((row, index) => {
        const arrivalTime = parseInt(row.querySelector('.arrival-time').value);
        const burstTime = parseInt(row.querySelector('.burst-time').value);
        processes.push({ id: `P${index + 1}`, arrivalTime, burstTime });
    });

    const response = await fetch('http://localhost:3000/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ processes, quantum })
    });

    if (!response.ok) {
        alert("Error fetching data from the backend.");
        return;
    }

    let { results, averageTE, averageTR } = await response.json();

    // Ordenar resultados por ID
    results = results.sort((a, b) => a.id.localeCompare(b.id));

    const resultsBody = document.getElementById('results-body');
    resultsBody.innerHTML = '';

    results.forEach(({ id, detailedTE, TR, rounds }) => {
        const row = document.createElement('tr');
        const roundsText = rounds.map(r => `[${r.start}-${r.end}]`).join(', ');
        row.innerHTML = `
            <td>${id}</td>
            <td>${detailedTE}</td>
            <td>${TR}</td>
            <td>${roundsText}</td>
        `;
        resultsBody.appendChild(row);
    });
    
    

    document.getElementById('averages').textContent = `TEProm: ${averageTE.toFixed(2)}, TRProm: ${averageTR.toFixed(2)}`;
    document.getElementById('results').style.display = 'block';
});



