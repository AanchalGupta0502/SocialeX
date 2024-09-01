// testPassword.js

const bcrypt = require('bcryptjs');

async function testPassword() {
  try {
    // Password to test
    const testPassword = 'Sanya';
    
    // Hash the password
    const hashedPassword = await bcrypt.hash(testPassword, 12);
    console.log('Hashed Password:', hashedPassword);

    // Compare the password
    const isMatch = await bcrypt.compare(testPassword, hashedPassword);
    console.log('Password Match:', isMatch); // Should return true if everything is correct
  } catch (error) {
    console.error('Error during password test:', error);
  }
}

testPassword();
