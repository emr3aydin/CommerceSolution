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

      await authAPI.register(userData);
      setSuccess("Kayıt başarılı! Giriş sayfasına yönlendiriliyorsunuz...");
      
      // 2 saniye sonra login sayfasına yönlendir
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
      
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

  return (
    <div className="flex items-center justify-center min-h-screen py-8">
      <Card className="max-w-2xl w-full mx-4">
        <CardHeader className="flex flex-col gap-3 text-center">
          <h1 className="text-2xl font-bold">Kayıt Ol</h1>
          <p className="text-sm text-gray-600">Yeni hesap oluşturun</p>
        </CardHeader>
        
        <form onSubmit={handleRegister}>
          <CardBody className="gap-4">
            {error && (
              <div className="bg-danger-50 border border-danger-200 text-danger-700 px-4 py-3 rounded">
                {error}
              </div>
            )}
            
            {success && (
              <div className="bg-success-50 border border-success-200 text-success-700 px-4 py-3 rounded">
                {success}
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                type="text"
                label="Ad"
                placeholder="Adınızı girin"
                value={formData.firstName}
                onChange={(e) => handleInputChange("firstName", e.target.value)}
                isRequired
                variant="bordered"
              />
              
              <Input
                type="text"
                label="Soyad"
                placeholder="Soyadınızı girin"
                value={formData.lastName}
                onChange={(e) => handleInputChange("lastName", e.target.value)}
                isRequired
                variant="bordered"
              />
            </div>
            
            <Input
              type="email"
              label="E-posta"
              placeholder="E-posta adresinizi girin"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              isRequired
              variant="bordered"
            />
            
            <Input
              type="text"
              label="Kullanıcı Adı"
              placeholder="Kullanıcı adınızı girin"
              value={formData.username}
              onChange={(e) => handleInputChange("username", e.target.value)}
              isRequired
              variant="bordered"
            />
            
            <Input
              type="tel"
              label="Telefon Numarası"
              placeholder="Telefon numaranızı girin"
              value={formData.phoneNumber}
              onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
              variant="bordered"
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                type="date"
                label="Doğum Tarihi"
                value={formData.dateOfBirth}
                onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                isRequired
                variant="bordered"
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
                isRequired
              >
                {genderOptions.map((option) => (
                  <SelectItem key={option.key}>
                    {option.label}
                  </SelectItem>
                ))}
              </Select>
            </div>
            
            <Input
              label="Şifre"
              placeholder="Şifrenizi girin"
              value={formData.password}
              onChange={(e) => handleInputChange("password", e.target.value)}
              endContent={
                <button className="focus:outline-none" type="button" onClick={toggleVisibility}>
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
            />
            
            <Input
              label="Şifre Tekrar"
              placeholder="Şifrenizi tekrar girin"
              value={formData.confirmPassword}
              onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
              endContent={
                <button className="focus:outline-none" type="button" onClick={toggleConfirmVisibility}>
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
            />
          </CardBody>
          
          <CardFooter className="flex flex-col gap-4">
            <Button
              type="submit"
              color="primary"
              className="w-full"
              isLoading={isLoading}
              disabled={isLoading || success !== ""}
            >
              Kayıt Ol
            </Button>
            
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Zaten hesabınız var mı?{" "}
                <Link as={NextLink} href="/login" color="primary">
                  Giriş yapın
                </Link>
              </p>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
