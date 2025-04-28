
import { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, CalendarIcon, ShoppingCartIcon, ArrowUpIcon, ArrowDownIcon, ChevronLeftIcon, ChevronRightIcon, Loader2 } from "lucide-react";
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
  TooltipProps
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
      day: { current: 0, previous: 0 },
      week: { current: 0, previous: 0 },
      month: { current: 0, previous: 0 },
      year: { current: 0, previous: 0 }
    }
  });
  const [chartData, setChartData] = useState<any[]>([]);
  const [bookingsData, setBookingsData] = useState<any[]>([]);

  const { toast } = useToast();

  // Fetch dashboard statistics
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/dashboard/stats');
        const data = await response.json();

        if (data) {
          console.log("Dashboard stats:", data);
          setStatsData({
            totalBookings: data.totalBookings || 0,
            totalIncome: data.totalIncome || 0,
            productSales: data.productSales || 0,
            compareData: data.compareData || {
              day: { current: 0, previous: 0 },
              week: { current: 0, previous: 0 },
              month: { current: 0, previous: 0 },
              year: { current: 0, previous: 0 }
            }
          });
        }
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        toast({
          variant: "destructive",
          title: "Lỗi",
          description: "Không thể tải dữ liệu thống kê",
        });

        // Fallback to default values if API fails
        setStatsData({
          totalBookings: 0,
          totalIncome: 0,
          productSales: 0,
          compareData: {
            day: { current: 0, previous: 0 },
            week: { current: 0, previous: 0 },
            month: { current: 0, previous: 0 },
            year: { current: 0, previous: 0 }
          }
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
        const response = await fetch(`/api/dashboard/chart?period=${periodType}&date=${formattedDate}`);
        const data = await response.json();

        if (data && data.chartData) {
          console.log(`Chart data for ${periodType}:`, data.chartData);
          setChartData(data.chartData);
        } else {
          // Fallback to empty array if API returns no data
          setChartData([]);
        }
      } catch (error) {
        console.error(`Error fetching ${periodType} chart data:`, error);
        toast({
          variant: "destructive",
          title: "Lỗi",
          description: `Không thể tải dữ liệu biểu đồ cho ${periodType}`,
        });
        setChartData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchChartData();
  }, [periodType, currentDate]);

  // Fetch bookings for selected date
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const formattedDate = format(selectedDate, "yyyy-MM-dd");
        const response = await fetch(`/api/bookings?date=${formattedDate}`);
        const data = await response.json();

        if (data && data.bookings) {
          console.log("Bookings for selected date:", data.bookings);
          setBookingsData(data.bookings);
        } else {
          setBookingsData([]);
        }
      } catch (error) {
        console.error("Error fetching bookings:", error);
        setBookingsData([]);
      }
    };

    fetchBookings();
  }, [selectedDate]);

  // Get chart data based on period type
  const getChartData = () => {
    return chartData.length > 0 ? chartData : [];

  // Custom tooltip cho biểu đồ
  const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border border-gray-200 shadow-md rounded-md">
          <p className="font-medium">{label}</p>
          <p className="text-field-600">{`${payload[0].value?.toLocaleString()} đ`}</p>
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

  // Lọc các đặt sân cho ngày được chọn
  const filteredBookings = bookingsData.filter(booking => {
    // Chuyển đổi chuỗi ngày từ API thành đối tượng Date
    const bookingDate = booking.date ? new Date(booking.date) : null;
    return bookingDate && isSameDay(bookingDate, selectedDate);
  });

  // Xác định ngày có đặt sân
  const getBookedDates = () => {
    return bookingsData.map(booking => {
      return booking.date ? new Date(booking.date) : null;
    }).filter(date => date !== null);
  };

  const bookedDates = getBookedDates();

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
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
            <Card className="p-6">
              <div className="flex items-start">
                <div className="p-2 rounded-md bg-blue-100">
                  <CalendarIcon className="w-7 h-7 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-muted-foreground">Đặt sân</p>
                  <h3 className="text-2xl font-bold">{statsData.totalBookings}</h3>
                  <p className="text-xs text-green-600 mt-1">
                    {statsData.compareData.week.previous > 0 ?
                      `${(((statsData.compareData.week.current - statsData.compareData.week.previous) / statsData.compareData.week.previous) * 100).toFixed(1)}% so với tuần trước` :
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
                  <h3 className="text-2xl font-bold">{(statsData.totalIncome/1000000).toLocaleString()}tr đ</h3>
                  <p className="text-xs text-green-600 mt-1">
                    {statsData.compareData.week.previous > 0 ?
                      `${(((statsData.compareData.week.current - statsData.compareData.week.previous) / statsData.compareData.week.previous) * 100).toFixed(1)}% so với tuần trước` :
                      "Chưa có dữ liệu so sánh"}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-start">
                <div className="p-2 rounded-md bg-yellow-100">
                  <ShoppingCartIcon className="w-7 h-7 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-muted-foreground">Bán hàng</p>
                  <h3 className="text-2xl font-bold">{statsData.productSales}</h3>
                  <p className="text-xs text-green-600 mt-1">
                    {statsData.compareData.week.previous > 0 ?
                      `${(((statsData.compareData.week.current - statsData.compareData.week.previous) / statsData.compareData.week.previous) * 100).toFixed(1)}% so với tuần trước` :
                      "Chưa có dữ liệu so sánh"}
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </>
      )}

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
                  <p className="text-lg font-semibold">{compareData.current.toLocaleString()} đ</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Kỳ trước</p>
                  <p className="text-lg font-semibold">{compareData.previous.toLocaleString()} đ</p>
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
                    fill="#059669"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={60}
                  />
                </RechartsBarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>
      </div>

      {/* Upcoming Bookings Calendar */}
      <Card className="mt-6">
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold mb-4">Lịch đặt sân</h2>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Calendar */}
            <div className="lg:col-span-2">
              <div ref={calendarRef} className="border rounded-md p-4">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  className="w-full p-0"
                  modifiers={{
                    booked: bookedDates
                  }}
                  modifiersStyles={{
                    booked: { backgroundColor: '#059669', color: 'white', fontWeight: 'bold' }
                  }}
                />
              </div>

              <div className="mt-4">
                <div className="flex items-center gap-2 text-sm mb-2">
                  <div className="w-4 h-4 bg-emerald-600 rounded-full"></div>
                  <span>Ngày có đặt sân</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-4 h-4 border rounded-full"></div>
                  <span>Ngày chưa có đặt sân</span>
                </div>
              </div>
            </div>

            {/* Bookings for Selected Date */}
            <div className="lg:col-span-3">
              <div className="border rounded-md overflow-hidden">
                <div className="bg-gray-50 p-3 border-b">
                  <h3 className="font-medium">
                    Đặt sân ngày: {format(selectedDate, 'dd/MM/yyyy')}
                  </h3>
                </div>

                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Khách hàng</TableHead>
                        <TableHead>Sân</TableHead>
                        <TableHead>Thời gian</TableHead>
                        <TableHead>Giá</TableHead>
                        <TableHead>Trạng thái</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        <TableRow>
                          <TableCell colSpan={5} className="h-32 text-center">
                            <div className="flex justify-center items-center">
                              <Loader2 className="w-6 h-6 animate-spin text-field-600 mr-2" />
                              <span>Đang tải dữ liệu...</span>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : filteredBookings.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="h-32 text-center">
                            Không có đặt sân nào vào ngày này
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredBookings.map((booking) => (
                          <TableRow key={booking.id}>
                            <TableCell>
                              <div>
                                <div className="font-medium">
                                  {booking.user?.name || booking.customer || "Khách hàng"}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {booking.user?.phone || booking.phone || booking.user?.email || "Không có thông tin"}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>{booking.field?.name || booking.field || "Không xác định"}</TableCell>
                            <TableCell>{`${booking.start_time?.substring(0, 5) || ""} - ${booking.end_time?.substring(0, 5) || ""}`}</TableCell>
                            <TableCell>{(booking.price || 0).toLocaleString()}đ</TableCell>
                            <TableCell>
                              <Badge className={`
                                ${booking.status === "paid" || booking.status === "completed" ? "bg-green-100 text-green-800" : ""}
                                ${booking.status === "pending" ? "bg-yellow-100 text-yellow-800" : ""}
                                ${booking.status === "cancelled" ? "bg-red-100 text-red-800" : ""}
                                ${!booking.status ? "bg-gray-100 text-gray-800" : ""}
                              `}>
                                {booking.status === "paid" || booking.status === "completed" ? "Đã thanh toán" : ""}
                                {booking.status === "pending" ? "Chờ thanh toán" : ""}
                                {booking.status === "cancelled" ? "Đã hủy" : ""}
                                {!booking.status ? "Không xác định" : ""}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;

