import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Mail, Phone, Calendar, Users, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

const Home = () => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm({
    defaultValues: {
      fullName: "",
      email: "",
      message: "",
      rating: 5
    }
  });

  const onSubmit = async (data: any) => {
    try {
      // Gửi phản hồi lên API
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: data.fullName,
          email: data.email,
          content: data.message
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success("Cảm ơn bạn! Phản hồi đã được gửi thành công.");
        reset();
      } else {
        throw new Error(result.message || "Không thể gửi phản hồi");
      }
    } catch (error) {
      console.error("Error sending feedback:", error);
      toast.error("Rất tiếc! Đã xảy ra lỗi khi gửi phản hồi.");
    }
  };

  // Location coordinates and address - dùng mặc định, không fetch API
  const [location, setLocation] = useState({
    address: "96A Đ. Trần Phú, P. Mộ Lao, Hà Đông, Hà Nội",
    lat: 20.9732762,
    lng: 105.7875231,
  });

  // Create Google Maps embed URL
  const googleMapsEmbedUrl = `https://maps.google.com/maps?q=${location.lat},${location.lng}&z=16&output=embed`;

  const facilities = [
    {
      title: "Sân cỏ nhân tạo chất lượng cao",
      description: "Sân cỏ nhập khẩu, đảm bảo an toàn khi thi đấu",
      icon: "🏟️",
    },
    {
      title: "Hệ thống chiếu sáng hiện đại",
      description: "Đèn LED cao cấp, đảm bảo ánh sáng tối ưu cho các trận đấu buổi tối",
      icon: "💡",
    },
    {
      title: "Phòng thay đồ tiện nghi",
      description: "Phòng thay đồ rộng rãi, sạch sẽ với tủ có khóa an toàn",
      icon: "🚿",
    },
    {
      title: "Dịch vụ ăn uống",
      description: "Đồ ăn nhẹ, nước uống phục vụ trước và sau trận đấu",
      icon: "🥤",
    },
  ];

  const [fields, setFields] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch fields from API
  useEffect(() => {
    const fetchFields = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:9003/api/fields');
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
        } else if (data && data.success === true && Array.isArray(data.fields)) {
          // Success response with fields array
          fieldsData = data.fields;
        }

        if (fieldsData && fieldsData.length > 0) {
          const mappedFields = fieldsData.map((field: any) => ({
            id: field.fieldId || field.id,
            name: field.name,
            size: field.size || "Không xác định",
            img: field.imageUrl
              ? (field.imageUrl.startsWith('http') ? field.imageUrl : `http://localhost:9003${field.imageUrl}`)
              : field.image
                ? (field.image.startsWith('http') ? field.image : `http://localhost:9003${field.image}`)
                : `https://placehold.co/600x400?text=${encodeURIComponent(field.name || 'Football Field')}`,
            description: field.description || "Sân bóng đá"
          }));

          setFields(mappedFields);
        } else {
          console.error("API returned no fields");
          toast.error("Không thể tải danh sách sân bóng");
          setFields([]);
        }
      } catch (error) {
        console.error("Error fetching fields:", error);
        toast.error("Không thể tải danh sách sân bóng");
        setFields([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFields();
  }, []);

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="py-12 px-4 md:px-0 text-center">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-field-900">
            Sân Bóng Đá Chất Lượng Cao
          </h1>
          <p className="text-xl mb-8 text-gray-700">
            Đặt sân nhanh chóng, tiện lợi cùng nhiều dịch vụ đi kèm
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/booking">
              <Button className="bg-field-600 hover:bg-field-700 text-white px-6 py-6 text-lg">
                <Calendar className="w-5 h-5 mr-2" /> Đặt sân ngay
              </Button>
            </Link>
            <Link to="/opponents">
              <Button variant="outline" className="border-field-500 text-field-700 hover:bg-field-50 px-6 py-6 text-lg">
                <Users className="w-5 h-5 mr-2" /> Tìm đối thủ
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Fields Display */}
      <section className="py-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-field-800">Hệ Thống Sân Bóng</h2>
          <p className="text-gray-600 mt-2">
            Chúng tôi cung cấp 4 sân cỏ nhân tạo chất lượng cao
          </p>
        </div>

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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {fields.map((field) => (
              <Card key={field.id} className="overflow-hidden hover:shadow-xl transition-shadow">
                <img
                  src={field.img}
                  alt={field.name}
                  className="w-full h-48 object-cover"
                />
                <CardContent className="p-4 text-center">
                  <h3 className="font-bold text-xl mb-1">{field.name}</h3>
                  <p className="text-gray-600">Sân {field.size}</p>
                  <Link to="/booking">
                    <Button variant="outline" className="mt-4 w-full border-field-500 text-field-700 hover:bg-field-50">
                      Đặt sân này
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Facilities */}
      <section className="py-12 bg-field-50 rounded-lg w-full max-w-[98%] mx-auto px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-field-800">Tiện Nghi & Dịch Vụ</h2>
          <p className="text-gray-600 mt-2">
            Chúng tôi cung cấp các tiện ích hiện đại cho người chơi
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {facilities.map((facility, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="text-4xl mb-4">{facility.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{facility.title}</h3>
              <p className="text-gray-600">{facility.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* About and Contact */}
      <section className="py-12 grid md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-3xl font-bold text-field-800 mb-6">
            Về Sân Bóng Xanh
          </h2>
          <p className="mb-4 text-gray-700">
            Sân Bóng Xanh là một trong những địa điểm chơi bóng đá chất lượng hàng đầu tại thành phố. Chúng tôi cung cấp sân cỏ nhân tạo chuẩn FIFA, với hệ thống chiếu sáng hiện đại và các tiện nghi đi kèm.
          </p>
          <p className="mb-6 text-gray-700">
            Được thành lập từ năm 2025, chúng tôi luôn cam kết mang đến không gian thi đấu tốt nhất, dịch vụ tuyệt vời với giá cả phải chăng cho người chơi bóng đá mọi lứa tuổi.
          </p>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-field-500 flex items-center justify-center">
              <span className="text-white font-bold text-xl">X</span>
            </div>
            <div>
              <h3 className="font-bold text-xl">Sân Bóng Xanh</h3>
              <p className="text-gray-600">Nơi đam mê hội tụ</p>
            </div>
          </div>

          {/* Google Map */}
          <div className="mt-8 h-80 border border-gray-300 rounded-lg overflow-hidden">
            <iframe
              src={googleMapsEmbedUrl}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen={false}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Sân Bóng Xanh location"
            />
          </div>
        </div>

        <div>
          <h2 className="text-3xl font-bold text-field-800 mb-6">
            Liên Hệ & Đặt Sân
          </h2>
          <div className="space-y-4">
            <div className="flex items-start">
              <MapPin className="w-5 h-5 text-field-600 mt-1 mr-3" />
              <div>
                <h3 className="font-semibold">Địa chỉ</h3>
                <p className="text-gray-700">
                  {location.address}
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <Phone className="w-5 h-5 text-field-600 mt-1 mr-3" />
              <div>
                <h3 className="font-semibold">Điện thoại</h3>
                <p className="text-gray-700">0382 802 842</p>
              </div>
            </div>

            <div className="flex items-start">
              <Mail className="w-5 h-5 text-field-600 mt-1 mr-3" />
              <div>
                <h3 className="font-semibold">Email</h3>
                <p className="text-gray-700">nguyenthutrangbg03@gmail.com</p>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="mt-6 bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-4">Gửi phản hồi</h3>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <input
                  type="text"
                  placeholder="Họ tên"
                  {...register("fullName", {
                    required: "Vui lòng nhập họ tên",
                    minLength: {
                      value: 2,
                      message: "Họ tên phải có ít nhất 2 ký tự"
                    }
                  })}
                  className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-field-500 ${
                    errors.fullName ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.fullName && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.fullName.message as string}
                  </p>
                )}
              </div>
              <div>
                <input
                  type="email"
                  placeholder="Email"
                  {...register("email", {
                    required: "Vui lòng nhập email",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Email không hợp lệ"
                    }
                  })}
                  className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-field-500 ${
                    errors.email ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.email.message as string}
                  </p>
                )}
              </div>
              <div>
                <textarea
                  placeholder="Nội dung"
                  rows={3}
                  {...register("message", {
                    required: "Vui lòng nhập nội dung",
                    minLength: {
                      value: 10,
                      message: "Nội dung phải có ít nhất 10 ký tự"
                    }
                  })}
                  className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-field-500 ${
                    errors.message ? "border-red-500" : "border-gray-300"
                  }`}
                ></textarea>
                {errors.message && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.message.message as string}
                  </p>
                )}
              </div>
              <Button
                type="submit"
                className="bg-field-600 hover:bg-field-700 text-white w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Đang gửi..." : "Gửi phản hồi"}
              </Button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
