import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import QRCodePayment from "@/components/payment/QRCodePayment";
import { validateBookingInfo } from "@/components/validation/BookingValidation";

interface Product {
  id: number;
  name: string;
  price: number;
  image?: string;
  image_url?: string;
  category: string;
  description: string;
  type: "rent" | "buy"; // Thêm loại sản phẩm: thuê hoặc mua
  stock_quantity?: number;
}

interface CartItem {
  product: Product;
  quantity: number;
}

const Services = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [activeType, setActiveType] = useState<"all" | "buy" | "rent">("all");
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    phone: "",
    email: ""
  });
  const [validationError, setValidationError] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const { toast } = useToast();

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/products');
        const data = await response.json();

        if (data && data.products) {
          console.log("Products data:", data.products);

          // Map API data to our Product interface
          const mappedProducts = data.products.map((product: any) => ({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image_url || `https://placehold.co/300x300/E8F5E9/388E3C?text=${encodeURIComponent(product.name)}`,
            category: product.category,
            description: product.description || "",
            type: product.type || "buy",
            stock_quantity: product.stock_quantity
          }));

          setProducts(mappedProducts);
        } else {
          console.error("API returned no products");
          setProducts([]);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
        toast({
          variant: "destructive",
          title: "Lỗi",
          description: "Không thể tải danh sách sản phẩm",
        });
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const filteredProducts = products.filter((product: Product) => {
    // Lọc theo danh mục
    const matchesCategory = activeTab === "all" || product.category === activeTab;
    // Lọc theo loại: mua hoặc thuê
    const matchesType = activeType === "all" || product.type === activeType;

    return matchesCategory && matchesType;
  });

  const addToCart = (product: Product) => {
    setCartItems(prev => {
      const existingItem = prev.find(item => item.product.id === product.id);
      if (existingItem) {
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prev, { product, quantity: 1 }];
      }
    });

    toast({
      title: "Đã thêm vào giỏ hàng",
      description: product.name,
    });
  };

  const removeFromCart = (productId: number) => {
    setCartItems(prev => prev.filter(item => item.product.id !== productId));
  };

  const updateQuantity = (productId: number, newQuantity: number) => {
    if (newQuantity < 1) return;

    setCartItems(prev =>
      prev.map(item =>
        item.product.id === productId
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  const handleCheckout = () => {
    // Kiểm tra thông tin khách hàng
    const validationResult = validateBookingInfo(customerInfo.name, customerInfo.phone, customerInfo.email);

    if (!validationResult.isValid) {
      setValidationError(validationResult.message || "Thông tin không hợp lệ");
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: validationResult.message,
      });
      return;
    }

    // Reset lỗi nếu thông tin hợp lệ
    setValidationError(null);

    // Hiển thị QR thanh toán
    setShowPayment(true);
  };

  const handlePaymentSuccess = async () => {
    try {
      // Gửi thông tin đơn hàng lên API
      const orderData = {
        customer_name: customerInfo.name,
        customer_phone: customerInfo.phone,
        customer_email: customerInfo.email,
        total_amount: totalPrice,
        items: cartItems.map(item => ({
          product_id: item.product.id,
          quantity: item.quantity,
          price: item.product.price,
          product_name: item.product.name,
          product_type: item.product.type
        })),
        status: "paid",
        payment_method: "vietqr"
      };

      console.log("Sending order data:", orderData);

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      const data = await response.json();

      if (data.success) {
        // Đóng dialog thanh toán
        setShowPayment(false);

        // Hiển thị thông báo thành công
        toast({
          title: "Đặt hàng thành công!",
          description: `Cảm ơn bạn đã đặt hàng. Tổng thanh toán: ${totalPrice.toLocaleString()}đ`,
        });

        // Reset giỏ hàng và form
        setCartItems([]);
        setShowCart(false);
        setCustomerInfo({
          name: "",
          phone: "",
          email: ""
        });
      } else {
        throw new Error(data.message || "Không thể hoàn tất đơn hàng");
      }
    } catch (error) {
      console.error("Error processing order:", error);
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể hoàn tất đơn hàng. Vui lòng thử lại sau.",
      });

      // Đóng dialog thanh toán
      setShowPayment(false);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2 text-center">Dịch Vụ & Sản Phẩm</h1>
      <p className="text-center text-gray-600 mb-8">Các sản phẩm và dịch vụ đi kèm tại Sân Bóng Xanh</p>

      {/* Cart Button */}
      <div className="flex justify-end mb-6">
        <Button
          variant="outline"
          className="relative border-field-500 text-field-700"
          onClick={() => setShowCart(!showCart)}
        >
          <ShoppingCart className="w-5 h-5 mr-2" />
          <span>Giỏ hàng</span>
          {totalItems > 0 && (
            <Badge className="absolute -top-2 -right-2 bg-field-600">
              {totalItems}
            </Badge>
          )}
        </Button>
      </div>

      {/* Cart Display */}
      {showCart && (
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Giỏ hàng</h2>
              <Button
                variant="ghost"
                className="text-gray-500 h-8"
                onClick={() => setShowCart(false)}
              >
                Đóng
              </Button>
            </div>

            {cartItems.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Giỏ hàng trống</p>
                <Button
                  variant="link"
                  className="text-field-600 mt-2"
                  onClick={() => setShowCart(false)}
                >
                  Tiếp tục mua sắm
                </Button>
              </div>
            ) : (
              <div>
                <div className="space-y-4 max-h-80 overflow-auto">
                  {cartItems.map((item) => (
                    <div key={item.product.id} className="flex items-center border-b border-gray-100 pb-4">
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-16 h-16 object-cover rounded-md"
                      />
                      <div className="ml-4 flex-grow">
                        <h3 className="font-medium">{item.product.name}</h3>
                        <p className="text-sm text-gray-600">{item.product.price.toLocaleString()}đ</p>
                        <Badge className="mt-1" variant="outline">
                          {item.product.type === "buy" ? "Mua" : "Thuê"}
                        </Badge>
                      </div>
                      <div className="flex items-center">
                        <Button
                          variant="outline"
                          className="h-8 w-8 p-0"
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        >
                          -
                        </Button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <Button
                          variant="outline"
                          className="h-8 w-8 p-0"
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        >
                          +
                        </Button>
                      </div>
                      <Button
                        variant="ghost"
                        className="ml-4 h-8 text-gray-500"
                        onClick={() => removeFromCart(item.product.id)}
                      >
                        ✕
                      </Button>
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-4 border-t border-gray-200">
                  <div className="flex justify-between mb-4">
                    <span className="font-semibold">Tổng thanh toán:</span>
                    <span className="font-semibold">{totalPrice.toLocaleString()}đ</span>
                  </div>

                  {/* Thông tin khách hàng */}
                  <div className="mb-6 space-y-3">
                    <h3 className="font-semibold">Thông tin khách hàng</h3>
                    <input
                      type="text"
                      placeholder="Họ và tên"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-field-500"
                      value={customerInfo.name}
                      onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})}
                    />
                    <input
                      type="tel"
                      placeholder="Số điện thoại (+84, 84 hoặc 0...)"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-field-500"
                      value={customerInfo.phone}
                      onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
                    />
                    <input
                      type="email"
                      placeholder="Email"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-field-500"
                      value={customerInfo.email}
                      onChange={(e) => setCustomerInfo({...customerInfo, email: e.target.value})}
                    />

                    {validationError && (
                      <div className="p-3 bg-red-50 text-red-700 rounded-md text-sm">
                        {validationError}
                      </div>
                    )}
                  </div>

                  <Button
                    className="w-full bg-field-600 hover:bg-field-700 text-white"
                    onClick={handleCheckout}
                    disabled={!cartItems.length || !customerInfo.name || !customerInfo.phone || !customerInfo.email}
                  >
                    Tiến hành thanh toán
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Type Selection: Mua hoặc Thuê */}
      <Tabs defaultValue="all" value={activeType} onValueChange={(value) => setActiveType(value as "all" | "buy" | "rent")}>
        <div className="flex justify-center mb-6">
          <TabsList>
            <TabsTrigger value="all">Tất cả sản phẩm</TabsTrigger>
            <TabsTrigger value="buy">Mua sản phẩm</TabsTrigger>
            <TabsTrigger value="rent">Thuê dụng cụ</TabsTrigger>
          </TabsList>
        </div>
      </Tabs>

      {/* Product Categories */}
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="all">Tất cả</TabsTrigger>
          <TabsTrigger value="clothes">Quần áo</TabsTrigger>
          <TabsTrigger value="shoes">Giày</TabsTrigger>
          <TabsTrigger value="equipment">Thiết bị</TabsTrigger>
          <TabsTrigger value="food">Đồ ăn & nước</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-field-600 mr-2" />
              <span>Đang tải danh sách sản phẩm...</span>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p>Không có sản phẩm nào trong danh mục này.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow flex flex-col h-full">
                  <div className="h-48 overflow-hidden">
                    <img
                      src={product.image || product.image_url}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform hover:scale-105"
                    />
                  </div>
                  <CardContent className="p-4 flex flex-col flex-grow">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold">{product.name}</h3>
                      <Badge className="bg-field-600">{product.price.toLocaleString()}đ</Badge>
                    </div>
                    <div className="mb-2">
                      <Badge variant="outline">
                        {product.type === "buy" ? "Mua" : "Thuê"}
                      </Badge>
                      {product.stock_quantity !== undefined && (
                        <Badge variant="outline" className="ml-2">
                          Còn {product.stock_quantity} sản phẩm
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-4 flex-grow">{product.description}</p>
                    <Button
                      className="w-full bg-field-600 hover:bg-field-700 text-white mt-auto"
                      onClick={() => addToCart(product)}
                      disabled={product.stock_quantity !== undefined && product.stock_quantity <= 0}
                    >
                      {product.stock_quantity !== undefined && product.stock_quantity <= 0
                        ? "Hết hàng"
                        : "Thêm vào giỏ"}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* QR Payment Dialog */}
      <QRCodePayment
        open={showPayment}
        onOpenChange={setShowPayment}
        amount={totalPrice}
        customerInfo={customerInfo}
        description={`Thanh toán mua hàng: ${cartItems.length} sản phẩm`}
        onSuccess={handlePaymentSuccess}
      />
    </div>
  );
};

export default Services;
