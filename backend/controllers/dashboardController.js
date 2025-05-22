const { catchAsync } = require('../utils/error');
const { Booking, Field } = require('../models');
const moment = require('moment');
const { Op } = require('sequelize');
const { sequelize } = require('../config/database');

// Get dashboard statistics from database
exports.getStats = catchAsync(async (_, res) => {
  console.log('Fetching bookings for stats...');

  const targetStatus = 'đã đặt'; // Lowercase target

  // Get bookings with status 'Đã đặt'
  const bookings = await Booking.findAll({
    attributes: ['bookingId', 'totalPrice', 'createdAt', 'status'],
    where: sequelize.where(sequelize.fn('LOWER', sequelize.fn('TRIM', sequelize.col('status'))), 'LIKE', '%' + targetStatus + '%')
  });

  console.log(`Found ${bookings.length} bookings matching status '${targetStatus}' in DB query.`);

  // Calculate total bookings based on the fetched bookings
  const totalBookings = bookings.length;
  console.log(`Calculated total bookings from fetched bookings: ${totalBookings}`);

  // Calculate total income from the fetched bookings
  const totalIncome = bookings
    .reduce((sum, booking) => sum + (parseFloat(booking.totalPrice) || 0), 0);

  console.log(`Total income from fetched matching bookings: ${totalIncome}`);

  // Get date ranges for comparisons (using original moment logic)
  const today = moment().startOf('day');
  const yesterday = moment().subtract(1, 'days').startOf('day');
  const thisWeekStart = moment().startOf('week');
  const lastWeekStart = moment().subtract(1, 'weeks').startOf('week');
  const thisMonthStart = moment().startOf('month');
  const lastMonthStart = moment().subtract(1, 'months').startOf('month');
  const thisYearStart = moment().startOf('year');
  const lastYearStart = moment().subtract(1, 'years').startOf('year');

  console.log(`Date ranges: Today=${today.format()}, Yesterday=${yesterday.format()}, This Week=${thisWeekStart.format()}, Last Week=${lastWeekStart.format()}, This Month=${thisMonthStart.format()}, Last Month=${lastMonthStart.format()}, This Year=${thisYearStart.format()}, Last Year=${lastYearStart.format()}`);

  // Count bookings for each period - Filter using the fetched bookings and date comparison
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

  console.log(`Booking counts (filtered): Today=${todayBookings}, Yesterday=${yesterdayBookings}, This Week=${thisWeekBookings}, Last Week=${lastWeekBookings}, This Month=${thisMonthBookings}, Last Month=${lastMonthBookings}, This Year=${thisYearBookings}, Last Year=${lastYearBookings}`);

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
  const { period, date } = req.query;
  const selectedDate = moment(date);

  let chartData = [];

  // Simplified implementation that returns sample data based on actual bookings
  // This avoids complex SQL functions that might not be supported in all database engines

  let startDate, endDate;
  let groupingFormat;
  let intervalType;
  let labels = [];

  switch(period) {
    case 'day':
      startDate = moment(selectedDate).startOf('day');
      endDate = moment(selectedDate).endOf('day');
      groupingFormat = 'H:00';
      intervalType = 'hour';
      labels = Array(24).fill(0).map((_, i) => moment(startDate).add(i, 'hours').format(groupingFormat));
      break;
    case 'week':
      startDate = moment(selectedDate).startOf('week');
      endDate = moment(selectedDate).endOf('week');
      groupingFormat = 'ddd'; // Mon, Tue, etc.
      intervalType = 'day';
      labels = Array(7).fill(0).map((_, i) => moment(startDate).add(i, 'days').format(groupingFormat));
      break;
    case 'month':
      startDate = moment(selectedDate).startOf('month');
      endDate = moment(selectedDate).endOf('month');
      groupingFormat = 'D'; // 1, 2, 3, etc.
      intervalType = 'day';
      labels = Array(moment(endDate).diff(startDate, 'days') + 1).fill(0).map((_, i) => moment(startDate).add(i, 'days').format(groupingFormat));
      break;
    case 'year':
    default:
      startDate = moment(selectedDate).startOf('year');
      endDate = moment(selectedDate).endOf('year');
      groupingFormat = 'MMM'; // Jan, Feb, etc.
      intervalType = 'month';
      labels = Array(12).fill(0).map((_, i) => moment(startDate).add(i, 'months').format(groupingFormat));
      break;
  }

  // Get bookings within the calculated date range
  const bookings = await Booking.findAll({
    attributes: ['bookingId', 'totalPrice', 'bookingDate', 'status'],
    where: {
      [Op.and]: [
        sequelize.where(sequelize.fn('LOWER', sequelize.fn('TRIM', sequelize.col('status'))), 'LIKE', '%booked%'),
        {
          bookingDate: {
            [Op.between]: [startDate.toDate(), endDate.toDate()]
          }
        }
      ]
    }
  });

  // Initialize chart data with labels and zero values
  chartData = labels.map(label => ({
    name: label,
    value: 0
  }));

  // Aggregate booking data into chartData buckets
  bookings.forEach(booking => {
    const bookingDateMoment = moment(booking.bookingDate);
    let labelIndex;

    switch(period) {
      case 'day':
        labelIndex = bookingDateMoment.hour();
        if (labelIndex >= 0 && labelIndex < 24) {
           chartData[labelIndex].value += parseFloat(booking.totalPrice) || 0;
        }
        break;
      case 'week':
        // Calculate the difference in days from the start of the week
        labelIndex = bookingDateMoment.diff(startDate, 'days');
        if (labelIndex >= 0 && labelIndex < chartData.length) {
          chartData[labelIndex].value += parseFloat(booking.totalPrice) || 0;
        }
        break;
      case 'month':
        // Day of month is 1-based. Subtract 1 for 0-based index.
        labelIndex = bookingDateMoment.date() - 1;
         if (labelIndex >= 0 && labelIndex < chartData.length) {
           chartData[labelIndex].value += parseFloat(booking.totalPrice) || 0;
        }
        break;
      case 'year':
        labelIndex = bookingDateMoment.month(); // 0-11 for Jan-Dec
        chartData[labelIndex].value += parseFloat(booking.totalPrice) || 0;
        break;
    }
  });

  // Handle year period separately for revenueByQuarter
  if (period === 'year') {
     // Tính doanh thu theo quý
      const revenueByQuarter = [0, 0, 0, 0];
      bookings.forEach(booking => {
        const month = moment(booking.createdAt).month();
        const quarter = Math.floor(month / 3); // 0-3
        revenueByQuarter[quarter] += booking.totalPrice || 0;
      });
      // Định dạng dữ liệu trả về cho từng quý
      const revenueByQuarterData = [
        { quarter: 'Quý 1', value: revenueByQuarter[0] },
        { quarter: 'Quý 2', value: revenueByQuarter[1] },
        { quarter: 'Quý 3', value: revenueByQuarter[2] },
        { quarter: 'Quý 4', value: revenueByQuarter[3] }
      ];
      return res.status(200).json({
        chartData,
        revenueByQuarter: revenueByQuarterData
      });
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

// API: Xu hướng đặt sân trung bình mỗi thứ trong tuần
exports.getBookingTrend = catchAsync(async (req, res) => {
  // Calculate date range for the current week
  const now = moment();
  const weekStart = now.clone().startOf('week');
  const weekEnd = now.clone().endOf('week');

  console.log(`Calculating booking trend for week: ${weekStart.format()} - ${weekEnd.format()}`);

  const bookings = await Booking.findAll({
    attributes: ['bookingDate'],
    where: {
      bookingDate: {
        [Op.between]: [weekStart.toDate(), weekEnd.toDate()]
      }
    }
  });

  console.log(`Found ${bookings.length} bookings matching status 'Đã đặt' or similar in the current week.`);

  // Đếm số lượt đặt theo từng thứ trong tuần
  const weekdayCounts = Array(7).fill(0);
  bookings.forEach(booking => {
    const bookingDateMoment = moment(booking.bookingDate);
    // Moment day() returns 0 for Sunday, 1 for Monday, ..., 6 for Saturday.
    const dayIndex = bookingDateMoment.day();
    if (dayIndex >= 0 && dayIndex < 7) {
      weekdayCounts[dayIndex]++;
    }
  });

  // For booking trend, we just need the counts per day of the week within the period
  const weekdays = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
  const data = weekdays.map((name, i) => ({
    name,
    bookings: weekdayCounts[i]
  }));

  console.log('Booking trend data:', data);

  res.status(200).json(data);
});