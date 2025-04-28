
import { useState } from "react";
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
import { Calendar as CalendarIcon } from "lucide-react";
import { vi } from "date-fns/locale";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { validateBookingInfo } from "@/components/validation/BookingValidation";
import QRCodePayment from "@/components/payment/QRCodePayment";
import { useToast } from "@/components/ui/use-toast";

interface TimeSlot {
  id: number;
  start: string;
  end: string;
  price: number;
  available: boolean;
}

interface Field {
  id: number;
  name: string;
  size: string;
  image: string;
  description: string;
}

const fields: Field[] = [
  {
    id: 1,
    name: "Sân A",
    size: "5 người",
    image: "https://images.unsplash.com/photo-1459865264687-595d652de67e?w=800&auto=format&fit=crop&q=80",
    description: "Sân cỏ nhân tạo cao cấp, có mái che, hệ thống đèn LED sáng rõ"
  },
  {
    id: 2,
    name: "Sân B",
    size: "5 người",
    image: "https://images.unsplash.com/photo-1556056504-5c7696c4c28d?w=800&auto=format&fit=crop&q=80",
    description: "Sân cỏ nhân tạo cao cấp, có mái che, hệ thống đèn LED sáng rõ"
  },
  {
    id: 3,
    name: "Sân C",
    size: "7 người",
    image: "https://images.unsplash.com/photo-1551958219-acbc608c6377?w=800&auto=format&fit=crop&q=80",
    description: "Sân cỏ nhân tạo cao cấp, phù hợp cho sân 7 người, có đèn LED"
  },
  {
    id: 4,
    name: "Sân D",
    size: "7 người",
    image: "https://images.unsplash.com/photo-1536122985607-4fe00b283652?w=800&auto=format&fit=crop&q=80",
    description: "Sân cỏ nhân tạo cao cấp, phù hợp cho sân 7 người, có đèn LED"
  },
];

// Giả lập dữ liệu khung giờ
const generateTimeSlots = (): TimeSlot[] => {
  const slots: TimeSlot[] = [];
  const startHour = 6; // 6:00 AM
  const endHour = 22; // 10:00 PM
  
  for (let hour = startHour; hour < endHour; hour++) {
    // Các khung giờ sáng và chiều giá thấp hơn
    const price = hour >= 17 && hour <= 21 ? 350000 : 250000; // Giá cao điểm và thấp điểm
    
    slots.push({
      id: hour - startHour,
      start: `${hour}:00`,
      end: `${hour + 1}:00`,
      price,
      available: Math.random() > 0.3, // 30% khả năng đã được đặt
    });
  }
  
  return slots;
};

const BookingField = () => {
  const [selectedField, setSelectedField] = useState<Field>(fields[0]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null);
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [note, setNote] = useState("");
  const [showPayment, setShowPayment] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  
  const { toast } = useToast();
  const timeSlots = generateTimeSlots();
  
  const handleBooking = () => {
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
    
    // Reset lỗi nếu thông tin hợp lệ
    setValidationError(null);
    
    // Hiển thị QR thanh toán
    setShowPayment(true);
  };
  
  const handlePaymentSuccess = () => {
    // Đóng dialog thanh toán
    setShowPayment(false);
    
    // Hiển thị thông báo đặt sân thành công
    toast({
      title: "Đặt sân thành công!",
      description: `Sân: ${selectedField.name}, Ngày: ${format(selectedDate, "dd/MM/yyyy")}, Giờ: ${selectedTimeSlot?.start} - ${selectedTimeSlot?.end}`,
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
              <Tabs defaultValue={fields[0].id.toString()} onValueChange={(value) => {
                const field = fields.find(f => f.id.toString() === value);
                if (field) setSelectedField(field);
              }}>
                <TabsList className="grid grid-cols-4 mb-4">
                  {fields.map((field) => (
                    <TabsTrigger key={field.id} value={field.id.toString()}>
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
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {timeSlots.map((slot) => (
                      <Button
                        key={slot.id}
                        variant={selectedTimeSlot?.id === slot.id ? "default" : "outline"}
                        className={cn(
                          "justify-center text-sm",
                          !slot.available && "opacity-50 cursor-not-allowed"
                        )}
                        disabled={!slot.available}
                        onClick={() => setSelectedTimeSlot(slot)}
                      >
                        {slot.start} - {slot.end}
                      </Button>
                    ))}
                  </div>
                  
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
                    <span className="font-medium">{selectedField.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Loại sân:</span>
                    <span>{selectedField.size}</span>
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
        description={`Đặt ${selectedField.name}, ngày ${format(selectedDate, "dd/MM/yyyy")}, ${selectedTimeSlot?.start || ""} - ${selectedTimeSlot?.end || ""}`}
        onSuccess={handlePaymentSuccess}
      />
    </div>
  );
};

export default BookingField;
