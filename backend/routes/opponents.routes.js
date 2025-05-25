const express = require('express');
const router = express.Router();
const { Opponent, Booking, Field, TimeSlot } = require('../models');
const { Op } = require('sequelize');

// Get all opponents
router.get('/', async (req, res) => {
  try {
    console.log('Fetching all valid opponents...');

    const today = new Date();
    const opponents = await Opponent.findAll({
      attributes: ['id', 'booking_id', 'team_name', 'contact_phone', 'contact_email', 'description', 'status', 'expireDate', 'createdAt', 'updatedAt'],
      where: {
        expireDate: {
          [Op.gte]: today
        }
      },
      include: [
        {
          model: Booking,
          include: [
            {
              model: Field,
              attributes: ['fieldId', 'name', 'size', 'description', 'imageUrl', 'isActive']
            },
            {
              model: TimeSlot,
              attributes: ['timeSlotId', 'startTime', 'endTime', 'weekdayPrice', 'weekendPrice', 'isActive']
            }
          ]
        }
      ],
      order: [['createdAt', 'DESC']] // Sort by creation date, newest first
    });

    console.log(`Found ${opponents.length} valid opponents`);

    // Transform data to be more frontend-friendly
    const transformedOpponents = opponents.map(opponent => {
      const plainOpponent = opponent.get({ plain: true });
      return {
        ...plainOpponent,
        id: plainOpponent.id,
        bookingId: plainOpponent.booking_id,
        teamName: plainOpponent.team_name,
        contactPhone: plainOpponent.contact_phone,
        contactEmail: plainOpponent.contact_email,
        skillLevel: plainOpponent.skill_level,
        playerCount: plainOpponent.player_count,
        expireDate: plainOpponent.expireDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Default to 7 days from now if missing
      };
    });

    res.json({
      success: true,
      opponents: transformedOpponents
    });
  } catch (error) {
    console.error('Error fetching opponents:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch opponents',
      error: error.message
    });
  }
});

// Get available opponents (with filter options)
router.get('/available', async (req, res) => {
  try {
    console.log('Fetching available opponents...');

    // Filter for opponents with status 'searching'
    const opponents = await Opponent.findAll({
      attributes: ['id', 'booking_id', 'team_name', 'contact_phone', 'contact_email', 'description', 'status', 'createdAt', 'updatedAt'],
      where: {
        status: 'searching'
      },
      include: [
        {
          model: Booking,
          include: [
            {
              model: Field,
              attributes: ['fieldId', 'name', 'size', 'description', 'imageUrl', 'isActive']
            },
            {
              model: TimeSlot,
              attributes: ['timeSlotId', 'startTime', 'endTime', 'weekdayPrice', 'weekendPrice', 'isActive']
            }
          ]
        }
      ]
    });

    console.log(`Found ${opponents.length} available opponents`);

    // Transform data to be more frontend-friendly
    const transformedOpponents = opponents.map(opponent => {
      const plainOpponent = opponent.get({ plain: true });

      // Add camelCase aliases for snake_case properties
      return {
        ...plainOpponent,
        id: plainOpponent.id,
        bookingId: plainOpponent.booking_id,
        teamName: plainOpponent.team_name,
        contactPhone: plainOpponent.contact_phone,
        contactEmail: plainOpponent.contact_email,
        skillLevel: plainOpponent.skill_level,
        playerCount: plainOpponent.player_count,
        expireDate: plainOpponent.expireDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Default to 7 days from now if missing
        // Keep the original snake_case properties too for backward compatibility
      };
    });

    res.json({
      success: true,
      opponents: transformedOpponents
    });
  } catch (error) {
    console.error('Error fetching available opponents:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch available opponents',
      error: error.message
    });
  }
});

