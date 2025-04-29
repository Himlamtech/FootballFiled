import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import {
  BarChart,
  PieChart,
  BarChartIcon,
  PieChartIcon,
  DollarSign,
  Calendar,
  ShoppingBag,
  FileText,
  Download,
  Search,
  Loader2
} from "lucide-react";
import { format, subDays, isWithinInterval, parseISO } from "date-fns";
import { vi } from "date-fns/locale";
import { useToast } from "@/components/ui/use-toast";
import { financeAPI } from "@/lib/api";
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Legend
} from "recharts";

interface FinanceRecord {
  id: number;
  transaction_type: 'booking' | 'product_sale' | 'expense' | 'other';
  amount: number;
  description: string;
  reference_id: string;
  status: 'completed' | 'pending' | 'cancelled';
  created_at: string;
  reference_name?: string;
}

interface TransactionSummary {
  totalIncome: number;
  totalExpense: number;
  netIncome: number;
  bookingRevenue: number;
  productRevenue: number;
  otherRevenue: number;
}

interface ChartData {
  name: string;
  value: number;
  color: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const Finance = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [transactions, setTransactions] = useState<FinanceRecord[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<FinanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<TransactionSummary>({
    totalIncome: 0,
    totalExpense: 0,
    netIncome: 0,
    bookingRevenue: 0,
    productRevenue: 0,
    otherRevenue: 0
  });
  const [dateRange, setDateRange] = useState({
    from: subDays(new Date(), 30),
    to: new Date()
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [transactionType, setTransactionType] = useState("all");
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [revenueTrendData, setRevenueTrendData] = useState<any[]>([]);

  const { toast } = useToast();

  // Fetch finances from API
  useEffect(() => {
    const fetchFinances = async () => {
      try {
        setLoading(true);

        // For development, we'll temporarily disable authentication
        // In a real app, we would handle authentication properly
        // For now, let's use the mock data to demonstrate the UI

        // Uncomment this when authentication is properly set up
        /*
        const response = await financeAPI.getAllFinances();
        const data = response.data;

        if (data && data.data) {
          console.log("Finances data:", data.data);
          setTransactions(data.data);
          // Also fetch the summary
          fetchSummary();
        } else {
          console.error("API returned no finances");
          setTransactions([]);
          // Generate mock data for development
          generateMockData();
        }
        */

        // For now, use mock data
        console.log("Using mock data for development");
        generateMockData();
      } catch (error) {
        console.error("Error fetching finances:", error);
        toast({
          variant: "destructive",
          title: "Lỗi",
          description: "Không thể tải dữ liệu tài chính",
        });
        // Generate mock data for development
        generateMockData();
      } finally {
        setLoading(false);
      }
    };

    const fetchSummary = async () => {
      try {
        // For development, we'll temporarily disable API calls
        // Uncomment this when authentication is properly set up
        /*
        const response = await financeAPI.getFinanceSummary();
        const data = response.data;

        if (data) {
          console.log("Finance summary:", data);

          // Map the backend response to our frontend summary structure
          const summaryData = {
            totalIncome: data.income || 0,
            totalExpense: data.expenses || 0,
            netIncome: data.total || 0,
            bookingRevenue: 0, // We'll calculate these from transactions
            productRevenue: 0,
            otherRevenue: 0
          };

          setSummary(summaryData);
        } else {
          console.error("API returned no summary");
          // Set default summary
          setSummary({
            totalIncome: 0,
            totalExpense: 0,
            netIncome: 0,
            bookingRevenue: 0,
            productRevenue: 0,
            otherRevenue: 0
          });
        }
        */

        // For now, we'll use the summary calculated from mock data
        console.log("Using calculated summary from mock data");
      } catch (error) {
        console.error("Error fetching finance summary:", error);
        // Set default summary
        setSummary({
          totalIncome: 0,
          totalExpense: 0,
          netIncome: 0,
          bookingRevenue: 0,
          productRevenue: 0,
          otherRevenue: 0
        });
      }
    };

    // Generate mock data for development purposes
    const generateMockData = () => {
      const mockTransactions: FinanceRecord[] = [];
      const today = new Date();

      // Generate booking income
      for (let i = 0; i < 15; i++) {
        const date = subDays(today, Math.floor(Math.random() * 30));
        mockTransactions.push({
          id: i + 1,
          transaction_type: 'booking',
          amount: Math.floor(Math.random() * 5 + 1) * 100000,
          description: `Đặt sân ${Math.floor(Math.random() * 4) + 1}`,
          reference_id: `BOOK-${1000 + i}`,
          reference_name: `Khách hàng ${i + 1}`,
          status: Math.random() > 0.2 ? 'completed' : 'pending',
          created_at: date.toISOString()
        });
      }

      // Generate product sales
      for (let i = 0; i < 10; i++) {
        const date = subDays(today, Math.floor(Math.random() * 30));
        mockTransactions.push({
          id: i + 16,
          transaction_type: 'product_sale',
          amount: Math.floor(Math.random() * 3 + 1) * 50000,
          description: `Mua sản phẩm #${Math.floor(Math.random() * 10) + 1}`,
          reference_id: `SALE-${2000 + i}`,
          reference_name: `Khách hàng ${i + 1}`,
          status: Math.random() > 0.1 ? 'completed' : 'pending',
          created_at: date.toISOString()
        });
      }

      // Generate expenses
      for (let i = 0; i < 5; i++) {
        const date = subDays(today, Math.floor(Math.random() * 30));
        mockTransactions.push({
          id: i + 26,
          transaction_type: 'expense',
          amount: Math.floor(Math.random() * 10 + 5) * 100000 * -1, // Negative for expenses
          description: `Chi phí ${['Bảo trì', 'Điện nước', 'Thuê nhân viên', 'Mua thiết bị', 'Khác'][i]}`,
          reference_id: `EXP-${3000 + i}`,
          reference_name: 'Admin',
          status: 'completed',
          created_at: date.toISOString()
        });
      }

      setTransactions(mockTransactions);

      // Generate mock summary
      const mockBookingRevenue = mockTransactions
        .filter(t => t.transaction_type === 'booking' && t.status === 'completed')
        .reduce((sum, t) => sum + t.amount, 0);

      const mockProductRevenue = mockTransactions
        .filter(t => t.transaction_type === 'product_sale' && t.status === 'completed')
        .reduce((sum, t) => sum + t.amount, 0);

      const mockExpenses = mockTransactions
        .filter(t => t.transaction_type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      const mockTotalIncome = mockBookingRevenue + mockProductRevenue;

      setSummary({
        totalIncome: mockTotalIncome,
        totalExpense: mockExpenses * -1, // Convert to positive for display
        netIncome: mockTotalIncome + mockExpenses, // Expenses are already negative
        bookingRevenue: mockBookingRevenue,
        productRevenue: mockProductRevenue,
        otherRevenue: 0
      });
    };

    fetchFinances();
  }, []);

  // Generate chart data when transactions change
  useEffect(() => {
    if (transactions.length > 0) {
      // Create pie chart data for income distribution
      const bookingRevenue = transactions
        .filter(t => t.transaction_type === 'booking' && t.status === 'completed')
        .reduce((sum, t) => sum + t.amount, 0);

      const productRevenue = transactions
        .filter(t => t.transaction_type === 'product_sale' && t.status === 'completed')
        .reduce((sum, t) => sum + t.amount, 0);

      const otherRevenue = transactions
        .filter(t => t.transaction_type === 'other' && t.status === 'completed' && t.amount > 0)
        .reduce((sum, t) => sum + t.amount, 0);

      const pieData: ChartData[] = [
        { name: 'Đặt sân', value: bookingRevenue, color: COLORS[0] },
        { name: 'Bán sản phẩm', value: productRevenue, color: COLORS[1] },
        { name: 'Khác', value: otherRevenue, color: COLORS[2] }
      ].filter(d => d.value > 0);

      setChartData(pieData);

      // Create revenue trend data (last 7 days)
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = subDays(new Date(), i);
        const formattedDate = format(date, 'dd/MM');
        return {
          date: formattedDate,
          income: 0,
          expense: 0
        };
      }).reverse();

      transactions.forEach(t => {
        const transactionDate = parseISO(t.created_at);
        const formattedDate = format(transactionDate, 'dd/MM');
        const dayIndex = last7Days.findIndex(d => d.date === formattedDate);

        if (dayIndex >= 0) {
          if (t.amount > 0 && t.status === 'completed') {
            last7Days[dayIndex].income += t.amount;
          } else if (t.amount < 0) {
            last7Days[dayIndex].expense += t.amount * -1; // Convert to positive for display
          }
        }
      });

      setRevenueTrendData(last7Days);
    }
  }, [transactions]);

  // Filter transactions based on date range, search query, and transaction type
  useEffect(() => {
    if (transactions.length > 0) {
      let filtered = transactions;

      // Filter by date range
      if (dateRange.from && dateRange.to) {
        filtered = filtered.filter(t => {
          const date = parseISO(t.created_at);
          return isWithinInterval(date, { start: dateRange.from, end: dateRange.to });
        });
      }

      // Filter by search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(t =>
          t.description.toLowerCase().includes(query) ||
          t.reference_id.toLowerCase().includes(query) ||
          (t.reference_name && t.reference_name.toLowerCase().includes(query))
        );
      }

      // Filter by transaction type
      if (transactionType !== 'all') {
        filtered = filtered.filter(t => t.transaction_type === transactionType);
      }

      setFilteredTransactions(filtered);
    } else {
      setFilteredTransactions([]);
    }
  }, [transactions, dateRange, searchQuery, transactionType]);

