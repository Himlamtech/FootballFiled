
import { useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, CalendarIcon, ShoppingCartIcon, ArrowUpIcon, ArrowDownIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
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

const Dashboard = () => {
  const [periodType, setPeriodType] = useState<"day" | "week" | "month" | "year">("week");
  const [comparePeriod, setComparePeriod] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const calendarRef = useRef<HTMLDivElement>(null);
  
  // Dữ liệu thống kê giả định
  const stats = {
    totalBookings: 128,
    totalIncome: 42500000,
    productSales: 56,
    compareData: {
      day: {
        current: 1500000,
        previous: 1200000
      },
      week: {
        current: 8500000,
        previous: 7200000
      },
      month: {
        current: 38500000,
        previous: 32800000
      },
      year: {
        current: 425000000,
        previous: 380000000
      }
    }
  };
  
  // Dữ liệu biểu đồ theo thời gian
  const getChartData = () => {
    switch(periodType) {
      case "day":
        return [
          { name: '6h', value: 320000 },
          { name: '8h', value: 180000 },
          { name: '10h', value: 150000 },
          { name: '12h', value: 380000 },
          { name: '14h', value: 220000 },
          { name: '16h', value: 320000 },
          { name: '18h', value: 650000 },
          { name: '20h', value: 820000 },
        ];
      case "week":
        return [
          { name: 'T2', value: 1200000 },
          { name: 'T3', value: 980000 },
          { name: 'T4', value: 1380000 },
          { name: 'T5', value: 1520000 },
          { name: 'T6', value: 1650000 },
          { name: 'T7', value: 1850000 },
          { name: 'CN', value: 1420000 },
        ];
      case "month":
        return [
          { name: 'Tuần 1', value: 7500000 },
          { name: 'Tuần 2', value: 8300000 },
          { name: 'Tuần 3', value: 9200000 },
          { name: 'Tuần 4', value: 10500000 },
        ];
      case "year":
        return [
          { name: 'T1', value: 32000000 },
          { name: 'T2', value: 28000000 },
          { name: 'T3', value: 34000000 },
          { name: 'T4', value: 32000000 },
          { name: 'T5', value: 35000000 },
          { name: 'T6', value: 38000000 },
          { name: 'T7', value: 42000000 },
          { name: 'T8', value: 45000000 },
          { name: 'T9', value: 40000000 },
          { name: 'T10', value: 38000000 },
          { name: 'T11', value: 43000000 },
          { name: 'T12', value: 48000000 },
        ];
      default:
        return [];
    }
  };

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
  const compareData = stats.compareData[periodType];
  const percentChange = ((compareData.current - compareData.previous) / compareData.previous) * 100;
  const chartData = getChartData();
  
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
  
  // Dữ liệu lịch đặt sân sắp tới
  const upcomingBookings = [
    { id: 1, customer: 'Nguyễn Văn A', phone: '0901234567', field: 'Sân A', date: new Date(), time: '17:00 - 18:00', price: 350000, status: 'paid' },
    { id: 2, customer: 'Trần Văn B', phone: '0912345678', field: 'Sân B', date: new Date(), time: '18:00 - 19:00', price: 350000, status: 'deposit' },
    { id: 3, customer: 'Lê Văn C', phone: '0923456789', field: 'Sân C', date: new Date(), time: '19:00 - 20:00', price: 350000, status: 'pending' },
    { id: 4, customer: 'Phạm Văn D', phone: '0934567890', field: 'Sân D', date: addDays(new Date(), 1), time: '17:00 - 18:00', price: 350000, status: 'paid' },
    { id: 5, customer: 'Hoàng Văn E', phone: '0945678901', field: 'Sân A', date: addDays(new Date(), 1), time: '18:00 - 19:00', price: 350000, status: 'deposit' },
    { id: 6, customer: 'Vũ Văn F', phone: '0956789012', field: 'Sân B', date: addDays(new Date(), 2), time: '19:00 - 20:00', price: 350000, status: 'pending' },
    { id: 7, customer: 'Đặng Văn G', phone: '0967890123', field: 'Sân C', date: addDays(new Date(), 2), time: '20:00 - 21:00', price: 350000, status: 'paid' },
    { id: 8, customer: 'Bùi Văn H', phone: '0978901234', field: 'Sân D', date: addDays(new Date(), 3), time: '17:00 - 18:00', price: 350000, status: 'deposit' },
  ];

  // Lọc các đặt sân cho ngày được chọn
  const filteredBookings = upcomingBookings.filter(booking => 
    isSameDay(booking.date, selectedDate)
  );

  // Xác định ngày có đặt sân
  const getBookedDates = () => {
    return upcomingBookings.map(booking => booking.date);
  };
  
  const bookedDates = getBookedDates();

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Thống kê tổng quan</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <Card className="p-6">
          <div className="flex items-start">
            <div className="p-2 rounded-md bg-blue-100">
              <CalendarIcon className="w-7 h-7 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-muted-foreground">Đặt sân</p>
              <h3 className="text-2xl font-bold">{stats.totalBookings}</h3>
              <p className="text-xs text-green-600 mt-1">+8% so với tuần trước</p>
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
              <h3 className="text-2xl font-bold">{(stats.totalIncome/1000000).toLocaleString()}tr đ</h3>
              <p className="text-xs text-green-600 mt-1">+12% so với tuần trước</p>
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
              <h3 className="text-2xl font-bold">{stats.productSales}</h3>
              <p className="text-xs text-green-600 mt-1">+5% so với tuần trước</p>
            </div>
          </div>
        </Card>
      </div>
      
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
          
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsBarChart
                data={chartData}
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
                      {filteredBookings.length === 0 ? (
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
                                <div className="font-medium">{booking.customer}</div>
                                <div className="text-xs text-gray-500">{booking.phone}</div>
                              </div>
                            </TableCell>
                            <TableCell>{booking.field}</TableCell>
                            <TableCell>{booking.time}</TableCell>
                            <TableCell>{booking.price.toLocaleString()}đ</TableCell>
                            <TableCell>
                              <Badge className="bg-green-100 text-green-800">
                                Đã thanh toán
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

