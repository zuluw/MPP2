const express = require('express');
const cors = require('cors');
const path = require('path');
const issueRoutes = require('./routes/issueRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/api/issues', issueRoutes);

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Endpoint ${req.originalUrl} not found.`
    });
});

app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`>>> REST API Server running on port ${PORT}`);
});