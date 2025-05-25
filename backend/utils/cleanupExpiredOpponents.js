const { Opponent, Booking } = require('../models');
const { Op } = require('sequelize');

/**
 * Cleanup expired opponent posts
 * Removes opponent posts where the match date/time has passed
 */
async function cleanupExpiredOpponents() {
  try {
    const now = new Date();
    console.log(`Starting cleanup of expired opponents at ${now.toISOString()}`);

    // Find expired opponents with their booking details for logging
    const expiredOpponents = await Opponent.findAll({
      where: {
        expireDate: {
          [Op.lt]: now
        }
      },
      include: [
        {
          model: Booking,
          attributes: ['bookingDate', 'customerName'],
          required: true
        }
      ],
      attributes: ['id', 'team_name', 'expireDate']
    });

    if (expiredOpponents.length > 0) {
      console.log(`Found ${expiredOpponents.length} expired opponent posts:`);
      expiredOpponents.forEach(opponent => {
        console.log(`- Team: ${opponent.team_name}, Expired: ${opponent.expireDate}, Match Date: ${opponent.Booking.bookingDate}`);
      });

      // Delete expired opponents
      const deleted = await Opponent.destroy({
        where: {
          expireDate: {
            [Op.lt]: now
          }
        }
      });

      console.log(`Successfully deleted ${deleted} expired opponent posts.`);
    } else {
      console.log('No expired opponent posts found.');
    }

    return expiredOpponents.length;
  } catch (error) {
    console.error('Error during cleanup of expired opponents:', error);
    throw error;
  }
}

// Allow running this script directly
if (require.main === module) {
  cleanupExpiredOpponents()
    .then((deletedCount) => {
      console.log(`Cleanup completed. Deleted ${deletedCount} expired posts.`);
      process.exit(0);
    })
    .catch((error) => {
      console.error('Cleanup failed:', error);
      process.exit(1);
    });
}

module.exports = cleanupExpiredOpponents;