const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for all routes
app.use(cors());
app.use(express.json());

// Serve static files from the root directory
app.use(express.static(__dirname));

// Import and use the chat API handler (using dynamic import for ES6 module)
let chatHandler;

// Load the chat handler dynamically (ES6 module)
(async () => {
  try {
    const chatModule = await import('./api/chat.js');
    chatHandler = chatModule.default;
  } catch (error) {
    console.error('Failed to load chat handler:', error);
    process.exit(1);
  }
})();

// Convert Vercel serverless function to Express route
app.post('/api/chat', async (req, res) => {
  // Wait for handler to load if not ready yet
  if (!chatHandler) {
    try {
      const chatModule = await import('./api/chat.js');
      chatHandler = chatModule.default;
    } catch (error) {
      console.error('Failed to load chat handler:', error);
      return res.status(500).json({ error: 'Server configuration error' });
    }
  }

  // Create a mock Vercel request/response object
  const vercelReq = {
    method: req.method,
    body: req.body,
    headers: req.headers
  };
  
  let responseEnded = false;
  const vercelRes = {
    statusCode: 200,
    headers: {},
    setHeader: function(name, value) {
      this.headers[name] = value;
      if (!res.headersSent) {
        res.setHeader(name, value);
      }
    },
    status: function(code) {
      this.statusCode = code;
      if (!res.headersSent && !responseEnded) {
        res.status(code);
      }
      return this;
    },
    json: function(obj) {
      if (!responseEnded && !res.headersSent) {
        res.status(this.statusCode).json(obj);
        responseEnded = true;
      }
    },
    end: function() {
      if (!responseEnded) {
        res.end();
        responseEnded = true;
      }
    },
    write: function(chunk) {
      if (!responseEnded) {
        res.write(chunk);
      }
    }
  };

  try {
    await chatHandler(vercelReq, vercelRes);
    if (!responseEnded) {
      res.end();
    }
  } catch (error) {
    console.error('Error in chat handler:', error);
    if (!res.headersSent && !responseEnded) {
      res.status(500).json({ 
        error: 'Failed to process request', 
        details: error.message 
      });
    }
  }
});

// Handle OPTIONS requests for CORS preflight
app.options('/api/chat', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.status(200).end();
});

// Serve index.html for root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  console.log(`📝 Open http://localhost:${PORT} in your browser`);
});

