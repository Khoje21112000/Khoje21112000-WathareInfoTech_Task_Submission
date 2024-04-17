const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 5000;

// Replace with your MongoDB connection string
const mongoURI = "mongodb://localhost:27017/task";

mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.error(err));

const SampleData = mongoose.model('projectdatas', new mongoose.Schema({
    ts: { type: String, required: true }, // Update field name to "ts"
    machine_status: { type: Number, required: true }, // Assuming "machine_status" is the actual field name
    vibration: { type: Number, required: true } // Assuming "vibration" is the actual field name
}));

app.use(cors());
app.use(bodyParser.json());

// Get data with optional filtering
app.get('/data', async (req, res) => {
    const startTime = req.query.start_time ? new Date(req.query.start_time) : null;
    const endTime = req.query.end_time ? new Date(req.query.end_time) : null;

    let query = {};
    if (startTime && endTime) {
        query.ts = { $gte: startTime.toISOString(), $lte: endTime.toISOString() };
    }

    try {
        const data = await SampleData.find(query);
        const summary = calculateSummary(data); // Function to calculate summary statistics
        res.json({ data, summary });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching data' });
    }
});

// Get all data
app.get('/alldata', async (req, res) => {
    try {
        const allData = await SampleData.find();
        res.json(allData);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching all data' });
    }
});

function calculateSummary(data) {
    const numOnes = data.filter(d => d.sample === 1).length;
    const numZeros = data.length - numOnes;
    // Implement logic to calculate continuous stretches (optional)
    return { numOnes, numZeros }; // Add continuous stretches data if implemented
}

app.listen(port, () => console.log(`Server running on port ${port}`));

// server.js

// const express = require('express');
// const mongoose = require('mongoose');
// const bodyParser = require('body-parser');
// const cors = require('cors');

// const app = express();
// const port = process.env.PORT || 5000;

// const mongoURI = "mongodb://localhost:27017/task";

// mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
//     .then(() => console.log('MongoDB Connected'))
//     .catch(err => console.error(err));

// const SampleData = mongoose.model('samples', new mongoose.Schema({
//     ts: { type: Date, required: true },
//     sample: { type: Number, required: true },
//     machine_status: { type: Number, required: true },
//     vibration: { type: Number, required: true }
// }));

// app.use(cors());
// app.use(bodyParser.json());

// // Import raw sample data set to DB Collection (Assuming data is in JSON format)
// const rawData = require('./rawSampleData.json');
// SampleData.insertMany(rawData)
//     .then(() => console.log('Raw data imported successfully'))
//     .catch(err => console.error('Error importing raw data:', err));

// // Function to calculate summary statistics
// function calculateSummary(data) {
//     let numOnes = 0, numZeros = 0, continuousVariations = 0;
//     let prevSample = null;
//     let continuousCount = 0;

//     data.forEach(d => {
//         if (d.sample === 1) {
//             numOnes++;
//             if (prevSample === 0) continuousCount = 0;
//             prevSample = 1;
//         } else if (d.sample === 0) {
//             numZeros++;
//             if (prevSample === 1) continuousCount = 0;
//             prevSample = 0;
//         } else {
//             // Missing sample
//             prevSample = null;
//             continuousVariations++;
//         }

//         if (prevSample !== null) continuousCount++;
//         continuousVariations = Math.max(continuousVariations, continuousCount);
//     });

//     return { numOnes, numZeros, continuousVariations };
// }

// // API to filter data by time with frequency options
// app.get('/data', async (req, res) => {
//     const { startTime, endTime, frequency } = req.query;
//     let query = {};

//     if (startTime && endTime) {
//         query.ts = { $gte: new Date(startTime), $lte: new Date(endTime) };
//     }

//     try {
//         let data = await SampleData.find(query).sort({ ts: 1 });

//         // Implement filtering based on frequency (hour, day, week, month)
//         // Adjust data based on the selected frequency

//         const summary = calculateSummary(data);
//         res.json({ data, summary });
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ message: 'Error fetching data' });
//     }
// });

// app.listen(port, () => console.log(`Server running on port ${port}`));
