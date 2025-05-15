const { Field, TimeSlot, Review, sequelize } = require('../models');
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

/**
 * Create new field
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
exports.createField = async (req, res) => {
  try {
    console.log('Creating new field with data:', req.body);

    // Handle both camelCase and snake_case parameters
    const name = req.body.name;
    const description = req.body.description;
    const size = req.body.size || req.body.type;
    const pricePerHour = req.body.pricePerHour || req.body.price_per_hour || req.body.price;
    const imageUrl = req.body.imageUrl || req.body.image_url || req.body.image;
    const isActive = req.body.isActive !== undefined ? req.body.isActive : true;

    // Validate required fields
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Field name is required'
      });
    }

    const field = await Field.create({
      name,
      description: description || '',
      size: size || '7-a-side',
      pricePerHour: pricePerHour || 200000,
      imageUrl: imageUrl || '',
      isActive
    });

    console.log('Field created successfully:', field.toJSON());

    res.status(201).json({
      success: true,
      message: 'Field created successfully',
      field: {
        ...field.toJSON(),
        id: field.fieldId // Add id alias for frontend compatibility
      }
    });
  } catch (error) {
    console.error('Create field error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating field',
      error: error.message
    });
  }
};

/**
 * Update field
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
exports.updateField = async (req, res) => {
  try {
    const fieldId = req.params.id;
    console.log(`Updating field with ID: ${fieldId}`, req.body);

    // Handle both camelCase and snake_case parameters
    const name = req.body.name;
    const description = req.body.description;
    const size = req.body.size || req.body.type;
    const pricePerHour = req.body.pricePerHour || req.body.price_per_hour || req.body.price;
    const imageUrl = req.body.imageUrl || req.body.image_url || req.body.image;
    const isActive = req.body.isActive !== undefined ? req.body.isActive : undefined;

    const field = await Field.findByPk(fieldId);

    if (!field) {
      console.log(`Field with ID ${fieldId} not found`);
      return res.status(404).json({
        success: false,
        message: 'Field not found'
      });
    }

    await field.update({
      name: name !== undefined ? name : field.name,
      description: description !== undefined ? description : field.description,
      size: size !== undefined ? size : field.size,
      pricePerHour: pricePerHour !== undefined ? pricePerHour : field.pricePerHour,
      imageUrl: imageUrl !== undefined ? imageUrl : field.imageUrl,
      isActive: isActive !== undefined ? isActive : field.isActive
    });

    console.log(`Field with ID ${fieldId} updated successfully`);

    res.status(200).json({
      success: true,
      message: 'Field updated successfully',
      field: {
        ...field.toJSON(),
        id: field.fieldId // Add id alias for frontend compatibility
      }
    });
  } catch (error) {
    console.error('Update field error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating field',
      error: error.message
    });
  }
};

/**
 * Delete field
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
exports.deleteField = async (req, res) => {
  try {
    const fieldId = req.params.id;
    console.log(`Deleting field with ID: ${fieldId}`);

    const field = await Field.findByPk(fieldId);

    if (!field) {
      console.log(`Field with ID ${fieldId} not found`);
      return res.status(404).json({
        success: false,
        message: 'Field not found'
      });
    }

    // Check if there are active bookings for this field
    const hasBookings = await field.countBookings({
      where: {
        status: {
          [Op.in]: ['pending', 'confirmed']
        },
        bookingDate: {
          [Op.gte]: new Date()
        }
      }
    });

    if (hasBookings > 0) {
      console.log(`Cannot delete field with ID ${fieldId} - has ${hasBookings} active bookings`);
      return res.status(400).json({
        success: false,
        message: 'Cannot delete field with active bookings. Deactivate it instead.'
      });
    }

    await field.destroy();
    console.log(`Field with ID ${fieldId} deleted successfully`);

    res.status(200).json({
      success: true,
      message: 'Field deleted successfully'
    });
  } catch (error) {
    console.error('Delete field error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting field',
      error: error.message
    });
  }
};