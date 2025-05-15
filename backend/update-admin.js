const bcrypt = require('bcryptjs');
const { sequelize } = require('./config/database');

async function updateAdminPassword() {
  try {
    // Generate password hash
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('admin', salt);
    console.log('Generated password hash:', passwordHash);
    
    // Update admin password directly in the database
    const [result] = await sequelize.query(
      `UPDATE Users SET password = ? WHERE email = 'admin'`,
      { replacements: [passwordHash] }
    );
    
    console.log('Update result:', result);
    console.log('Admin password updated successfully!');
    
    // Verify the update
    const [users] = await sequelize.query(
      `SELECT userId, name, email, role, password FROM Users WHERE email = 'admin'`
    );
    
    console.log('Admin user after update:', users[0]);
    
    // Test password validation
    const isValid = await bcrypt.compare('admin', users[0].password);
    console.log('Password validation test:', isValid);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

updateAdminPassword();
