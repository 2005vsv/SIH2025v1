import express from 'express';

const router = express.Router();

// WhatsApp webhook
router.post('/whatsapp', (req, res) => {
  const { Body, From } = req.body;
  
  // Simple intent detection
  let response = 'Hello! How can I help you today?';
  
  if (Body?.toLowerCase().includes('fees')) {
    response = 'Your current fee status: Tuition - $2000 due by Dec 31st. You can pay online through the portal.';
  } else if (Body?.toLowerCase().includes('hostel')) {
    response = 'Your hostel details: Room 201, Block A. Contact hostel office for any changes.';
  } else if (Body?.toLowerCase().includes('exam')) {
    response = 'Upcoming exams: Mathematics on Dec 15th, Physics on Dec 18th. Check the portal for detailed schedule.';
  }
  
  res.json({ success: true, message: response });
});

// Telegram webhook
router.post('/telegram', (req, res) => {
  const message = req.body.message;
  
  if (message) {
    const text = message.text?.toLowerCase() || '';
    let response = 'Hello! How can I help you today?';
    
    if (text.includes('fees')) {
      response = 'Your current fee status: Tuition - $2000 due by Dec 31st.';
    } else if (text.includes('hostel')) {
      response = 'Your hostel details: Room 201, Block A.';
    } else if (text.includes('exam')) {
      response = 'Upcoming exams: Mathematics on Dec 15th, Physics on Dec 18th.';
    }
    
    res.json({ 
      method: 'sendMessage',
      chat_id: message.chat.id,
      text: response
    });
  } else {
    res.status(400).json({ success: false, message: 'Invalid request' });
  }
});

export default router;