const express = require('express');
const app = express();
const cors = require('cors');
const PORT = 3000;

app.use(cors());
app.use(express.json());

const calculateTEandTR = (processes, quantum) => {
    let results = [];
    let currentTime = 0;
    let queue = [...processes]; // Copia de los procesos para procesar rondas
    let rounds = {}; // Para almacenar las rondas de cada proceso

    processes.forEach(process => {
        rounds[process.id] = []; // Inicializa las rondas para cada proceso
    });

    // Procesar las rondas
    while (queue.length > 0) {
        const process = queue.shift(); // Toma el primer proceso de la cola
        const { id, arrivalTime, burstTime } = process;
        const remainingTime = process.remainingTime || burstTime;

        // Si el proceso está listo para ejecutarse
        if (currentTime >= arrivalTime) {
            const start = currentTime; // Inicio de la ronda
            const executionTime = Math.min(quantum, remainingTime);
            const end = start + executionTime - 1; // Fin de la ronda

            currentTime = end + 1; // Avanza el tiempo actual al final + 1

            // Registra la ronda
            rounds[id].push({ start, end });

            // Si el proceso no ha terminado, actualiza y vuelve a la cola
            if (remainingTime > quantum) {
                queue.push({
                    ...process,
                    remainingTime: remainingTime - quantum,
                });
            } else {
                // Si el proceso termina, calcula TE y TR
                const processRounds = rounds[id];
                let TE = processRounds[0].start; // TE inicia con la primera ronda
                let operations = [`${processRounds[0].start}`]; // Detalla las operaciones

                if (processRounds.length > 1) {
                    const firstRoundEnd = processRounds[0].end;
                    const lastRoundStart = processRounds[processRounds.length - 1].start;

                    // Verificar si las últimas dos rondas son consecutivas
                    if (processRounds.length > 2 && lastRoundStart === processRounds[processRounds.length - 2].end + 1) {
                        const penultimateRoundStart = processRounds[processRounds.length - 2].start;
                        TE += penultimateRoundStart - firstRoundEnd;
                        operations.push(`+ (${penultimateRoundStart} - ${firstRoundEnd})`);
                    } else {
                        TE += lastRoundStart - firstRoundEnd;
                        operations.push(`+ (${lastRoundStart} - ${firstRoundEnd})`);
                    }
                }

                const TR = processRounds[processRounds.length - 1].end; // El final de la última ronda
                const detailedTE = `${operations.join(' ')} => ${TE}`; // Formatear detalle de TE

                results.push({ id, TE, detailedTE, TR, rounds: processRounds });
            }
        } else {
            // Si el proceso aún no está listo, reinsertarlo
            queue.push(process);
            currentTime++;
        }
    }

    const totalTE = results.reduce((sum, p) => sum + p.TE, 0);
    const totalTR = results.reduce((sum, p) => sum + p.TR, 0);
    const averageTE = totalTE / results.length;
    const averageTR = totalTR / results.length;

    const averageDetails = {
        TEProm: `TEProm = (${results.map(p => p.TE).join(' + ')}) / ${results.length} = ${averageTE.toFixed(2)}`,
        TRProm: `TRProm = (${results.map(p => p.TR).join(' + ')}) / ${results.length} = ${averageTR.toFixed(2)}`
    };

    return { results, averageTE, averageTR, averageDetails };
};

// Endpoint to calculate TE and TR
app.post('/calculate', (req, res) => {
    const { processes, quantum } = req.body;

    if (!processes || !Array.isArray(processes) || !quantum) {
        return res.status(400).json({ error: 'Invalid input data' });
    }

    const calculations = calculateTEandTR(processes, quantum);
    res.json(calculations);
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
