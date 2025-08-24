"use client";

import { useState } from "react";
import { Card, CardHeader, CardBody, CardFooter } from "@heroui/card";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { Link } from "@heroui/link";
import { Select, SelectItem } from "@heroui/select";
import { EyeFilledIcon, EyeSlashFilledIcon } from "@/components/icons";
import NextLink from "next/link";
import { authAPI } from "@/lib/api";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    phoneNumber: "",
    dateOfBirth: "",
    gender: "",
  });
  
  const [isVisible, setIsVisible] = useState(false);
  const [isConfirmVisible, setIsConfirmVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const toggleVisibility = () => setIsVisible(!isVisible);
  const toggleConfirmVisibility = () => setIsConfirmVisible(!isConfirmVisible);

  const handleInputChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    // Şifre kontrolü
    if (formData.password !== formData.confirmPassword) {
      setError("Şifreler eşleşmiyor.");
      setIsLoading(false);
      return;
    }

    // Şifre uzunluk kontrolü
    if (formData.password.length < 6) {
      setError("Şifre en az 6 karakter olmalıdır.");
      setIsLoading(false);
      return;
    }

    try {
      const userData = {
        email: formData.email,
        username: formData.username,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phoneNumber: formData.phoneNumber,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
      };

      const response = await authAPI.register(userData);
      
      if (response.success) {
        setSuccess(response.message || "Kayıt başarılı! Email doğrulama sayfasına yönlendiriliyorsunuz...");
        
        // 3 saniye sonra email doğrulama sayfasına yönlendir
        setTimeout(() => {
          window.location.href = `/verify-email?email=${encodeURIComponent(formData.email)}`;
        }, 3000);
      } else {
        setError(response.message || 'Kayıt sırasında bir hata oluştu.');
      }
      
    } catch (error: any) {
      setError(error.message || 'Kayıt sırasında bir hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  };

  const genderOptions = [
    { key: "Erkek", label: "Erkek" },
    { key: "Kadın", label: "Kadın" },
    { key: "Diğer", label: "Diğer" },
  ];

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardBody className="p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                Kayıt Başarılı!
              </h1>
              
              <p className="text-gray-600 mb-6">
                Hesabınız başarıyla oluşturuldu. Email adresinize gönderilen doğrulama kodunu girerek hesabınızı aktifleştirin.
              </p>

              <Button
                as={NextLink}
                href={`/verify-email?email=${encodeURIComponent(formData.email)}`}
                color="primary"
                size="lg"
                className="w-full font-semibold bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg"
              >
                Email Doğrulama Sayfasına Git
              </Button>
            </CardBody>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-blue-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Hesap Oluştur
          </h1>
          <p className="text-gray-600">
            Hemen kayıt olun ve alışverişin keyfini çıkarın
          </p>
        </div>

        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <form onSubmit={handleRegister}>
            <CardBody className="gap-6 p-8">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}
              
              {/* Kişisel Bilgiler */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Kişisel Bilgiler</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    type="text"
                    label="Ad"
                    placeholder="Adınızı girin"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange("firstName", e.target.value)}
                    isRequired
                    variant="bordered"
                    size="lg"
                    classNames={{
                      input: "text-base",
                      inputWrapper: "border-gray-200 hover:border-primary focus-within:border-primary"
                    }}
                  />
                  
                  <Input
                    type="text"
                    label="Soyad"
                    placeholder="Soyadınızı girin"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange("lastName", e.target.value)}
                    isRequired
                    variant="bordered"
                    size="lg"
                    classNames={{
                      input: "text-base",
                      inputWrapper: "border-gray-200 hover:border-primary focus-within:border-primary"
                    }}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  <Input
                    type="date"
                    label="Doğum Tarihi"
                    value={formData.dateOfBirth}
                    onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                    isRequired
                    variant="bordered"
                    size="lg"
                    classNames={{
                      input: "text-base",
                      inputWrapper: "border-gray-200 hover:border-primary focus-within:border-primary"
                    }}
                  />
                  
                  <Select
                    label="Cinsiyet"
                    placeholder="Cinsiyet seçin"
                    selectedKeys={formData.gender ? [formData.gender] : []}
                    onSelectionChange={(keys) => {
                      const selected = Array.from(keys as Set<string>)[0] || "";
                      handleInputChange("gender", selected);
                    }}
                    variant="bordered"
                    size="lg"
                    isRequired
                    classNames={{
                      trigger: "border-gray-200 hover:border-primary data-[open=true]:border-primary"
                    }}
                  >
                    {genderOptions.map((option) => (
                      <SelectItem key={option.key}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </Select>
                </div>
              </div>

              {/* İletişim Bilgileri */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">İletişim Bilgileri</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    type="email"
                    label="E-posta"
                    placeholder="ornek@email.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    isRequired
                    variant="bordered"
                    size="lg"
                    classNames={{
                      input: "text-base",
                      inputWrapper: "border-gray-200 hover:border-primary focus-within:border-primary"
                    }}
                  />
                  
                  <Input
                    type="tel"
                    label="Telefon Numarası"
                    placeholder="05XX XXX XX XX"
                    value={formData.phoneNumber}
                    onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                    variant="bordered"
                    size="lg"
                    classNames={{
                      input: "text-base",
                      inputWrapper: "border-gray-200 hover:border-primary focus-within:border-primary"
                    }}
                  />
                </div>
              </div>

              {/* Hesap Bilgileri */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Hesap Bilgileri</h3>
                <div className="space-y-6">
                  <Input
                    type="text"
                    label="Kullanıcı Adı"
                    placeholder="Benzersiz kullanıcı adı"
                    value={formData.username}
                    onChange={(e) => handleInputChange("username", e.target.value)}
                    isRequired
                    variant="bordered"
                    size="lg"
                    classNames={{
                      input: "text-base",
                      inputWrapper: "border-gray-200 hover:border-primary focus-within:border-primary"
                    }}
                    description="Bu isim ile giriş yapacaksınız"
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                      label="Şifre"
                      placeholder="Güçlü bir şifre oluşturun"
                      value={formData.password}
                      onChange={(e) => handleInputChange("password", e.target.value)}
                      endContent={
                        <button 
                          className="focus:outline-none" 
                          type="button" 
                          onClick={toggleVisibility}
                          aria-label={isVisible ? "Şifreyi gizle" : "Şifreyi göster"}
                        >
                          {isVisible ? (
                            <EyeSlashFilledIcon className="text-2xl text-default-400 pointer-events-none" />
                          ) : (
                            <EyeFilledIcon className="text-2xl text-default-400 pointer-events-none" />
                          )}
                        </button>
                      }
                      type={isVisible ? "text" : "password"}
                      isRequired
                      variant="bordered"
                      size="lg"
                      classNames={{
                        input: "text-base",
                        inputWrapper: "border-gray-200 hover:border-primary focus-within:border-primary"
                      }}
                      description="En az 6 karakter"
                    />
                    
                    <Input
                      label="Şifre Tekrar"
                      placeholder="Şifrenizi tekrar girin"
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                      endContent={
                        <button 
                          className="focus:outline-none" 
                          type="button" 
                          onClick={toggleConfirmVisibility}
                          aria-label={isConfirmVisible ? "Şifreyi gizle" : "Şifreyi göster"}
                        >
                          {isConfirmVisible ? (
                            <EyeSlashFilledIcon className="text-2xl text-default-400 pointer-events-none" />
                          ) : (
                            <EyeFilledIcon className="text-2xl text-default-400 pointer-events-none" />
                          )}
                        </button>
                      }
                      type={isConfirmVisible ? "text" : "password"}
                      isRequired
                      variant="bordered"
                      size="lg"
                      classNames={{
                        input: "text-base",
                        inputWrapper: "border-gray-200 hover:border-primary focus-within:border-primary"
                      }}
                      description="Şifrenizi doğrulayın"
                    />
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                color="primary"
                size="lg"
                className="w-full font-semibold bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 shadow-lg"
                isLoading={isLoading}
                disabled={isLoading}
              >
                {isLoading ? 'Hesap oluşturuluyor...' : 'Hesap Oluştur'}
              </Button>
            </CardBody>

            <CardFooter className="flex flex-col gap-4 px-8 pb-8">
              <div className="relative w-full">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500">veya</span>
                </div>
              </div>

              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Zaten hesabınız var mı?{" "}
                  <Link 
                    as={NextLink} 
                    href="/login" 
                    color="primary"
                    className="font-semibold hover:underline"
                  >
                    Giriş yapın
                  </Link>
                </p>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
