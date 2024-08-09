const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const Pi = 3.14;
const Psi = 6.84845;
const ZetaMap = {
    'a': 3.21,
    'b': 4.1,
    'c': 6.8
};

// Helper functions for calculations
const calculateTwoParams = (first, second) => {
    const avg = (first + second) / 2;
    const result = (Pi * Pi * first) + (Psi * (2.44 + Math.pow(second, 3 / 2)) * 3);
    return { avg: avg.toFixed(3), result: result.toFixed(3) };
};

const calculateThreeParams = (first, second, third) => {
    const zeta = ZetaMap[third] || ZetaMap['a'];
    const avg = (first + second) / 2;
    const result = (Pi * Pi * first * Pi) + (Psi * (2.44 + Math.pow(second, 3 / 2)) * 3) + (zeta / second) * Math.log(zeta);
    return { avg: avg.toFixed(3), result: result.toFixed(3) };
};

app.post('/process', (req, res) => {
    const data = req.body.data.split('\n').filter(line => line.trim() !== '');
    const numberOfSamples = parseInt(data[0], 10);
    const results = [];
    const errors = [];
    let currentIndex = 1;

    for (let i = 0; i < numberOfSamples; i++) {
        if (!data[currentIndex]) {
            errors.push({ error: `Missing control record at expected line ${currentIndex + 1}` });
            continue;
        }

        // Remove all spaces from the control record line
        const controlRecordLine = data[currentIndex].replace(/\s+/g, '');
        const controlRecord = [controlRecordLine[0], controlRecordLine.slice(1, 2), controlRecordLine.slice(2)];

        if (controlRecord[0] !== '*' || controlRecord.length !== 3) {
            errors.push({ error: `Invalid control record at line ${currentIndex + 1}`, line: currentIndex + 1 });
            currentIndex += parseInt(controlRecord[1], 10) + 1;  // Skip to the next group
            continue;  // Skip to the next group of records
        }

        const numRecords = parseInt(controlRecord[1], 10);
        const numElements = parseInt(controlRecord[2], 10);

        if (isNaN(numRecords) || isNaN(numElements)) {
            errors.push({ error: `Invalid number format in control record at line ${currentIndex + 1}`, line: currentIndex + 1 });
            currentIndex += numRecords + 1;  // Skip to the next group
            continue;
        }

        const groupResults = [];
        let totalAvg = 0;

        for (let j = 0; j < numRecords; j++) {
            const recordIndex = currentIndex + 1 + j;
            if (!data[recordIndex]) {
                errors.push({ error: `Missing record at expected line ${recordIndex + 1}` });
                groupResults.push({ error: `Error processing record at line ${recordIndex + 1}` });
                continue;
            }

            const recordLine = data[recordIndex].replace(/\s+/g, '');
            let record;

            // Safely handle parsing errors
            try {
                record = recordLine.split('').map((el, idx) => idx < 2 ? parseFloat(el) : el);
                
                if (record.length !== numElements) {
                    throw new Error(`Data count mismatch`);
                }
                
                let result;
                if (numElements === 2) {
                    result = calculateTwoParams(record[0], record[1]);
                } else if (numElements === 3) {
                    result = calculateThreeParams(record[0], record[1], record[2]);
                }

                totalAvg += parseFloat(result.avg);
                groupResults.push({ record, ...result });
            } catch (err) {
                errors.push({ error: err.message, line: recordIndex + 1 });
                groupResults.push({ error: `Error processing record at line ${recordIndex + 1}` });
                continue;
            }
        }

        currentIndex += numRecords + 1;

        const groupAvgResult = totalAvg / numRecords;
        results.push({
            controlRecord,
            groupResults,
            groupAvgResult: groupAvgResult.toFixed(3)
        });
    }

    res.json({
        message: 'Data processed with some errors',
        results,
        errors
    });
});

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
