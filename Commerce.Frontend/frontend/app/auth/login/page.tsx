"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Card,
  CardBody,
  CardHeader,
  Input,
  Button,
  Link,
  Divider,
} from "@heroui/react";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { useAuthStore } from "@/store/auth";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Layout from "@/components/layout/Layout";

const loginSchema = z.object({
  email: z.string().min(1, "E-posta adresi gereklidir"),
  password: z.string().min(6, "Şifre en az 6 karakter olmalıdır"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [isVisible, setIsVisible] = useState(false);
  const { login, isLoading, error } = useAuthStore();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const toggleVisibility = () => setIsVisible(!isVisible);

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data);
      toast.success("Giriş başarılı!");
      router.push("/");
    } catch (error) {
      toast.error("Giriş yapılırken bir hata oluştu");
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <Card className="shadow-lg">
            <CardHeader className="flex flex-col gap-3 pb-6">
              <div className="text-center">
                <h1 className="text-2xl font-bold">Giriş Yap</h1>
                <p className="text-gray-600 mt-2">
                  Hesabınıza giriş yaparak alışverişe devam edin
                </p>
              </div>
            </CardHeader>

            <CardBody className="px-6 pb-6">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <Input
                  {...register("email")}
                  type="text"
                  label="E-posta veya Kullanıcı Adı"
                  placeholder="ornek@email.com"
                  startContent={<Mail size={18} />}
                  isInvalid={!!errors.email}
                  errorMessage={errors.email?.message}
                />

                <Input
                  {...register("password")}
                  label="Şifre"
                  placeholder="Şifrenizi girin"
                  startContent={<Lock size={18} />}
                  endContent={
                    <button
                      className="focus:outline-none"
                      type="button"
                      onClick={toggleVisibility}
                    >
                      {isVisible ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  }
                  type={isVisible ? "text" : "password"}
                  isInvalid={!!errors.password}
                  errorMessage={errors.password?.message}
                />

                {error && (
                  <div className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-lg">
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  color="primary"
                  size="lg"
                  className="w-full"
                  isLoading={isLoading}
                >
                  Giriş Yap
                </Button>

                <div className="text-center">
                  <Link href="/auth/forgot-password" size="sm">
                    Şifremi unuttum
                  </Link>
                </div>

                <Divider />

                <div className="text-center">
                  <p className="text-sm text-gray-600">
                    Henüz hesabınız yok mu?{" "}
                    <Link href="/auth/register" color="primary">
                      Kayıt olun
                    </Link>
                  </p>
                </div>
              </form>
            </CardBody>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
