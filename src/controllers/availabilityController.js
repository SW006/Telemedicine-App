const { pool } = require('../db/db');

const availabilityController = {
  // Get doctor availability
  getDoctorAvailability: async (req, res, next) => {
    try {
      const { doctorId } = req.params;
      const { date } = req.query;

      // Check if doctor exists
      const doctorCheck = await pool.query(
        'SELECT id FROM doctors WHERE id = $1 AND verified = true',
        [doctorId]
      );

      if (doctorCheck.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Doctor not found'
        });
      }

      let query = `
        SELECT day_of_week, start_time, end_time, is_available
        FROM availability
        WHERE doctor_id = $1 AND is_available = true
      `;
      
      const queryParams = [doctorId];

      if (date) {
        const dayOfWeek = new Date(date).getDay();
        query += ' AND day_of_week = $2';
        queryParams.push(dayOfWeek);
      }

      query += ' ORDER BY day_of_week, start_time';

      const result = await pool.query(query, queryParams);

      res.json({
        success: true,
        data: result.rows
      });
    } catch (error) {
      console.error('Get doctor availability error:', error);
      next(error);
    }
  },

  // Get available time slots for a specific date
  getAvailableSlots: async (req, res, next) => {
    try {
      const { doctorId } = req.params;
      const { date } = req.query;

      if (!date) {
        return res.status(400).json({
          success: false,
          error: 'Date is required'
        });
      }

      // Check if doctor exists
      const doctorCheck = await pool.query(
        'SELECT id FROM doctors WHERE id = $1 AND verified = true',
        [doctorId]
      );

      if (doctorCheck.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Doctor not found'
        });
      }

      const dayOfWeek = new Date(date).getDay();

      // Get doctor's availability for this day
      const availability = await pool.query(`
        SELECT start_time, end_time
        FROM availability
        WHERE doctor_id = $1 AND day_of_week = $2 AND is_available = true
        ORDER BY start_time
      `, [doctorId, dayOfWeek]);

      if (availability.rows.length === 0) {
        return res.json({
          success: true,
          data: []
        });
      }

      // Get existing appointments for this date
      const appointments = await pool.query(`
        SELECT appointment_time
        FROM appointments
        WHERE doctor_id = $1 AND appointment_date = $2 AND status != 'cancelled'
        ORDER BY appointment_time
      `, [doctorId, date]);

      const bookedTimes = new Set(appointments.rows.map(row => row.appointment_time));

      // Generate available time slots
      const availableSlots = [];
      
      for (const slot of availability.rows) {
        const startTime = new Date(`2000-01-01T${slot.start_time}`);
        const endTime = new Date(`2000-01-01T${slot.end_time}`);
        
        // Generate 30-minute slots
        const currentTime = new Date(startTime);
        while (currentTime < endTime) {
          const timeString = currentTime.toTimeString().slice(0, 5);
          
          if (!bookedTimes.has(timeString)) {
            availableSlots.push(timeString);
          }
          
          currentTime.setMinutes(currentTime.getMinutes() + 30);
        }
      }

      res.json({
        success: true,
        data: availableSlots
      });
    } catch (error) {
      console.error('Get available slots error:', error);
      next(error);
    }
  },

  // Set doctor availability (for doctors)
  setAvailability: async (req, res, next) => {
    try {
      const { doctorId } = req.params;
      const { day_of_week, start_time, end_time } = req.body;
      const userId = req.userId;

      // Check if user is the doctor
      const doctorCheck = await pool.query(
        'SELECT id FROM doctors WHERE id = $1 AND user_id = $2',
        [doctorId, userId]
      );

      if (doctorCheck.rows.length === 0) {
        return res.status(403).json({
          success: false,
          error: 'You can only set availability for your own profile'
        });
      }

      // Validate time range
      if (start_time >= end_time) {
        return res.status(400).json({
          success: false,
          error: 'Start time must be before end time'
        });
      }

      // Check for existing availability for this day
      const existing = await pool.query(
        'SELECT id FROM availability WHERE doctor_id = $1 AND day_of_week = $2',
        [doctorId, day_of_week]
      );

      if (existing.rows.length > 0) {
        // Update existing
        await pool.query(
          'UPDATE availability SET start_time = $1, end_time = $2, updated_at = CURRENT_TIMESTAMP WHERE doctor_id = $3 AND day_of_week = $4',
          [start_time, end_time, doctorId, day_of_week]
        );
      } else {
        // Create new
        await pool.query(
          'INSERT INTO availability (doctor_id, day_of_week, start_time, end_time) VALUES ($1, $2, $3, $4)',
          [doctorId, day_of_week, start_time, end_time]
        );
      }

      res.json({
        success: true,
        message: 'Availability updated successfully'
      });
    } catch (error) {
      console.error('Set availability error:', error);
      next(error);
    }
  },

  // Update availability (bulk)
  updateAvailability: async (req, res, next) => {
    try {
      const { doctorId } = req.params;
      const { availability } = req.body;
      const userId = req.userId;

      // Check if user is the doctor
      const doctorCheck = await pool.query(
        'SELECT id FROM doctors WHERE id = $1 AND user_id = $2',
        [doctorId, userId]
      );

      if (doctorCheck.rows.length === 0) {
        return res.status(403).json({
          success: false,
          error: 'You can only update availability for your own profile'
        });
      }

      // Clear existing availability for this doctor
      await pool.query('DELETE FROM availability WHERE doctor_id = $1', [doctorId]);

      // Insert new availability slots
      for (const slot of availability) {
        const { day_of_week, start_time, end_time, is_available = true } = slot;
        
        if (start_time >= end_time) {
          return res.status(400).json({
            success: false,
            error: 'Start time must be before end time'
          });
        }

        await pool.query(
          'INSERT INTO availability (doctor_id, day_of_week, start_time, end_time, is_available) VALUES ($1, $2, $3, $4, $5)',
          [doctorId, day_of_week, start_time, end_time, is_available]
        );
      }

      res.json({
        success: true,
        message: 'Availability updated successfully'
      });
    } catch (error) {
      console.error('Update availability error:', error);
      next(error);
    }
  },

  // Update specific availability slot
  updateAvailabilitySlot: async (req, res, next) => {
    try {
      const { availabilityId } = req.params;
      const { day_of_week, start_time, end_time, is_available } = req.body;
      const userId = req.userId;

      // Check if the availability slot belongs to the user
      const slotCheck = await pool.query(
        'SELECT a.id FROM availability a JOIN doctors d ON a.doctor_id = d.id WHERE a.id = $1 AND d.user_id = $2',
        [availabilityId, userId]
      );

      if (slotCheck.rows.length === 0) {
        return res.status(403).json({
          success: false,
          error: 'You can only update your own availability slots'
        });
      }

      // Validate time range
      if (start_time >= end_time) {
        return res.status(400).json({
          success: false,
          error: 'Start time must be before end time'
        });
      }

      await pool.query(
        'UPDATE availability SET day_of_week = $1, start_time = $2, end_time = $3, is_available = $4, updated_at = CURRENT_TIMESTAMP WHERE id = $5',
        [day_of_week, start_time, end_time, is_available, availabilityId]
      );

      res.json({
        success: true,
        message: 'Availability slot updated successfully'
      });
    } catch (error) {
      console.error('Update availability slot error:', error);
      next(error);
    }
  },

  // Add new availability slot
  addAvailabilitySlot: async (req, res, next) => {
    try {
      const { doctor_id, day_of_week, start_time, end_time, is_available = true } = req.body;
      const userId = req.userId;

      // Check if user is the doctor
      const doctorCheck = await pool.query(
        'SELECT id FROM doctors WHERE id = $1 AND user_id = $2',
        [doctor_id, userId]
      );

      if (doctorCheck.rows.length === 0) {
        return res.status(403).json({
          success: false,
          error: 'You can only add availability slots for your own profile'
        });
      }

      // Validate time range
      if (start_time >= end_time) {
        return res.status(400).json({
          success: false,
          error: 'Start time must be before end time'
        });
      }

      const result = await pool.query(
        'INSERT INTO availability (doctor_id, day_of_week, start_time, end_time, is_available) VALUES ($1, $2, $3, $4, $5) RETURNING id',
        [doctor_id, day_of_week, start_time, end_time, is_available]
      );

      res.status(201).json({
        success: true,
        message: 'Availability slot added successfully',
        data: { id: result.rows[0].id }
      });
    } catch (error) {
      console.error('Add availability slot error:', error);
      next(error);
    }
  },

  // Delete availability slot
  deleteAvailabilitySlot: async (req, res, next) => {
    try {
      const { availabilityId } = req.params;
      const userId = req.userId;

      // Check if the availability slot belongs to the user
      const slotCheck = await pool.query(
        'SELECT a.id FROM availability a JOIN doctors d ON a.doctor_id = d.id WHERE a.id = $1 AND d.user_id = $2',
        [availabilityId, userId]
      );

      if (slotCheck.rows.length === 0) {
        return res.status(403).json({
          success: false,
          error: 'You can only delete your own availability slots'
        });
      }

      await pool.query('DELETE FROM availability WHERE id = $1', [availabilityId]);

      res.json({
        success: true,
        message: 'Availability slot deleted successfully'
      });
    } catch (error) {
      console.error('Delete availability slot error:', error);
      next(error);
    }
  }
};

module.exports = availabilityController;