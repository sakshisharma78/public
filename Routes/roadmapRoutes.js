const express = require('express');
const mongoose = require('mongoose');
const Roadmap = require('../Models/roadmap'); // Adjust path as needed

const router = express.Router();

// GET request to fetch all roadmaps
router.get('/', async (req, res) => {
  try {
    const roadmaps = await Roadmap.find();
    res.json(roadmaps);
  } catch (error) {
    console.error('Error fetching roadmaps:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET request to fetch a specific roadmap by ID
router.get('/:id', async (req, res) => {
  const id = req.params.id;
  
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid roadmap ID' });
  }

  try {
    const roadmap = await Roadmap.findById(id);
    if (!roadmap) {
      return res.status(404).json({ message: 'Roadmap not found' });
    }
    res.json(roadmap);
  } catch (error) {
    console.error('Error fetching roadmap:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST request to generate and save a roadmap
router.post('/generate-roadmap', async (req, res) => {
  const { languageName, duration } = req.body;

  if (!languageName || !duration) {
    return res.status(400).json({ error: 'languageName and duration are required' });
  }

  // Placeholder for AI-generated data
  const roadmapData = {}; // Replace with actual AI call

  const roadmap = new Roadmap({
    languageName,
    duration,
    roadmapData,
  });

  try {
    await roadmap.save();
    res.status(201).json({ roadmap });
  } catch (error) {
    console.error('Error saving roadmap:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
