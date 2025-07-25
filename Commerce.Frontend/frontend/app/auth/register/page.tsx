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
  Select,
  SelectItem,
} from "@heroui/react";
import { Eye, EyeOff, Mail, Lock, User, Phone, Calendar } from "lucide-react";
import { useAuthStore } from "@/store/auth";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Layout from "@/components/layout/Layout";

const registerSchema = z.object({
  email: z.string().email("Geçerli bir e-posta adresi girin"),
  username: z.string().min(3, "Kullanıcı adı en az 3 karakter olmalıdır"),
  password: z.string().min(6, "Şifre en az 6 karakter olmalıdır"),
  firstName: z.string().min(2, "Ad en az 2 karakter olmalıdır"),
  lastName: z.string().min(2, "Soyad en az 2 karakter olmalıdır"),
  phoneNumber: z.string().min(10, "Geçerli bir telefon numarası girin"),
  dateOfBirth: z.string().min(1, "Doğum tarihi gereklidir"),
  gender: z.string().min(1, "Cinsiyet seçimi gereklidir"),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const [isVisible, setIsVisible] = useState(false);
  const { register: registerUser, isLoading, error } = useAuthStore();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const toggleVisibility = () => setIsVisible(!isVisible);

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await registerUser(data);
      toast.success("Kayıt başarılı! Şimdi giriş yapabilirsiniz.");
      router.push("/auth/login");
    } catch (error) {
      toast.error("Kayıt olunurken bir hata oluştu");
    }
  };

  const genderOptions = [
    { key: "Erkek", label: "Erkek" },
    { key: "Kadın", label: "Kadın" },
    { key: "Diğer", label: "Diğer" },
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <Card className="shadow-lg">
            <CardHeader className="flex flex-col gap-3 pb-6">
              <div className="text-center">
                <h1 className="text-2xl font-bold">Kayıt Ol</h1>
                <p className="text-gray-600 mt-2">
                  Yeni hesap oluşturun ve alışverişe başlayın
                </p>
              </div>
            </CardHeader>

            <CardBody className="px-6 pb-6">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    {...register("firstName")}
                    type="text"
                    label="Ad"
                    placeholder="Adınız"
                    startContent={<User size={18} />}
                    isInvalid={!!errors.firstName}
                    errorMessage={errors.firstName?.message}
                  />

                  <Input
                    {...register("lastName")}
                    type="text"
                    label="Soyad"
                    placeholder="Soyadınız"
                    startContent={<User size={18} />}
                    isInvalid={!!errors.lastName}
                    errorMessage={errors.lastName?.message}
                  />
                </div>

                <Input
                  {...register("username")}
                  type="text"
                  label="Kullanıcı Adı"
                  placeholder="Kullanıcı adınız"
                  startContent={<User size={18} />}
                  isInvalid={!!errors.username}
                  errorMessage={errors.username?.message}
                />

                <Input
                  {...register("email")}
                  type="email"
                  label="E-posta"
                  placeholder="ornek@email.com"
                  startContent={<Mail size={18} />}
                  isInvalid={!!errors.email}
                  errorMessage={errors.email?.message}
                />

                <Input
                  {...register("phoneNumber")}
                  type="tel"
                  label="Telefon"
                  placeholder="05XX XXX XX XX"
                  startContent={<Phone size={18} />}
                  isInvalid={!!errors.phoneNumber}
                  errorMessage={errors.phoneNumber?.message}
                />

                <Input
                  {...register("dateOfBirth")}
                  type="date"
                  label="Doğum Tarihi"
                  startContent={<Calendar size={18} />}
                  isInvalid={!!errors.dateOfBirth}
                  errorMessage={errors.dateOfBirth?.message}
                />

                <Select
                  label="Cinsiyet"
                  placeholder="Cinsiyet seçin"
                  isInvalid={!!errors.gender}
                  errorMessage={errors.gender?.message}
                  onSelectionChange={(value) => setValue("gender", Array.from(value)[0] as string)}
                >
                  {genderOptions.map((option) => (
                    <SelectItem key={option.key}>
                      {option.label}
                    </SelectItem>
                  ))}
                </Select>

                <Input
                  {...register("password")}
                  label="Şifre"
                  placeholder="Şifrenizi oluşturun"
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
                  Kayıt Ol
                </Button>

                <Divider />

                <div className="text-center">
                  <p className="text-sm text-gray-600">
                    Zaten hesabınız var mı?{" "}
                    <Link href="/auth/login" color="primary">
                      Giriş yapın
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
