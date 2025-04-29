
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
import { Calendar, Users, MapPin, Clock, Phone, Loader2 } from "lucide-react";
import axios from "axios";

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
}

const FindOpponents = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [teamName, setTeamName] = useState("");
  const [level, setLevel] = useState("Trung bình");
  const [location, setLocation] = useState("");
  const [members, setMembers] = useState("5");
  const [dateTime, setDateTime] = useState("");
  const [contact, setContact] = useState("");
  const [description, setDescription] = useState("");
  const [filter, setFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);

  const { toast } = useToast();

  // Fetch opponents from API
  useEffect(() => {
    const fetchOpponents = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/opponents/available');

        if (response.data && response.data.opponents) {
          // Transform API data to match our Team interface
          const fetchedTeams = response.data.opponents.map((opponent: Opponent) => {
            const booking = opponent.booking;
            const field = booking?.field;
            const timeSlot = booking?.time_slot;

            // Determine level based on field size
            let level = "Trung bình";
            if (field?.size === "5-a-side") {
              level = "Thấp";
            } else if (field?.size === "11-a-side") {
              level = "Cao";
            }

            // Format time from timeSlot
            const timeString = timeSlot ?
              `${timeSlot.start_time.substring(0, 5)} - ${timeSlot.end_time.substring(0, 5)}` :
              "";

            return {
              id: opponent.id,
              name: opponent.teamName,
              level,
              location: field?.location || "",
              members: field?.size === "5-a-side" ? 5 : field?.size === "7-a-side" ? 7 : 11,
              date: booking?.bookingDate ? parseISO(booking.bookingDate) : new Date(),
              time: timeString,
              contact: opponent.contactPhone,
              description: opponent.description || "",
              fieldId: field?.id,
              fieldName: field?.name,
              bookingId: booking?.id
            };
          });

          setTeams(fetchedTeams);
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
    try {
      // In a real implementation, you would create a booking first
      // and then create an opponent request with the booking ID
      // For now, we'll just simulate the API call

      // First, create a booking
      const bookingResponse = await axios.post('http://localhost:9002/api/bookings', {
        field_id: 1, // Using field 1 as default
        time_slot_id: 1, // Using time slot 1 as default
        booking_date: new Date().toISOString().split('T')[0],
        customer_name: teamName,
        customer_phone: contact,
        customer_email: "",
        notes: description,
        payment_method: "cash"
      });

      const bookingId = bookingResponse.data.id;

      // Then create an opponent with the booking ID
      const response = await axios.post('http://localhost:9002/api/opponents', {
        bookingId,
        teamName,
        contactPhone: contact,
        contactEmail: "",
        description
      });

      if (response.data) {
        // Add the new team to the list
        const newOpponent = response.data;

        const newTeam: Team = {
          id: newOpponent.id,
          name: teamName,
          level,
          location,
          members: parseInt(members),
          date: new Date(),
          time: dateTime,
          contact,
          description,
          bookingId: newOpponent.bookingId
        };

        setTeams([newTeam, ...teams]);

        toast({
          title: "Đăng tin thành công!",
          description: "Thông tin của bạn đã được đăng lên hệ thống.",
        });

        // Reset form
        setTeamName("");
        setLevel("Trung bình");
        setLocation("");
        setMembers("5");
        setDateTime("");
        setContact("");
        setDescription("");
        setDialogOpen(false);
      }
    } catch (error) {
      console.error("Error posting opponent:", error);
      toast({
        title: "Lỗi",
        description: "Không thể đăng tin tìm đối. Vui lòng thử lại sau.",
        variant: "destructive"
      });
    }
  };

  const filteredTeams = filter === "all"
    ? teams
    : teams.filter(team => team.level.toLowerCase() === filter);

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

              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full bg-field-600 hover:bg-field-700 text-white mb-4">
                    <Users className="w-4 h-4 mr-2" /> Đăng tin mới
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Đăng tin tìm đối</DialogTitle>
                    <DialogDescription>
                      Nhập thông tin đội bóng của bạn để tìm đối thủ phù hợp
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4 py-4">
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="text-sm font-medium">Tên đội bóng</label>
                        <Input
                          placeholder="Nhập tên đội bóng"
                          value={teamName}
                          onChange={(e) => setTeamName(e.target.value)}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium">Trình độ</label>
                          <select
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-field-500"
                            value={level}
                            onChange={(e) => setLevel(e.target.value)}
                          >
                            <option>Thấp</option>
                            <option>Trung bình</option>
                            <option>Cao</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-sm font-medium">Số người/đội</label>
                          <select
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-field-500"
                            value={members}
                            onChange={(e) => setMembers(e.target.value)}
                          >
                            <option>5</option>
                            <option>7</option>
                            <option>11</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium">Địa điểm</label>
                        <Input
                          placeholder="Nhập địa điểm"
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium">Thời gian</label>
                        <Input
                          placeholder="VD: 18:00 - 19:30"
                          value={dateTime}
                          onChange={(e) => setDateTime(e.target.value)}
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium">Liên hệ</label>
                        <Input
                          placeholder="Số điện thoại"
                          value={contact}
                          onChange={(e) => setContact(e.target.value)}
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium">Mô tả thêm</label>
                        <Textarea
                          placeholder="Mô tả thêm về đội bóng và yêu cầu"
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  <DialogFooter>
                    <Button className="bg-field-600 hover:bg-field-700 text-white" onClick={handlePostTeam}>
                      Đăng tin
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
                    className={`cursor-pointer ${filter === "thấp" ? "bg-field-700" : "bg-gray-200 hover:bg-gray-300 text-gray-800"}`}
                    onClick={() => setFilter("thấp")}
                  >
                    Thấp
                  </Badge>
                  <Badge
                    className={`cursor-pointer ${filter === "trung bình" ? "bg-field-700" : "bg-gray-200 hover:bg-gray-300 text-gray-800"}`}
                    onClick={() => setFilter("trung bình")}
                  >
                    Trung bình
                  </Badge>
                  <Badge
                    className={`cursor-pointer ${filter === "cao" ? "bg-field-700" : "bg-gray-200 hover:bg-gray-300 text-gray-800"}`}
                    onClick={() => setFilter("cao")}
                  >
                    Cao
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
              {filteredTeams.map((team) => (
                <Card key={team.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">{team.name}</h3>
                        <div className="flex items-center text-gray-600 mt-1">
                          <MapPin className="w-4 h-4 mr-1" />
                          <span className="text-sm">{team.location}</span>
                        </div>
                      </div>
                      <Badge className={
                        team.level === "Cao" ? "bg-red-500" :
                        team.level === "Trung bình" ? "bg-yellow-500" :
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
                      <Button variant="outline" className="border-field-500 text-field-700 hover:bg-field-50">
                        Liên hệ
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FindOpponents;
