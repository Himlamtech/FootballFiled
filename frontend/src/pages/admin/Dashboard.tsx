import { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, CalendarIcon, ShoppingCartIcon, ArrowUpIcon, ArrowDownIcon, ChevronLeftIcon, ChevronRightIcon, Loader2, FileText, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { dashboardAPI, bookingAPI } from "@/lib/api";
import { format, addDays, subDays, startOfWeek, endOfWeek, isWithinInterval, isSameDay } from "date-fns";
import { vi } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  TooltipProps,
  LineChart,
  Line,
  Legend,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { useToast } from "@/components/ui/use-toast";

const Dashboard = () => {
  const [periodType, setPeriodType] = useState<"day" | "week" | "month" | "year">("week");
  const [comparePeriod, setComparePeriod] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const calendarRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [statsData, setStatsData] = useState({
    totalBookings: 0,
    totalIncome: 0,
    productSales: 0,
    compareData: {
      day: { current: 0, previous: 0, currentRevenue: 0, previousRevenue: 0, growthRate: 0 },
      week: { current: 0, previous: 0, currentRevenue: 0, previousRevenue: 0, growthRate: 0 },
      month: { current: 0, previous: 0, currentRevenue: 0, previousRevenue: 0, growthRate: 0, projected: 0 },
      year: { current: 0, previous: 0 }
    },
    additionalStats: {
      feedbackCount: 0,
      pendingFeedbackCount: 0,
      opponentCount: 0,
      fieldCount: 0,
      avgBookingValue: 0
    },
    financialSummary: {
      revenueByFieldSize: [],
      revenueByDayOfWeek: [],
      yearlyRevenueComparison: []
    },
    recentBookings: []
  });
  const [chartData, setChartData] = useState<any[]>([]);
  const [revenueByQuarterData, setRevenueByQuarterData] = useState<any[]>([]);
  const [bookingTrendData, setBookingTrendData] = useState<any[]>([]);
  const [bookingHistory, setBookingHistory] = useState({
    bookings: [],
    pagination: { total: 0, totalPages: 0, currentPage: 1, limit: 10 },
    summary: { totalAmount: 0, avgAmount: 0, count: 0 }
  });
  const [revenueAnalysis, setRevenueAnalysis] = useState({
    period: 'month',
    startDate: '',
    endDate: '',
    data: [],
    summary: { totalRevenue: 0, totalBookings: 0, avgRevenue: 0, avgBookings: 0, avgBookingValue: 0 }
  });
  const [customerStats, setCustomerStats] = useState({
    summary: {
      totalCustomers: 0,
      totalRevenue: 0,
      totalBookings: 0,
      avgRevenuePerCustomer: 0,
      avgBookingsPerCustomer: 0,
      avgBookingValue: 0
    },
    segments: {
      oneTimeCustomers: 0,
      regularCustomers: 0,
      loyalCustomers: 0,
      oneTimePercentage: 0,
      regularPercentage: 0,
      loyalPercentage: 0
    },
    topCustomers: []
  });

  const { toast } = useToast();

  // Fetch dashboard statistics
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await dashboardAPI.getStats();
        const data = response.data;

        if (data) {
          console.log("Dashboard stats:", data);
          setStatsData({
            totalBookings: data.totalBookings || 0,
            totalIncome: data.totalIncome || 0,
            productSales: data.productSales || 0,
            compareData: data.compareData || {
              day: { current: 0, previous: 0, currentRevenue: 0, previousRevenue: 0, growthRate: 0 },
              week: { current: 0, previous: 0, currentRevenue: 0, previousRevenue: 0, growthRate: 0 },
              month: { current: 0, previous: 0, currentRevenue: 0, previousRevenue: 0, growthRate: 0, projected: 0 },
              year: { current: 0, previous: 0 }
            },
            additionalStats: data.additionalStats || {
              feedbackCount: 0,
              pendingFeedbackCount: 0,
              opponentCount: 0,
              fieldCount: 0,
              avgBookingValue: 0
            },
            financialSummary: data.financialSummary || {
              revenueByFieldSize: [],
              revenueByDayOfWeek: [],
              yearlyRevenueComparison: []
            },
            recentBookings: data.recentBookings || []
          });
        }
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not load statistics data",
        });

        // Set empty values for stats data
        setStatsData({
          totalBookings: 0,
          totalIncome: 0,
          productSales: 0,
          compareData: {
            day: { current: 0, previous: 0, currentRevenue: 0, previousRevenue: 0, growthRate: 0 },
            week: { current: 0, previous: 0, currentRevenue: 0, previousRevenue: 0, growthRate: 0 },
            month: { current: 0, previous: 0, currentRevenue: 0, previousRevenue: 0, growthRate: 0, projected: 0 },
            year: { current: 0, previous: 0 }
          },
          additionalStats: {
            feedbackCount: 0,
            pendingFeedbackCount: 0,
            opponentCount: 0,
            fieldCount: 0,
            avgBookingValue: 0
          },
          financialSummary: {
            revenueByFieldSize: [],
            revenueByDayOfWeek: [],
            yearlyRevenueComparison: []
          },
          recentBookings: []
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Fetch chart data based on period type
  useEffect(() => {
    const fetchChartData = async () => {
      try {
        setLoading(true);
        const formattedDate = format(currentDate, "yyyy-MM-dd");

        try {
          const response = await dashboardAPI.getChartData({
            period: periodType,
            date: formattedDate
          });
          const data = response.data;

          if (data && Array.isArray(data.chartData) && data.chartData.length > 0 && data.chartData.every(item => 'name' in item && 'value' in item)) {
            setChartData(data.chartData);
            if (periodType === 'year' && data.revenueByQuarter && Array.isArray(data.revenueByQuarter) && data.revenueByQuarter.every(item => 'quarter' in item && 'value' in item)) {
              setRevenueByQuarterData(data.revenueByQuarter);
            } else {
              setRevenueByQuarterData([]);
            }
          } else {
            console.warn(`API returned invalid or empty chart data for ${periodType}. Generating sample data.`, data);
            // Generate sample chart data if API returns no data or invalid data
            const sampleData = generateSampleChartData(periodType, currentDate);
            setChartData(sampleData);
            setRevenueByQuarterData([]);
          }
        } catch (apiError) {
          console.error(`Error fetching chart data from API, generating sample data:`, apiError);

          // Generate sample chart data if API fails
          const sampleData = generateSampleChartData(periodType, currentDate);
          console.log(`Generated sample chart data for ${periodType}:`, sampleData);
          setChartData(sampleData);
          setRevenueByQuarterData([]);
        }
      } catch (error) {
        console.error(`Error in chart data handling:`, error);
        toast({
          variant: "destructive",
          title: "Error",
          description: `Could not load chart data for ${periodType}`,
        });
        setChartData([]);
        setRevenueByQuarterData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchChartData();
  }, [periodType, currentDate]);

  // Fetch booking trend data (average bookings per weekday)
  useEffect(() => {
    const fetchBookingTrend = async () => {
      if (periodType !== 'week') return;
      try {
        const response = await dashboardAPI.getBookingTrend();
        // Assuming the API returns an array of objects with { name: string, bookings: number }
        if (response.data && Array.isArray(response.data) && response.data.every(item => 'name' in item && 'bookings' in item)) {
          setBookingTrendData(response.data);
        } else {
          console.warn("API returned invalid or empty booking trend data.", response.data);
          setBookingTrendData([]);
        }
      } catch (e) {
        console.error("Error fetching booking trend data:", e);
        setBookingTrendData([]);
      }
    };
    fetchBookingTrend();
  }, [periodType]);

  // Fetch booking history data
  useEffect(() => {
    const fetchBookingHistory = async () => {
      try {
        setLoading(true);
        const response = await dashboardAPI.getBookingHistory({
          page: 1,
          limit: 10,
          sortBy: 'createdAt',
          sortOrder: 'desc'
        });

        if (response.data) {
          setBookingHistory(response.data);
        }
      } catch (error) {
        console.error("Error fetching booking history:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not load booking history",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchBookingHistory();
  }, []);

  // Fetch revenue analysis data
  useEffect(() => {
    const fetchRevenueAnalysis = async () => {
      try {
        setLoading(true);
        const response = await dashboardAPI.getRevenueAnalysis({
          period: 'month'
        });

        if (response.data) {
          setRevenueAnalysis(response.data);
        }
      } catch (error) {
        console.error("Error fetching revenue analysis:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not load revenue analysis",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchRevenueAnalysis();
  }, []);

  // Fetch customer statistics
  useEffect(() => {
    const fetchCustomerStats = async () => {
      try {
        setLoading(true);
        const response = await dashboardAPI.getCustomerStats();

        if (response.data) {
          setCustomerStats(response.data);
        }
      } catch (error) {
        console.error("Error fetching customer statistics:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not load customer statistics",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCustomerStats();
  }, []);

  // Generate sample chart data for testing
  const generateSampleChartData = (period: string, date: Date) => {
    const data = [];

    switch(period) {
      case 'day':
        // 24 hours
        for (let i = 0; i < 24; i++) {
          data.push({
            name: `${i}:00`,
            value: Math.floor(Math.random() * 500000) + 100000
          });
        }
        break;
      case 'week':
        // 7 days
        const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
        for (let i = 0; i < 7; i++) {
          data.push({
            name: dayNames[i],
            value: Math.floor(Math.random() * 2000000) + 500000
          });
        }
        break;
      case 'month':
        // 30 days
        for (let i = 1; i <= 30; i++) {
          data.push({
            name: `${i}`,
            value: Math.floor(Math.random() * 1000000) + 200000
          });
        }
        break;
      case 'year':
        // 12 months
        const monthNames = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'];
        for (let i = 0; i < 12; i++) {
          data.push({
            name: monthNames[i],
            value: Math.floor(Math.random() * 10000000) + 1000000
          });
        }
        break;
    }

    return data;
  };

  // Get chart data based on period type
  const getChartData = () => {
    return chartData.length > 0 ? chartData : [];
  };

  // Custom tooltip cho biểu đồ
  const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 shadow-md rounded-md">
          <p className="font-medium text-gray-800">{label}</p>
          <p className="text-lg font-bold text-emerald-600">{formatIncome(payload[0].value || 0)}</p>
        </div>
      );
    }
    return null;
  };

  // Dữ liệu so sánh với kỳ trước đó
  const compareData = statsData.compareData[periodType];
  const percentChange = compareData.previous > 0
    ? ((compareData.current - compareData.previous) / compareData.previous) * 100
    : 0;
  const currentChartData = getChartData();

  // Di chuyển đến tuần/kỳ trước hoặc sau
  const navigatePeriod = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      switch(periodType) {
        case 'day':
          setCurrentDate(prevDate => subDays(prevDate, 1));
          break;
        case 'week':
          setCurrentDate(prevDate => subDays(prevDate, 7));
          break;
        case 'month':
          setCurrentDate(prevDate => {
            const newDate = new Date(prevDate);
            newDate.setMonth(newDate.getMonth() - 1);
            return newDate;
          });
          break;
        case 'year':
          setCurrentDate(prevDate => {
            const newDate = new Date(prevDate);
            newDate.setFullYear(newDate.getFullYear() - 1);
            return newDate;
          });
          break;
      }
    } else {
      switch(periodType) {
        case 'day':
          setCurrentDate(prevDate => addDays(prevDate, 1));
          break;
        case 'week':
          setCurrentDate(prevDate => addDays(prevDate, 7));
          break;
        case 'month':
          setCurrentDate(prevDate => {
            const newDate = new Date(prevDate);
            newDate.setMonth(newDate.getMonth() + 1);
            return newDate;
          });
          break;
        case 'year':
          setCurrentDate(prevDate => {
            const newDate = new Date(prevDate);
            newDate.setFullYear(newDate.getFullYear() + 1);
            return newDate;
          });
          break;
      }
    }
  };

  // Format current period display
  const getCurrentPeriodLabel = () => {
    switch(periodType) {
      case 'day':
        return format(currentDate, 'dd/MM/yyyy');
      case 'week':
        const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
        const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
        return `${format(weekStart, 'dd/MM')} - ${format(weekEnd, 'dd/MM/yyyy')}`;
      case 'month':
        return format(currentDate, 'MM/yyyy');
      case 'year':
        return format(currentDate, 'yyyy');
      default:
        return '';
    }
  };

  // Format income value to show as "X.XXtr đ"
  const formatIncome = (value: number) => {
    // Convert to trillions (divide by 1,000,000 VND)
    const inTrillions = value / 1000000;

    // Format with 2 decimal places
    const formatted = inTrillions.toFixed(2);

    // Remove trailing zeros after decimal point (e.g., 0.30 -> 0.3, 1.00 -> 1)
    const trimmed = formatted.replace(/\.?0+$/, '') || '0';

    // Return formatted string
    return `${trimmed}tr đ`;
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Thống kê tổng quan</h1>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-field-600 mr-2" />
          <span>Đang tải dữ liệu...</span>
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="p-6">
              <div className="flex items-start">
                <div className="p-2 rounded-md bg-blue-100">
                  <CalendarIcon className="w-7 h-7 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-muted-foreground">Đặt sân</p>
                  <h3 className="text-2xl font-bold">{statsData.totalBookings}</h3>
                  <p className={`text-xs ${compareData.current >= compareData.previous ? 'text-green-600' : 'text-red-600'} mt-1`}>
                    {compareData.previous > 0 ?
                      `${(((compareData.current - compareData.previous) / compareData.previous) * 100).toFixed(1)}% so với kỳ trước` :
                      "Chưa có dữ liệu so sánh"}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-start">
                <div className="p-2 rounded-md bg-green-100">
                  <BarChart className="w-7 h-7 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-muted-foreground">Doanh thu</p>
                  <h3 className="text-2xl font-bold">
                    {formatIncome(typeof statsData.totalIncome === 'number'
                      ? statsData.totalIncome
                      : parseFloat(String(statsData.totalIncome || 0).replace(/[^\d.-]/g, '')))}
                  </h3>
                  <p className={`text-xs ${compareData.currentRevenue >= compareData.previousRevenue ? 'text-green-600' : 'text-red-600'} mt-1`}>
                    {compareData.previousRevenue > 0 ?
                      `${compareData.growthRate.toFixed(1)}% so với kỳ trước` :
                      "Chưa có dữ liệu so sánh"}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-start">
                <div className="p-2 rounded-md bg-purple-100">
                  <FileText className="w-7 h-7 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-muted-foreground">Phản hồi</p>
                  <h3 className="text-2xl font-bold">{statsData.additionalStats.feedbackCount}</h3>
                  <p className="text-xs text-purple-600 mt-1">
                    {statsData.additionalStats.pendingFeedbackCount > 0 ?
                      `${statsData.additionalStats.pendingFeedbackCount} phản hồi chưa xử lý` :
                      "Không có phản hồi mới"}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-start">
                <div className="p-2 rounded-md bg-amber-100">
                  <Users className="w-7 h-7 text-amber-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-muted-foreground">Giá trị đặt sân TB</p>
                  <h3 className="text-2xl font-bold">
                    {formatIncome(statsData.additionalStats.avgBookingValue)}
                  </h3>
                  <p className="text-xs text-amber-600 mt-1">
                    {statsData.totalBookings > 0 ?
                      `Dựa trên ${statsData.totalBookings} lượt đặt sân` :
                      "Chưa có dữ liệu"}
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </>
      )}

      {/* Recent Bookings */}
      <Card className="p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4">Lịch sử đặt sân gần đây</h2>
        {loading ? (
          <div className="h-60 flex justify-center items-center">
            <Loader2 className="w-8 h-8 animate-spin text-field-600 mr-2" />
            <span>Đang tải dữ liệu...</span>
          </div>
        ) : statsData.recentBookings.length === 0 ? (
          <div className="h-60 flex justify-center items-center bg-gray-50 rounded-lg">
            <p className="text-gray-500">Chưa có lịch sử đặt sân</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Ngày đặt</TableHead>
                  <TableHead>Thời gian</TableHead>
                  <TableHead>Sân</TableHead>
                  <TableHead>Kích thước</TableHead>
                  <TableHead className="text-right">Số tiền</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {statsData.recentBookings.map((booking: any) => (
                  <TableRow key={booking.id}>
                    <TableCell className="font-medium">#{booking.id}</TableCell>
                    <TableCell>{booking.date}</TableCell>
                    <TableCell>{booking.time}</TableCell>
                    <TableCell>{booking.field}</TableCell>
                    <TableCell>{booking.fieldSize}</TableCell>
                    <TableCell className="text-right">{formatIncome(booking.amount)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      <div className="grid grid-cols-1 gap-6 mb-8">
        {/* Chart with Period Selection */}
        <Card className="p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold">Biểu đồ doanh thu</h2>
              <div className="text-sm text-gray-500">{getCurrentPeriodLabel()}</div>
            </div>

            <div className="flex gap-2 mt-3 sm:mt-0">
              <Button
                variant="outline"
                size="icon"
                onClick={() => navigatePeriod('prev')}
              >
                <ChevronLeftIcon className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => navigatePeriod('next')}
              >
                <ChevronRightIcon className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-3 sm:mt-0">
              <Tabs defaultValue="week" value={periodType} onValueChange={(v) => setPeriodType(v as "day" | "week" | "month" | "year")}>
                <TabsList>
                  <TabsTrigger value="day">Ngày</TabsTrigger>
                  <TabsTrigger value="week">Tuần</TabsTrigger>
                  <TabsTrigger value="month">Tháng</TabsTrigger>
                  <TabsTrigger value="year">Năm</TabsTrigger>
                </TabsList>
              </Tabs>

              <Select
                defaultValue="compare"
                value={comparePeriod ? "compare" : "current"}
                onValueChange={(v) => setComparePeriod(v === "compare")}
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Chọn kỳ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="current">Kỳ hiện tại</SelectItem>
                  <SelectItem value="compare">So sánh với kỳ trước</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* So sánh với kỳ trước */}
          {comparePeriod && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-600">Kỳ hiện tại</p>
                  <p className="text-lg font-semibold">{formatIncome(statsData.totalIncome)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Kỳ trước</p>
                  <p className="text-lg font-semibold">{formatIncome(0)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Thay đổi</p>
                  <p className={`text-lg font-semibold flex items-center ${percentChange >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {percentChange >= 0 ? (
                      <ArrowUpIcon className="w-4 h-4 mr-1" />
                    ) : (
                      <ArrowDownIcon className="w-4 h-4 mr-1" />
                    )}
                    {Math.abs(percentChange).toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>
          )}

          {loading ? (
            <div className="h-80 flex justify-center items-center">
              <Loader2 className="w-8 h-8 animate-spin text-field-600 mr-2" />
              <span>Đang tải dữ liệu biểu đồ...</span>
            </div>
          ) : currentChartData.length === 0 ? (
            <div className="h-80 flex justify-center items-center bg-gray-50 rounded-lg">
              <p className="text-gray-500">Không có dữ liệu cho khoảng thời gian này</p>
            </div>
          ) : (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsBarChart
                  data={currentChartData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(value) => `${(value/1000).toFixed(0)}k`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar
                    dataKey="value"
                    fill="#10b981"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={60}
                  />
                </RechartsBarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>
      </div>

      {/* Additional Data Visualization Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Booking Trends Chart */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Xu hướng đặt sân</h2>
          {loading ? (
            <div className="h-60 flex justify-center items-center">
              <Loader2 className="w-8 h-8 animate-spin text-field-600 mr-2" />
              <span>Đang tải dữ liệu...</span>
            </div>
          ) : (
            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={bookingTrendData}
                  margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip formatter={(value) => [`${value} lượt đặt`, 'Số lượt đặt']} />
                  <Line
                    type="monotone"
                    dataKey="bookings"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    dot={{ r: 4, fill: "#3b82f6" }}
                    activeDot={{ r: 6, fill: "#3b82f6" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        {/* Revenue Distribution Chart */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Phân bố doanh thu theo loại sân</h2>
          {loading ? (
            <div className="h-60 flex justify-center items-center">
              <Loader2 className="w-8 h-8 animate-spin text-field-600 mr-2" />
              <span>Đang tải dữ liệu...</span>
            </div>
          ) : statsData.financialSummary.revenueByFieldSize.length === 0 ? (
            <div className="h-60 flex justify-center items-center bg-gray-50 rounded-lg">
              <p className="text-gray-500">Không có dữ liệu phân bố doanh thu</p>
            </div>
          ) : (
            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statsData.financialSummary.revenueByFieldSize}
                    dataKey="revenue"
                    nameKey="fieldSize"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    label={({ fieldSize, percentage }) => `${fieldSize}: ${percentage.toFixed(0)}%`}
                  >
                    {statsData.financialSummary.revenueByFieldSize.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={['#10b981', '#3b82f6', '#f59e0b', '#ef4444'][index % 4]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => formatIncome(Number(value))}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>
      </div>

      {/* Customer Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Customer Segments */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Phân loại khách hàng</h2>
          {loading ? (
            <div className="h-60 flex justify-center items-center">
              <Loader2 className="w-8 h-8 animate-spin text-field-600 mr-2" />
              <span>Đang tải dữ liệu...</span>
            </div>
          ) : (
            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Một lần', value: customerStats.segments.oneTimeCustomers, percentage: customerStats.segments.oneTimePercentage },
                      { name: 'Thường xuyên', value: customerStats.segments.regularCustomers, percentage: customerStats.segments.regularPercentage },
                      { name: 'Trung thành', value: customerStats.segments.loyalCustomers, percentage: customerStats.segments.loyalPercentage }
                    ]}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    label={({ name, percentage }) => `${name}: ${percentage}%`}
                  >
                    <Cell fill="#3b82f6" />
                    <Cell fill="#10b981" />
                    <Cell fill="#f59e0b" />
                  </Pie>
                  <Tooltip
                    formatter={(value, name) => [`${value} khách hàng`, name]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        {/* Top Customers */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Khách hàng hàng đầu</h2>
          {loading ? (
            <div className="h-60 flex justify-center items-center">
              <Loader2 className="w-8 h-8 animate-spin text-field-600 mr-2" />
              <span>Đang tải dữ liệu...</span>
            </div>
          ) : customerStats.topCustomers.length === 0 ? (
            <div className="h-60 flex justify-center items-center bg-gray-50 rounded-lg">
              <p className="text-gray-500">Không có dữ liệu khách hàng</p>
            </div>
          ) : (
            <div className="h-60 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Khách hàng</TableHead>
                    <TableHead>Số lần đặt</TableHead>
                    <TableHead className="text-right">Tổng chi tiêu</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customerStats.topCustomers.slice(0, 5).map((customer: any, index: number) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{customer.name}</TableCell>
                      <TableCell>{customer.bookingCount}</TableCell>
                      <TableCell className="text-right">{formatIncome(customer.totalSpent)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </Card>
      </div>

      {/* Revenue Analysis by Month */}
      <Card className="p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4">Phân tích doanh thu theo tháng</h2>
        {loading ? (
          <div className="h-80 flex justify-center items-center">
            <Loader2 className="w-8 h-8 animate-spin text-field-600 mr-2" />
            <span>Đang tải dữ liệu...</span>
          </div>
        ) : revenueAnalysis.data.length === 0 ? (
          <div className="h-80 flex justify-center items-center bg-gray-50 rounded-lg">
            <p className="text-gray-500">Không có dữ liệu phân tích doanh thu</p>
          </div>
        ) : (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsBarChart
                data={revenueAnalysis.data}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="period"
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(value) => `${(value/1000000).toFixed(1)}tr`}
                />
                <Tooltip
                  formatter={(value) => [formatIncome(Number(value)), "Doanh thu"]}
                  labelFormatter={(label) => `Tháng ${label}`}
                />
                <Legend />
                <Bar
                  name="Doanh thu"
                  dataKey="revenue"
                  fill="#10b981"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={60}
                />
                <Bar
                  name="Tăng trưởng"
                  dataKey="growthRate"
                  fill="#3b82f6"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={30}
                />
              </RechartsBarChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>
    </div>
  );
};

export default Dashboard;

