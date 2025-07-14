const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// 🔗 Connect to MongoDB
mongoose.connect('mongodb+srv://lolklop578:Hq7O5eA2AuSONjdk@cluster0.ek77ffb.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB error:', err));

// 🧾 Define schema
const LogSchema = new mongoose.Schema({
  latitude: Number,
  longitude: Number,
  networkType: String,
  speed: Number,
  timestamp: { type: Date, default: Date.now }
});

const Log = mongoose.model('Log', LogSchema);

// 📥 POST endpoint
app.post('/api/location', async (req, res) => {
  try {
    const { latitude, longitude, networkType, speed } = req.body;
    const entry = new Log({ latitude, longitude, networkType, speed });
    await entry.save();
    res.status(201).json({ message: 'Location saved successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Something went wrong' });
  }
});
app.get("/api/location", async (req, res) => {
  const logs = await Log.find().sort({ timestamp: -1 }).limit(100);
  res.json(logs);
});

// 🚀 Start server
app.listen(5000, () => {
  console.log('Server running on http://localhost:5000');
});