// Get opponent by id
router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    console.log(`Fetching opponent with ID: ${id}`);

    const opponent = await Opponent.findByPk(id, {
      attributes: ['id', 'booking_id', 'team_name', 'contact_phone', 'contact_email', 'description', 'status', 'createdAt', 'updatedAt'],
      include: [
        {
          model: Booking,
          include: [
            {
              model: Field,
              attributes: ['fieldId', 'name', 'size', 'description', 'imageUrl', 'isActive']
            },
            {
              model: TimeSlot,
              attributes: ['timeSlotId', 'startTime', 'endTime', 'weekdayPrice', 'weekendPrice', 'isActive']
            }
          ]
        }
      ]
    });

    if (!opponent) {
      console.log(`Opponent with ID ${id} not found`);
      return res.status(404).json({
        success: false,
        message: 'Opponent not found'
      });
    }

    // Transform data to be more frontend-friendly
    const plainOpponent = opponent.get({ plain: true });

    // Add camelCase aliases for snake_case properties
    const transformedOpponent = {
      ...plainOpponent,
      id: plainOpponent.id,
      bookingId: plainOpponent.booking_id,
      teamName: plainOpponent.team_name,
      contactPhone: plainOpponent.contact_phone,
      contactEmail: plainOpponent.contact_email,
      skillLevel: plainOpponent.skill_level,
      playerCount: plainOpponent.player_count,
      expireDate: plainOpponent.expireDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Default to 7 days from now if missing
      // Keep the original snake_case properties too for backward compatibility
    };

    console.log(`Successfully fetched opponent with ID: ${id}`);
    res.json({
      success: true,
      opponent: transformedOpponent
    });
  } catch (error) {
    console.error('Error fetching opponent:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch opponent',
      error: error.message
    });
  }
});

// Create a new opponent
router.post('/', async (req, res) => {
  try {
    console.log('Opponent request body:', req.body);

    // Handle both camelCase and snake_case parameters
    const bookingId = req.body.bookingId || req.body.booking_id;
    const teamName = req.body.teamName || req.body.team_name;
    const contactPhone = req.body.contactPhone || req.body.contact_phone;
    const contactEmail = req.body.contactEmail || req.body.contact_email;
    const description = req.body.description;
    const skillLevel = req.body.skillLevel || req.body.skill_level;
    const playerCount = req.body.playerCount || req.body.player_count;
    const expireDate = req.body.expireDate || req.body.expire_date || new Date();

    console.log('Processed opponent parameters:', {
      bookingId, teamName, contactPhone, contactEmail, skillLevel, playerCount, expireDate
    });

    // Validate required fields
    if (!bookingId || !teamName || !contactPhone) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: bookingId, teamName, and contactPhone are required'
      });
    }

    // Check if booking exists and get the match date/time
    const booking = await Booking.findByPk(bookingId, {
      include: [
        {
          model: TimeSlot,
          attributes: ['timeSlotId', 'startTime', 'endTime']
        }
      ]
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Calculate expireDate based on the actual match date and time
    const matchDate = new Date(booking.bookingDate);
    const timeSlot = booking.TimeSlot;

    // Parse the end time (format: "HH:MM:SS")
    const [hours, minutes] = timeSlot.endTime.split(':').map(Number);

    // Set the expire date to the end time of the match
    const calculatedExpireDate = new Date(matchDate);
    calculatedExpireDate.setHours(hours, minutes, 0, 0);

    console.log(`Setting expireDate to match end time: ${calculatedExpireDate} (Match: ${matchDate}, End time: ${timeSlot.endTime})`);

    // Create opponent
    const opponent = await Opponent.create({
      booking_id: bookingId,
      team_name: teamName,
      contact_phone: contactPhone,
      contact_email: contactEmail || null,
      description: description || null,
      skill_level: skillLevel || 'intermediate',
      player_count: playerCount || 5,
      status: 'searching',
      expireDate: calculatedExpireDate
    });

    res.status(201).json({
      success: true,
      message: 'Opponent created successfully',
      opponent: opponent
    });
  } catch (error) {
    console.error('Error creating opponent:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create opponent',
      error: error.message
    });
  }
});

// Update an opponent
router.put('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { teamName, contactPhone, contactEmail, description, status } = req.body;

    // Find opponent
    const opponent = await Opponent.findByPk(id);
    if (!opponent) {
      return res.status(404).json({
        success: false,
        message: 'Opponent not found'
      });
    }

    // Update fields
    if (teamName) opponent.team_name = teamName;
    if (contactPhone) opponent.contact_phone = contactPhone;
    if (contactEmail !== undefined) opponent.contact_email = contactEmail;
    if (description !== undefined) opponent.description = description;
    if (status) opponent.status = status;

    // Save changes
    await opponent.save();

    res.json({
      success: true,
      message: 'Opponent updated successfully',
      opponent: opponent
    });
  } catch (error) {
    console.error('Error updating opponent:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update opponent',
      error: error.message
    });
  }
});

// Delete an opponent
router.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    // Find opponent
    const opponent = await Opponent.findByPk(id);
    if (!opponent) {
      return res.status(404).json({
        success: false,
        message: 'Opponent not found'
      });
    }

    // Delete opponent
    await opponent.destroy();

    res.json({
      success: true,
      message: 'Opponent deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting opponent:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete opponent',
      error: error.message
    });
  }
});

module.exports = router;