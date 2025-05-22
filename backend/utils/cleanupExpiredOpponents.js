const { Opponent } = require('../models');

async function cleanupExpiredOpponents() {
  const now = new Date();
  const deleted = await Opponent.destroy({
    where: {
      expireDate: {
        $lt: now
      }
    }
  });
  console.log(`Đã xóa ${deleted} đối thủ hết hạn.`);
}

if (require.main === module) {
  cleanupExpiredOpponents().then(() => process.exit(0));
}

module.exports = cleanupExpiredOpponents; 