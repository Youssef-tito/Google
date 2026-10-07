const express = require('express');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static(__dirname));

// نقطة استقبال البيانات
app.post('/api/save-data', (req, res) => {
    console.log('بيانات مستلمة جديدة:', req.body);
    res.json({ status: 'success' });
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));