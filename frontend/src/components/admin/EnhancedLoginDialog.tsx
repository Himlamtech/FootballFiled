import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Lock, LogIn, Mail, Phone, KeyRound, Undo } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

// Define the login form schema
const loginFormSchema = z.object({
  username: z
    .string()
    .min(1, { message: "Vui lòng nhập tên người dùng" }),
  password: z
    .string()
    .min(1, { message: "Vui lòng nhập mật khẩu" }),
});

// Define the forgot password form schema
const forgotPasswordSchema = z.object({
  method: z.enum(["email", "sms"]),
  contact: z.string().min(1, { message: "Vui lòng nhập thông tin liên hệ" }),
});

// Define the change password form schema
const changePasswordSchema = z.object({
  username: z.string().min(1, { message: "Vui lòng nhập tên người dùng" }),
  currentPassword: z.string().min(1, { message: "Vui lòng nhập mật khẩu hiện tại" }),
  newPassword: z.string().min(6, { message: "Mật khẩu mới phải có ít nhất 6 ký tự" }),
  confirmPassword: z.string().min(1, { message: "Vui lòng xác nhận mật khẩu mới" }),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Mật khẩu xác nhận không khớp",
  path: ["confirmPassword"],
});

type LoginFormValues = z.infer<typeof loginFormSchema>;
type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;
type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;

interface EnhancedLoginDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EnhancedLoginDialog({ open, onOpenChange }: EnhancedLoginDialogProps) {
  const { login } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("login");

  // Login form
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // Forgot password form
  const forgotPasswordForm = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      method: "email",
      contact: "",
    },
  });

  // Change password form
  const changePasswordForm = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      username: "",
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Login submission
  async function onLoginSubmit(data: LoginFormValues) {
    setIsLoading(true);
    try {
      const success = await login(data.username, data.password);
      if (success) {
        toast({
          title: "Đăng nhập thành công",
          description: "Chào mừng đến với trang quản trị",
        });
        onOpenChange(false);
        // Redirect to admin page after successful login
        navigate("/admin");
      } else {
        toast({
          variant: "destructive",
          title: "Đăng nhập thất bại",
          description: "Tên người dùng hoặc mật khẩu không chính xác",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Đăng nhập thất bại",
        description: "Đã xảy ra lỗi, vui lòng thử lại sau",
      });
    } finally {
      setIsLoading(false);
    }
  }

  // Forgot password submission
  async function onForgotPasswordSubmit(data: ForgotPasswordFormValues) {
    setIsLoading(true);
    try {
      // Simulate API call for password recovery
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "Yêu cầu đặt lại mật khẩu đã được gửi",
        description: data.method === "email" 
          ? `Hướng dẫn đã được gửi đến ${data.contact}` 
          : `Mã xác nhận đã được gửi đến ${data.contact}`,
      });
      
      // Reset form and go back to login
      forgotPasswordForm.reset();
      setActiveTab("login");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Yêu cầu thất bại",
        description: "Đã xảy ra lỗi, vui lòng thử lại sau",
      });
    } finally {
      setIsLoading(false);
    }
  }

  // Change password submission
  async function onChangePasswordSubmit(data: ChangePasswordFormValues) {
    setIsLoading(true);
    try {
      // Simulate API call for password change
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "Đổi mật khẩu thành công",
        description: "Mật khẩu của bạn đã được cập nhật",
      });
      
      // Reset form and go back to login
      changePasswordForm.reset();
      setActiveTab("login");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Đổi mật khẩu thất bại",
        description: "Đã xảy ra lỗi, vui lòng thử lại sau",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-center flex items-center justify-center gap-2">
            <Lock className="h-5 w-5 text-field-600" />
            Quản trị viên
          </DialogTitle>
          <DialogDescription className="text-center">
            Đăng nhập hoặc quản lý tài khoản quản trị viên
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="login">Đăng nhập</TabsTrigger>
            <TabsTrigger value="forgot">Quên mật khẩu</TabsTrigger>
            <TabsTrigger value="change">Đổi mật khẩu</TabsTrigger>
          </TabsList>

          {/* Login Tab */}
          <TabsContent value="login">
            <Form {...loginForm}>
              <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                <FormField
                  control={loginForm.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tên người dùng</FormLabel>
                      <FormControl>
                        <Input placeholder="admin" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={loginForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mật khẩu</FormLabel>
                      <FormControl>
                        <Input 
                          type="password" 
                          placeholder="•••••••" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button 
                  type="submit" 
                  className="w-full bg-field-600 hover:bg-field-700"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Đang đăng nhập...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <LogIn className="mr-2 h-4 w-4" /> Đăng nhập
                    </div>
                  )}
                </Button>
              </form>
            </Form>
          </TabsContent>

          {/* Forgot Password Tab */}
          <TabsContent value="forgot">
            <Form {...forgotPasswordForm}>
              <form onSubmit={forgotPasswordForm.handleSubmit(onForgotPasswordSubmit)} className="space-y-4">
                <FormField
                  control={forgotPasswordForm.control}
                  name="method"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Phương thức khôi phục</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-col space-y-1"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="email" id="email" />
                            <Label htmlFor="email" className="flex items-center gap-1">
                              <Mail className="h-4 w-4" /> Email
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="sms" id="sms" />
                            <Label htmlFor="sms" className="flex items-center gap-1">
                              <Phone className="h-4 w-4" /> SMS
                            </Label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={forgotPasswordForm.control}
                  name="contact"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {forgotPasswordForm.watch("method") === "email" ? "Email" : "Số điện thoại"}
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder={forgotPasswordForm.watch("method") === "email" 
                            ? "admin@example.com" 
                            : "0123456789"} 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className="w-full bg-field-600 hover:bg-field-700"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Đang xử lý...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <Undo className="mr-2 h-4 w-4" /> Khôi phục mật khẩu
                    </div>
                  )}
                </Button>
              </form>
            </Form>
          </TabsContent>

          {/* Change Password Tab */}
          <TabsContent value="change">
            <Form {...changePasswordForm}>
              <form onSubmit={changePasswordForm.handleSubmit(onChangePasswordSubmit)} className="space-y-4">
                <FormField
                  control={changePasswordForm.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tên người dùng</FormLabel>
                      <FormControl>
                        <Input placeholder="admin" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={changePasswordForm.control}
                  name="currentPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mật khẩu hiện tại</FormLabel>
                      <FormControl>
                        <Input 
                          type="password" 
                          placeholder="•••••••" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={changePasswordForm.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mật khẩu mới</FormLabel>
                      <FormControl>
                        <Input 
                          type="password" 
                          placeholder="•••••••" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={changePasswordForm.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Xác nhận mật khẩu mới</FormLabel>
                      <FormControl>
                        <Input 
                          type="password" 
                          placeholder="•••••••" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button 
                  type="submit" 
                  className="w-full bg-field-600 hover:bg-field-700"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Đang xử lý...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <KeyRound className="mr-2 h-4 w-4" /> Đổi mật khẩu
                    </div>
                  )}
                </Button>
              </form>
            </Form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
} 