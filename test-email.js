const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_API_KEY || 'mock-api-key');

async function test() {
  console.log('Testing email with key:', process.env.RESEND_API_KEY ? 'Present' : 'Missing/Mock');
  try {
    const data = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: 'delivered@resend.dev',
      subject: 'Test Email',
      html: '<p>Test</p>'
    });
    console.log('Success:', data);
  } catch (err) {
    console.error('Error:', err);
  }
}

test();
