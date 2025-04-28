import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { format, addDays, startOfDay } from "date-fns";
import { vi } from "date-fns/locale";
import { CalendarIcon, Pencil, Trash2, Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/components/ui/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";

interface TimeSlot {
  id: number;
  time: string;
  weekdayPrice: number;
  weekendPrice: number;
}

interface FieldStatus {
  fieldId: number;
  date: Date;
  timeSlots: {
    id: number;
    time: string;
    isBooked: boolean;
    isLocked: boolean;
    customer?: {
      name: string;
      phone: string;
    };
  }[];
}

interface Booking {
  id: number;
  fieldId: number;
  customerName: string;
  phone: string;
  date: Date;
  timeSlot: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  price: number;
}

const timeSlots: TimeSlot[] = [
  { id: 1, time: "06:00 - 07:00", weekdayPrice: 200000, weekendPrice: 250000 },
  { id: 2, time: "07:00 - 08:00", weekdayPrice: 200000, weekendPrice: 250000 },
  { id: 3, time: "08:00 - 09:00", weekdayPrice: 200000, weekendPrice: 250000 },
  { id: 4, time: "09:00 - 10:00", weekdayPrice: 200000, weekendPrice: 250000 },
  { id: 5, time: "10:00 - 11:00", weekdayPrice: 200000, weekendPrice: 250000 },
  { id: 6, time: "11:00 - 12:00", weekdayPrice: 200000, weekendPrice: 250000 },
  { id: 7, time: "12:00 - 13:00", weekdayPrice: 200000, weekendPrice: 250000 },
  { id: 8, time: "13:00 - 14:00", weekdayPrice: 200000, weekendPrice: 250000 },
  { id: 9, time: "14:00 - 15:00", weekdayPrice: 200000, weekendPrice: 250000 },
  { id: 10, time: "15:00 - 16:00", weekdayPrice: 200000, weekendPrice: 250000 },
  { id: 11, time: "16:00 - 17:00", weekdayPrice: 250000, weekendPrice: 300000 },
  { id: 12, time: "17:00 - 18:00", weekdayPrice: 350000, weekendPrice: 400000 },
  { id: 13, time: "18:00 - 19:00", weekdayPrice: 350000, weekendPrice: 400000 },
  { id: 14, time: "19:00 - 20:00", weekdayPrice: 350000, weekendPrice: 400000 },
  { id: 15, time: "20:00 - 21:00", weekdayPrice: 350000, weekendPrice: 400000 },
  { id: 16, time: "21:00 - 22:00", weekdayPrice: 300000, weekendPrice: 350000 },
  { id: 17, time: "22:00 - 23:00", weekdayPrice: 300000, weekendPrice: 350000 },
  { id: 18, time: "23:00 - 00:00", weekdayPrice: 300000, weekendPrice: 350000 },
];

// Dữ liệu giả định về trạng thái các sân
const generateFieldStatus = (): FieldStatus[] => {
  const fields = [1, 2, 3, 4]; // 4 sân
  const dates = Array.from({ length: 14 }, (_, i) => addDays(startOfDay(new Date()), i)); // 2 tuần
  
  const statuses: FieldStatus[] = [];
  
  // Tạo dữ liệu cho mỗi sân trong 14 ngày
  fields.forEach(fieldId => {
    dates.forEach(date => {
      statuses.push({
        fieldId,
        date,
        timeSlots: timeSlots.map(slot => {
          const randomValue = Math.random();
          const isBooked = randomValue > 0.7; // 30% khả năng đã đặt
          
          return {
            id: slot.id,
            time: slot.time,
            isBooked,
            isLocked: randomValue > 0.95, // 5% khả năng bị khóa
            ...(isBooked ? {
              customer: {
                name: `Khách hàng ${Math.floor(Math.random() * 100)}`,
                phone: `09${Math.floor(10000000 + Math.random() * 90000000)}`
              }
            } : {})
          };
        })
      });
    });
  });
  
  return statuses;
};

const fields = [
  { id: 1, name: "Sân A", type: "Sân 5 người" },
  { id: 2, name: "Sân B", type: "Sân 5 người" },
  { id: 3, name: "Sân C", type: "Sân 7 người" },
  { id: 4, name: "Sân D", type: "Sân 7 người" },
];

const FieldManagement = () => {
  const [activeTab, setActiveTab] = useState<string>("1"); // Default is Sân A
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [bookings] = useState<Booking[]>([]);
  const [fieldStatuses, setFieldStatuses] = useState<FieldStatus[]>(generateFieldStatus());
  const [editingTimeSlot, setEditingTimeSlot] = useState<TimeSlot | null>(null);
  const [weekdayPrice, setWeekdayPrice] = useState<string>("");
  const [weekendPrice, setWeekendPrice] = useState<string>("");
  const [showLockDialog, setShowLockDialog] = useState(false);
  const [lockReason, setLockReason] = useState("");
  const [lockingSlot, setLockingSlot] = useState<{ fieldId: number, slotId: number } | null>(null);
  const [showBulkEditDialog, setShowBulkEditDialog] = useState(false);
  const [selectedTimeSlots, setSelectedTimeSlots] = useState<number[]>([]);
  const [bulkPrice, setBulkPrice] = useState<string>("");
  const [bulkPriceType, setBulkPriceType] = useState<"weekday" | "weekend" | "both">("both");
  const [dayLocked, setDayLocked] = useState<Record<string, boolean>>({});
  
  const { toast } = useToast();
  
  const currentFieldStatus = fieldStatuses.find(
    s => s.fieldId === parseInt(activeTab) && 
    format(s.date, "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd")
  );
  
  // Đếm số khung giờ trống
  const availableSlots = currentFieldStatus?.timeSlots.filter(
    slot => !slot.isBooked && !slot.isLocked
  ).length || 0;
  
  // Đếm số khung giờ đã đặt
  const bookedSlots = currentFieldStatus?.timeSlots.filter(
    slot => slot.isBooked
  ).length || 0;
  
  // Đếm số khung giờ bị khóa
  const lockedSlots = currentFieldStatus?.timeSlots.filter(
    slot => slot.isLocked
  ).length || 0;
  
  // Kiểm tra xem ngày hiện tại có bị khóa không
  const isCurrentDayLocked = () => {
    const key = `${activeTab}_${format(selectedDate, "yyyy-MM-dd")}`;
    return dayLocked[key] || false;
  };
  
  const handleUpdatePrice = () => {
    if (!editingTimeSlot) return;
    
    toast({
      title: "Cập nhật giá thành công",
      description: `Khung giờ ${editingTimeSlot.time} đã được cập nhật.`,
    });
    
    setEditingTimeSlot(null);
    setWeekdayPrice("");
    setWeekendPrice("");
  };

  const handleToggleSlotSelection = (slotId: number) => {
    if (selectedTimeSlots.includes(slotId)) {
      setSelectedTimeSlots(selectedTimeSlots.filter(id => id !== slotId));
    } else {
      setSelectedTimeSlots([...selectedTimeSlots, slotId]);
    }
  };

  const handleBulkUpdatePrice = () => {
    if (!bulkPrice || selectedTimeSlots.length === 0) return;
  
    toast({
      title: "Cập nhật giá hàng loạt thành công",
      description: `Đã cập nhật giá cho ${selectedTimeSlots.length} khung giờ.`,
    });

    setShowBulkEditDialog(false);
    setBulkPrice("");
    setSelectedTimeSlots([]);
  };
  
  const handleLockTimeSlot = () => {
    if (!lockingSlot) return;
    
    setFieldStatuses(prev => {
      return prev.map(status => {
        if (status.fieldId === lockingSlot.fieldId && 
            format(status.date, "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd")) {
          return {
            ...status,
            timeSlots: status.timeSlots.map(slot => 
              slot.id === lockingSlot.slotId 
                ? { ...slot, isLocked: true }
                : slot
            )
          };
        }
        return status;
      });
    });
    
    toast({
      title: "Đã khóa khung giờ",
      description: lockReason || "Khung giờ đã được khóa",
    });
    
    setShowLockDialog(false);
    setLockReason("");
    setLockingSlot(null);
  };
  
  const handleUnlockTimeSlot = (slotId: number) => {
    setFieldStatuses(prev => {
      return prev.map(status => {
        if (status.fieldId === parseInt(activeTab) && 
            format(status.date, "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd")) {
          return {
            ...status,
            timeSlots: status.timeSlots.map(slot => 
              slot.id === slotId 
                ? { ...slot, isLocked: false }
                : slot
            )
          };
        }
        return status;
      });
    });
    
    toast({
      title: "Đã mở khóa khung giờ",
      description: "Khung giờ đã được mở khóa và có thể đặt sân"
    });
  };
  
  // Khóa cả ngày
  const handleLockEntireDay = () => {
    const key = `${activeTab}_${format(selectedDate, "yyyy-MM-dd")}`;
    const currentlyLocked = dayLocked[key] || false;
    
    // Nếu ngày đã bị khóa, mở khóa tất cả khung giờ
    if (currentlyLocked) {
      setFieldStatuses(prev => {
        return prev.map(status => {
          if (status.fieldId === parseInt(activeTab) && 
              format(status.date, "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd")) {
            return {
              ...status,
              timeSlots: status.timeSlots.map(slot => 
                !slot.isBooked ? { ...slot, isLocked: false } : slot
              )
            };
          }
          return status;
        });
      });
      
      setDayLocked({...dayLocked, [key]: false});
      
      toast({
        title: "Đã mở khóa tất cả khung giờ trong ngày",
        description: "Tất cả khung giờ đã được mở khóa"
      });
    } 
    // Ngược lại, khóa tất cả khung giờ trống
    else {
      setFieldStatuses(prev => {
        return prev.map(status => {
          if (status.fieldId === parseInt(activeTab) && 
              format(status.date, "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd")) {
            return {
              ...status,
              timeSlots: status.timeSlots.map(slot => 
                !slot.isBooked ? { ...slot, isLocked: true } : slot
              )
            };
          }
          return status;
        });
      });
      
      setDayLocked({...dayLocked, [key]: true});
      
      toast({
        title: "Đã khóa tất cả khung giờ trống trong ngày",
        description: "Tất cả khung giờ trống trong ngày đã bị khóa"
      });
    }
  };
  
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Quản lý sân bóng</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Panel - Price Management */}
        <div>
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Quản lý giá sân</h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedTimeSlots([]);
                    setShowBulkEditDialog(true);
                  }}
                >
                  Chỉnh sửa hàng loạt
                </Button>
              </div>
              
              <div className="border rounded-md">
                <div className="grid grid-cols-3 bg-gray-50 p-3 font-medium text-sm border-b">
                  <div>Khung giờ</div>
                  <div>Giá ngày thường</div>
                  <div>Giá cuối tuần</div>
                </div>
                <div className="max-h-[500px] overflow-y-auto">
                  {timeSlots.map((slot) => (
                    <div 
                      key={slot.id} 
                      className="grid grid-cols-3 p-3 border-b last:border-b-0 items-center text-sm hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-2">
                        <input 
                          type="checkbox"
                          className="rounded border-gray-300"
                          checked={selectedTimeSlots.includes(slot.id)}
                          onChange={() => handleToggleSlotSelection(slot.id)}
                        />
                        <span>{slot.time}</span>
                      </div>
                      <div>{slot.weekdayPrice.toLocaleString()}đ</div>
                      <div className="flex items-center justify-between">
                        <span>{slot.weekendPrice.toLocaleString()}đ</span>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => setEditingTimeSlot(slot)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                              <DialogTitle>Cập nhật giá sân</DialogTitle>
                              <DialogDescription>
                                Chỉnh sửa giá cho khung giờ {slot.time}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                              <div className="grid grid-cols-4 items-center gap-4">
                                <p className="text-right col-span-1">Ngày thường:</p>
                                <div className="col-span-3">
                                  <Input
                                    type="number"
                                    placeholder={slot.weekdayPrice.toString()}
                                    value={weekdayPrice}
                                    onChange={(e) => setWeekdayPrice(e.target.value)}
                                  />
                                </div>
                              </div>
                              <div className="grid grid-cols-4 items-center gap-4">
                                <p className="text-right col-span-1">Cuối tuần:</p>
                                <div className="col-span-3">
                                  <Input
                                    type="number"
                                    placeholder={slot.weekendPrice.toString()}
                                    value={weekendPrice}
                                    onChange={(e) => setWeekendPrice(e.target.value)}
                                  />
                                </div>
                              </div>
                            </div>
                            <DialogFooter>
                              <Button 
                                className="bg-field-600 hover:bg-field-700"
                                onClick={handleUpdatePrice}
                              >
                                Cập nhật
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Right Panel - Field Status and Booking Management */}
        <div className="lg:col-span-3">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-4">Quản lý đặt sân</h2>
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                {/* Field Selection */}
                <Tabs 
                  defaultValue="1" 
                  value={activeTab} 
                  onValueChange={setActiveTab}
                  className="space-y-4"
                >
                  <TabsList>
                    {fields.map((field) => (
                      <TabsTrigger key={field.id} value={field.id.toString()}>
                        {field.name}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>
                
                {/* Date Picker */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="justify-start text-left"
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
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              {/* Field Status Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <Card className="bg-green-50 border-green-100">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm text-green-700">Khung giờ trống</p>
                      <p className="text-2xl font-bold text-green-700">{availableSlots}</p>
                    </div>
                    <div className="bg-green-100 p-2 rounded-full">
                      <div className="w-4 h-4 rounded-full bg-green-500"></div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-blue-50 border-blue-100">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm text-blue-700">Đã đặt</p>
                      <p className="text-2xl font-bold text-blue-700">{bookedSlots}</p>
                    </div>
                    <div className="bg-blue-100 p-2 rounded-full">
                      <div className="w-4 h-4 rounded-full bg-blue-500"></div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-red-50 border-red-100">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm text-red-700">Khung giờ khóa</p>
                      <p className="text-2xl font-bold text-red-700">{lockedSlots}</p>
                    </div>
                    <div className="bg-red-100 p-2 rounded-full">
                      <div className="w-4 h-4 rounded-full bg-red-500"></div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Time Slots Table */}
              <div className="rounded-md border mb-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Khung giờ</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead>Người đặt</TableHead>
                      <TableHead className="text-right">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentFieldStatus?.timeSlots.map((slot) => (
                      <TableRow key={slot.id}>
                        <TableCell className="font-medium">{slot.time}</TableCell>
                        <TableCell>
                          {slot.isLocked ? (
                            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Khóa</Badge>
                          ) : slot.isBooked ? (
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Đã đặt</Badge>
                          ) : (
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Trống</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {slot.customer ? (
                            <div>
                              <div className="font-medium">{slot.customer.name}</div>
                              <div className="text-xs text-gray-500">{slot.customer.phone}</div>
                            </div>
                          ) : (
                            <span className="text-gray-500">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {slot.isLocked ? (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 text-red-500 hover:text-red-700"
                              onClick={() => handleUnlockTimeSlot(slot.id)}
                            >
                              <Lock className="h-5 w-5" />
                            </Button>
                          ) : !slot.isBooked ? (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 text-gray-700 hover:text-gray-900"
                              onClick={() => {
                                setLockingSlot({ fieldId: parseInt(activeTab), slotId: slot.id });
                                setShowLockDialog(true);
                              }}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-lock-open">
                                <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                                <path d="M7 11V7a5 5 0 0 1 9.9-1" />
                              </svg>
                            </Button>
                          ) : (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="h-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                              onClick={() => {
                                toast({
                                  title: "Hủy đặt sân",
                                  description: "Đã hủy đặt sân thành công",
                                });
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              {/* Lock Entire Day */}
              <div className="flex justify-end items-center mt-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm">{isCurrentDayLocked() ? "Mở khóa tất cả" : "Khóa tất cả khung giờ trống"}</span>
                  <Button 
                    variant="ghost" 
                    className={isCurrentDayLocked() ? "text-red-500 hover:text-red-700" : "text-gray-700 hover:text-gray-900"}
                    onClick={handleLockEntireDay}
                  >
                    {isCurrentDayLocked() ? (
                      <Lock className="h-5 w-5" />
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-lock-open">
                        <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                        <path d="M7 11V7a5 5 0 0 1 9.9-1" />
                      </svg>
                    )}
                    <span className="ml-1">{isCurrentDayLocked() ? "Ngày đã khóa" : "Khóa ngày"}</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Lock Time Slot Dialog */}
      <Dialog open={showLockDialog} onOpenChange={setShowLockDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Khóa khung giờ</DialogTitle>
            <DialogDescription>
              Nhập lý do khóa khung giờ này.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <p className="text-right col-span-1">Lý do:</p>
              <div className="col-span-3">
                <Input
                  placeholder="Ví dụ: Bảo trì sân"
                  value={lockReason}
                  onChange={(e) => setLockReason(e.target.value)}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowLockDialog(false)}
            >
              Hủy
            </Button>
            <Button 
              className="bg-field-600 hover:bg-field-700"
              onClick={handleLockTimeSlot}
            >
              Xác nhận khóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Edit Time Slots Dialog */}
      <Dialog open={showBulkEditDialog} onOpenChange={setShowBulkEditDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa giá hàng loạt</DialogTitle>
            <DialogDescription>
              Chọn các khung giờ và cập nhật giá cùng lúc
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="border rounded p-3 max-h-[200px] overflow-y-auto">
              {timeSlots.map(slot => (
                <div key={slot.id} className="flex items-center gap-2 py-1">
                  <input
                    type="checkbox"
                    id={`slot-${slot.id}`}
                    checked={selectedTimeSlots.includes(slot.id)}
                    onChange={() => handleToggleSlotSelection(slot.id)}
                    className="rounded border-gray-300"
                  />
                  <label htmlFor={`slot-${slot.id}`} className="text-sm">{slot.time}</label>
                </div>
              ))}
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Áp dụng cho</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-field-500"
                value={bulkPriceType}
                onChange={(e) => setBulkPriceType(e.target.value as "weekday" | "weekend" | "both")}
              >
                <option value="weekday">Giá ngày thường</option>
                <option value="weekend">Giá cuối tuần</option>
                <option value="both">Cả hai loại giá</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Giá mới (VNĐ)</label>
              <Input
                type="number"
                placeholder="Nhập giá mới"
                value={bulkPrice}
                onChange={(e) => setBulkPrice(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <div className="text-sm text-gray-600">
                Đã chọn: <span className="font-medium">{selectedTimeSlots.length}</span> khung giờ
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setShowBulkEditDialog(false);
                setSelectedTimeSlots([]);
              }}
            >
              Hủy
            </Button>
            <Button 
              className="bg-field-600 hover:bg-field-700"
              onClick={handleBulkUpdatePrice}
              disabled={selectedTimeSlots.length === 0 || !bulkPrice}
            >
              Cập nhật giá
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FieldManagement;
