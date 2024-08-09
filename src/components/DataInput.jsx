import React, { useState } from 'react';
import './DataInput.css';

const DataInput = ({ onSubmit }) => {
    const [fileData, setFileData] = useState('');
    const [manualData, setManualData] = useState('');

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = (event) => {
            setFileData(event.target.result);
        };
        reader.readAsText(file);
    };

    const handleSubmit = () => {
        if (fileData) {
            onSubmit(fileData);
        } else if (manualData) {
            onSubmit(manualData);
        } else {
            alert('Please provide data!');
        }
    };

    return (
        <div className="data-input-container">
            <h2>Upload File or Enter Data Manually</h2>
            <input type="file" onChange={handleFileChange} className="file-input" />
            <textarea
                placeholder="Enter data manually"
                value={manualData}
                onChange={(e) => setManualData(e.target.value)}
                rows="10"
                cols="50"
                className="manual-input"
            />
            <button onClick={handleSubmit} className="submit-button">Submit</button>
        </div>
    );
};

export default DataInput;
