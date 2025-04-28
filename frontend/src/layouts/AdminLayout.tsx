import { Outlet, NavLink } from "react-router-dom";
import { BarChart, Calendar, ShoppingCart, FileText, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/admin/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

const AdminLayout = () => {
  const { isAuthenticated, logout } = useAuth();
  const { toast } = useToast();

  const handleLogout = () => {
    logout();
    toast({
      title: "Đăng xuất thành công",
      description: "Bạn đã đăng xuất khỏi trang quản trị",
    });
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen flex bg-gray-100">
        {/* Sidebar */}
        <aside className="w-64 bg-field-800 text-white fixed h-full overflow-y-auto z-10">
          <div className="p-6">
            <h3 className="text-2xl font-semibold">Admin panel</h3>
            <h2 className="text-1xl text-black font-semibold">Xuân Duy</h2>
          </div>
          <nav className="mt-6">
            <ul className="space-y-1 px-4">
              <li>
                <NavLink
                  to="/admin"
                  end
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 px-4 py-3 text-sm rounded-md transition-colors",
                      isActive
                        ? "bg-field-700 text-white"
                        : "text-field-100 hover:bg-field-700"
                    )
                  }
                >
                  <BarChart className="w-5 h-5" />
                  <span>Thống kê</span>
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/admin/quan-ly-san"
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 px-4 py-3 text-sm rounded-md transition-colors",
                      isActive
                        ? "bg-field-700 text-white"
                        : "text-field-100 hover:bg-field-700"
                    )
                  }
                >
                  <Calendar className="w-5 h-5" />
                  <span>Quản lý sân bóng</span>
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/admin/quan-ly-san-pham"
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 px-4 py-3 text-sm rounded-md transition-colors",
                      isActive
                        ? "bg-field-700 text-white"
                        : "text-field-100 hover:bg-field-700"
                    )
                  }
                >
                  <ShoppingCart className="w-5 h-5" />
                  <span>Quản lý sản phẩm</span>
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/admin/phan-hoi"
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 px-4 py-3 text-sm rounded-md transition-colors",
                      isActive
                        ? "bg-field-700 text-white"
                        : "text-field-100 hover:bg-field-700"
                    )
                  }
                >
                  <FileText className="w-5 h-5" />
                  <span>Phản hồi khách hàng</span>
                </NavLink>
              </li>
            </ul>
          </nav>
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col ml-64">
          <header className="bg-white shadow-sm sticky top-0 z-10">
            <div className="px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold"></h2>
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium">Admin</span>
                {isAuthenticated && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleLogout}
                    className="text-gray-500 hover:text-red-500 flex items-center gap-1"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Đăng xuất</span>
                  </Button>
                )}
              </div>
            </div>
          </header>

          <main className="flex-1 p-6 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default AdminLayout;
