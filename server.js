const express = require('express');
const fernet = require('fernet');

const app = express();
const PORT = 3000;

// Use built-in express json parser
app.use(express.json());

app.post('/decrypt', (req, res) => {
  const { token, secret } = req.body;

  if (!token || !secret) {
    return res.status(400).json({ error: 'Missing token or secret' });
  }

  try {
    const secretKey = new fernet.Secret(secret);
    const message = new fernet.Token({
      secret: secretKey,
      token: token,
      ttl: 0 // Change this if you want to enforce expiration
    });

    const decrypted = message.decode();

    // Check if decryption actually returned a value
    if (!decrypted) {
        throw new Error("Decryption returned empty result");
    }

    try {
      return res.json(JSON.parse(decrypted));
    } catch (e) {
      return res.json({ decrypted }); 
    }

  } catch (err) {
    // Improved error logging for debugging
    return res.status(400).json({ 
      error: 'Decryption failed', 
      message: err.message 
    });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
