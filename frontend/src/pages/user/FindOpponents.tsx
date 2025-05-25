import { useState, useEffect } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { format, addDays, parseISO } from "date-fns";
import { useToast } from "@/components/ui/use-toast";
import { Calendar, Users, MapPin, Clock, Phone, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import axios from "axios";
import { opponentAPI, fieldAPI, bookingAPI } from "@/lib/api";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from "@/components/ui/pagination";

interface Booking {
  id: number;
  fieldId: number;
  timeSlotId: number;
  bookingDate: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  field?: {
    id: number;
    name: string;
    location: string;
    size: string;
  };
  time_slot?: {
    id: number;
    start_time: string;
    end_time: string;
  };
}

interface Opponent {
  id: number;
  bookingId: number;
  teamName: string;
  contactEmail?: string;
  contactPhone: string;
  description?: string;
  status: 'searching' | 'matched' | 'cancelled';
  matchedWithId?: number;
  createdAt: string;
  updatedAt: string;
  booking?: Booking;
  expireDate?: string;
}

interface Team {
  id: number;
  name: string;
  level: string;
  location: string;
  members: number;
  date: Date;
  time: string;
  contact: string;
  description: string;
  fieldId?: number;
  fieldName?: string;
  bookingId?: number;
  expireDate?: string;
}

const FindOpponents = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [teamName, setTeamName] = useState("");
  const [level, setLevel] = useState("Trung Bình");
  const [fieldType, setFieldType] = useState("7"); // New field for field type
  const [timeSlotId, setTimeSlotId] = useState(""); // New field for time slot selection
  const [contact, setContact] = useState("");
  const [description, setDescription] = useState("");
  const [filter, setFilter] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [matchDate, setMatchDate] = useState<string>("");

  // New state for available time slots
  const [availableTimeSlots, setAvailableTimeSlots] = useState<any[]>([]);
  const [availableFields, setAvailableFields] = useState<any[]>([]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [teamsPerPage] = useState(4); // Increased from 3 to 4 to show more teams per page

  const { toast } = useToast();

  // Fetch available fields and time slots when date or field type changes
  useEffect(() => {
    const fetchFieldsAndTimeSlots = async () => {
      if (!matchDate || !fieldType) return;

      try {
        // Get available fields
        const fieldsResponse = await fieldAPI.getAllFields();
        const fieldsData = fieldsResponse.data?.fields || fieldsResponse.data || [];

        // Filter fields by type (size)
        const filteredFields = fieldsData.filter((field: any) => {
          const fieldSize = field.size || "";
          if (fieldType === "5") {
            return fieldSize.includes("5") || fieldSize.toLowerCase().includes("5v5") || fieldSize.toLowerCase().includes("5-a-side");
          } else if (fieldType === "7") {
            return fieldSize.includes("7") || fieldSize.toLowerCase().includes("7v7") || fieldSize.toLowerCase().includes("7-a-side");
          } else if (fieldType === "11") {
            return fieldSize.includes("11") || fieldSize.toLowerCase().includes("11v11") || fieldSize.toLowerCase().includes("11-a-side");
          }
          return false;
        });

        setAvailableFields(filteredFields);

        // Get time slots for the first available field of the selected type
        if (filteredFields.length > 0) {
          const selectedField = filteredFields[0];
          const fieldId = selectedField.fieldId || selectedField.id;

          const timeSlotsResponse = await axios.get(`http://localhost:9002/api/timeslots?field_id=${fieldId}&date=${matchDate}`);
          const timeSlotsData = timeSlotsResponse.data || [];

          // Filter only available time slots
          const availableSlots = timeSlotsData.filter((slot: any) => slot.available);
          setAvailableTimeSlots(availableSlots);

          // Reset time slot selection when date or field type changes
          setTimeSlotId("");
        } else {
          setAvailableTimeSlots([]);
          setTimeSlotId("");
        }
      } catch (error) {
        console.error("Error fetching fields and time slots:", error);
        setAvailableTimeSlots([]);
        setTimeSlotId("");
      }
    };

    fetchFieldsAndTimeSlots();
  }, [matchDate, fieldType]);

  // Fetch opponents from API
  useEffect(() => {
    const fetchOpponents = async () => {
      try {
        setLoading(true);
        console.log("Fetching opponents from API...");
        // Try using the API service first
        let response;
        try {
          response = await opponentAPI.getAllOpponents();
        } catch (error) {
          console.error("Error using opponentAPI service, falling back to direct axios:", error);
          response = await axios.get('http://localhost:9002/api/opponents');
        }
        console.log("Opponents API response:", response.data);

        let opponentsData = [];

        // Handle different API response formats
        if (response.data && response.data.opponents) {
          opponentsData = response.data.opponents;
        } else if (response.data && Array.isArray(response.data)) {
          opponentsData = response.data;
        } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
          opponentsData = response.data.data;
        } else if (response.data && response.data.success && response.data.opponents) {
          opponentsData = response.data.opponents;
        }

        // Nếu không có dữ liệu, tạo dữ liệu mẫu để hiển thị UI
        if (!opponentsData || opponentsData.length === 0) {
          console.log("No opponents data found, creating sample data for UI");
          opponentsData = [
            {
              id: 1,
              teamName: "FC Hà Nội",
              contactPhone: "0987654321",
              description: "Đội bóng đá nghiệp dư tìm đối thủ giao lưu vào cuối tuần",
              booking: {
                id: 1,
                bookingDate: new Date().toISOString(),
                field: {
                  id: 1,
                  name: "Sân Mỹ Đình",
                  location: "Hà Nội",
                  size: "7v7"
                },
                timeSlot: {
                  startTime: "18:00:00",
                  endTime: "19:30:00"
                }
              }
            }
          ];
        }

        if (opponentsData.length > 0) {
          console.log("Opponents data to process:", opponentsData);

          // Transform API data to match our Team interface
          const fetchedTeams = opponentsData.map((opponent: any) => {
            // Handle different property naming conventions
            const opponentId = opponent.id || opponent.opponentId;
            const teamName = opponent.teamName || opponent.team_name;
            const contactPhone = opponent.contactPhone || opponent.contact_phone;
            const contactEmail = opponent.contactEmail || opponent.contact_email;
            const description = opponent.description;

            // Handle different booking property names
            const booking = opponent.booking || opponent.Booking;
            const bookingId = booking?.id || booking?.bookingId || booking?.booking_id;
            const bookingDate = booking?.bookingDate || booking?.booking_date || booking?.date;

            // Handle different field property names
            const field = booking?.field || booking?.Field;
            const fieldId = field?.id || field?.fieldId;
            const fieldName = field?.name;
            const fieldSize = field?.size;
            const fieldLocation = field?.location;

            // Handle different time slot property names
            const timeSlot = booking?.time_slot || booking?.TimeSlot || booking?.timeSlot;
            const startTime = timeSlot?.start_time || timeSlot?.startTime;
            const endTime = timeSlot?.end_time || timeSlot?.endTime;

            // Determine level based on skill_level from opponent data or field size as fallback
            let level = "Trung Bình";
            const skillLevel = opponent.skill_level || opponent.skillLevel;
            if (skillLevel) {
              if (skillLevel === "beginner") {
                level = "Yếu";
              } else if (skillLevel === "advanced") {
                level = "Khá";
              } else {
                level = "Trung Bình";
              }
            } else {
              // Fallback to field size mapping
              if (fieldSize === "5-a-side" || fieldSize === "5v5" || fieldSize.includes("5")) {
                level = "Yếu";
              } else if (fieldSize === "11-a-side" || fieldSize === "11v11" || fieldSize.includes("11")) {
                level = "Khá";
              }
            }

            // Format time from timeSlot
            let timeString = "";
            if (startTime && endTime) {
              timeString = `${startTime.substring(0, 5)} - ${endTime.substring(0, 5)}`;
            }

            // Determine number of members based on player_count from opponent data or field size as fallback
            let members = 7; // Default to 7-a-side
            const playerCount = opponent.player_count || opponent.playerCount;
            if (playerCount) {
              members = playerCount;
            } else {
              // Fallback to field size mapping
              if (fieldSize === "5-a-side" || fieldSize === "5v5" || fieldSize.includes("5")) {
                members = 5;
              } else if (fieldSize === "11-a-side" || fieldSize === "11v11" || fieldSize.includes("11")) {
                members = 11;
              }
            }

            // Lấy trường expireDate
            const expireDate = opponent.expireDate || opponent.expire_date;

            return {
              id: opponentId,
              name: teamName,
              level,
              location: fieldLocation || "",
              members,
              date: bookingDate ? parseISO(bookingDate) : new Date(),
              time: timeString,
              contact: contactPhone,
              description: description || "",
              fieldId,
              fieldName,
              bookingId,
              expireDate: expireDate,
            };
          });

          console.log("Processed teams:", fetchedTeams);
          setTeams(fetchedTeams);
        } else {
          console.log("No opponents found");
          setTeams([]);
        }
      } catch (error) {
        console.error("Error fetching opponents:", error);
        toast({
          title: "Lỗi",
          description: "Không thể tải danh sách đội bóng. Vui lòng thử lại sau.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchOpponents();
  }, [toast]);

  const handlePostTeam = async () => {
    setIsSubmitting(true);

    try {
      // Validate form data
      if (!teamName || !contact || !timeSlotId || !matchDate || !fieldType) {
        toast({
          title: "Thiếu thông tin",
          description: "Vui lòng điền đầy đủ thông tin đội bóng, bao gồm ngày giao lưu và khung giờ",
          variant: "destructive"
        });
        setIsSubmitting(false);
        return;
      }

      // Validate that we have available fields and time slots
      if (availableFields.length === 0) {
        toast({
          title: "Không có sân phù hợp",
          description: `Không tìm thấy sân ${fieldType} người cho ngày đã chọn`,
          variant: "destructive"
        });
        setIsSubmitting(false);
        return;
      }

      if (availableTimeSlots.length === 0) {
        toast({
          title: "Không có khung giờ trống",
          description: "Không có khung giờ nào còn trống cho ngày và sân đã chọn",
          variant: "destructive"
        });
        setIsSubmitting(false);
        return;
      }

      // Get the selected field and time slot
      const selectedField = availableFields[0]; // Use first available field of the selected type
      const fieldId = selectedField.fieldId || selectedField.id;
      const selectedTimeSlot = availableTimeSlots.find(slot => slot.id == timeSlotId);

      if (!selectedTimeSlot) {
        toast({
          title: "Lỗi khung giờ",
          description: "Khung giờ đã chọn không còn khả dụng",
          variant: "destructive"
        });
        setIsSubmitting(false);
        return;
      }

      console.log("Creating booking with:", {
        fieldId,
        timeSlotId: parseInt(timeSlotId),
        matchDate,
        teamName,
        contact,
        selectedTimeSlot
      });

      // Create booking first
      const bookingData = {
        fieldId: fieldId,
        timeSlotId: parseInt(timeSlotId),
        bookingDate: matchDate,
        totalPrice: selectedTimeSlot.price || 200000,
        customerName: teamName,
        customerPhone: contact,
        customerEmail: "",
        notes: description,
      };

      let bookingResponse;
      try {
        bookingResponse = await bookingAPI.createBooking(bookingData);
      } catch (error: any) {
        console.error("Booking creation error:", error);

        let errorMessage = "Không thể tạo booking. Vui lòng thử lại.";
        if (error.response?.data?.errors) {
          errorMessage = error.response.data.errors.map((err: any) => err.msg).join(", ");
        } else if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        }

        toast({
          title: "Lỗi tạo booking",
          description: errorMessage,
          variant: "destructive"
        });
        setIsSubmitting(false);
        return;
      }
      console.log("Booking response:", bookingResponse.data);

      // Extract booking ID
      const bookingId = bookingResponse.data?.booking?.id ||
                       bookingResponse.data?.booking?.bookingId ||
                       bookingResponse.data?.id ||
                       bookingResponse.data?.bookingId;

      if (!bookingId) {
        console.error('Failed to get booking ID from response');
        toast({
          title: "Lỗi tạo booking",
          description: "Không thể tạo booking. Vui lòng thử lại.",
          variant: "destructive"
        });
        setIsSubmitting(false);
        return;
      }

      console.log(`Created booking with ID: ${bookingId}`);

      // Create opponent
      const opponentData = {
        bookingId: bookingId,
        teamName: teamName,
        contactPhone: contact,
        contactEmail: "",
        description: description,
        skillLevel: level === "Yếu" ? "beginner" : level === "Khá" ? "advanced" : "intermediate",
        playerCount: parseInt(fieldType)
      };

      const opponentResponse = await opponentAPI.createOpponent(opponentData);
      console.log("Opponent response:", opponentResponse.data);

      // Close dialog and show success message
      setIsDialogOpen(false);

      toast({
        title: "Đăng tin thành công!",
        description: "Thông tin của bạn đã được đăng lên hệ thống.",
      });

      // Reset form
      setTeamName("");
      setLevel("Trung Bình");
      setFieldType("7");
      setTimeSlotId("");
      setContact("");
      setDescription("");
      setMatchDate("");

      // Refresh the opponents list to show the new entry
      try {

        // Refresh opponent list
        const refreshResponse = await opponentAPI.getAllOpponents();
        const opponentsData = refreshResponse.data?.opponents || refreshResponse.data || [];

        if (opponentsData.length > 0) {
          // Process the new data to match our Team interface
          const fetchedTeams = opponentsData.map((opponent: any) => {
            // Similar to the fetchOpponents mapping logic
            const opponentId = opponent.id || opponent.opponentId;
            const teamName = opponent.teamName || opponent.team_name;
            const contactPhone = opponent.contactPhone || opponent.contact_phone;
            const description = opponent.description;

            const booking = opponent.booking || opponent.Booking;
            const field = booking?.field || booking?.Field;
            const timeSlot = booking?.time_slot || booking?.TimeSlot || booking?.timeSlot;

            let level = "Trung bình";
            const fieldSize = field?.size || "";
            if (fieldSize === "5-a-side" || fieldSize === "5v5") {
              level = "Thấp";
            } else if (fieldSize === "11-a-side" || fieldSize === "11v11") {
              level = "Cao";
            }

            let timeString = "";
            const startTime = timeSlot?.start_time || timeSlot?.startTime;
            const endTime = timeSlot?.end_time || timeSlot?.endTime;
            if (startTime && endTime) {
              timeString = `${startTime.substring(0, 5)} - ${endTime.substring(0, 5)}`;
            }

            let members = 7;
            if (fieldSize === "5-a-side" || fieldSize === "5v5") {
              members = 5;
            } else if (fieldSize === "11-a-side" || fieldSize === "11v11") {
              members = 11;
            }

            const bookingDate = booking?.bookingDate || booking?.booking_date || booking?.date;

            // Lấy trường expireDate
            const expireDate = opponent.expireDate || opponent.expire_date;

            return {
              id: opponentId,
              name: teamName,
              level,
              location: field?.location || "",
              members,
              date: bookingDate ? new Date(bookingDate) : new Date(),
              time: timeString,
              contact: contactPhone,
              description: description || "",
              fieldId: field?.id || field?.fieldId,
              fieldName: field?.name,
              bookingId: booking?.id || booking?.bookingId,
              expireDate: expireDate,
            };
          });

          // Update teams state with actual data from server
          setTeams(fetchedTeams);
        }
      } catch (error) {
        console.error("Error in API calls:", error);
        // The UI is already updated, so we don't need to show an error to the user
      }
    } catch (error) {
      console.error("Error posting opponent:", error);
      toast({
        title: "Lỗi",
        description: "Không thể đăng tin tìm đối. Vui lòng thử lại sau.",
        variant: "destructive"
      });
      setIsSubmitting(false);
    }
  };

  const handleCopyPhone = (phone: string) => {
    navigator.clipboard.writeText(phone);
    toast({
      title: "Đã sao chép số điện thoại!",
      description: phone,
      duration: 2000
    });
  };

  const filteredTeams = filter === "all"
    ? teams
    : teams.filter(team => team.level.toLowerCase() === filter);

  // Get current teams for pagination
  const indexOfLastTeam = currentPage * teamsPerPage;
  const indexOfFirstTeam = indexOfLastTeam - teamsPerPage;
  const currentTeams = filteredTeams.slice(indexOfFirstTeam, indexOfLastTeam);

  // Change page
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  // Calculate total pages
  const totalPages = Math.ceil(filteredTeams.length / teamsPerPage);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2 text-center">Giao Lưu Bóng Đá</h1>
      <p className="text-center text-gray-600 mb-8">Tìm đối thủ cho đội bóng của bạn</p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side - Post New Team */}
        <div>
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Đăng tin tìm đối</h2>

              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full bg-field-600 hover:bg-field-700 text-white mb-4">
                    <Users className="w-4 h-4 mr-2" /> Đăng tin mới
                  </Button>
                </DialogTrigger>
                <DialogContent className="w-full max-w-sm mx-auto max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Đăng tin tìm đối</DialogTitle>
                  </DialogHeader>

                  <div className="py-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <div>
                        <label className="text-sm font-medium">Tên Đội</label>
                        <Input
                          placeholder="Nhập tên đội bóng"
                          value={teamName}
                          onChange={(e) => setTeamName(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Trình độ</label>
                        <select
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-field-500"
                          value={level}
                          onChange={(e) => setLevel(e.target.value)}
                        >
                          <option value="Yếu">Yếu</option>
                          <option value="Trung Bình">Trung Bình</option>
                          <option value="Khá">Khá</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Sân</label>
                        <select
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-field-500"
                          value={fieldType}
                          onChange={(e) => setFieldType(e.target.value)}
                        >
                          <option value="5">5</option>
                          <option value="7">7</option>
                          <option value="11">11</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Ngày tháng</label>
                        <Input
                          type="date"
                          value={matchDate}
                          onChange={(e) => setMatchDate(e.target.value)}
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-sm font-medium">Khung giờ</label>
                        <select
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-field-500"
                          value={timeSlotId}
                          onChange={(e) => setTimeSlotId(e.target.value)}
                          disabled={!matchDate || !fieldType || availableTimeSlots.length === 0}
                        >
                          <option value="">
                            {!matchDate || !fieldType
                              ? "Vui lòng chọn ngày và loại sân trước"
                              : availableTimeSlots.length === 0
                                ? "Không có khung giờ trống"
                                : "Chọn khung giờ"}
                          </option>
                          {availableTimeSlots.map((slot) => (
                            <option key={slot.id} value={slot.id}>
                              {slot.start_time?.substring(0, 5)} - {slot.end_time?.substring(0, 5)}
                              ({new Intl.NumberFormat('vi-VN').format(slot.price)}đ)
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-sm font-medium">Liên hệ</label>
                        <Input
                          placeholder="Số điện thoại"
                          value={contact}
                          onChange={(e) => setContact(e.target.value)}
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-sm font-medium">Thông tin thêm</label>
                        <Textarea
                          placeholder="Mô tả thêm về đội bóng và yêu cầu"
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  <DialogFooter>
                    <Button
                      className="bg-field-600 hover:bg-field-700 text-white"
                      onClick={handlePostTeam}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Đang xử lý...
                        </>
                      ) : (
                        'Đăng tin'
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <div className="bg-field-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Hướng dẫn tìm đối</h3>
                <ul className="list-disc pl-5 space-y-2 text-sm">
                  <li>Đăng tin tìm đối với thông tin chính xác</li>
                  <li>Tìm đối thủ phù hợp với trình độ của đội bạn</li>
                  <li>Liên hệ trực tiếp với đội khác qua số điện thoại</li>
                  <li>Có thể sử dụng sân tại hệ thống Sân Bóng Xanh với giá ưu đãi</li>
                  <li>Nếu cần trọng tài, liên hệ với quản lý sân</li>
                </ul>
              </div>

              <div className="mt-6">
                <h3 className="font-semibold mb-2">Lọc theo trình độ</h3>
                <div className="flex flex-wrap gap-2">
                  <Badge
                    className={`cursor-pointer ${filter === "all" ? "bg-field-700" : "bg-gray-200 hover:bg-gray-300 text-gray-800"}`}
                    onClick={() => setFilter("all")}
                  >
                    Tất cả
                  </Badge>
                  <Badge
                    className={`cursor-pointer ${filter === "yếu" ? "bg-field-700" : "bg-gray-200 hover:bg-gray-300 text-gray-800"}`}
                    onClick={() => setFilter("yếu")}
                  >
                    Yếu
                  </Badge>
                  <Badge
                    className={`cursor-pointer ${filter === "trung bình" ? "bg-field-700" : "bg-gray-200 hover:bg-gray-300 text-gray-800"}`}
                    onClick={() => setFilter("trung bình")}
                  >
                    Trung Bình
                  </Badge>
                  <Badge
                    className={`cursor-pointer ${filter === "khá" ? "bg-field-700" : "bg-gray-200 hover:bg-gray-300 text-gray-800"}`}
                    onClick={() => setFilter("khá")}
                  >
                    Khá
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Side - Team List */}
        <div className="lg:col-span-2">
          <h2 className="text-xl font-semibold mb-4">Danh sách đội bóng đang tìm đối</h2>

          {loading ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
              <p>Đang tải danh sách đội bóng...</p>
            </div>
          ) : filteredTeams.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <p>Không có đội bóng nào phù hợp với tiêu chí lọc.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {currentTeams.map((team) => (
                <Card key={team.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">{team.name}</h3>
                        <div className="flex items-center text-gray-600 mt-1">
                          <MapPin className="w-4 h-4 mr-1" />
                          <span className="text-sm">{team.location}</span>
                        </div>
                        {team.expireDate && (
                          <div className="text-sm text-gray-500 mt-1">
                            Hạn hiệu lực: {format(new Date(team.expireDate), 'dd/MM/yyyy')}
                          </div>
                        )}
                      </div>
                      <Badge className={
                        team.level === "Khá" ? "bg-red-500" :
                        team.level === "Trung Bình" ? "bg-yellow-500" :
                        "bg-green-500"
                      }>
                        {team.level}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-3 my-4">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 text-field-700 mr-2" />
                        <span className="text-sm">{format(team.date, "dd/MM/yyyy")}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 text-field-700 mr-2" />
                        <span className="text-sm">{team.time}</span>
                      </div>
                      <div className="flex items-center">
                        <Users className="w-4 h-4 text-field-700 mr-2" />
                        <span className="text-sm">{team.members} người/đội</span>
                      </div>
                      <div className="flex items-center">
                        <Phone className="w-4 h-4 text-field-700 mr-2" />
                        <span className="text-sm">{team.contact}</span>
                      </div>
                    </div>

                    <p className="text-gray-600 text-sm border-t border-gray-100 pt-3">
                      {team.description}
                    </p>

                    <div className="mt-4 flex justify-end">
                      <Button
                        variant="outline"
                        className="border-field-500 text-field-700 hover:bg-field-50"
                        onClick={() => handleCopyPhone(team.contact)}
                      >
                        Liên hệ
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Pagination */}
              {filteredTeams.length > 0 && (
                <Pagination className="mt-6">
                  <PaginationContent>
                    <PaginationItem>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => currentPage > 1 && paginate(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                        <span className="sr-only">Previous</span>
                      </Button>
                    </PaginationItem>

                    {Array.from({ length: totalPages }, (_, i) => (
                      <PaginationItem key={i + 1}>
                        <Button
                          variant={currentPage === i + 1 ? "default" : "outline"}
                          size="sm"
                          onClick={() => paginate(i + 1)}
                          className={currentPage === i + 1 ? "bg-field-600 hover:bg-field-700" : ""}
                        >
                          {i + 1}
                        </Button>
                      </PaginationItem>
                    ))}

                    <PaginationItem>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => currentPage < totalPages && paginate(currentPage + 1)}
                        disabled={currentPage === totalPages}
                      >
                        <ChevronRight className="h-4 w-4" />
                        <span className="sr-only">Next</span>
                      </Button>
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FindOpponents;
