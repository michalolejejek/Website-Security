const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

// Celowo podatna konfiguracja Multer – zapis pod oryginalną nazwą klienta (ryzyko Path Traversal)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = './uploads';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Podatność: użycie oryginalnej nazwy bez sanitizacji (np. "../file.js")
    cb(null, file.originalname);
  }
});

const upload = multer({
  storage: storage,
  // Brak ograniczeń rozmiaru na poziomie middleware (ryzyko DoS) / lub bardzo wysoki limit
  limits: { fileSize: 50 * 1024 * 1024 } // 50 MB
});

app.use(express.static('public'));

// Endpoint przesyłania plików (/api/upload)
app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Nie przesłano żadnego pliku.' });
  }
  res.json({
    message: 'Plik przesłany pomyślnie.',
    filename: req.file.filename,
    size: req.file.size
  });
});

// Endpoint pobierania plików (/api/download)
app.get('/api/download/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, 'uploads', filename);

  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).json({ error: 'Plik nie został odnaleziony.' });
  }
});

app.listen(PORT, () => {
  console.log(`Serwer laboratoryjny działa na porcie ${PORT}`);
});