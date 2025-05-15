const { catchAsync } = require('../utils/error');
const { Booking, Field } = require('../models');
const moment = require('moment');

// Get dashboard statistics from database
exports.getStats = catchAsync(async (_, res) => {
  // Get all bookings
  const bookings = await Booking.findAll({
    attributes: ['bookingId', 'totalPrice', 'createdAt', 'status']
  });

  // Calculate total bookings
  const totalBookings = bookings.length;

  // Calculate total income from confirmed bookings
  const totalIncome = bookings
    .filter(booking => booking.status === 'confirmed')
    .reduce((sum, booking) => sum + (booking.totalPrice || 0), 0);

  // Get date ranges for comparisons
  const today = moment().startOf('day');
  const yesterday = moment().subtract(1, 'days').startOf('day');
  const thisWeekStart = moment().startOf('week');
  const lastWeekStart = moment().subtract(1, 'weeks').startOf('week');
  const thisMonthStart = moment().startOf('month');
  const lastMonthStart = moment().subtract(1, 'months').startOf('month');
  const thisYearStart = moment().startOf('year');
  const lastYearStart = moment().subtract(1, 'years').startOf('year');

  // Count bookings for each period
  const todayBookings = bookings.filter(booking =>
    moment(booking.createdAt).isSame(today, 'day')
  ).length;

  const yesterdayBookings = bookings.filter(booking =>
    moment(booking.createdAt).isSame(yesterday, 'day')
  ).length;

  const thisWeekBookings = bookings.filter(booking =>
    moment(booking.createdAt).isSame(thisWeekStart, 'week')
  ).length;

  const lastWeekBookings = bookings.filter(booking =>
    moment(booking.createdAt).isSame(lastWeekStart, 'week')
  ).length;

  const thisMonthBookings = bookings.filter(booking =>
    moment(booking.createdAt).isSame(thisMonthStart, 'month')
  ).length;

  const lastMonthBookings = bookings.filter(booking =>
    moment(booking.createdAt).isSame(lastMonthStart, 'month')
  ).length;

  const thisYearBookings = bookings.filter(booking =>
    moment(booking.createdAt).isSame(thisYearStart, 'year')
  ).length;

  const lastYearBookings = bookings.filter(booking =>
    moment(booking.createdAt).isSame(lastYearStart, 'year')
  ).length;

  res.status(200).json({
    totalBookings,
    totalIncome,
    productSales: 0, // Removed feature
    compareData: {
      day: { current: todayBookings, previous: yesterdayBookings },
      week: { current: thisWeekBookings, previous: lastWeekBookings },
      month: { current: thisMonthBookings, previous: lastMonthBookings },
      year: { current: thisYearBookings, previous: lastYearBookings }
    }
  });
});

// Get booking chart data from database
exports.getBookingChartData = catchAsync(async (req, res) => {
  const { period } = req.query;
  let chartData = [];

  // Simplified implementation that returns sample data based on actual bookings
  // This avoids complex SQL functions that might not be supported in all database engines

  // Get all bookings
  const bookings = await Booking.findAll({
    attributes: ['bookingId', 'totalPrice', 'createdAt', 'status'],
    where: {
      status: 'confirmed'
    }
  });

  // Process bookings based on period
  switch(period) {
    case 'day': {
      // Create hourly buckets (0-23)
      const hourlyBuckets = Array(24).fill(0).map((_, i) => ({
        name: `${i}:00`,
        value: 0
      }));

      // Filter bookings for today
      const todayStart = moment().startOf('day');
      const todayBookings = bookings.filter(booking =>
        moment(booking.createdAt).isSame(todayStart, 'day')
      );

      // Group by hour
      todayBookings.forEach(booking => {
        const hour = moment(booking.createdAt).hour();
        hourlyBuckets[hour].value += booking.totalPrice || 0;
      });

      // Only include hours with data
      chartData = hourlyBuckets.filter(bucket => bucket.value > 0);

      // If no data, include some hours for display
      if (chartData.length === 0) {
        chartData = [
          { name: '08:00', value: 0 },
          { name: '12:00', value: 0 },
          { name: '16:00', value: 0 },
          { name: '20:00', value: 0 }
        ];
      }

      break;
    }

    case 'week': {
      // Create daily buckets (0-6, Sunday to Saturday)
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const dailyBuckets = dayNames.map(name => ({
        name,
        value: 0
      }));

      // Filter bookings for this week
      const weekStart = moment().startOf('week');
      const weekBookings = bookings.filter(booking =>
        moment(booking.createdAt).isSame(weekStart, 'week')
      );

      // Group by day of week
      weekBookings.forEach(booking => {
        const dayOfWeek = moment(booking.createdAt).day(); // 0-6, Sunday to Saturday
        dailyBuckets[dayOfWeek].value += booking.totalPrice || 0;
      });

      chartData = dailyBuckets;
      break;
    }

    case 'month': {
      // Create weekly buckets (1-5)
      const weeklyBuckets = Array(5).fill(0).map((_, i) => ({
        name: `Week ${i + 1}`,
        value: 0
      }));

      // Filter bookings for this month
      const monthStart = moment().startOf('month');
      const monthBookings = bookings.filter(booking =>
        moment(booking.createdAt).isSame(monthStart, 'month')
      );

      // Group by week of month (approximate)
      monthBookings.forEach(booking => {
        const day = moment(booking.createdAt).date();
        const weekOfMonth = Math.min(Math.floor((day - 1) / 7), 4); // 0-4
        weeklyBuckets[weekOfMonth].value += booking.totalPrice || 0;
      });

      chartData = weeklyBuckets;
      break;
    }

    case 'year':
    default: {
      // Create monthly buckets (0-11, January to December)
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const monthlyBuckets = monthNames.map(name => ({
        name,
        value: 0
      }));

      // Filter bookings for this year
      const yearStart = moment().startOf('year');
      const yearBookings = bookings.filter(booking =>
        moment(booking.createdAt).isSame(yearStart, 'year')
      );

      // Group by month
      yearBookings.forEach(booking => {
        const month = moment(booking.createdAt).month(); // 0-11
        monthlyBuckets[month].value += booking.totalPrice || 0;
      });

      chartData = monthlyBuckets;
    }
  }

  res.status(200).json({
    chartData
  });
});

// Get popular fields from database
exports.getPopularFields = catchAsync(async (_, res) => {
  // Get all fields
  const fields = await Field.findAll({
    attributes: ['fieldId', 'name', 'size', 'description']
  });

  // Get all bookings
  const bookings = await Booking.findAll({
    attributes: ['fieldId']
  });

  // Count bookings per field
  const fieldBookingCounts = {};
  bookings.forEach(booking => {
    const fieldId = booking.fieldId;
    if (fieldId) {
      fieldBookingCounts[fieldId] = (fieldBookingCounts[fieldId] || 0) + 1;
    }
  });

  // Format the data
  const formattedFields = fields.map(field => ({
    fieldId: field.fieldId,
    field: {
      name: field.name,
      size: field.size,
      description: field.description
    },
    bookingCount: fieldBookingCounts[field.fieldId] || 0
  }));

  // Sort by booking count and limit to 4
  const sortedFields = formattedFields
    .sort((a, b) => b.bookingCount - a.bookingCount)
    .slice(0, 4);

  res.status(200).json({
    data: sortedFields
  });
});