
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: Đường dẫn không tồn tại:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-8xl font-bold text-field-600 mb-4">404</h1>
        <p className="text-2xl text-gray-700 mb-8">Không tìm thấy trang</p>
        <p className="text-lg text-gray-600 mb-8">
          Trang bạn đang tìm không tồn tại hoặc đã được chuyển sang địa chỉ khác.
        </p>
        <Link to="/">
          <Button className="bg-field-600 hover:bg-field-700 text-white px-6 py-6 text-lg">
            Quay lại trang chủ
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