  // Format amount with color and sign
  const formatAmount = (amount: number) => {
    const formatted = Math.abs(amount).toLocaleString() + ' đ';
    if (amount < 0) {
      return <span className="text-red-500">-{formatted}</span>;
    }
    return <span className="text-green-600">{formatted}</span>;
  };

  // Format transaction type for display
  const formatTransactionType = (type: string) => {
    switch (type) {
      case 'booking':
        return <Badge className="bg-blue-500">Đặt sân</Badge>;
      case 'product_sale':
        return <Badge className="bg-green-500">Bán sản phẩm</Badge>;
      case 'expense':
        return <Badge className="bg-red-500">Chi phí</Badge>;
      case 'other':
        return <Badge className="bg-purple-500">Khác</Badge>;
      default:
        return type;
    }
  };

  // Format status for display
  const formatStatus = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500">Hoàn thành</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500">Đang xử lý</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-500">Đã hủy</Badge>;
      default:
        return status;
    }
  };

  // Handle export to CSV
  const exportToCSV = () => {
    // Create CSV header
    const header = [
      'ID',
      'Loại giao dịch',
      'Số tiền',
      'Mô tả',
      'Mã tham chiếu',
      'Tên tham chiếu',
      'Trạng thái',
      'Ngày tạo'
    ].join(',');

    // Create CSV rows
    const rows = filteredTransactions.map(t => [
      t.id,
      t.transaction_type,
      t.amount,
      `"${t.description.replace(/"/g, '""')}"`, // Escape quotes
      t.reference_id,
      t.reference_name || '',
      t.status,
      format(parseISO(t.created_at), 'dd/MM/yyyy HH:mm')
    ].join(','));

    // Combine header and rows
    const csv = [header, ...rows].join('\n');

    // Create download link
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.setAttribute('href', url);
    link.setAttribute('download', `finance_report_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="container p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Quản lý tài chính</h1>
        <Button onClick={exportToCSV}>
          <Download className="mr-2 h-4 w-4" />
          Xuất báo cáo
        </Button>
      </div>

      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="overview">
            <BarChartIcon className="mr-2 h-4 w-4" />
            Tổng quan
          </TabsTrigger>
          <TabsTrigger value="transactions">
            <FileText className="mr-2 h-4 w-4" />
            Chi tiết giao dịch
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Tổng thu</p>
                    <h3 className="text-2xl font-bold text-green-600">
                      {summary.totalIncome.toLocaleString()} đ
                    </h3>
                  </div>
                  <div className="bg-green-100 p-3 rounded-full">
                    <DollarSign className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Tổng chi</p>
                    <h3 className="text-2xl font-bold text-red-600">
                      {summary.totalExpense.toLocaleString()} đ
                    </h3>
                  </div>
                  <div className="bg-red-100 p-3 rounded-full">
                    <DollarSign className="h-6 w-6 text-red-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Thu nhập ròng</p>
                    <h3 className={`text-2xl font-bold ${summary.netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {summary.netIncome.toLocaleString()} đ
                    </h3>
                  </div>
                  <div className={`${summary.netIncome >= 0 ? 'bg-green-100' : 'bg-red-100'} p-3 rounded-full`}>
                    <DollarSign className={`h-6 w-6 ${summary.netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Income Distribution Chart */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold mb-4">Phân bố thu nhập</h3>
              <div className="h-[300px]">
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={chartData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        fill="#8884d8"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => value.toLocaleString() + ' đ'} />
                      <Legend />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <p className="text-gray-500">Không có dữ liệu để hiển thị</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Revenue Trend Chart */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold mb-4">Xu hướng doanh thu (7 ngày qua)</h3>
              <div className="h-[300px]">
                {revenueTrendData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsBarChart
                      data={revenueTrendData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis tickFormatter={(value) => value.toLocaleString()} />
                      <Tooltip formatter={(value: number) => value.toLocaleString() + ' đ'} />
                      <Legend />
                      <Bar dataKey="income" name="Thu" fill="#0088FE" />
                      <Bar dataKey="expense" name="Chi" fill="#FF8042" />
                    </RechartsBarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <p className="text-gray-500">Không có dữ liệu để hiển thị</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Revenue by Type */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Doanh thu đặt sân</p>
                    <h3 className="text-2xl font-bold text-blue-600">
                      {summary.bookingRevenue.toLocaleString()} đ
                    </h3>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-full">
                    <Calendar className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Doanh thu sản phẩm</p>
                    <h3 className="text-2xl font-bold text-green-600">
                      {summary.productRevenue.toLocaleString()} đ
                    </h3>
                  </div>
                  <div className="bg-green-100 p-3 rounded-full">
                    <ShoppingBag className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Doanh thu khác</p>
                    <h3 className="text-2xl font-bold text-purple-600">
                      {summary.otherRevenue.toLocaleString()} đ
                    </h3>
                  </div>
                  <div className="bg-purple-100 p-3 rounded-full">
                    <DollarSign className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="transactions">
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="w-full md:w-1/4">
              <Input
                placeholder="Tìm kiếm giao dịch..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
                icon={<Search className="h-4 w-4" />}
              />
            </div>
            <div className="w-full md:w-1/4">
              <Select value={transactionType} onValueChange={setTransactionType}>
                <SelectTrigger>
                  <SelectValue placeholder="Loại giao dịch" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="booking">Đặt sân</SelectItem>
                  <SelectItem value="product_sale">Bán sản phẩm</SelectItem>
                  <SelectItem value="expense">Chi phí</SelectItem>
                  <SelectItem value="other">Khác</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-full md:w-1/2">
              <DateRangePicker
                from={dateRange.from}
                to={dateRange.to}
                onFromChange={(date) => setDateRange(prev => ({ ...prev, from: date }))}
                onToChange={(date) => setDateRange(prev => ({ ...prev, to: date }))}
              />
            </div>
          </div>

          {/* Transactions Table */}
          <Card>
            <CardContent className="p-0">
              {loading ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="h-8 w-8 animate-spin mr-2" />
                  <span>Đang tải dữ liệu...</span>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Loại</TableHead>
                      <TableHead>Ngày tạo</TableHead>
                      <TableHead>Mô tả</TableHead>
                      <TableHead>Tham chiếu</TableHead>
                      <TableHead className="text-right">Số tiền</TableHead>
                      <TableHead>Trạng thái</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTransactions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          Không có giao dịch nào
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredTransactions.map((transaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell>{transaction.id}</TableCell>
                          <TableCell>{formatTransactionType(transaction.transaction_type)}</TableCell>
                          <TableCell>{format(parseISO(transaction.created_at), 'dd/MM/yyyy')}</TableCell>
                          <TableCell>{transaction.description}</TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-medium">{transaction.reference_id}</span>
                              {transaction.reference_name && (
                                <span className="text-sm text-gray-500">{transaction.reference_name}</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-semibold">
                            {formatAmount(transaction.amount)}
                          </TableCell>
                          <TableCell>{formatStatus(transaction.status)}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Finance;