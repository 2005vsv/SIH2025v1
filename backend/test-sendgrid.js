require('dotenv').config();
const emailService = require('./src/services/emailService');

async function testEmail() {
  console.log('🧪 Testing Email Service...\n');

  console.log('📧 Attempting to send test email to tanishop13062005@gmail.com...');

  try {
    // Test sending a simple email
    const result = await emailService.sendTestEmail('tanishop13062005@gmail.com');

    if (result.success) {
      console.log('✅ Test email sent successfully!');
      console.log('📨 Check your email inbox for the test message');
      console.log('📧 Message ID:', result.messageId);
    }
  } catch (error) {
    console.log('❌ Failed to send test email:', error.message);
    if (error.response) {
      console.log('📋 Error Details:', JSON.stringify(error.response.body, null, 2));
    } else if (error.code) {
      console.log('📋 Error Code:', error.code);
    }
  }
}

// Run the test
testEmail().then(() => {
  console.log('\n🏁 Test completed');
  process.exit(0);
}).catch((error) => {
  console.error('💥 Test failed:', error);
  process.exit(1);
});