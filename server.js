const express = require('express');
const fernet = require('fernet');

const app = express();

// FIX: Use Render's dynamic port or default to 3000 for local testing
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Health Check Route (Helps you see if the server is up in your browser)
app.get('/', (req, res) => {
  res.send('✅ Decryption Server is Running');
});

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
      ttl: 0 
    });

    const decrypted = message.decode();

    if (!decrypted) {
        throw new Error("Decryption returned empty result");
    }

    try {
      return res.json(JSON.parse(decrypted));
    } catch (e) {
      return res.json({ decrypted }); 
    }

  } catch (err) {
    return res.status(400).json({ 
      error: 'Decryption failed', 
      message: err.message 
    });
  }
});

// FIX: Listen on 0.0.0.0 to ensure Render can route traffic to the container
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on port ${PORT}`);
});
