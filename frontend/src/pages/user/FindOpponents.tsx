
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
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { format, addDays } from "date-fns";
import { useToast } from "@/components/ui/use-toast";
import { Calendar, Users, MapPin, Clock, Phone } from "lucide-react";

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
}

const defaultTeams: Team[] = [
  {
    id: 1,
    name: "FC Thủ Đức",
    level: "Trung bình",
    location: "Quận Thủ Đức, TP.HCM",
    members: 7,
    date: addDays(new Date(), 1),
    time: "19:00 - 20:30",
    contact: "0901234567",
    description: "Tìm đối thủ trình độ trung bình, đá giao lưu vui vẻ"
  },
  {
    id: 2,
    name: "Bình Thạnh FC",
    level: "Cao",
    location: "Quận Bình Thạnh, TP.HCM",
    members: 5,
    date: addDays(new Date(), 2),
    time: "18:00 - 19:30",
    contact: "0907654321",
    description: "Đội bóng trình độ cao đang tìm đối thủ cùng trình độ, có thể đặt cược nhỏ."
  },
  {
    id: 3,
    name: "FC Quận 1",
    level: "Thấp",
    location: "Quận 1, TP.HCM",
    members: 7,
    date: addDays(new Date(), 3),
    time: "20:00 - 21:30",
    contact: "0903456789",
    description: "Đội bóng mới thành lập, tìm đối thủ để giao lưu và học hỏi."
  },
];

const FindOpponents = () => {
  const [teams, setTeams] = useState<Team[]>(defaultTeams);
  const [teamName, setTeamName] = useState("");
  const [level, setLevel] = useState("Trung bình");
  const [location, setLocation] = useState("");
  const [members, setMembers] = useState("5");
  const [dateTime, setDateTime] = useState("");
  const [contact, setContact] = useState("");
  const [description, setDescription] = useState("");
  const [filter, setFilter] = useState("all");
  
  const { toast } = useToast();
  
  const handlePostTeam = () => {
    const newTeam: Team = {
      id: teams.length + 1,
      name: teamName,
      level,
      location,
      members: parseInt(members),
      date: new Date(),
      time: dateTime,
      contact,
      description,
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
              
              <Dialog>
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
          
          {filteredTeams.length === 0 ? (
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
