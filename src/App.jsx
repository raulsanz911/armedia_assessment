import React, { useState } from 'react';
import DataInput from './components/DataInput';
import './App.css';

function App() {
    const [output, setOutput] = useState('');

    const handleDataSubmit = (data) => {
        fetch('http://10.96.1.232:5000/process', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ data }),
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then((result) => setOutput(result))
            .catch((error) => {
                console.error('Error:', error);
            });
    };

    const renderOutput = () => {
        if (!output) return null;

        return (
            <>
                <h2>Processed Output</h2>
            <div className="output-container">
                {output.results.map((group, groupIndex) => (
                    <div key={groupIndex} className="group">
                        <h3>Group {groupIndex + 1}</h3>
                        {group.groupResults.map((result, resultIndex) => (
                            <div key={resultIndex} className="result">
                                {result.error ? (
                                    <p className="error">Error: {result.error}</p>
                                ) : (
                                    <div>
                                        {result.record.length === 2 && (
                                            <>
                                                <p className="result-label">AVG = <span className="result-value">{result.avg}</span></p>
                                                <p className="result-label">FORM = <span className="result-value">{result.result}</span></p>
                                            </>
                                        )}
                                        {result.record.length === 3 && (
                                            <>
                                                <p className="result-label">AVG 33 = <span className="result-value">{result.avg}</span></p>
                                                <p className="result-label">FORM 33 = <span className="result-value">{result.result}</span></p>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                        <p className="group-summary">Total records processed: {group.groupResults.length}</p>
                        <p className="group-summary">Group average result: {group.groupAvgResult}</p>
                    </div>
                ))}
                
            </div>
            </>
        );
    };

    return (
        <div className="App">
            <h2>Data Processor</h2>
            <DataInput onSubmit={handleDataSubmit} />
            {renderOutput()}
        </div>
    );
}

export default App;
