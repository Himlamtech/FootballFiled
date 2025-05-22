const { Field, TimeSlot, Review } = require('../models');
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
        },
        {
          model: Review,
          as: 'reviews',
          required: false,
          limit: 5,
          order: [['createdAt', 'DESC']]
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

    // Calculate average rating
    let averageRating = 0;
    let reviewCount = 0;

    try {
      const avgRating = await Review.findOne({
        attributes: [
          [sequelize.fn('AVG', sequelize.col('rating')), 'averageRating'],
          [sequelize.fn('COUNT', sequelize.col('reviewId')), 'reviewCount']
        ],
        where: { fieldId }
      });

      if (avgRating) {
        averageRating = avgRating.getDataValue('averageRating') || 0;
        reviewCount = avgRating.getDataValue('reviewCount') || 0;
      }
    } catch (error) {
      console.error('Error calculating average rating:', error);
      // Continue with default values
    }

    const fieldData = field.toJSON();
    fieldData.averageRating = averageRating;
    fieldData.reviewCount = reviewCount;

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