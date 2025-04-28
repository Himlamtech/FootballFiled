
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, BarChart } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface Product {
  id: number;
  name: string;
  price: string | number;
  image_url?: string;
  image?: string; // Để tương thích với dữ liệu mẫu cũ
  category: string;
  type?: "rent" | "sale";
  description: string;
  stock_quantity?: number;
  inventory?: number; // Để tương thích với dữ liệu mẫu cũ
  is_available?: boolean;
  salesCount?: number; // Để tương thích với dữ liệu mẫu cũ
  created_at?: string;
  updated_at?: string;
}

// Đã xóa dữ liệu mẫu

const ProductManagement = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [activeTypeTab, setActiveTypeTab] = useState<"all" | "sale" | "rent">("all");
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showStats, setShowStats] = useState(false);
  const [loading, setLoading] = useState(true);

  // Form state
  const [productName, setProductName] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [productImage, setProductImage] = useState("");
  const [productCategory, setProductCategory] = useState("clothes");
  const [productType, setProductType] = useState<"rent" | "sale">("sale");
  const [productDescription, setProductDescription] = useState("");
  const [productInventory, setProductInventory] = useState("");

  const { toast } = useToast();

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/products');
        const data = await response.json();
        console.log("Products API response:", data);

        if (data.products) {
          // Map API data to our Product interface
          const mappedProducts = data.products.map((product: any) => ({
            id: product.id,
            name: product.name,
            price: product.price,
            image_url: product.image_url,
            category: product.category || "equipment",
            type: "sale", // Default to sale since API doesn't have this field
            description: product.description,
            stock_quantity: product.stock_quantity,
            inventory: product.stock_quantity, // For compatibility
            salesCount: 0, // Default value
            is_available: product.is_available
          }));

          setProducts(mappedProducts);
        } else {
          console.error("API returned no products");
          setProducts([]);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
        toast({
          title: "Lỗi",
          description: "Không thể tải danh sách sản phẩm",
          variant: "destructive",
        });
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Lọc sản phẩm theo danh mục và loại (bán/thuê)
  const filteredProducts = products.filter(product => {
    const categoryMatch = activeTab === "all" ? true : product.category === activeTab;
    const typeMatch = activeTypeTab === "all" ? true : product.type === activeTypeTab;
    return categoryMatch && typeMatch;
  });

  // Thống kê bán hàng theo danh mục
  const categorySales = products.reduce((acc, product) => {
    if (product.type === "sale") {
      if (!acc[product.category]) {
        acc[product.category] = {
          count: 0,
          revenue: 0,
          name: getCategoryName(product.category)
        };
      }
      // Sử dụng salesCount nếu có, nếu không thì mặc định là 0
      const salesCount = product.salesCount || 0;
      acc[product.category].count += salesCount;

      // Chuyển đổi price thành số nếu nó là chuỗi
      const price = typeof product.price === 'string' ? parseFloat(product.price) : product.price;
      acc[product.category].revenue += salesCount * (price || 0);
    }
    return acc;
  }, {} as Record<string, {count: number, revenue: number, name: string}>);

  // Thống kê cho thuê theo danh mục
  const categoryRentals = products.reduce((acc, product) => {
    if (product.type === "rent") {
      if (!acc[product.category]) {
        acc[product.category] = {
          count: 0,
          name: getCategoryName(product.category)
        };
      }
      // Giả định số lượt thuê
      const rentCount = Math.floor(Math.random() * 30);
      acc[product.category].count += rentCount;
    }
    return acc;
  }, {} as Record<string, {count: number, name: string}>);

  function getCategoryName(category: string) {
    switch (category) {
      case "clothes": return "Quần áo";
      case "shoes": return "Giày";
      case "equipment": return "Thiết bị";
      case "food": return "Đồ ăn & nước";
      default: return category;
    }
  }

  const handleAddProduct = () => {
    const newProduct: Product = {
      id: products.length + 1,
      name: productName,
      price: parseInt(productPrice) || 0,
      image: productImage || "https://placehold.co/300x300/E8F5E9/388E3C?text=S%E1%BA%A3n+ph%E1%BA%A9m+m%E1%BB%9Bi&font=roboto",
      category: productCategory,
      type: productType,
      description: productDescription,
      inventory: parseInt(productInventory) || 0,
      salesCount: 0
    };

    setProducts([...products, newProduct]);
    resetForm();
    setIsAddingProduct(false);

    toast({
      title: "Thêm sản phẩm thành công",
      description: `Sản phẩm "${productName}" đã được thêm vào.`,
    });
  };

  const handleUpdateProduct = () => {
    if (!editingProduct) return;

    const updatedProducts = products.map(p =>
      p.id === editingProduct.id
        ? {
            ...p,
            name: productName || p.name,
            price: parseInt(productPrice) || p.price,
            image: productImage || p.image,
            category: productCategory || p.category,
            type: productType || p.type,
            description: productDescription || p.description,
            inventory: parseInt(productInventory) || p.inventory,
          }
        : p
    );

    setProducts(updatedProducts);
    resetForm();
    setEditingProduct(null);

    toast({
      title: "Cập nhật sản phẩm thành công",
      description: `Sản phẩm "${productName}" đã được cập nhật.`,
    });
  };

  const handleDeleteProduct = (id: number) => {
    const productToDelete = products.find(p => p.id === id);
    if (!productToDelete) return;

    setProducts(products.filter(p => p.id !== id));

    toast({
      title: "Xóa sản phẩm thành công",
      description: `Sản phẩm "${productToDelete.name}" đã bị xóa.`,
    });
  };

  const handleEditClick = (product: Product) => {
    setEditingProduct(product);
    setProductName(product.name);
    setProductPrice(product.price.toString());
    setProductImage(product.image);
    setProductCategory(product.category);
    setProductType(product.type);
    setProductDescription(product.description);
    setProductInventory(product.inventory.toString());
  };

  const resetForm = () => {
    setProductName("");
    setProductPrice("");
    setProductImage("");
    setProductCategory("clothes");
    setProductType("sale");
    setProductDescription("");
    setProductInventory("");
  };

  const totalSales = Object.values(categorySales).reduce((sum, cat) => sum + cat.count, 0);
  const totalRentals = Object.values(categoryRentals).reduce((sum, cat) => sum + cat.count, 0);
  const totalRevenue = Object.values(categorySales).reduce((sum, cat) => sum + cat.revenue, 0);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Quản lý sản phẩm</h1>
        <Button
          variant="outline"
          size="sm"
          className="flex gap-2"
          onClick={() => setShowStats(!showStats)}
        >
          <BarChart className="h-4 w-4" />
          {showStats ? "Ẩn thống kê" : "Xem thống kê"}
        </Button>
      </div>

      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-lg">Đang tải dữ liệu...</span>
        </div>
      )}

      {/* Statistics Section */}
      {showStats && (
        <div className="mb-8">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-4">Thống kê bán hàng</h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="text-sm text-green-700 mb-1">Tổng doanh thu</h3>
                  <p className="text-2xl font-bold text-green-700">{totalRevenue.toLocaleString()}đ</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="text-sm text-blue-700 mb-1">Sản phẩm đã bán</h3>
                  <p className="text-2xl font-bold text-blue-700">{totalSales}</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h3 className="text-sm text-purple-700 mb-1">Lượt cho thuê</h3>
                  <p className="text-2xl font-bold text-purple-700">{totalRentals}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium mb-3">Thống kê bán hàng theo danh mục</h3>
                  <div className="space-y-3">
                    {Object.entries(categorySales).map(([key, data]) => (
                      <div key={key} className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${
                            key === "clothes" ? "bg-blue-500" :
                            key === "shoes" ? "bg-purple-500" :
                            key === "equipment" ? "bg-green-500" : "bg-yellow-500"
                          }`}></div>
                          <span>{data.name}</span>
                        </div>
                        <div className="flex gap-4">
                          <span className="text-sm text-gray-600">{data.count} sản phẩm</span>
                          <span className="font-medium">{data.revenue.toLocaleString()}đ</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium mb-3">Thống kê cho thuê theo danh mục</h3>
                  <div className="space-y-3">
                    {Object.entries(categoryRentals).map(([key, data]) => (
                      <div key={key} className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${
                            key === "clothes" ? "bg-blue-500" :
                            key === "shoes" ? "bg-purple-500" :
                            key === "equipment" ? "bg-green-500" : "bg-yellow-500"
                          }`}></div>
                          <span>{data.name}</span>
                        </div>
                        <span className="text-sm">{data.count} lượt thuê</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div className="space-y-4 w-full">
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="all">Tất cả</TabsTrigger>
              <TabsTrigger value="clothes">Quần áo</TabsTrigger>
              <TabsTrigger value="shoes">Giày</TabsTrigger>
              <TabsTrigger value="equipment">Thiết bị</TabsTrigger>
              <TabsTrigger value="food">Đồ ăn & nước</TabsTrigger>
            </TabsList>
          </Tabs>

          <Tabs defaultValue="all" value={activeTypeTab} onValueChange={(v) => setActiveTypeTab(v as "all" | "sale" | "rent")}>
            <TabsList>
              <TabsTrigger value="all">Tất cả</TabsTrigger>
              <TabsTrigger value="sale">Bán</TabsTrigger>
              <TabsTrigger value="rent">Cho thuê</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <Dialog open={isAddingProduct} onOpenChange={setIsAddingProduct}>
          <DialogTrigger asChild>
            <Button className="bg-field-600 hover:bg-field-700 whitespace-nowrap">
              Thêm sản phẩm mới
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Thêm sản phẩm mới</DialogTitle>
              <DialogDescription>
                Nhập thông tin chi tiết cho sản phẩm mới
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Tên sản phẩm</label>
                <Input
                  placeholder="Nhập tên sản phẩm"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Giá (VNĐ)</label>
                  <Input
                    type="number"
                    placeholder="Nhập giá sản phẩm"
                    value={productPrice}
                    onChange={(e) => setProductPrice(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Tồn kho</label>
                  <Input
                    type="number"
                    placeholder="Số lượng tồn kho"
                    value={productInventory}
                    onChange={(e) => setProductInventory(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Danh mục</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-field-500"
                    value={productCategory}
                    onChange={(e) => setProductCategory(e.target.value)}
                  >
                    <option value="clothes">Quần áo</option>
                    <option value="shoes">Giày</option>
                    <option value="equipment">Thiết bị</option>
                    <option value="food">Đồ ăn & nước</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Loại</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-field-500"
                    value={productType}
                    onChange={(e) => setProductType(e.target.value as "rent" | "sale")}
                  >
                    <option value="sale">Bán</option>
                    <option value="rent">Cho thuê</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Link hình ảnh</label>
                <Input
                  placeholder="Nhập link hình ảnh"
                  value={productImage}
                  onChange={(e) => setProductImage(e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Mô tả</label>
                <Textarea
                  placeholder="Mô tả sản phẩm"
                  rows={3}
                  value={productDescription}
                  onChange={(e) => setProductDescription(e.target.value)}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  resetForm();
                  setIsAddingProduct(false);
                }}
              >
                Hủy
              </Button>
              <Button
                className="bg-field-600 hover:bg-field-700"
                onClick={handleAddProduct}
                disabled={!productName || !productPrice}
              >
                Thêm sản phẩm
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={!!editingProduct} onOpenChange={(open) => !open && setEditingProduct(null)}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Chỉnh sửa sản phẩm</DialogTitle>
              <DialogDescription>
                Chỉnh sửa thông tin chi tiết cho sản phẩm
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Tên sản phẩm</label>
                <Input
                  placeholder="Nhập tên sản phẩm"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Giá (VNĐ)</label>
                  <Input
                    type="number"
                    placeholder="Nhập giá sản phẩm"
                    value={productPrice}
                    onChange={(e) => setProductPrice(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Tồn kho</label>
                  <Input
                    type="number"
                    placeholder="Số lượng tồn kho"
                    value={productInventory}
                    onChange={(e) => setProductInventory(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Danh mục</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-field-500"
                    value={productCategory}
                    onChange={(e) => setProductCategory(e.target.value)}
                  >
                    <option value="clothes">Quần áo</option>
                    <option value="shoes">Giày</option>
                    <option value="equipment">Thiết bị</option>
                    <option value="food">Đồ ăn & nước</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Loại</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-field-500"
                    value={productType}
                    onChange={(e) => setProductType(e.target.value as "rent" | "sale")}
                  >
                    <option value="sale">Bán</option>
                    <option value="rent">Cho thuê</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Link hình ảnh</label>
                <Input
                  placeholder="Nhập link hình ảnh"
                  value={productImage}
                  onChange={(e) => setProductImage(e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Mô tả</label>
                <Textarea
                  placeholder="Mô tả sản phẩm"
                  rows={3}
                  value={productDescription}
                  onChange={(e) => setProductDescription(e.target.value)}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  resetForm();
                  setEditingProduct(null);
                }}
              >
                Hủy
              </Button>
              <Button
                className="bg-field-600 hover:bg-field-700"
                onClick={handleUpdateProduct}
              >
                Cập nhật
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Product Table */}
      <Card>
        <CardContent className="p-0">
          <div className="rounded-md overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="text-left p-4">Sản phẩm</th>
                  <th className="text-left p-4">Danh mục</th>
                  <th className="text-left p-4">Loại</th>
                  <th className="text-left p-4">Giá</th>
                  <th className="text-left p-4">Tồn kho</th>
                  <th className="text-left p-4">Đã bán/Cho thuê</th>
                  <th className="text-right p-4">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="border-b last:border-b-0">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-12 h-12 rounded-md object-cover"
                        />
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-xs text-gray-500 line-clamp-1">{product.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge className={`
                        ${product.category === "clothes" ? "bg-blue-100 text-blue-800" : ""}
                        ${product.category === "shoes" ? "bg-purple-100 text-purple-800" : ""}
                        ${product.category === "equipment" ? "bg-green-100 text-green-800" : ""}
                        ${product.category === "food" ? "bg-yellow-100 text-yellow-800" : ""}
                      `}>
                        {product.category === "clothes" && "Quần áo"}
                        {product.category === "shoes" && "Giày"}
                        {product.category === "equipment" && "Thiết bị"}
                        {product.category === "food" && "Đồ ăn & nước"}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <Badge className={product.type === 'sale' ?
                        'bg-green-100 text-green-800' :
                        'bg-blue-100 text-blue-800'
                      }>
                        {product.type === 'sale' ? 'Bán' : 'Cho thuê'}
                      </Badge>
                    </td>
                    <td className="p-4">{product.price.toLocaleString()}đ</td>
                    <td className="p-4">
                      <Badge className={`
                        ${product.inventory > 10 ? "bg-green-100 text-green-800" :
                         product.inventory > 0 ? "bg-yellow-100 text-yellow-800" :
                         "bg-red-100 text-red-800"}
                      `}>
                        {product.inventory}
                      </Badge>
                    </td>
                    <td className="p-4">
                      {product.type === 'sale' ?
                        <span className="text-green-700">{product.salesCount} sản phẩm</span> :
                        <span className="text-blue-700">{Math.floor(Math.random() * 30)} lượt</span>
                      }
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => handleEditClick(product)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                          onClick={() => handleDeleteProduct(product.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}

                {filteredProducts.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-gray-500">
                      Không có sản phẩm nào trong danh mục này
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductManagement;
