
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";

interface Feedback {
  id: number;
  name: string;
  email: string;
  date: string;
  content: string;
  status: "new" | "read" | "responded";
}

const initialFeedbacks: Feedback[] = [
  {
    id: 1,
    name: "Nguyễn Văn A",
    email: "nguyenvana@example.com",
    date: "2023-08-10",
    content: "Tôi rất hài lòng với chất lượng sân bóng và dịch vụ tại đây. Đội ngũ nhân viên rất nhiệt tình và thân thiện. Sẽ tiếp tục sử dụng dịch vụ và giới thiệu cho bạn bè.",
    status: "new"
  },
  {
    id: 2,
    name: "Trần Thị B",
    email: "tranthib@example.com",
    date: "2023-08-05",
    content: "Phòng thay đồ hơi bẩn, mong cải thiện vấn đề này. Ngoài ra sân bóng rất tốt, đèn chiếu sáng rõ.",
    status: "read"
  },
  {
    id: 3,
    name: "Lê Văn C",
    email: "levanc@example.com",
    date: "2023-07-28",
    content: "Giá thuê sân hơi cao so với các sân bóng khác trong khu vực. Mong có chương trình khuyến mãi cho khách hàng thường xuyên.",
    status: "responded"
  },
  {
    id: 4,
    name: "Phạm Thị D",
    email: "phamthid@example.com",
    date: "2023-07-20",
    content: "Dịch vụ đồ ăn tại sân rất ngon, đặc biệt là nước chanh. Tuy nhiên wifi hơi yếu, mong cải thiện.",
    status: "new"
  },
  {
    id: 5,
    name: "Hoàng Văn E",
    email: "hoangvane@example.com",
    date: "2023-07-15",
    content: "Sân bóng rất tốt, tuy nhiên có một số vị trí cỏ nhân tạo đã bị mòn. Hy vọng sẽ được thay mới sớm.",
    status: "read"
  },
];

const Feedback = () => {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>(initialFeedbacks);
  const [filter, setFilter] = useState<"all" | "new" | "read" | "responded">("all");
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
  const [responseMessage, setResponseMessage] = useState("");
  
  const { toast } = useToast();
  
  const filteredFeedbacks = filter === "all" 
    ? feedbacks 
    : feedbacks.filter(feedback => feedback.status === filter);
  
  const markAsRead = (id: number) => {
    setFeedbacks(feedbacks.map(feedback => 
      feedback.id === id ? { ...feedback, status: "read" as const } : feedback
    ));
    
    toast({
      title: "Đã đánh dấu là đã đọc",
    });
  };
  
  const handleSendResponse = () => {
    if (!selectedFeedback || !responseMessage.trim()) return;
    
    setFeedbacks(feedbacks.map(feedback => 
      feedback.id === selectedFeedback.id ? { ...feedback, status: "responded" as const } : feedback
    ));
    
    toast({
      title: "Đã gửi phản hồi",
      description: `Phản hồi đã được gửi đến ${selectedFeedback.email}`,
    });
    
    setSelectedFeedback(null);
    setResponseMessage("");
  };
  
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Phản hồi khách hàng</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel - Feedback List */}
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Danh sách phản hồi</h2>
                
                <div className="flex gap-2">
                  <Button 
                    variant={filter === "all" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilter("all")}
                  >
                    Tất cả
                  </Button>
                  <Button 
                    variant={filter === "new" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilter("new")}
                    className={filter === "new" ? "" : "text-blue-600"}
                  >
                    Mới
                  </Button>
                  <Button 
                    variant={filter === "read" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilter("read")}
                  >
                    Đã đọc
                  </Button>
                  <Button 
                    variant={filter === "responded" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilter("responded")}
                  >
                    Đã trả lời
                  </Button>
                </div>
              </div>
              
              {/* Feedback Items */}
              <div className="space-y-4">
                {filteredFeedbacks.length > 0 ? (
                  filteredFeedbacks.map((feedback) => (
                    <Card 
                      key={feedback.id} 
                      className={`hover:shadow-md transition-shadow ${
                        selectedFeedback?.id === feedback.id ? "border-field-500" : ""
                      }`}
                    >
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-medium">{feedback.name}</h3>
                            <p className="text-sm text-gray-500">{feedback.email}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500">{feedback.date}</span>
                            <Badge className={`
                              ${feedback.status === "new" ? "bg-blue-100 text-blue-800" : ""}
                              ${feedback.status === "read" ? "bg-gray-100 text-gray-800" : ""}
                              ${feedback.status === "responded" ? "bg-green-100 text-green-800" : ""}
                            `}>
                              {feedback.status === "new" && "Mới"}
                              {feedback.status === "read" && "Đã đọc"}
                              {feedback.status === "responded" && "Đã trả lời"}
                            </Badge>
                          </div>
                        </div>
                        
                        <p className="text-sm my-3">{feedback.content}</p>
                        
                        <div className="flex justify-end gap-2 mt-2">
                          {feedback.status === "new" && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => markAsRead(feedback.id)}
                            >
                              Đánh dấu đã đọc
                            </Button>
                          )}
                          {feedback.status !== "responded" && (
                            <Button 
                              className="bg-field-600 hover:bg-field-700 text-white"
                              size="sm"
                              onClick={() => setSelectedFeedback(feedback)}
                            >
                              Phản hồi
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <p className="text-gray-500">Không có phản hồi nào</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Right Panel - Response Form */}
        <div>
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-4">Trả lời phản hồi</h2>
              
              {selectedFeedback ? (
                <div className="space-y-4">
                  <div className="bg-gray-50 p-3 rounded-md">
                    <h3 className="font-medium text-sm">Phản hồi của khách hàng:</h3>
                    <p className="text-sm mt-1">{selectedFeedback.content}</p>
                    <div className="mt-2 text-xs text-gray-500">
                      {selectedFeedback.name} ({selectedFeedback.email})
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium block mb-1">Nội dung phản hồi:</label>
                    <textarea
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-field-500"
                      rows={6}
                      value={responseMessage}
                      onChange={(e) => setResponseMessage(e.target.value)}
                      placeholder="Nhập nội dung phản hồi..."
                    ></textarea>
                  </div>
                  
                  <div className="flex justify-end gap-2">
                    <Button 
                      variant="outline"
                      onClick={() => {
                        setSelectedFeedback(null);
                        setResponseMessage("");
                      }}
                    >
                      Hủy
                    </Button>
                    <Button 
                      className="bg-field-600 hover:bg-field-700 text-white"
                      onClick={handleSendResponse}
                      disabled={!responseMessage.trim()}
                    >
                      Gửi phản hồi
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <p className="text-gray-500">Chọn một phản hồi để trả lời</p>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card className="mt-6">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-4">Thống kê phản hồi</h2>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">Tổng số phản hồi:</span>
                  <span className="font-medium">{feedbacks.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Phản hồi mới:</span>
                  <span className="font-medium text-blue-600">
                    {feedbacks.filter(f => f.status === "new").length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Đã đọc:</span>
                  <span className="font-medium">
                    {feedbacks.filter(f => f.status === "read").length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Đã trả lời:</span>
                  <span className="font-medium text-green-600">
                    {feedbacks.filter(f => f.status === "responded").length}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Feedback;
