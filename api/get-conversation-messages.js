
export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { phone_number } = req.query;

    if (!phone_number) {
      return res.status(400).json({ error: 'Phone number is required' });
    }

    // TODO: Replace with actual database query
    // const messages = await getMessagesForConversation(phone_number);

    // Mock data for now
    const mockMessages = [
      {
        id: 1,
        message_body: 'Hi, I just had a baby and need some help with meals',
        direction: 'inbound',
        sent_at: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
        sent_by_user: null
      },
      {
        id: 2,
        message_body: 'Congratulations! We\'d love to help. I\'ll have someone reach out to set up a meal train.',
        direction: 'outbound',
        sent_at: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
        sent_by_user: 'Admin'
      }
    ];

    res.status(200).json({
      success: true,
      messages: mockMessages
    });

  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch messages' 
    });
  }
}