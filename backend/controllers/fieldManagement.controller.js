const { Field, TimeSlot, FieldManagement, sequelize } = require('../models');
const { Op } = require('sequelize');

/**
 * Get field management status for a specific field and date
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
exports.getFieldStatus = async (req, res) => {
  try {
    const { fieldId, date } = req.query;

    if (!fieldId || !date) {
      return res.status(400).json({
        success: false,
        message: 'Field ID and date are required'
      });
    }

    // Get field management records
    const managementRecords = await FieldManagement.findAll({
      where: {
        fieldId,
        date
      },
      include: [
        {
          model: TimeSlot,
          attributes: ['timeSlotId', 'startTime', 'endTime']
        }
      ]
    });

    // Get all time slots for the field
    const timeSlots = await TimeSlot.findAll({
      where: {
        fieldId
      },
      attributes: ['timeSlotId', 'startTime', 'endTime', 'weekdayPrice', 'weekendPrice']
    });

    // Map time slots with their lock status
    const fieldStatus = timeSlots.map(slot => {
      const managementRecord = managementRecords.find(
        record => record.timeSlotId === slot.timeSlotId
      );

      return {
        timeSlotId: slot.timeSlotId,
        startTime: slot.startTime,
        endTime: slot.endTime,
        weekdayPrice: slot.weekdayPrice,
        weekendPrice: slot.weekendPrice,
        isLocked: managementRecord ? managementRecord.isLocked : false,
        lockReason: managementRecord ? managementRecord.lockReason : null
      };
    });

    res.status(200).json({
      success: true,
      fieldStatus
    });
  } catch (error) {
    console.error('Get field status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching field status',
      error: error.message
    });
  }
};

/**
 * Lock a time slot for a specific field and date
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
exports.lockTimeSlot = async (req, res) => {
  try {
    const { fieldId } = req.params;
    const { timeSlotId, date, reason } = req.body;

    if (!fieldId || !timeSlotId || !date) {
      return res.status(400).json({
        success: false,
        message: 'Field ID, time slot ID, and date are required'
      });
    }

    // Check if field exists
    const field = await Field.findByPk(fieldId);
    if (!field) {
      return res.status(404).json({
        success: false,
        message: 'Field not found'
      });
    }

    // Check if time slot exists
    const timeSlot = await TimeSlot.findByPk(timeSlotId);
    if (!timeSlot) {
      return res.status(404).json({
        success: false,
        message: 'Time slot not found'
      });
    }

    // Find or create field management record
    const [management, created] = await FieldManagement.findOrCreate({
      where: {
        fieldId,
        timeSlotId,
        date
      },
      defaults: {
        isLocked: true,
        lockReason: reason || 'Locked by admin'
      }
    });

    // If record already exists, update it
    if (!created) {
      await management.update({
        isLocked: true,
        lockReason: reason || 'Locked by admin'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Time slot locked successfully',
      management
    });
  } catch (error) {
    console.error('Lock time slot error:', error);
    res.status(500).json({
      success: false,
      message: 'Error locking time slot',
      error: error.message
    });
  }
};

/**
 * Unlock a time slot for a specific field and date
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
exports.unlockTimeSlot = async (req, res) => {
  try {
    const { fieldId } = req.params;
    const { timeSlotId, date } = req.body;

    if (!fieldId || !timeSlotId || !date) {
      return res.status(400).json({
        success: false,
        message: 'Field ID, time slot ID, and date are required'
      });
    }

    // Find field management record
    const management = await FieldManagement.findOne({
      where: {
        fieldId,
        timeSlotId,
        date
      }
    });

    if (!management) {
      return res.status(404).json({
        success: false,
        message: 'Field management record not found'
      });
    }

    // Update record
    await management.update({
      isLocked: false,
      lockReason: null
    });

    res.status(200).json({
      success: true,
      message: 'Time slot unlocked successfully',
      management
    });
  } catch (error) {
    console.error('Unlock time slot error:', error);
    res.status(500).json({
      success: false,
      message: 'Error unlocking time slot',
      error: error.message
    });
  }
};

/**
 * Lock all time slots for a specific field and date
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
exports.lockAllTimeSlots = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { fieldId } = req.params;
    const { date, reason } = req.body;

    if (!fieldId || !date) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Field ID and date are required'
      });
    }

    // Check if field exists
    const field = await Field.findByPk(fieldId, { transaction });
    if (!field) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Field not found'
      });
    }

    // Get all time slots for the field
    const timeSlots = await TimeSlot.findAll({
      where: {
        fieldId
      },
      attributes: ['timeSlotId'],
      transaction
    });

    if (timeSlots.length === 0) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'No time slots found for this field'
      });
    }

    // Lock all time slots
    const managementRecords = await Promise.all(
      timeSlots.map(async (slot) => {
        const [management, created] = await FieldManagement.findOrCreate({
          where: {
            fieldId,
            timeSlotId: slot.timeSlotId,
            date
          },
          defaults: {
            isLocked: true,
            lockReason: reason || 'Locked by admin'
          },
          transaction
        });

        if (!created) {
          await management.update({
            isLocked: true,
            lockReason: reason || 'Locked by admin'
          }, { transaction });
        }

        return management;
      })
    );

    await transaction.commit();

    res.status(200).json({
      success: true,
      message: 'All time slots locked successfully',
      count: managementRecords.length
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Lock all time slots error:', error);
    res.status(500).json({
      success: false,
      message: 'Error locking all time slots',
      error: error.message
    });
  }
};
