import { Outlet, NavLink, Link } from "react-router-dom";
import { Home, Calendar, Users, Facebook, Instagram, Youtube, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { EnhancedLoginDialog } from "@/components/admin/EnhancedLoginDialog";

const UserLayout = () => {
  const [showLoginDialog, setShowLoginDialog] = useState(false);

  return (
    <div className="min-h-screen flex flex-col field-gradient">
      {/* Header - fixed to top */}
      <header className="bg-white shadow-sm z-50 sticky top-0">
        <div className="container mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 rounded-full bg-field-500 flex items-center justify-center">
                <span className="text-white font-bold text-xl">X</span>
              </div>
              <span className="text-field-700 font-bold text-xl hidden sm:inline-block">
                Sân Bóng Xanh
              </span>
            </Link>

            {/* Main Navigation */}
            <nav className="flex items-center space-x-2">
              <ul className="flex space-x-1 sm:space-x-2">
                <li>
                  <NavLink
                    to="/"
                    className={({ isActive }) =>
                      cn(
                        "nav-link flex items-center gap-1",
                        isActive ? "active" : ""
                      )
                    }
                    end
                  >
                    <Home className="w-4 h-4" />
                    <span className="hidden sm:inline-block">Trang chủ</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/booking"
                    className={({ isActive }) =>
                      cn(
                        "nav-link flex items-center gap-1",
                        isActive ? "active" : ""
                      )
                    }
                  >
                    <Calendar className="w-4 h-4" />
                    <span className="hidden sm:inline-block">Đặt sân</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/opponents"
                    className={({ isActive }) =>
                      cn(
                        "nav-link flex items-center gap-1",
                        isActive ? "active" : ""
                      )
                    }
                  >
                    <Users className="w-4 h-4" />
                    <span className="hidden sm:inline-block">Giao lưu</span>
                  </NavLink>
                </li>

              </ul>

              {/* Admin Button */}
              <Button
                variant="outline"
                size="sm"
                className="ml-2 border-field-500 text-field-700 hover:bg-field-50"
                onClick={() => setShowLoginDialog(true)}
              >
                <Lock className="w-4 h-4 mr-1" />
                <span>QTV</span>
              </Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Admin Login Dialog */}
      <EnhancedLoginDialog
        open={showLoginDialog}
        onOpenChange={setShowLoginDialog}
      />

      {/* Main Content */}
      <main className="flex-1">
        <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <Outlet />
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-field-800 text-white mt-auto">
        <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Sân Bóng Xanh</h3>
              <p className="mb-2">
                Địa chỉ: 96A Đ. Trần Phú, P. Mộ Lao, Hà Đông, Hà Nội
              </p>
              <p className="mb-2">Điện thoại: 0382 802 842</p>
              <p>Email: nguyenthutrangbg03@gmail.com</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Giờ hoạt động</h3>
              <p className="mb-2">Thứ 2 - Thứ 6: 6:00 - 24:00</p>
              <p>Thứ 7 - Chủ nhật: 5:00 - 24:00</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Kết nối</h3>
              <div className="flex space-x-4">
                <a href="https://www.facebook.com/cobehattieu.ntt/?locale=vi_VN" target="_blank" rel="noopener noreferrer" className="hover:text-field-300 transition-colors flex items-center">
                  <Facebook className="w-5 h-5 mr-1" /> Facebook
                </a>
                <a href="https://www.instagram.com/iamntt_03/" target="_blank" rel="noopener noreferrer" className="hover:text-field-300 transition-colors flex items-center">
                  <Instagram className="w-5 h-5 mr-1" /> Instagram
                </a>
                <a href="https://www.youtube.com/@ThuTrangNguyendaynee" target="_blank" rel="noopener noreferrer" className="hover:text-field-300 transition-colors flex items-center">
                  <Youtube className="w-5 h-5 mr-1" /> Youtube
                </a>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-field-700 text-center">
            <p>&copy; {new Date().getFullYear()} Sân Bóng Xanh. Tất cả quyền được bảo lưu.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default UserLayout;
