const { Field, TimeSlot } = require('../models');
const { sequelize } = require('../config/database');
const { Op } = require('sequelize');

/**
 * Get all fields
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
exports.getAllFields = async (req, res) => {
  try {
    const { size, isActive } = req.query;

    // Build filter
    const filter = {};

    if (size) {
      filter.size = size;
    }

    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }

    console.log('Fetching fields with filter:', filter);

    const fields = await Field.findAll({
      where: filter,
      include: [
        {
          model: TimeSlot,
          as: 'timeSlots',
          required: false
        }
      ],
      order: [['name', 'ASC']]
    });

    console.log(`Found ${fields.length} fields`);

    // Transform data to be more frontend-friendly
    const transformedFields = fields.map(field => {
      const plainField = field.get({ plain: true });

      // Add camelCase aliases for snake_case properties if needed
      return {
        ...plainField,
        id: plainField.fieldId,
        // Keep the original properties too for backward compatibility
      };
    });

    res.status(200).json({
      success: true,
      fields: transformedFields
    });
  } catch (error) {
    console.error('Get fields error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching fields',
      error: error.message
    });
  }
};

/**
 * Get field by ID
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
exports.getFieldById = async (req, res) => {
  try {
    const fieldId = req.params.id;
    console.log(`Fetching field with ID: ${fieldId}`);

    const field = await Field.findByPk(fieldId, {
      include: [
        {
          model: TimeSlot,
          as: 'timeSlots',
          required: false
        }
      ]
    });

    if (!field) {
      console.log(`Field with ID ${fieldId} not found`);
      return res.status(404).json({
        success: false,
        message: 'Field not found'
      });
    }

    // Note: Reviews functionality removed in optimized schema
    const fieldData = field.toJSON();

    // Add id alias for fieldId for frontend compatibility
    fieldData.id = fieldData.fieldId;

    console.log(`Successfully fetched field with ID: ${fieldId}`);
    res.status(200).json({
      success: true,
      field: fieldData
    });
  } catch (error) {
    console.error('Get field error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching field details',
      error: error.message
    });
  }
};