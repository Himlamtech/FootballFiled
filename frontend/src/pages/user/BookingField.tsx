import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Loader2, Lock } from "lucide-react";
import { vi } from "date-fns/locale";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { validateBookingInfo } from "@/components/validation/BookingValidation";
import QRCodePayment from "@/components/payment/QRCodePayment";
import { useToast } from "@/components/ui/use-toast";
import apiService from '@/services/api.service';

interface TimeSlot {
  id: number;
  start: string;
  end: string;
  price: number;
  available: boolean;
  isLocked?: boolean;
  lockReason?: string;
}

interface Field {
  id: number;
  name: string;
  size: string;
  image: string;
  description: string;
}

// Đã xóa dữ liệu mẫu

// Đã xóa hàm tạo dữ liệu mẫu cho khung giờ

const BookingField = () => {
  const [fields, setFields] = useState<Field[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [selectedField, setSelectedField] = useState<Field | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null);
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [note, setNote] = useState("");
  const [showPayment, setShowPayment] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingTimeSlots, setLoadingTimeSlots] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("vietqr");

  const { toast } = useToast();

  // Fetch fields from API
  useEffect(() => {
    const fetchFields = async () => {
      try {
        setLoading(true);
        // Fetch fields from API
        const response = await fetch('http://localhost:9002/api/fields');
        const data = await response.json();

        if (data) {
          let fieldsData = [];

          // Handle different API response formats
          if (Array.isArray(data)) {
            // Direct array of fields
            fieldsData = data;
          } else if (data.fields && Array.isArray(data.fields)) {
            // Fields in a 'fields' property
            fieldsData = data.fields;
          } else if (data.data && Array.isArray(data.data)) {
            // Fields in a 'data' property
            fieldsData = data.data;
          }

          // Map API response to our Field interface
          const mappedFields = fieldsData.map((field: any) => ({
            id: field.fieldId || field.id,
            name: field.name,
            size: field.size || field.capacity ? `${field.capacity || field.size}` : "Không xác định",
            image: field.imageUrl
              ? (field.imageUrl.startsWith('http') ? field.imageUrl : `http://localhost:9002${field.imageUrl}`)
              : `https://placehold.co/600x400?text=${encodeURIComponent(field.name || 'Football Field')}`,
            description: field.description || "Sân bóng đá"
          }));

          // Update state with mapped fields
          setFields(mappedFields);

          // Set default selected field
          if (mappedFields.length > 0) {
            setSelectedField(mappedFields[0]);
          }
        } else {
          console.error("API returned no fields");
          setFields([]);
        }
      } catch (error) {
        console.error("Error fetching fields:", error);
        toast({
          title: "Lỗi",
          description: "Không thể tải danh sách sân bóng",
          variant: "destructive",
        });
        setFields([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFields();
  }, []);

  // Fetch time slots for selected field and date
  useEffect(() => {
    const fetchTimeSlots = async () => {
      if (!selectedField) return;

      try {
        // Set loading state while fetching time slots
        setLoadingTimeSlots(true);
        const formattedDate = format(selectedDate, "yyyy-MM-dd");

        // Fetch time slots from API
        const response = await fetch(`http://localhost:9002/api/timeslots?field_id=${selectedField.id}&date=${formattedDate}`);
        const data = await response.json();

        let timeSlotData = [];

        // Handle different API response formats
        if (Array.isArray(data)) {
          // Direct array of time slots
          timeSlotData = data;
        } else if (data.data && Array.isArray(data.data)) {
          // Time slots in a 'data' property
          timeSlotData = data.data;
        }

        // Process time slot data if available
        if (timeSlotData.length > 0) {

          // Convert API data to the format needed for frontend
          const formattedTimeSlots = timeSlotData.map(slot => {
            // Handle different property naming conventions
            const startTime = slot.start_time || slot.startTime;
            const endTime = slot.end_time || slot.endTime;
            const slotId = slot.id || slot.timeSlotId;

            // Handle different price formats
            let price = 0;
            if (slot.price) {
              price = slot.price;
            } else if (slot.weekdayPrice || slot.weekday_price) {
              // Check if it's a weekend
              const isWeekend = selectedDate.getDay() === 0 || selectedDate.getDay() === 6;
              price = isWeekend
                ? (slot.weekendPrice || slot.weekend_price || 0)
                : (slot.weekdayPrice || slot.weekday_price || 0);
            }

            // Check if the time slot is locked by admin
            const isLocked = slot.isLocked === true;
            const lockReason = slot.lockReason || 'Locked by admin';

            return {
              id: slotId,
              start: startTime ? startTime.substring(0, 5) : "00:00",
              end: endTime ? endTime.substring(0, 5) : "00:00",
              price: parseFloat(price) || 0,
              available: slot.available !== false && !isLocked, // Not available if locked or explicitly set to false
              isLocked: isLocked,
              lockReason: isLocked ? lockReason : undefined
            };
          });

          // Lọc trùng khung giờ (theo start + end)
          const uniqueTimeSlots = Array.from(
            new Map(formattedTimeSlots.map(slot => [slot.start + slot.end, slot])).values()
          );

          // Update state with unique time slots
          setTimeSlots(uniqueTimeSlots);
        } else {
          console.error("API returned no time slots");
          setTimeSlots([]);
        }
      } catch (error) {
        console.error("Error fetching time slots:", error);
        toast({
          title: "Lỗi",
          description: "Không thể tải danh sách khung giờ",
          variant: "destructive",
        });
        setTimeSlots([]);
      } finally {
        setLoadingTimeSlots(false);
      }
    };

    if (selectedField) {
      fetchTimeSlots();
    }
  }, [selectedField, selectedDate]);

  const handleBooking = async () => {
    // Validate thông tin
    const validationResult = validateBookingInfo(customerName, phone, email);
    if (!validationResult.isValid) {
      setValidationError(validationResult.message || "Thông tin không hợp lệ");
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: validationResult.message,
      });
      return;
    }

    if (!selectedField || !selectedTimeSlot) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Vui lòng chọn sân và khung giờ",
      });
      return;
    }

    // Reset lỗi nếu thông tin hợp lệ
    setValidationError(null);

    // Show payment dialog
    setShowPayment(true);
  };

  const handlePaymentSuccess = async () => {
    try {
      // Prepare booking data for API using camelCase
      const bookingData = {
        fieldId: selectedField?.id || 0, // Provide default 0 if null
        timeSlotId: selectedTimeSlot?.id || 0, // Provide default 0 if null
        bookingDate: format(selectedDate, "yyyy-MM-dd"),
        totalPrice: Number(selectedTimeSlot?.price || 0), // Ensure number type
        customerName: customerName,
        customerPhone: phone,
        customerEmail: email,
        notes: note,
        paymentMethod: paymentMethod, // Use state paymentMethod
        // status will default to 'Đã đặt' on backend
      };

      // Use apiService to create booking
      const response = await apiService.createBooking(bookingData);

      // Check if booking was successful (apiService throws error on failure)
      handleBookingSuccess();

    } catch (error) {
      console.error("Error creating booking:", error);
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: error.message || "Không thể hoàn tất đặt sân. Vui lòng thử lại sau.",
      });

      // Close payment dialog on error
      setShowPayment(false);
    }
  };

  const handleBookingSuccess = () => {
    // Đóng dialog thanh toán
    setShowPayment(false);

    // Hiển thị thông báo đặt sân thành công
    toast({
      title: "Đặt sân thành công!",
      description: `Sân: ${selectedField?.name}, Ngày: ${format(selectedDate, "dd/MM/yyyy")}, Giờ: ${selectedTimeSlot?.start} - ${selectedTimeSlot?.end}`,
    });

    // Reset form
    setSelectedTimeSlot(null);
    setCustomerName("");
    setPhone("");
    setEmail("");
    setNote("");
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8 text-center">Đặt Sân Bóng</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Panel - Selection */}
        <div className="lg:col-span-2 space-y-8">
          {/* Field Selection */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Chọn sân</h2>

              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-field-600 mr-2" />
                  <span>Đang tải danh sách sân...</span>
                </div>
              ) : fields.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <p className="text-gray-500">Không có sân bóng nào</p>
                </div>
              ) : (
                <Tabs
                  defaultValue={fields[0]?.id ? String(fields[0].id) : undefined}
                  onValueChange={(value) => {
                    const field = fields.find(f => f.id.toString() === value);
                    if (field) setSelectedField(field);
                  }}
                >
                  <TabsList className={`grid grid-cols-${Math.min(fields.length, 4)} mb-4`}>
                    {fields.map((field) => (
                      <TabsTrigger key={String(field.id)} value={String(field.id)}>
                        {field.name}
                      </TabsTrigger>
                    ))}
                  </TabsList>

                  {fields.map((field) => (
                    <TabsContent key={field.id} value={field.id.toString()}>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <img
                            src={field.image}
                            alt={field.name}
                            className="w-full h-48 object-cover rounded-md"
                          />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{field.name}</h3>
                          <p className="text-gray-600 mb-2">Loại sân: {field.size}</p>
                          <p className="text-sm">{field.description}</p>
                        </div>
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              )}
            </CardContent>
          </Card>

          {/* Date & Time Selection */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Chọn ngày và giờ</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Date Picker */}
                <div>
                  <h3 className="font-medium mb-2">Chọn ngày</h3>
                  <div className="mb-4">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {selectedDate ? (
                            format(selectedDate, "dd/MM/yyyy")
                          ) : (
                            <span>Chọn ngày</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={(date) => date && setSelectedDate(date)}
                          initialFocus
                          locale={vi}
                          fromDate={new Date()}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                {/* Time Slots */}
                <div>
                  <h3 className="font-medium mb-2">Chọn giờ</h3>

                  {loadingTimeSlots ? (
                    <div className="flex justify-center items-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-field-600 mr-2" />
                      <span>Đang tải khung giờ...</span>
                    </div>
                  ) : timeSlots.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                      <p className="text-gray-500">Không có khung giờ nào cho ngày này</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      <TooltipProvider>
                        {timeSlots.map((slot) => (
                          <Tooltip key={slot.id}>
                            <TooltipTrigger asChild>
                              <Button
                                variant={selectedTimeSlot?.id === slot.id ? "default" : "outline"}
                                className={cn(
                                  "justify-center text-sm",
                                  !slot.available && "opacity-50 cursor-not-allowed",
                                  slot.isLocked && "bg-red-100 border-red-300 text-red-700 hover:bg-red-200 hover:text-red-800"
                                )}
                                disabled={!slot.available}
                                onClick={() => setSelectedTimeSlot(slot)}
                              >
                                {slot.start} - {slot.end}
                                {slot.isLocked && <Lock className="ml-1 h-3 w-3" />}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              {slot.isLocked ? `Đã khóa: ${slot.lockReason}` : slot.available ? "Khả dụng" : "Đã đặt"}
                            </TooltipContent>
                          </Tooltip>
                        ))}
                      </TooltipProvider>
                    </div>
                  )}

                  {selectedTimeSlot && (
                    <div className="mt-4 p-3 bg-field-50 rounded-md">
                      <p><span className="font-medium">Giá:</span> {selectedTimeSlot.price.toLocaleString()}đ</p>
                      <p className="text-sm text-gray-500">(Đã bao gồm VAT)</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Panel - Customer Info and Summary */}
        <div>
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Thông tin đặt sân</h2>

              {/* Customer Info Form */}
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium mb-1">Họ và tên</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-field-500"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Số điện thoại</label>
                  <input
                    type="tel"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-field-500"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+84, 84 hoặc 0..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input
                    type="email"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-field-500"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Ghi chú</label>
                  <textarea
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-field-500"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                  ></textarea>
                </div>

                {validationError && (
                  <div className="p-3 bg-red-50 text-red-700 rounded-md text-sm">
                    {validationError}
                  </div>
                )}
              </div>

              {/* Booking Summary */}
              <div className="bg-field-50 p-4 rounded-md mb-6">
                <h3 className="font-semibold mb-3">Thông tin đặt sân</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Sân:</span>
                    <span className="font-medium">{selectedField?.name || "Chưa chọn"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Loại sân:</span>
                    <span>{selectedField?.size || "Không xác định"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Ngày:</span>
                    <span>{format(selectedDate, "dd/MM/yyyy")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Giờ:</span>
                    <span>
                      {selectedTimeSlot
                        ? `${selectedTimeSlot.start} - ${selectedTimeSlot.end}`
                        : "Chưa chọn"}
                    </span>
                  </div>
                  <div className="border-t border-gray-200 my-2 pt-2 flex justify-between font-semibold">
                    <span>Thành tiền:</span>
                    <span>
                      {selectedTimeSlot
                        ? `${selectedTimeSlot.price.toLocaleString()}đ`
                        : "0đ"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="mb-6">
                <h3 className="font-semibold mb-3">Phương thức thanh toán</h3>
                <Select defaultValue="vietqr">
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn phương thức thanh toán" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vietqr">VietQR</SelectItem>
                    {/* <SelectItem value="cash">Tiền mặt</SelectItem> */}
                  </SelectContent>
                </Select>
                <div className="mt-3 text-sm text-gray-600">
                  Quét mã QR để thanh toán sau khi xác nhận đặt sân
                </div>
              </div>

              {/* Confirm Button */}
              <Button
                className="w-full bg-field-600 hover:bg-field-700 text-white"
                disabled={!selectedTimeSlot || !customerName || !phone}
                onClick={handleBooking}
              >
                Xác nhận đặt sân
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* QR Payment Dialog */}
      <QRCodePayment
        open={showPayment}
        onOpenChange={setShowPayment}
        amount={selectedTimeSlot?.price || 0}
        customerInfo={{
          name: customerName,
          phone: phone,
          email: email
        }}
        description={`Đặt ${selectedField?.name || ""}, ngày ${format(selectedDate, "dd/MM/yyyy")}, ${selectedTimeSlot?.start || ""} - ${selectedTimeSlot?.end || ""}`}
        onSuccess={handlePaymentSuccess}
      />
    </div>
  );
};

export default BookingField;
