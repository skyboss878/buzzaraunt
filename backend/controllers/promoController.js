// ~/buzzaraunt/backend/controllers/promoController.js
const pool = require('../db');
// You'd import your AI API library here, e.g., const OpenAI = require('openai');

// Mock AI response for now
const mockAiResponse = (prompt) => {
  const captions = [
    `Unleash your taste buds! 🤤 Get 50% off all wings this weekend! Perfect for game night or family dinner. #WingsSpecial #FoodieHeaven`,
    `Craving something spicy? Our 🔥 hot wings are calling your name! 🍗 Weekend exclusive: buy one get one free. #SpicyWings #WeekendVibes`,
    `Family fun and fantastic food! Bring the whole crew for our amazing wing deals. We've got sports on big screens and a great beer selection! 🍻 #FamilyRestaurant #SportsBar`,
    `Don't miss out on the crispiest, juiciest wings in town! 🤩 Limited time offer: half price on all flavors. Tag a friend who needs wings! #WingLover #FoodDeals`
  ];
  const music = ['Upbeat Pop', 'Chill Acoustic', 'Energetic Rock', 'Smooth Jazz'];
  const voiceLinks = ['https://example.com/voice1.mp3', 'https://example.com/voice2.mp3']; // Placeholder
  const images = ['https://source.unsplash.com/featured/?chicken-wings,restaurant', 'https://source.unsplash.com/featured/?food,promo']; // Placeholder

  return {
    caption: captions[Math.floor(Math.random() * captions.length)],
    image_src: images[Math.floor(Math.random() * images.length)],
    voice_link: voiceLinks[Math.floor(Math.random() * voiceLinks.length)],
    music: music[Math.floor(Math.random() * music.length)],
    scheduled_time: new Date().toISOString() // Default to now
  };
};

exports.generatePromo = async (req, res) => {
  const { prompt } = req.body;
  const userId = req.user.id; // From authMiddleware

  if (!prompt) {
    return res.status(400).json({ success: false, message: 'Prompt is required to generate a promo.' });
  }

  try {
    // In a real app: Call actual AI APIs here
    // Example: const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    // const aiGeneratedContent = await openai.chat.completions.create({ .. });

    const generatedPromoData = mockAiResponse(prompt);

    // Save generated promo to database
    const client = await pool.connect();
    const insertQuery = `
      INSERT INTO promos (user_id, caption, image_src, voice_link, music, scheduled_time)
      VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, caption, image_src, voice_link, music, scheduled_time
    `;
    const result = await client.query(insertQuery, [
      userId,
      generatedPromoData.caption,
      generatedPromoData.image_src,
      generatedPromoData.voice_link,
      generatedPromoData.music,
      generatedPromoData.scheduled_time
    ]);
    client.release();

    const savedPromo = result.rows[0];

    res.json({ success: true, promo: savedPromo });
  } catch (err) {
        console.error("❌ Error:", err);
        console.error("❌ Error:", err);
    res.status(500).json({ success: false, message: "Server error.", error: err.message, error: err.message, error: err.message });
    res.status(500).json({ success: false, message: 'Server error generating promo.', error: err.message, error: err.message });
  }
};

exports.getPromos = async (req, res) => {
  const userId = req.user.id; // From authMiddleware

  try {
    const client = await pool.connect();
    const result = await client.query('SELECT * FROM promos WHERE user_id = $1 ORDER BY scheduled_time DESC', [userId]);
    client.release();

    res.json({ success: true, promos: result.rows });
  } catch (err) {
        console.error("❌ Error:", err);
    res.status(500).json({ success: false, message: "Server error.", error: err.message, error: err.message, error: err.message });
        console.error("❌ Error:", err);
    res.status(500).json({ success: false, message: 'Server error fetching promos.', error: err.message, error: err.message });
  }
};

exports.deletePromo = async (req, res) => {
  const promoId = req.params.id; // Get promo ID from URL parameter
  const userId = req.user.id; // From authMiddleware

  try {
    const client = await pool.connect();
    const deleteQuery = 'DELETE FROM promos WHERE id = $1 AND user_id = $2 RETURNING id';
    const result = await client.query(deleteQuery, [promoId, userId]);
    client.release();

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Promo not found or not authorized to delete.' });
    }

    res.json({ success: true, message: 'Promo deleted successfully.' });
        console.error("❌ Error:", err);
    res.status(500).json({ success: false, message: "Server error.", error: err.message, error: err.message, error: err.message });
  } catch (err) {
        console.error("❌ Error:", err);
    res.status(500).json({ success: false, message: 'Server error deleting promo.', error: err.message, error: err.message });
  }
};
