// api/get-sms-conversations.js
// Get SMS conversations for admin dashboard

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
    // TODO: Replace with actual database query
    // const conversations = await getConversationsFromDatabase();

    // Mock data for now - replace with real database queries
    const mockConversations = [
      {
        id: 1,
        phone_number: '+15551234567',
        contact_name: 'Sarah Johnson',
        last_message: 'Thank you for the meal delivery!',
        last_message_at: new Date().toISOString(),
        unread_count: 0,
        status: 'active',
        assigned_to: 'Admin'
      },
      {
        id: 2,
        phone_number: '+15559876543',
        contact_name: null,
        last_message: 'Hi, I need help with childcare',
        last_message_at: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
        unread_count: 1,
        status: 'pending',
        assigned_to: null
      }
    ];

    res.status(200).json({
      success: true,
      conversations: mockConversations
    });

  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch conversations' 
    });
  }
}