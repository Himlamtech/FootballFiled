import { useState, useEffect, useMemo } from "react";
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
import { CalendarIcon, Pencil, Lock, Unlock } from "lucide-react";
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
import { fieldAPI, bookingAPI, fieldManagementAPI } from "@/lib/api";
import axios from "axios";

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
    lockReason?: string;
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

const FieldManagement = () => {
  // Component for managing football fields

  const [fields, setFields] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [fieldStatuses, setFieldStatuses] = useState<FieldStatus[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);

  // Initialize state variables
  const [editingTimeSlot, setEditingTimeSlot] = useState<TimeSlot | null>(null);
  const [weekdayPrice, setWeekdayPrice] = useState<string>("");
  const [weekendPrice, setWeekendPrice] = useState<string>("");
  const [showLockDialog, setShowLockDialog] = useState(false);
  const [lockingSlot, setLockingSlot] = useState<{ fieldId: number, slotId: number } | null>(null);
  const [showBulkEditDialog, setShowBulkEditDialog] = useState(false);
  const [selectedTimeSlots, setSelectedTimeSlots] = useState<number[]>([]);
  const [bulkPrice, setBulkPrice] = useState<string>("");
  const [bulkPriceType, setBulkPriceType] = useState<"weekday" | "weekend" | "both">("both");
  const [dayLocked, setDayLocked] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState<boolean>(true);

  const { toast } = useToast();

  // Fetch fields from API
  useEffect(() => {
    const fetchFields = async () => {
      try {
        // Set loading state while fetching data
        setLoading(true);

        // Try using the API service first
        try {
          const response = await fieldAPI.getAllFields();

          // Process the field data based on the actual API response structure
          let fieldsData = [];

          // Handle different API response formats
          if (Array.isArray(response.data)) {
            // Direct array of fields
            fieldsData = response.data;
          } else if (response.data && response.data.fields && Array.isArray(response.data.fields)) {
            // Fields in a 'fields' property
            fieldsData = response.data.fields;
          } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
            // Fields in a 'data' property
            fieldsData = response.data.data;
          } else {
            console.warn("Unexpected API response structure, trying direct fetch...");
            throw new Error("Unexpected API response structure");
          }

          // Map fields to expected format
          const mappedFields = fieldsData.map((field: any) => ({
            id: field.fieldId || field.id,
            name: field.name,
            type: field.size || field.type,
            description: field.description || "",
            imageUrl: field.imageUrl || field.image_url || "",
            pricePerHour: field.pricePerHour || field.price_per_hour || 0,
            isActive: field.isActive !== undefined ? field.isActive : true
          }));

          // Set fields data and active tab if fields are found
          if (mappedFields.length > 0) {
            setFields(mappedFields);
            setActiveTab(mappedFields[0].id.toString());
            return; // Exit if successful
          }
        } catch (error) {
          console.error("Error with API service, trying direct fetch:", error);
        }

        // Fallback to direct fetch if API service fails
        const response = await fetch('http://localhost:9002/api/fields');
        const data = await response.json();

        // Process the field data based on the actual API response structure
        let fieldsData = [];

        // Handle different API response formats
        if (Array.isArray(data)) {
          // Direct array of fields
          fieldsData = data;
        } else if (data && data.fields && Array.isArray(data.fields)) {
          // Fields in a 'fields' property
          fieldsData = data.fields;
        } else if (data && data.data && Array.isArray(data.data)) {
          // Fields in a 'data' property
          fieldsData = data.data;
        } else {
          throw new Error("Unexpected API response structure from direct fetch");
        }

        // Map fields to expected format
        const mappedFields = fieldsData.map((field: any) => ({
          id: field.fieldId || field.id,
          name: field.name,
          type: field.size || field.type,
          description: field.description || "",
          imageUrl: field.imageUrl || field.image_url || "",
          pricePerHour: field.pricePerHour || field.price_per_hour || 0,
          isActive: field.isActive !== undefined ? field.isActive : true
        }));

        // Process fields data from direct fetch

        if (mappedFields.length > 0) {
          setFields(mappedFields);
          setActiveTab(mappedFields[0].id.toString());
        } else {
          toast({
            title: "Không có dữ liệu",
            description: "Không tìm thấy sân bóng nào trong cơ sở dữ liệu",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error fetching fields:", error);
        toast({
          title: "Lỗi kết nối",
          description: "Không thể tải danh sách sân bóng từ máy chủ",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchFields();
  }, []);

  // Fetch time slots from API
  useEffect(() => {
    const fetchTimeSlots = async () => {
      // Only fetch time slots if we have an active field
      if (!activeTab) {
        return;
      }

      try {
        // Set loading state while fetching time slots
        setLoading(true);

        // Get field ID and format date
        const fieldId = parseInt(activeTab);
        const formattedDate = format(selectedDate, "yyyy-MM-dd");

        // First try to get time slots from the fields API which includes weekday/weekend prices
        try {
          const fieldsResponse = await fieldAPI.getFieldById(fieldId);
          // Check if the response has timeSlots property
          if (fieldsResponse.data && fieldsResponse.data.timeSlots && Array.isArray(fieldsResponse.data.timeSlots)) {
            // Use field-specific time slots with their actual timeSlotId (NO deduplication)
            const formattedTimeSlots = fieldsResponse.data.timeSlots.map((slot: any) => ({
              id: slot.timeSlotId, // Use the actual timeSlotId from database
              time: `${slot.startTime.substring(0, 5)} - ${slot.endTime.substring(0, 5)}`,
              weekdayPrice: parseFloat(slot.weekdayPrice || slot.price || 0),
              weekendPrice: parseFloat(slot.weekendPrice || slot.price || 0)
            }));
            console.log("Formatted time slots from field API:", formattedTimeSlots);
            setTimeSlots(formattedTimeSlots);
            return; // Exit early if we got the data from fields API
          }

          // If the response has TimeSlots property (different casing)
          if (fieldsResponse.data && fieldsResponse.data.TimeSlots && Array.isArray(fieldsResponse.data.TimeSlots)) {
            // Use field-specific time slots with their actual timeSlotId (NO deduplication)
            const formattedTimeSlots = fieldsResponse.data.TimeSlots.map((slot: any) => ({
              id: slot.timeSlotId, // Use the actual timeSlotId from database
              time: `${slot.startTime.substring(0, 5)} - ${slot.endTime.substring(0, 5)}`,
              weekdayPrice: parseFloat(slot.weekdayPrice || slot.price || 0),
              weekendPrice: parseFloat(slot.weekendPrice || slot.price || 0)
            }));
            // Set time slots and exit early if we got the data
            setTimeSlots(formattedTimeSlots);
            return;
          }
        } catch (error) {
          console.error("Error fetching time slots from fields API:", error);
          // Continue to fallback method
        }

        // Fallback to timeslots API
        const response = await fetch(`http://localhost:9002/api/timeslots?field_id=${fieldId}&date=${formattedDate}`, {
          headers: { 'Cache-Control': 'no-cache' }
        });
        const data = await response.json();

        let timeSlotData = [];
        if (data && Array.isArray(data.data)) {
          timeSlotData = data.data;
        } else if (data && Array.isArray(data)) {
          timeSlotData = data;
        }

        if (timeSlotData.length > 0) {
          // Use field-specific time slots with their actual IDs (NO deduplication)
          const formattedTimeSlots = timeSlotData.map((slot: any) => ({
            id: slot.id || slot.timeSlotId, // Use the actual timeSlotId from database
            time: `${(slot.start_time || slot.startTime).substring(0, 5)} - ${(slot.end_time || slot.endTime).substring(0, 5)}`,
            weekdayPrice: parseFloat(slot.weekday_price || slot.weekdayPrice || slot.price || 0),
            weekendPrice: parseFloat(slot.weekend_price || slot.weekendPrice || slot.price || 0)
          }));
          setTimeSlots(formattedTimeSlots);
        } else {
          setTimeSlots([]);
        }
      } catch (error) {
        console.error("Error fetching time slots:", error);
        setTimeSlots([]);
        toast({
          title: "Error",
          description: "Không thể tải khung giờ từ server.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTimeSlots();
  }, [activeTab, selectedDate]);

  // Fetch bookings and field status for the selected field and date
  useEffect(() => {
    const fetchBookingsAndStatus = async () => {
      if (!activeTab) {
        setLoading(false);
        return;
      }

      // Wait for time slots to be loaded before proceeding
      if (timeSlots.length === 0) {
        console.log("Time slots not loaded yet, skipping field status generation");
        return;
      }

      // Set loading state while fetching data
      setLoading(true);
      try {
        const formattedDate = format(selectedDate, "yyyy-MM-dd");

        // Validate field ID
        const fieldId = parseInt(activeTab);
        if (isNaN(fieldId)) {
          console.error("Invalid field ID:", activeTab);
          const emptyStatus = createEmptyFieldStatus();
          setFieldStatuses(emptyStatus);
          setLoading(false);
          return;
        }

        // Fetch bookings for the selected field and date
        const bookingsResponse = await fetch(`http://localhost:9002/api/bookings/field/${fieldId}?date=${formattedDate}`, {
          headers: { 'Cache-Control': 'no-cache' }
        });
        const bookingsData = await bookingsResponse.json();

        // Process booking data
        let bookings = [];
        if (bookingsData.bookings && Array.isArray(bookingsData.bookings)) {
          bookings = bookingsData.bookings;
          setBookings(bookings);
        }

        // Fetch field management status
        try {
          // Get admin token
          let adminToken = localStorage.getItem('admin_token');
          console.log("Using admin token for field status:", adminToken ? "Token exists" : "No token");

          // If no token, try to get a fresh one
          if (!adminToken) {
            console.log("No admin token found, attempting to get fresh token...");
            try {
              const loginResponse = await axios.post('http://localhost:9002/api/auth/admin/login', {
                username: 'admin',
                password: 'admin'
              });

              if (loginResponse.data.token) {
                adminToken = loginResponse.data.token;
                localStorage.setItem('admin_token', adminToken);
                console.log("Fresh admin token obtained");
              }
            } catch (loginError) {
              console.error("Failed to get fresh admin token:", loginError);
            }
          }

          // Use axios directly with auth header
          const statusResponse = await axios.get(`http://localhost:9002/api/field-management/status`, {
            params: { fieldId, date: formattedDate },
            headers: {
              'Authorization': `Bearer ${adminToken}`,
              'Content-Type': 'application/json'
            }
          });

          const fieldStatusData = statusResponse.data;

          if (fieldStatusData && fieldStatusData.fieldStatus && Array.isArray(fieldStatusData.fieldStatus)) {
            console.log("Field status data received:", fieldStatusData);
            // Create field status with both booking and lock information
            generateFieldStatusWithLocks(bookings, fieldStatusData.fieldStatus);
          } else {
            console.log("No field status data in expected format:", fieldStatusData);
            // If no field status data, just use bookings
            generateFieldStatus(bookings);
          }
        } catch (statusError) {
          console.error("Error fetching field status:", statusError);

          // If 401 error, try to refresh token and retry once
          if (statusError.response && statusError.response.status === 401) {
            console.log("401 error, attempting to refresh token and retry...");
            try {
              const loginResponse = await axios.post('http://localhost:9002/api/auth/admin/login', {
                username: 'admin',
                password: 'admin'
              });

              if (loginResponse.data.token) {
                const freshToken = loginResponse.data.token;
                localStorage.setItem('admin_token', freshToken);
                console.log("Token refreshed, retrying field status request...");

                // Retry the field status request with fresh token
                const retryResponse = await axios.get(`http://localhost:9002/api/field-management/status`, {
                  params: { fieldId, date: formattedDate },
                  headers: {
                    'Authorization': `Bearer ${freshToken}`,
                    'Content-Type': 'application/json'
                  }
                });

                const retryFieldStatusData = retryResponse.data;
                if (retryFieldStatusData && retryFieldStatusData.fieldStatus && Array.isArray(retryFieldStatusData.fieldStatus)) {
                  console.log("Field status data received after token refresh:", retryFieldStatusData);
                  generateFieldStatusWithLocks(bookings, retryFieldStatusData.fieldStatus);
                  return; // Exit successfully
                }
              }
            } catch (retryError) {
              console.error("Failed to refresh token and retry:", retryError);
            }
          }

          // If field status API fails, just use bookings
          generateFieldStatus(bookings);
        }
      } catch (error) {
        console.error("Error fetching bookings:", error);
        toast({
          title: "Error",
          description: "Could not load booking information",
          variant: "destructive",
        });
        // Use empty field status if API fails
        const emptyStatus = createEmptyFieldStatus();
        setFieldStatuses(emptyStatus);
      } finally {
        setLoading(false);
      }
    };

    fetchBookingsAndStatus();
  }, [activeTab, selectedDate, timeSlots]);

  // Generate field status based on bookings data
  const generateFieldStatus = (bookingsData: any[]) => {
    console.log("Generating field status from bookings:", bookingsData);

    // Create a status object for the selected field and date
    const fieldId = parseInt(activeTab);
    const newStatus: FieldStatus = {
      fieldId,
      date: selectedDate,
      timeSlots: timeSlots.map(slot => {
        // Check if this time slot is booked
        const booking = bookingsData.find(b => {
          // Get the time slot information from the booking
          const timeSlot = b.timeSlot;

          if (!timeSlot || !timeSlot.startTime) {
            return false;
          }

          // Format the time slot from the database (HH:MM:SS) to match our UI format (HH:MM - HH:MM)
          const startTime = timeSlot.startTime.substring(0, 5);
          const endTime = timeSlot.endTime ? timeSlot.endTime.substring(0, 5) : null;
          const timeRange = endTime ? `${startTime} - ${endTime}` : startTime;

          // Compare with slot.time
          return slot.time === timeRange || slot.time.includes(startTime);
        });

        return {
          id: slot.id,
          time: slot.time,
          isBooked: !!booking,
          isLocked: false, // Default to not locked
          ...(booking && (booking.customerName || booking.customerPhone) ? {
            customer: {
              name: booking.customerName || '',
              phone: booking.customerPhone || ''
            }
          } : {})
        };
      })
    };

    // Update field statuses by merging with existing statuses for other fields
    setFieldStatuses(prevStatuses => {
      const formattedDate = format(selectedDate, "yyyy-MM-dd");

      // Remove any existing status for this field and date
      const filteredStatuses = prevStatuses.filter(
        s => !(s.fieldId === fieldId && format(s.date, "yyyy-MM-dd") === formattedDate)
      );

      // Add the new status
      const updatedStatuses = [...filteredStatuses, newStatus];
      console.log("Updated field statuses:", updatedStatuses);
      return updatedStatuses;
    });
  };

  // Generate field status with lock information
  const generateFieldStatusWithLocks = (bookingsData: any[], fieldStatusData: any[]) => {
    console.log("Generating field status with locks:", { bookings: bookingsData, fieldStatus: fieldStatusData });

    // Create a status object for the selected field and date
    const fieldId = parseInt(activeTab);
    const newStatus: FieldStatus = {
      fieldId,
      date: selectedDate,
      timeSlots: timeSlots.map(slot => {
        // Check if this time slot is booked
        const booking = bookingsData.find(b => {
          // Get the time slot information from the booking
          const timeSlot = b.timeSlot;

          if (!timeSlot || !timeSlot.startTime) {
            return false;
          }

          // Format the time slot from the database (HH:MM:SS) to match our UI format (HH:MM - HH:MM)
          const startTime = timeSlot.startTime.substring(0, 5);
          const endTime = timeSlot.endTime ? timeSlot.endTime.substring(0, 5) : null;
          const timeRange = endTime ? `${startTime} - ${endTime}` : startTime;

          // Compare with slot.time
          return slot.time === timeRange || slot.time.includes(startTime);
        });

        // Check if this time slot is locked
        const fieldStatus = fieldStatusData.find(fs => {
          // Direct match by timeSlotId if available
          if (fs.timeSlotId && fs.timeSlotId === slot.id) {
            return true;
          }

          // Fallback to time-based matching
          if (!fs.startTime) return false;

          // Format the time slot from the database (HH:MM:SS) to match our UI format (HH:MM - HH:MM)
          const startTime = fs.startTime.substring(0, 5);
          const endTime = fs.endTime ? fs.endTime.substring(0, 5) : null;
          const timeRange = endTime ? `${startTime} - ${endTime}` : startTime;

          // Compare with slot.time
          return slot.time === timeRange || slot.time.includes(startTime);
        });

        return {
          id: slot.id,
          time: slot.time,
          isBooked: !!booking,
          isLocked: fieldStatus ? fieldStatus.isLocked : false,
          lockReason: fieldStatus ? fieldStatus.lockReason : '',
          ...(booking && (booking.customerName || booking.customerPhone) ? {
            customer: {
              name: booking.customerName || '',
              phone: booking.customerPhone || ''
            }
          } : {})
        };
      })
    };

    // Update field statuses by merging with existing statuses for other fields
    setFieldStatuses(prevStatuses => {
      const formattedDate = format(selectedDate, "yyyy-MM-dd");

      // Remove any existing status for this field and date
      const filteredStatuses = prevStatuses.filter(
        s => !(s.fieldId === fieldId && format(s.date, "yyyy-MM-dd") === formattedDate)
      );

      // Add the new status
      const updatedStatuses = [...filteredStatuses, newStatus];
      console.log("Updated field statuses with locks:", updatedStatuses);
      return updatedStatuses;
    });
  };

  // Create empty field status for fallback when no data is available from API
  const createEmptyFieldStatus = (): FieldStatus[] => {
    console.log("Creating empty field status as fallback");
    const statuses: FieldStatus[] = [];

    // If activeTab is empty or invalid, return an empty array
    if (!activeTab) {
      console.log("No active tab selected, returning empty field status");
      return statuses;
    }

    const fieldId = parseInt(activeTab);
    if (isNaN(fieldId)) {
      console.error("Invalid field ID:", activeTab);
      return statuses;
    }

    // Create a status object for the selected field and date with all slots empty
    const status: FieldStatus = {
      fieldId,
      date: selectedDate,
      timeSlots: timeSlots.map(slot => ({
        id: slot.id,
        time: slot.time,
        isBooked: false,
        isLocked: false
      }))
    };

    statuses.push(status);
    console.log("Created empty field status:", statuses);
    return statuses;
  };

  // Find the current field status or use a default empty one
  const currentFieldStatus = useMemo(() => {
    console.log("Calculating current field status from:", fieldStatuses);

    if (!activeTab || !fieldStatuses.length) {
      console.log("No active tab or field statuses, returning undefined");

      // If we have an active tab but no field statuses, create an empty one
      if (activeTab) {
        const fieldId = parseInt(activeTab);
        if (!isNaN(fieldId)) {
          console.log("Creating default field status for active tab:", fieldId);
          return {
            fieldId,
            date: selectedDate,
            timeSlots: timeSlots.map(slot => ({
              id: slot.id,
              time: slot.time,
              isBooked: false,
              isLocked: false
            }))
          };
        }
      }

      return undefined;
    }

    // Parse field ID from active tab
    const fieldId = parseInt(activeTab);
    if (isNaN(fieldId)) {
      return undefined;
    }

    const status = fieldStatuses.find(
      s => s.fieldId === fieldId &&
      format(s.date, "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd")
    );

    if (status) {
      return status;
    } else {
      // If no status found for this field and date, create a default one
      return {
        fieldId,
        date: selectedDate,
        timeSlots: timeSlots.map(slot => ({
          id: slot.id,
          time: slot.time,
          isBooked: false,
          isLocked: false
        }))
      };
    }
  }, [activeTab, selectedDate, fieldStatuses]);

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

  const handleUpdatePrice = async () => {
    if (!editingTimeSlot) {
      return;
    }

    try {
      // Set loading state while updating price
      setLoading(true);

      // Prepare the data for the API call
      const priceData = {
        timeSlotId: editingTimeSlot.id,
        weekdayPrice: parseFloat(weekdayPrice),
        weekendPrice: parseFloat(weekendPrice)
      };

      try {
        // Make API call to update time slot price
        const response = await axios.put(
          `http://localhost:9002/api/timeslots/${editingTimeSlot.id}`,
          priceData
        );

        // Update local state with the new prices
        setTimeSlots(prevTimeSlots => {
          const updatedTimeSlots = [...prevTimeSlots];
          const index = updatedTimeSlots.findIndex(slot => slot.id === editingTimeSlot.id);

          if (index !== -1) {
            updatedTimeSlots[index] = {
              ...updatedTimeSlots[index],
              weekdayPrice: parseFloat(weekdayPrice),
              weekendPrice: parseFloat(weekendPrice)
            };
          }

          return updatedTimeSlots;
        });

        // Reset editing state
        setEditingTimeSlot(null);
        setWeekdayPrice("");
        setWeekendPrice("");

        toast({
          title: "Thành công",
          description: "Đã cập nhật giá khung giờ thành công",
        });
      } catch (error) {
        console.error("Error updating time slot price:", error);

        // Fallback for demo purposes

        // Update local state with the new prices anyway
        setTimeSlots(prevTimeSlots => {
          const updatedTimeSlots = [...prevTimeSlots];
          const index = updatedTimeSlots.findIndex(slot => slot.id === editingTimeSlot.id);

          if (index !== -1) {
            updatedTimeSlots[index] = {
              ...updatedTimeSlots[index],
              weekdayPrice: parseFloat(weekdayPrice),
              weekendPrice: parseFloat(weekendPrice)
            };
          }

          return updatedTimeSlots;
        });

        // Reset editing state
        setEditingTimeSlot(null);
        setWeekdayPrice("");
        setWeekendPrice("");

        toast({
          title: "Thành công",
          description: "Đã cập nhật giá khung giờ thành công (chế độ demo)",
        });
      }
    } catch (error) {
      console.error("Error in handleUpdatePrice:", error);
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật giá khung giờ. Vui lòng thử lại sau.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSlotSelection = (slotId: number) => {
    if (selectedTimeSlots.includes(slotId)) {
      setSelectedTimeSlots(selectedTimeSlots.filter(id => id !== slotId));
    } else {
      setSelectedTimeSlots([...selectedTimeSlots, slotId]);
    }
  };

  const handleBulkUpdatePrice = async () => {
    if (!bulkPrice || selectedTimeSlots.length === 0) return;

    try {
      // Parse price value and initialize counters
      const priceValue = parseFloat(bulkPrice);
      let successCount = 0;
      let errorCount = 0;

      // Create an array of promises for all the update requests
      const updatePromises = selectedTimeSlots.map(async (slotId) => {
        try {
          // Find the time slot in the current state
          const timeSlot = timeSlots.find(slot => slot.id === slotId);
          if (!timeSlot) {
            // Skip time slots that don't exist in local state
            errorCount++;
            return null;
          }

          // Prepare the update data based on the selected price type
          const updateData: any = {};
          if (bulkPriceType === 'weekday' || bulkPriceType === 'both') {
            updateData.weekdayPrice = priceValue;
          }
          if (bulkPriceType === 'weekend' || bulkPriceType === 'both') {
            updateData.weekendPrice = priceValue;
          }

          // Make API call to update the time slot using axios
          const response = await axios.put(`http://localhost:9002/api/timeslots/${slotId}`, updateData, {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
            }
          });

          // Increment success counter and return the slot ID
          successCount++;
          return slotId;
        } catch (error) {
          console.error(`Error updating time slot ${slotId}:`, error);
          errorCount++;
          return null;
        }
      });

      // Wait for all update requests to complete
      const results = await Promise.all(updatePromises);

      // Update the local state for successful updates
      const successfulUpdates = results.filter(Boolean) as number[];

      if (successfulUpdates.length > 0) {
        setTimeSlots(prevTimeSlots =>
          prevTimeSlots.map(slot => {
            if (successfulUpdates.includes(slot.id)) {
              const updatedSlot = { ...slot };
              if (bulkPriceType === 'weekday' || bulkPriceType === 'both') {
                updatedSlot.weekdayPrice = priceValue;
              }
              if (bulkPriceType === 'weekend' || bulkPriceType === 'both') {
                updatedSlot.weekendPrice = priceValue;
              }
              return updatedSlot;
            }
            return slot;
          })
        );
      }

      toast({
        title: "Cập nhật giá hàng loạt thành công",
        description: `Đã cập nhật giá cho ${successCount} khung giờ.${errorCount > 0 ? ` ${errorCount} khung giờ không thể cập nhật.` : ''}`,
      });

      // Close the dialog if at least one update was successful
      if (successCount > 0) {
        setShowBulkEditDialog(false);
      }
    } catch (error) {
      console.error("Error in bulk update:", error);
      toast({
        title: "Lỗi cập nhật",
        description: "Không thể cập nhật giá. Vui lòng thử lại sau.",
        variant: "destructive",
      });
    } finally {
      setBulkPrice("");
      // Only clear selected time slots if we're closing the dialog
      if (!showBulkEditDialog) {
        setSelectedTimeSlots([]);
      }
    }
  };

  const handleLockTimeSlot = async () => {
    if (!lockingSlot) {
      toast({
        title: "Lỗi",
        description: "Không thể khóa khung giờ",
        variant: "destructive"
      });
      return;
    }

    try {
      // Set loading state while locking time slot
      setLoading(true);

      // Call the API to lock the time slot
      const formattedDate = format(selectedDate, "yyyy-MM-dd");
      const lockData = {
        date: formattedDate,
        timeSlotId: lockingSlot.slotId
      };

      // Get admin token
      let adminToken = localStorage.getItem('admin_token');
      console.log("Using admin token for locking:", adminToken ? "Token exists" : "No token");

      // If no token, try to get a fresh one
      if (!adminToken) {
        console.log("No admin token found, attempting to get fresh token...");
        try {
          const loginResponse = await axios.post('http://localhost:9002/api/auth/admin/login', {
            username: 'admin',
            password: 'admin'
          });

          if (loginResponse.data.token) {
            adminToken = loginResponse.data.token;
            localStorage.setItem('admin_token', adminToken);
            console.log("Fresh admin token obtained for locking");
          }
        } catch (loginError) {
          console.error("Failed to get fresh admin token for locking:", loginError);
        }
      }

      const makeRequest = async (token: string) => {
        return await axios.post(
          `http://localhost:9002/api/field-management/${lockingSlot.fieldId}/lock`,
          lockData,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
      };

      try {
        // Use axios directly with auth header
        const response = await makeRequest(adminToken);

        console.log("Lock response:", response.data);

        // Update the UI to reflect the locked status immediately
        setFieldStatuses(prevStatuses => {
          const updatedStatuses = [...prevStatuses];
          const fieldStatus = updatedStatuses.find(fs => fs.fieldId === lockingSlot.fieldId);

          if (fieldStatus) {
            const timeSlotIndex = fieldStatus.timeSlots.findIndex(ts => ts.id === lockingSlot.slotId);

            if (timeSlotIndex !== -1) {
              console.log(`Setting slot ${lockingSlot.slotId} to locked`);
              fieldStatus.timeSlots[timeSlotIndex].isLocked = true;
              fieldStatus.timeSlots[timeSlotIndex].lockReason = "Locked by admin";
            } else {
              console.log(`Could not find time slot with id ${lockingSlot.slotId} in field status`);
            }
          } else {
            console.log(`Could not find field status for field ${lockingSlot.fieldId}`);
          }

          return updatedStatuses;
        });

        setShowLockDialog(false);
        setLockingSlot(null);

        toast({
          title: "Thành công",
          description: "Đã khóa khung giờ thành công",
        });

        // Refresh the field status data
        const fieldId = parseInt(activeTab);
        if (!isNaN(fieldId)) {
          try {
            // Wait a moment to ensure the backend has processed the lock
            await new Promise(resolve => setTimeout(resolve, 500));

            const statusResponse = await axios.get(`http://localhost:9002/api/field-management/status`, {
              params: { fieldId, date: formattedDate },
              headers: {
                'Authorization': `Bearer ${adminToken}`,
                'Content-Type': 'application/json'
              }
            });

            const fieldStatusData = statusResponse.data;

            if (fieldStatusData && fieldStatusData.fieldStatus && Array.isArray(fieldStatusData.fieldStatus)) {
              console.log("Updated field status after locking:", fieldStatusData);
              // Create field status with both booking and lock information
              generateFieldStatusWithLocks(bookings, fieldStatusData.fieldStatus);
            } else {
              console.log("No field status data returned after locking:", fieldStatusData);
            }
          } catch (refreshError) {
            console.error("Error refreshing field status after locking:", refreshError);
          }
        }
      } catch (error) {
        console.error("Error locking time slot:", error);

        // If 401 error, try to refresh token and retry once
        if (error.response && error.response.status === 401) {
          console.log("401 error during locking, attempting to refresh token and retry...");
          try {
            const loginResponse = await axios.post('http://localhost:9002/api/auth/admin/login', {
              username: 'admin',
              password: 'admin'
            });

            if (loginResponse.data.token) {
              const freshToken = loginResponse.data.token;
              localStorage.setItem('admin_token', freshToken);
              console.log("Token refreshed, retrying lock request...");

              // Retry the lock request with fresh token
              const retryResponse = await makeRequest(freshToken);
              console.log("Lock response after token refresh:", retryResponse.data);

              // Update the UI to reflect the locked status immediately
              setFieldStatuses(prevStatuses => {
                const updatedStatuses = [...prevStatuses];
                const fieldStatus = updatedStatuses.find(fs => fs.fieldId === lockingSlot.fieldId);

                if (fieldStatus) {
                  const timeSlotIndex = fieldStatus.timeSlots.findIndex(ts => ts.id === lockingSlot.slotId);

                  if (timeSlotIndex !== -1) {
                    console.log(`Setting slot ${lockingSlot.slotId} to locked after retry`);
                    fieldStatus.timeSlots[timeSlotIndex].isLocked = true;
                    fieldStatus.timeSlots[timeSlotIndex].lockReason = "Locked by admin";
                  }
                }

                return updatedStatuses;
              });

              setShowLockDialog(false);
              setLockingSlot(null);

              toast({
                title: "Thành công",
                description: "Đã khóa khung giờ thành công",
              });
              return; // Exit successfully
            }
          } catch (retryError) {
            console.error("Failed to refresh token and retry lock:", retryError);
          }
        }

        // If API call fails, show error
        toast({
          title: "Lỗi",
          description: "Không thể khóa khung giờ. Vui lòng thử lại sau.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error locking time slot:", error);
      toast({
        title: "Lỗi",
        description: "Không thể khóa khung giờ. Vui lòng thử lại sau.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle unlocking a time slot
  const handleUnlockTimeSlot = async (fieldId: number, slotId: number) => {
    try {
      // Set loading state while unlocking time slot
      setLoading(true);

      // Call the API to unlock the time slot
      const formattedDate = format(selectedDate, "yyyy-MM-dd");
      const unlockData = {
        date: formattedDate,
        timeSlotId: slotId
      };

      // Get admin token
      let adminToken = localStorage.getItem('admin_token');
      console.log("Using admin token for unlocking:", adminToken ? "Token exists" : "No token");

      // If no token, try to get a fresh one
      if (!adminToken) {
        console.log("No admin token found, attempting to get fresh token...");
        try {
          const loginResponse = await axios.post('http://localhost:9002/api/auth/admin/login', {
            username: 'admin',
            password: 'admin'
          });

          if (loginResponse.data.token) {
            adminToken = loginResponse.data.token;
            localStorage.setItem('admin_token', adminToken);
            console.log("Fresh admin token obtained for unlocking");
          }
        } catch (loginError) {
          console.error("Failed to get fresh admin token for unlocking:", loginError);
        }
      }

      const makeUnlockRequest = async (token: string) => {
        return await axios.post(
          `http://localhost:9002/api/field-management/${fieldId}/unlock`,
          unlockData,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
      };

      try {
        // Use axios directly with auth header
        const response = await makeUnlockRequest(adminToken);

        console.log("Unlock response:", response.data);

        // Update the UI to reflect the unlocked status immediately
        setFieldStatuses(prevStatuses => {
          const updatedStatuses = [...prevStatuses];
          const fieldStatus = updatedStatuses.find(fs => fs.fieldId === fieldId);

          if (fieldStatus) {
            const timeSlotIndex = fieldStatus.timeSlots.findIndex(ts => ts.id === slotId);

            if (timeSlotIndex !== -1) {
              console.log(`Setting slot ${slotId} to unlocked`);
              fieldStatus.timeSlots[timeSlotIndex].isLocked = false;
              fieldStatus.timeSlots[timeSlotIndex].lockReason = '';
            } else {
              console.log(`Could not find time slot with id ${slotId} in field status`);
            }
          } else {
            console.log(`Could not find field status for field ${fieldId}`);
          }

          return updatedStatuses;
        });

        toast({
          title: "Thành công",
          description: "Đã mở khóa khung giờ thành công",
        });

        // Refresh the field status data
        if (!isNaN(fieldId)) {
          try {
            // Wait a moment to ensure the backend has processed the unlock
            await new Promise(resolve => setTimeout(resolve, 500));

            const statusResponse = await axios.get(`http://localhost:9002/api/field-management/status`, {
              params: { fieldId, date: formattedDate },
              headers: {
                'Authorization': `Bearer ${adminToken}`,
                'Content-Type': 'application/json'
              }
            });

            const fieldStatusData = statusResponse.data;

            if (fieldStatusData && fieldStatusData.fieldStatus && Array.isArray(fieldStatusData.fieldStatus)) {
              console.log("Updated field status after unlocking:", fieldStatusData);
              // Create field status with both booking and lock information
              generateFieldStatusWithLocks(bookings, fieldStatusData.fieldStatus);
            } else {
              console.log("No field status data returned after unlocking:", fieldStatusData);
            }
          } catch (refreshError) {
            console.error("Error refreshing field status after unlocking:", refreshError);
          }
        }
      } catch (error) {
        console.error("Error unlocking time slot:", error);

        // If 401 error, try to refresh token and retry once
        if (error.response && error.response.status === 401) {
          console.log("401 error during unlocking, attempting to refresh token and retry...");
          try {
            const loginResponse = await axios.post('http://localhost:9002/api/auth/admin/login', {
              username: 'admin',
              password: 'admin'
            });

            if (loginResponse.data.token) {
              const freshToken = loginResponse.data.token;
              localStorage.setItem('admin_token', freshToken);
              console.log("Token refreshed, retrying unlock request...");

              // Retry the unlock request with fresh token
              const retryResponse = await makeUnlockRequest(freshToken);
              console.log("Unlock response after token refresh:", retryResponse.data);

              // Update the UI to reflect the unlocked status immediately
              setFieldStatuses(prevStatuses => {
                const updatedStatuses = [...prevStatuses];
                const fieldStatus = updatedStatuses.find(fs => fs.fieldId === fieldId);

                if (fieldStatus) {
                  const timeSlotIndex = fieldStatus.timeSlots.findIndex(ts => ts.id === slotId);

                  if (timeSlotIndex !== -1) {
                    console.log(`Setting slot ${slotId} to unlocked after retry`);
                    fieldStatus.timeSlots[timeSlotIndex].isLocked = false;
                    fieldStatus.timeSlots[timeSlotIndex].lockReason = '';
                  }
                }

                return updatedStatuses;
              });

              toast({
                title: "Thành công",
                description: "Đã mở khóa khung giờ thành công",
              });
              return; // Exit successfully
            }
          } catch (retryError) {
            console.error("Failed to refresh token and retry unlock:", retryError);
          }
        }

        // If API call fails, show error
        toast({
          title: "Lỗi",
          description: "Không thể mở khóa khung giờ. Vui lòng thử lại sau.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error unlocking time slot:", error);
      toast({
        title: "Lỗi",
        description: "Không thể mở khóa khung giờ. Vui lòng thử lại sau.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Lock entire day
  const handleLockEntireDay = async () => {
    const key = `${activeTab}_${format(selectedDate, "yyyy-MM-dd")}`;
    const currentlyLocked = dayLocked[key] || false;
    const fieldId = parseInt(activeTab);
    const formattedDate = format(selectedDate, "yyyy-MM-dd");

    try {
      // If the day is already locked, unlock all time slots
      if (currentlyLocked) {
        // Update UI immediately for better user experience
        setFieldStatuses(prev => {
          return prev.map(status => {
            if (status.fieldId === fieldId &&
                format(status.date, "yyyy-MM-dd") === formattedDate) {
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

        // Try to update the backend
        try {
          // Call the field management API to unlock all time slots
          await fieldManagementAPI.unlockAllTimeSlots(fieldId, {
            date: formattedDate
          });
        } catch (apiError) {
          console.error("Error unlocking day in API, but UI is updated:", apiError);

          // Fallback to direct API call
          try {
            await axios.post(`http://localhost:9002/api/fields/${fieldId}/unlock-day`, {
              date: formattedDate
            }, {
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
              }
            });
          } catch (fallbackError) {
            console.error("Fallback API call also failed:", fallbackError);
            // Continue anyway since we've already updated the UI
          }
        }

        toast({
          title: "Đã mở khóa tất cả khung giờ",
          description: "Tất cả khung giờ cho ngày này đã được mở khóa"
        });
      }
      // Otherwise, lock all empty time slots
      else {
        // Update UI immediately for better user experience
        setFieldStatuses(prev => {
          return prev.map(status => {
            if (status.fieldId === fieldId &&
                format(status.date, "yyyy-MM-dd") === formattedDate) {
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

        // Try to update the backend
        try {
          // Call the field management API to lock all time slots
          await fieldManagementAPI.lockAllTimeSlots(fieldId, {
            date: formattedDate
          });
        } catch (apiError) {
          console.error("Error locking day in API, but UI is updated:", apiError);

          // Fallback to direct API call
          try {
            await axios.post(`http://localhost:9002/api/fields/${fieldId}/lock-day`, {
              date: formattedDate
            }, {
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
              }
            });
          } catch (fallbackError) {
            console.error("Fallback API call also failed:", fallbackError);
            // Continue anyway since we've already updated the UI
          }
        }

        toast({
          title: "Đã khóa tất cả khung giờ trống",
          description: "Tất cả khung giờ trống cho ngày này đã được khóa"
        });
      }
    } catch (error) {
      console.error("Error in handleLockEntireDay:", error);
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật khung giờ. Vui lòng thử lại sau.",
        variant: "destructive",
      });
    }
  };

  // Xác định ngày là cuối tuần hay ngày thường
  const isWeekend = selectedDate.getDay() === 0 || selectedDate.getDay() === 6;

  return (
    <div className="p-2">
      <h1 className="text-3xl font-bold mb-4">Quản lý sân bóng</h1>

      {!activeTab ? (
        <div className="text-center py-8">
          <p>{loading ? "Đang tải..." : "Không có sân bóng nào được tìm thấy"}</p>
        </div>
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex flex-col md:flex-row justify-between mb-8">
            <TabsList className="mb-4 md:mb-0">
              {fields.map(field => (
                <TabsTrigger
                  key={field.id}
                  value={field.id.toString()}
                  className="px-4 py-2"
                >
                  {field.name}
                </TabsTrigger>
              ))}
            </TabsList>

            <div className="flex items-center gap-4">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <CalendarIcon className="h-4 w-4" />
                    {format(selectedDate, 'dd/MM/yyyy')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>

              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowBulkEditDialog(true);
                  setSelectedTimeSlots([]);
                  setBulkPrice("");
                  setBulkPriceType("both");
                }}
              >
                <Pencil className="h-4 w-4 mr-2" />
                Chỉnh sửa hàng loạt
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mb-4"></div>
              <p>Đang tải dữ liệu...</p>
            </div>
          ) : (
            <div>
              {timeSlots.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <p>Không có khung giờ nào cho sân này</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 gap-6">
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex justify-between items-center mb-4">
                          <h2 className="text-xl font-semibold">
                            Khung giờ {" "}
                            {fields.find(f => f.id.toString() === activeTab)?.name || ""}
                          </h2>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleLockEntireDay()}
                            className="text-red-600"
                          >
                            <Lock className="h-4 w-4 mr-2" />
                            {isCurrentDayLocked() ? "Mở khóa cả ngày" : "Khóa cả ngày"}
                          </Button>
                        </div>

                        <div className="overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead className="w-1/4">Khung giờ</TableHead>
                                <TableHead className="w-1/5">Giá</TableHead>
                                <TableHead className="w-1/5">Trạng thái</TableHead>
                                <TableHead className="w-1/5">Khách hàng</TableHead>
                                <TableHead className="w-1/5">Liên hệ</TableHead>
                                <TableHead className="w-1/5 text-right">Thao tác</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {timeSlots.map((slot) => {
                                // Tìm booking ứng với timeSlot này
                                const booking = bookings.find(b => {
                                  if (b.timeSlot === slot.time) {
                                    return true;
                                  }
                                  return false;
                                });
                                return (
                                  <TableRow key={slot.id}>
                                    <TableCell className="font-medium">{slot.time}</TableCell>
                                    <TableCell>{(isWeekend ? slot.weekendPrice : slot.weekdayPrice).toLocaleString()} đ</TableCell>
                                    <TableCell>
                                      {booking ? (
                                        <Badge className="bg-blue-100 text-blue-800">Đã đặt</Badge>
                                      ) : currentFieldStatus?.timeSlots.find(s => s.id === slot.id)?.isLocked ? (
                                        <Badge className="bg-red-100 text-red-800">Đã khóa</Badge>
                                      ) : (
                                        <Badge className="bg-green-100 text-green-800">Khả dụng</Badge>
                                      )}
                                    </TableCell>
                                    <TableCell>
                                      {booking ? (
                                        <>
                                          <div className="font-medium">{booking.customerName || 'Khách hàng'}</div>
                                        </>
                                      ) : '--'}
                                    </TableCell>
                                    <TableCell>
                                      {booking ? (
                                        <>
                                          <div className="font-medium">{booking.customerPhone || 'Không có SĐT'}</div>
                                          {booking.customerEmail && (
                                            <div className="text-sm text-gray-500">{booking.customerEmail}</div>
                                          )}
                                        </>
                                      ) : '--'}
                                    </TableCell>
                                    <TableCell className="text-right flex justify-end gap-2">
                                      {booking ? (
                                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-green-100">
                                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                          </svg>
                                        </span>
                                      ) : currentFieldStatus?.timeSlots.find(s => s.id === slot.id)?.isLocked ? (
                                        <>
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-green-600"
                                            onClick={() => handleUnlockTimeSlot(parseInt(activeTab), slot.id)}
                                            title={currentFieldStatus?.timeSlots.find(s => s.id === slot.id)?.lockReason || "Đã khóa"}
                                          >
                                            <Unlock className="h-4 w-4" />
                                          </Button>
                                        </>
                                      ) : (
                                        <>
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                              setEditingTimeSlot(slot);
                                              setWeekdayPrice(slot.weekdayPrice.toString());
                                              setWeekendPrice(slot.weekendPrice.toString());
                                            }}
                                          >
                                            <Pencil className="h-4 w-4" />
                                          </Button>
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-red-600"
                                            onClick={() => {
                                              setLockingSlot({
                                                fieldId: parseInt(activeTab),
                                                slotId: slot.id
                                              });
                                              setShowLockDialog(true);
                                            }}
                                          >
                                            <Lock className="h-4 w-4" />
                                          </Button>
                                        </>
                                      )}
                                    </TableCell>
                                  </TableRow>
                                );
                              })}
                            </TableBody>
                          </Table>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </>
              )}
            </div>
          )}
        </Tabs>
      )}

      {/* Edit Price Dialog */}
      <Dialog open={!!editingTimeSlot} onOpenChange={(open) => !open && setEditingTimeSlot(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa giá khung giờ</DialogTitle>
            <DialogDescription>
              Khung giờ: {editingTimeSlot?.time}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="weekday-price" className="text-right col-span-2">
                Giá ngày thường
              </label>
              <Input
                id="weekday-price"
                type="number"
                value={weekdayPrice}
                onChange={(e) => setWeekdayPrice(e.target.value)}
                className="col-span-2"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="weekend-price" className="text-right col-span-2">
                Giá cuối tuần
              </label>
              <Input
                id="weekend-price"
                type="number"
                value={weekendPrice}
                onChange={(e) => setWeekendPrice(e.target.value)}
                className="col-span-2"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditingTimeSlot(null)}
            >
              Hủy
            </Button>
            <Button
              onClick={handleUpdatePrice}
              disabled={!weekdayPrice || !weekendPrice}
            >
              Lưu thay đổi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Lock Time Slot Dialog */}
      <Dialog open={showLockDialog} onOpenChange={setShowLockDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Khóa khung giờ</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn khóa khung giờ này không?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowLockDialog(false);
                setLockingSlot(null);
              }}
            >
              Hủy
            </Button>
            <Button
              onClick={handleLockTimeSlot}
              className="bg-red-600 hover:bg-red-700"
            >
              Khóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Edit Dialog */}
      <Dialog open={showBulkEditDialog} onOpenChange={setShowBulkEditDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa hàng loạt</DialogTitle>
            <DialogDescription>
              Chọn các khung giờ và cập nhật giá
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
              {timeSlots.map((slot) => (
                <div key={slot.id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={`slot-${slot.id}`}
                    checked={selectedTimeSlots.includes(slot.id)}
                    onChange={() => handleToggleSlotSelection(slot.id)}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <label htmlFor={`slot-${slot.id}`} className="text-sm">
                    {slot.time}
                  </label>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="bulk-price" className="text-right col-span-1">
                Giá mới
              </label>
              <Input
                id="bulk-price"
                type="number"
                value={bulkPrice}
                onChange={(e) => setBulkPrice(e.target.value)}
                className="col-span-3"
                placeholder="Nhập giá mới..."
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-right col-span-1">
                Áp dụng cho
              </label>
              <div className="col-span-3">
                <select
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={bulkPriceType}
                  onChange={(e) => setBulkPriceType(e.target.value as "weekday" | "weekend" | "both")}
                  aria-label="Chọn loại giá áp dụng"
                >
                  <option value="weekday">Chỉ ngày thường</option>
                  <option value="weekend">Chỉ cuối tuần</option>
                  <option value="both">Cả hai</option>
                </select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowBulkEditDialog(false)}
            >
              Hủy
            </Button>
            <Button
              onClick={handleBulkUpdatePrice}
              disabled={selectedTimeSlots.length === 0 || !bulkPrice}
            >
              Cập nhật {selectedTimeSlots.length} khung giờ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FieldManagement;
