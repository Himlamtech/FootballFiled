const { Booking, Product, Field, BookingProduct, sequelize } = require('../models');
const { Op } = require('sequelize');
const logger = require('../utils/logger');
const moment = require('moment');

/**
 * Get dashboard statistics
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getDashboardStats = async (req, res, next) => {
  try {
    // Get total bookings
    const totalBookings = await Booking.count();

    // Get total income from bookings
    const totalIncome = await Booking.sum('total_price', {
      where: {
        payment_status: 'paid'
      }
    }) || 0;

    // Get total product sales
    const productSales = await BookingProduct.sum('price') || 0;

    // Get comparison data for different periods
    const now = new Date();

    // Day comparison
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterdayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);

    const todayIncome = await Booking.sum('total_price', {
      where: {
        payment_status: 'paid',
        booking_date: {
          [Op.gte]: todayStart,
          [Op.lt]: new Date(todayStart.getTime() + 24 * 60 * 60 * 1000)
        }
      }
    }) || 0;

    const yesterdayIncome = await Booking.sum('total_price', {
      where: {
        payment_status: 'paid',
        booking_date: {
          [Op.gte]: yesterdayStart,
          [Op.lt]: todayStart
        }
      }
    }) || 0;

    // Week comparison
    const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
    const lastWeekStart = new Date(weekStart.getTime() - 7 * 24 * 60 * 60 * 1000);

    const weekIncome = await Booking.sum('total_price', {
      where: {
        payment_status: 'paid',
        booking_date: {
          [Op.gte]: weekStart,
          [Op.lt]: now
        }
      }
    }) || 0;

    const lastWeekIncome = await Booking.sum('total_price', {
      where: {
        payment_status: 'paid',
        booking_date: {
          [Op.gte]: lastWeekStart,
          [Op.lt]: weekStart
        }
      }
    }) || 0;

    // Month comparison
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const monthIncome = await Booking.sum('total_price', {
      where: {
        payment_status: 'paid',
        booking_date: {
          [Op.gte]: monthStart,
          [Op.lt]: now
        }
      }
    }) || 0;

    const lastMonthIncome = await Booking.sum('total_price', {
      where: {
        payment_status: 'paid',
        booking_date: {
          [Op.gte]: lastMonthStart,
          [Op.lt]: monthStart
        }
      }
    }) || 0;

    // Year comparison
    const yearStart = new Date(now.getFullYear(), 0, 1);
    const lastYearStart = new Date(now.getFullYear() - 1, 0, 1);

    const yearIncome = await Booking.sum('total_price', {
      where: {
        payment_status: 'paid',
        booking_date: {
          [Op.gte]: yearStart,
          [Op.lt]: now
        }
      }
    }) || 0;

    const lastYearIncome = await Booking.sum('total_price', {
      where: {
        payment_status: 'paid',
        booking_date: {
          [Op.gte]: lastYearStart,
          [Op.lt]: yearStart
        }
      }
    }) || 0;

    // Return stats
    res.status(200).json({
      totalBookings,
      totalIncome,
      productSales,
      compareData: {
        day: { current: todayIncome, previous: yesterdayIncome },
        week: { current: weekIncome, previous: lastWeekIncome },
        month: { current: monthIncome, previous: lastMonthIncome },
        year: { current: yearIncome, previous: lastYearIncome }
      }
    });
  } catch (error) {
    logger.error('Error getting dashboard stats:', error);
    next(error);
  }
};

/**
 * Get chart data for dashboard
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getChartData = async (req, res, next) => {
  try {
    const { period = 'week', date = new Date() } = req.query;
    let chartData = [];

    const targetDate = date ? new Date(date) : new Date();

    switch (period) {
      case 'day': {
        // Get hourly data for the day
        const dayStart = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
        const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);

        // Generate hours
        for (let hour = 0; hour < 24; hour++) {
          const hourStart = new Date(dayStart.getTime() + hour * 60 * 60 * 1000);
          const hourEnd = new Date(dayStart.getTime() + (hour + 1) * 60 * 60 * 1000);

          // Get bookings for this hour
          const hourIncome = await Booking.sum('total_price', {
            where: {
              payment_status: 'paid',
              booking_date: dayStart,
              start_time: {
                [Op.gte]: hourStart.getHours() + ':00:00',
                [Op.lt]: hourEnd.getHours() + ':00:00'
              }
            }
          }) || 0;

          chartData.push({
            name: `${hour}:00`,
            value: hourIncome
          });
        }
        break;
      }

      case 'week': {
        // Get daily data for the week
        const weekStart = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate() - targetDate.getDay());

        // Generate days of the week
        for (let day = 0; day < 7; day++) {
          const dayDate = new Date(weekStart.getTime() + day * 24 * 60 * 60 * 1000);

          // Get bookings for this day
          const dayIncome = await Booking.sum('total_price', {
            where: {
              payment_status: 'paid',
              booking_date: dayDate
            }
          }) || 0;

          chartData.push({
            name: moment(dayDate).format('ddd'),
            value: dayIncome
          });
        }
        break;
      }

      case 'month': {
        // Get weekly data for the month
        const monthStart = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1);
        const monthEnd = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0);
        const daysInMonth = monthEnd.getDate();
        const weeksInMonth = Math.ceil(daysInMonth / 7);

        // Generate weeks
        for (let week = 0; week < weeksInMonth; week++) {
          const weekStart = new Date(monthStart.getTime() + week * 7 * 24 * 60 * 60 * 1000);
          const weekEnd = new Date(Math.min(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000, monthEnd.getTime() + 24 * 60 * 60 * 1000));

          // Get bookings for this week
          const weekIncome = await Booking.sum('total_price', {
            where: {
              payment_status: 'paid',
              booking_date: {
                [Op.gte]: weekStart,
                [Op.lt]: weekEnd
              }
            }
          }) || 0;

          chartData.push({
            name: `Week ${week + 1}`,
            value: weekIncome
          });
        }
        break;
      }

      case 'year': {
        // Get monthly data for the year
        const yearStart = new Date(targetDate.getFullYear(), 0, 1);

        // Generate months
        for (let month = 0; month < 12; month++) {
          const monthStart = new Date(yearStart.getFullYear(), month, 1);
          const monthEnd = new Date(yearStart.getFullYear(), month + 1, 0);

          // Get bookings for this month
          const monthIncome = await Booking.sum('total_price', {
            where: {
              payment_status: 'paid',
              booking_date: {
                [Op.gte]: monthStart,
                [Op.lte]: monthEnd
              }
            }
          }) || 0;

          chartData.push({
            name: moment(monthStart).format('MMM'),
            value: monthIncome
          });
        }
        break;
      }

      default:
        throw new Error('Invalid period type');
    }

    res.status(200).json({
      period,
      date: targetDate,
      chartData
    });
  } catch (error) {
    logger.error('Error getting chart data:', error);
    next(error);
  }
};

module.exports = {
  getDashboardStats,
  getChartData
};
