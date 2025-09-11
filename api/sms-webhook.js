
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { From, Body, MessageSid, To } = req.body;

    console.log('Received SMS:', {
      from: From,
      to: To,
      body: Body,
      sid: MessageSid
    });

    // TODO: Save incoming message to your database
    // const savedMessage = await saveMessageToDatabase({
    //   phone_number: From,
    //   message_body: Body,
    //   direction: 'inbound',
    //   twilio_sid: MessageSid,
    //   received_at: new Date()
    // });

    // TODO: Optional auto-responses
    // if (Body.toLowerCase().includes('help')) {
    //   // Send auto-reply about available services
    // }

    // TODO: Notify team members about new message
    // await notifyTeamMembers({
    //   from: From,
    //   message: Body
    // });

    // Respond to Twilio (empty response = no auto-reply)
    res.setHeader('Content-Type', 'text/xml');
    res.status(200).send(`<?xml version="1.0" encoding="UTF-8"?>
      <Response>
        <!-- Optional: Send auto-reply -->
        <!-- <Message>Thanks for contacting EMA! We'll respond soon.</Message> -->
      </Response>`);

  } catch (error) {
    console.error('Error processing SMS webhook:', error);
    res.status(500).json({ error: 'Failed to process SMS' });
  }
}