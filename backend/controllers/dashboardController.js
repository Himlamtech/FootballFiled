const { catchAsync } = require('../utils/error');
const { Booking, Field, TimeSlot, Feedback, Opponent } = require('../models');
const moment = require('moment');
const { Op } = require('sequelize');
const { sequelize } = require('../config/database');

// Get dashboard statistics from database
exports.getStats = catchAsync(async (_, res) => {
  console.log('Fetching bookings for stats...');

  // Get bookings with status 'Đã đặt'
  const bookings = await Booking.findAll({
    attributes: ['bookingId', 'totalPrice', 'createdAt', 'status', 'bookingDate', 'fieldId', 'timeSlotId'],
    where: {
      status: 'Đã đặt'
    },
    include: [
      {
        model: Field,
        attributes: ['name', 'size']
      },
      {
        model: TimeSlot,
        attributes: ['startTime', 'endTime']
      }
    ]
  });

  console.log(`Found ${bookings.length} bookings matching status 'Đã đặt' in DB query.`);

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

  // Calculate revenue for each period
  const todayRevenue = bookings
    .filter(booking => moment(booking.createdAt).isSame(today, 'day'))
    .reduce((sum, booking) => sum + (parseFloat(booking.totalPrice) || 0), 0);

  const yesterdayRevenue = bookings
    .filter(booking => moment(booking.createdAt).isSame(yesterday, 'day'))
    .reduce((sum, booking) => sum + (parseFloat(booking.totalPrice) || 0), 0);

  const thisWeekRevenue = bookings
    .filter(booking => moment(booking.createdAt).isSame(thisWeekStart, 'week'))
    .reduce((sum, booking) => sum + (parseFloat(booking.totalPrice) || 0), 0);

  const lastWeekRevenue = bookings
    .filter(booking => moment(booking.createdAt).isSame(lastWeekStart, 'week'))
    .reduce((sum, booking) => sum + (parseFloat(booking.totalPrice) || 0), 0);

  const thisMonthRevenue = bookings
    .filter(booking => moment(booking.createdAt).isSame(thisMonthStart, 'month'))
    .reduce((sum, booking) => sum + (parseFloat(booking.totalPrice) || 0), 0);

  const lastMonthRevenue = bookings
    .filter(booking => moment(booking.createdAt).isSame(lastMonthStart, 'month'))
    .reduce((sum, booking) => sum + (parseFloat(booking.totalPrice) || 0), 0);

  // Get additional statistics
  const [feedbackCount, opponentCount, fieldCount, pendingFeedbackCount] = await Promise.all([
    Feedback.count(),
    Opponent.count(),
    Field.count(),
    Feedback.count({
      where: {
        status: 'new'
      }
    })
  ]);

  // Calculate revenue by field size
  const revenueByFieldSize = {};
  bookings.forEach(booking => {
    const fieldSize = booking.Field?.size || 'Unknown';
    if (!revenueByFieldSize[fieldSize]) {
      revenueByFieldSize[fieldSize] = 0;
    }
    revenueByFieldSize[fieldSize] += parseFloat(booking.totalPrice) || 0;
  });

  // Format revenue by field size for frontend
  const revenueByFieldSizeArray = Object.keys(revenueByFieldSize).map(size => ({
    fieldSize: size,
    revenue: revenueByFieldSize[size],
    percentage: (revenueByFieldSize[size] / totalIncome) * 100
  }));

  // Calculate revenue by day of week
  const revenueByDayOfWeek = Array(7).fill(0);
  bookings.forEach(booking => {
    const dayOfWeek = moment(booking.bookingDate).day(); // 0 = Sunday, 1 = Monday, etc.
    revenueByDayOfWeek[dayOfWeek] += parseFloat(booking.totalPrice) || 0;
  });

  // Format revenue by day of week for frontend
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const revenueByDayOfWeekArray = daysOfWeek.map((day, index) => ({
    day,
    revenue: revenueByDayOfWeek[index],
    percentage: (revenueByDayOfWeek[index] / totalIncome) * 100
  }));

  // Calculate this year revenue by month
  const thisYearRevenueByMonth = Array(12).fill(0);
  const lastYearRevenueByMonth = Array(12).fill(0);

  bookings.forEach(booking => {
    const bookingDate = moment(booking.bookingDate);
    const month = bookingDate.month(); // 0-11

    if (bookingDate.isSame(thisYearStart, 'year')) {
      thisYearRevenueByMonth[month] += parseFloat(booking.totalPrice) || 0;
    } else if (bookingDate.isSame(lastYearStart, 'year')) {
      lastYearRevenueByMonth[month] += parseFloat(booking.totalPrice) || 0;
    }
  });

  // Format yearly revenue comparison for frontend
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const yearlyRevenueComparison = months.map((month, index) => ({
    month,
    thisYear: thisYearRevenueByMonth[index],
    lastYear: lastYearRevenueByMonth[index],
    growth: lastYearRevenueByMonth[index] > 0
      ? ((thisYearRevenueByMonth[index] - lastYearRevenueByMonth[index]) / lastYearRevenueByMonth[index]) * 100
      : 0
  }));

  // Get recent bookings for history
  const recentBookings = bookings
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5)
    .map(booking => ({
      id: booking.bookingId,
      date: moment(booking.bookingDate).format('DD/MM/YYYY'),
      time: `${booking.TimeSlot?.startTime} - ${booking.TimeSlot?.endTime}`,
      field: booking.Field?.name || `Sân ${booking.fieldId}`,
      fieldSize: booking.Field?.size || '',
      amount: parseFloat(booking.totalPrice) || 0,
      createdAt: moment(booking.createdAt).format('DD/MM/YYYY HH:mm')
    }));

  console.log(`Booking counts (filtered): Today=${todayBookings}, Yesterday=${yesterdayBookings}, This Week=${thisWeekBookings}, Last Week=${lastWeekBookings}, This Month=${thisMonthBookings}, Last Month=${lastMonthBookings}, This Year=${thisYearBookings}, Last Year=${lastYearBookings}`);

  // Calculate average booking value
  const avgBookingValue = totalBookings > 0 ? totalIncome / totalBookings : 0;

  // Calculate growth rates
  const dayGrowthRate = yesterdayRevenue > 0 ? ((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100 : 0;
  const weekGrowthRate = lastWeekRevenue > 0 ? ((thisWeekRevenue - lastWeekRevenue) / lastWeekRevenue) * 100 : 0;
  const monthGrowthRate = lastMonthRevenue > 0 ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 : 0;

  // Calculate projected monthly revenue based on current daily average
  const daysInMonth = moment().daysInMonth();
  const daysPassed = moment().date();
  const dailyAverage = thisMonthRevenue / daysPassed;
  const projectedMonthlyRevenue = dailyAverage * daysInMonth;

  res.status(200).json({
    totalBookings,
    totalIncome,
    productSales: 0, // Removed feature
    compareData: {
      day: {
        current: todayBookings,
        previous: yesterdayBookings,
        currentRevenue: todayRevenue,
        previousRevenue: yesterdayRevenue,
        growthRate: dayGrowthRate
      },
      week: {
        current: thisWeekBookings,
        previous: lastWeekBookings,
        currentRevenue: thisWeekRevenue,
        previousRevenue: lastWeekRevenue,
        growthRate: weekGrowthRate
      },
      month: {
        current: thisMonthBookings,
        previous: lastMonthBookings,
        currentRevenue: thisMonthRevenue,
        previousRevenue: lastMonthRevenue,
        growthRate: monthGrowthRate,
        projected: projectedMonthlyRevenue
      },
      year: {
        current: thisYearBookings,
        previous: lastYearBookings
      }
    },
    additionalStats: {
      feedbackCount,
      pendingFeedbackCount,
      opponentCount,
      fieldCount,
      avgBookingValue
    },
    financialSummary: {
      revenueByFieldSize: revenueByFieldSizeArray,
      revenueByDayOfWeek: revenueByDayOfWeekArray,
      yearlyRevenueComparison
    },
    recentBookings
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
        { status: 'Đã đặt' },
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

// Get revenue analysis by time period
exports.getRevenueAnalysis = catchAsync(async (req, res) => {
  const { period = 'month', startDate, endDate } = req.query;

  // Set default date range if not provided
  let start, end;
  if (startDate && endDate) {
    start = moment(startDate).startOf('day');
    end = moment(endDate).endOf('day');
  } else {
    // Default to last 12 months, last 12 weeks, or last 30 days depending on period
    end = moment().endOf('day');

    switch (period) {
      case 'day':
        start = moment().subtract(30, 'days').startOf('day');
        break;
      case 'week':
        start = moment().subtract(12, 'weeks').startOf('week');
        break;
      case 'month':
      default:
        start = moment().subtract(12, 'months').startOf('month');
        break;
    }
  }

  // Get all bookings within the date range
  const bookings = await Booking.findAll({
    attributes: ['bookingId', 'totalPrice', 'bookingDate', 'status', 'createdAt'],
    where: {
      status: 'Đã đặt',
      bookingDate: {
        [Op.between]: [start.toDate(), end.toDate()]
      }
    }
  });

  // Initialize result array based on period
  let results = [];
  let currentDate = moment(start);

  while (currentDate.isSameOrBefore(end, period)) {
    let periodLabel;
    let nextDate;

    switch (period) {
      case 'day':
        periodLabel = currentDate.format('DD/MM/YYYY');
        nextDate = moment(currentDate).add(1, 'day');
        break;
      case 'week':
        periodLabel = `${currentDate.format('DD/MM/YYYY')} - ${moment(currentDate).endOf('week').format('DD/MM/YYYY')}`;
        nextDate = moment(currentDate).add(1, 'week');
        break;
      case 'month':
      default:
        periodLabel = currentDate.format('MM/YYYY');
        nextDate = moment(currentDate).add(1, 'month');
        break;
    }

    results.push({
      period: periodLabel,
      revenue: 0,
      bookingCount: 0,
      avgBookingValue: 0
    });

    currentDate = nextDate;
  }

  // Aggregate booking data
  bookings.forEach(booking => {
    const bookingDate = moment(booking.bookingDate);
    let index = 0;

    switch (period) {
      case 'day':
        index = bookingDate.diff(start, 'days');
        break;
      case 'week':
        index = Math.floor(bookingDate.diff(start, 'days') / 7);
        break;
      case 'month':
      default:
        index = bookingDate.diff(start, 'months');
        break;
    }

    if (index >= 0 && index < results.length) {
      results[index].revenue += parseFloat(booking.totalPrice) || 0;
      results[index].bookingCount += 1;
    }
  });

  // Calculate average booking value
  results.forEach(result => {
    result.avgBookingValue = result.bookingCount > 0 ? result.revenue / result.bookingCount : 0;
  });

  // Calculate growth rates
  for (let i = 1; i < results.length; i++) {
    const prevRevenue = results[i-1].revenue;
    const currentRevenue = results[i].revenue;

    results[i].growthRate = prevRevenue > 0
      ? ((currentRevenue - prevRevenue) / prevRevenue) * 100
      : 0;
  }

  // First period has no previous period to compare with
  results[0].growthRate = 0;

  // Calculate total and average values
  const totalRevenue = results.reduce((sum, item) => sum + item.revenue, 0);
  const totalBookings = results.reduce((sum, item) => sum + item.bookingCount, 0);
  const avgRevenue = results.length > 0 ? totalRevenue / results.length : 0;
  const avgBookings = results.length > 0 ? totalBookings / results.length : 0;

  res.status(200).json({
    period,
    startDate: start.format('YYYY-MM-DD'),
    endDate: end.format('YYYY-MM-DD'),
    data: results,
    summary: {
      totalRevenue,
      totalBookings,
      avgRevenue,
      avgBookings,
      avgBookingValue: totalBookings > 0 ? totalRevenue / totalBookings : 0
    }
  });
});

// Get detailed booking history with pagination and filtering
exports.getBookingHistory = catchAsync(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    startDate,
    endDate,
    fieldId,
    status,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = req.query;

  // Build filter conditions
  const whereConditions = {};

  if (startDate && endDate) {
    whereConditions.bookingDate = {
      [Op.between]: [
        moment(startDate).startOf('day').toDate(),
        moment(endDate).endOf('day').toDate()
      ]
    };
  } else if (startDate) {
    whereConditions.bookingDate = {
      [Op.gte]: moment(startDate).startOf('day').toDate()
    };
  } else if (endDate) {
    whereConditions.bookingDate = {
      [Op.lte]: moment(endDate).endOf('day').toDate()
    };
  }

  if (fieldId) {
    whereConditions.fieldId = fieldId;
  }

  if (status) {
    whereConditions.status = status;
  }

  // Calculate pagination
  const offset = (page - 1) * limit;

  // Determine sort order
  const order = [[sortBy, sortOrder.toUpperCase()]];

  // Get total count for pagination
  const totalCount = await Booking.count({ where: whereConditions });

  // Get bookings with pagination and sorting
  const bookings = await Booking.findAll({
    where: whereConditions,
    include: [
      {
        model: Field,
        attributes: ['name', 'size']
      },
      {
        model: TimeSlot,
        attributes: ['startTime', 'endTime']
      }
    ],
    order,
    limit: parseInt(limit),
    offset: parseInt(offset)
  });

  // Format bookings for response
  const formattedBookings = bookings.map(booking => ({
    id: booking.bookingId,
    date: moment(booking.bookingDate).format('DD/MM/YYYY'),
    time: `${booking.TimeSlot?.startTime} - ${booking.TimeSlot?.endTime}`,
    field: booking.Field?.name || `Sân ${booking.fieldId}`,
    fieldSize: booking.Field?.size || '',
    amount: parseFloat(booking.totalPrice) || 0,
    status: booking.status,
    customerName: booking.customerName,
    customerPhone: booking.customerPhone,
    customerEmail: booking.customerEmail,
    notes: booking.notes,
    createdAt: moment(booking.createdAt).format('DD/MM/YYYY HH:mm')
  }));

  // Calculate total pages
  const totalPages = Math.ceil(totalCount / limit);

  // Calculate summary statistics for the filtered bookings
  const totalAmount = bookings.reduce((sum, booking) => sum + (parseFloat(booking.totalPrice) || 0), 0);
  const avgAmount = bookings.length > 0 ? totalAmount / bookings.length : 0;

  res.status(200).json({
    bookings: formattedBookings,
    pagination: {
      total: totalCount,
      totalPages,
      currentPage: parseInt(page),
      limit: parseInt(limit)
    },
    summary: {
      totalAmount,
      avgAmount,
      count: bookings.length
    }
  });
});

// Get customer statistics
exports.getCustomerStats = catchAsync(async (req, res) => {
  // Get all bookings with customer information
  const bookings = await Booking.findAll({
    attributes: ['bookingId', 'customerName', 'customerEmail', 'customerPhone', 'totalPrice', 'createdAt'],
    where: {
      status: 'Đã đặt'
    }
  });

  // Group bookings by customer (using email as unique identifier)
  const customerMap = {};

  bookings.forEach(booking => {
    const customerEmail = booking.customerEmail || 'unknown';
    const customerName = booking.customerName || 'Unknown';
    const customerPhone = booking.customerPhone || 'Unknown';
    const bookingAmount = parseFloat(booking.totalPrice) || 0;
    const bookingDate = moment(booking.createdAt);

    if (!customerMap[customerEmail]) {
      customerMap[customerEmail] = {
        email: customerEmail,
        name: customerName,
        phone: customerPhone,
        totalSpent: 0,
        bookingCount: 0,
        firstBooking: bookingDate,
        lastBooking: bookingDate,
        bookings: []
      };
    }

    const customer = customerMap[customerEmail];
    customer.totalSpent += bookingAmount;
    customer.bookingCount += 1;

    // Update first and last booking dates
    if (bookingDate.isBefore(customer.firstBooking)) {
      customer.firstBooking = bookingDate;
    }
    if (bookingDate.isAfter(customer.lastBooking)) {
      customer.lastBooking = bookingDate;
    }

    // Add booking to customer's booking list
    customer.bookings.push({
      id: booking.bookingId,
      amount: bookingAmount,
      date: bookingDate.format('DD/MM/YYYY')
    });
  });

  // Convert map to array and calculate additional metrics
  const customers = Object.values(customerMap).map(customer => {
    // Calculate average booking value
    customer.avgBookingValue = customer.bookingCount > 0 ? customer.totalSpent / customer.bookingCount : 0;

    // Calculate days since last booking
    customer.daysSinceLastBooking = moment().diff(customer.lastBooking, 'days');

    // Calculate customer lifetime (days between first and last booking)
    customer.customerLifetime = customer.lastBooking.diff(customer.firstBooking, 'days');

    // Format dates
    customer.firstBooking = customer.firstBooking.format('DD/MM/YYYY');
    customer.lastBooking = customer.lastBooking.format('DD/MM/YYYY');

    return customer;
  });

  // Sort customers by total spent (descending)
  customers.sort((a, b) => b.totalSpent - a.totalSpent);

  // Calculate top customers (top 10)
  const topCustomers = customers.slice(0, 10).map(customer => ({
    name: customer.name,
    email: customer.email,
    phone: customer.phone,
    totalSpent: customer.totalSpent,
    bookingCount: customer.bookingCount,
    avgBookingValue: customer.avgBookingValue
  }));

  // Calculate summary statistics
  const totalCustomers = customers.length;
  const totalRevenue = customers.reduce((sum, customer) => sum + customer.totalSpent, 0);
  const totalBookings = customers.reduce((sum, customer) => sum + customer.bookingCount, 0);
  const avgRevenuePerCustomer = totalCustomers > 0 ? totalRevenue / totalCustomers : 0;
  const avgBookingsPerCustomer = totalCustomers > 0 ? totalBookings / totalCustomers : 0;

  // Calculate customer segments based on booking frequency
  const oneTimeCustomers = customers.filter(customer => customer.bookingCount === 1).length;
  const regularCustomers = customers.filter(customer => customer.bookingCount >= 2 && customer.bookingCount <= 5).length;
  const loyalCustomers = customers.filter(customer => customer.bookingCount > 5).length;

  res.status(200).json({
    summary: {
      totalCustomers,
      totalRevenue,
      totalBookings,
      avgRevenuePerCustomer,
      avgBookingsPerCustomer,
      avgBookingValue: totalBookings > 0 ? totalRevenue / totalBookings : 0
    },
    segments: {
      oneTimeCustomers,
      regularCustomers,
      loyalCustomers,
      oneTimePercentage: totalCustomers > 0 ? (oneTimeCustomers / totalCustomers) * 100 : 0,
      regularPercentage: totalCustomers > 0 ? (regularCustomers / totalCustomers) * 100 : 0,
      loyalPercentage: totalCustomers > 0 ? (loyalCustomers / totalCustomers) * 100 : 0
    },
    topCustomers
  });
});