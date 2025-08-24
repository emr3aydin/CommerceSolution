"use client";

import { useState, useEffect } from "react";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import { Divider } from "@heroui/divider";
import { authAPI } from "@/lib/api";

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  gender?: string;
  isActive: boolean;
  createdAt: string;
}

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");

  // Profil form state
  const [profileForm, setProfileForm] = useState({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    dateOfBirth: "",
    gender: ""
  });

  // Şifre değiştirme form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  // Toast messages
  const [message, setMessage] = useState<{text: string, type: 'success' | 'error'} | null>(null);

  useEffect(() => {
    loadUserProfile();
  }, []);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const showMessage = (text: string, type: 'success' | 'error') => {
    setMessage({ text, type });
  };

  const loadUserProfile = async () => {
    try {
      setIsLoading(true);
      const response = await authAPI.getCurrentUser();
      
      if (response.success && response.data) {
        const userData = response.data as User;
        setUser(userData);
        setProfileForm({
          firstName: userData.firstName || "",
          lastName: userData.lastName || "",
          phoneNumber: userData.phoneNumber || "",
          dateOfBirth: userData.dateOfBirth ? userData.dateOfBirth.split('T')[0] : "",
          gender: userData.gender || ""
        });
      } else {
        showMessage("Profil bilgileri yüklenirken bir hata oluştu.", "error");
      }
    } catch (error: any) {
      console.error("Profile loading error:", error);
      showMessage("Profil bilgileri yüklenirken bir hata oluştu.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!profileForm.firstName.trim() || !profileForm.lastName.trim()) {
      showMessage("Ad ve soyad alanları zorunludur.", "error");
      return;
    }

    try {
      setIsSaving(true);
      
      const updateData = {
        firstName: profileForm.firstName.trim(),
        lastName: profileForm.lastName.trim(),
        phoneNumber: profileForm.phoneNumber.trim() || undefined,
        dateOfBirth: profileForm.dateOfBirth || undefined,
        gender: profileForm.gender || undefined
      };

      const response = await authAPI.updateProfile(updateData);

      if (response.success) {
        // Local storage'daki user info'yu güncelle
        const currentUserInfo = localStorage.getItem('userInfo');
        if (currentUserInfo) {
          const userData = JSON.parse(currentUserInfo);
          userData.firstName = updateData.firstName;
          userData.lastName = updateData.lastName;
          localStorage.setItem('userInfo', JSON.stringify(userData));
          
          // Navbar'ı güncelle
          window.dispatchEvent(new Event('userInfoChanged'));
        }

        showMessage("Profil bilgileriniz başarıyla güncellendi.", "success");
        await loadUserProfile();
      } else {
        showMessage(response.message || "Profil güncellenirken bir hata oluştu.", "error");
      }
    } catch (error: any) {
      console.error("Profile update error:", error);
      showMessage("Profil güncellenirken bir hata oluştu.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      showMessage("Tüm şifre alanları zorunludur.", "error");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showMessage("Yeni şifreler eşleşmiyor.", "error");
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      showMessage("Yeni şifre en az 6 karakter olmalıdır.", "error");
      return;
    }

    try {
      setIsChangingPassword(true);

      const response = await authAPI.changePassword(
        passwordForm.currentPassword,
        passwordForm.newPassword
      );

      if (response.success) {
        showMessage("Şifreniz başarıyla değiştirildi.", "success");
        setPasswordForm({
          currentPassword: "",
          newPassword: "",
          confirmPassword: ""
        });
      } else {
        showMessage(response.message || "Şifre değiştirilirken bir hata oluştu.", "error");
      }
    } catch (error: any) {
      console.error("Password change error:", error);
      showMessage("Şifre değiştirilirken bir hata oluştu.", "error");
    } finally {
      setIsChangingPassword(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Profilim</h1>

      {/* Message */}
      {message && (
        <Card className={`mb-6 ${message.type === 'error' ? 'border-danger bg-danger-50' : 'border-success bg-success-50'}`}>
          <CardBody>
            <p className={message.type === 'error' ? 'text-danger' : 'text-success'}>
              {message.text}
            </p>
          </CardBody>
        </Card>
      )}

      {/* Tabs */}
      <div className="flex space-x-4 mb-6">
        <Button
          variant={activeTab === "profile" ? "solid" : "light"}
          onClick={() => setActiveTab("profile")}
        >
          Profil Bilgileri
        </Button>
        <Button
          variant={activeTab === "password" ? "solid" : "light"}
          onClick={() => setActiveTab("password")}
        >
          Şifre Değiştir
        </Button>
      </div>

      {/* Profil Tab */}
      {activeTab === "profile" && (
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">Profil Bilgileri</h2>
          </CardHeader>
          <Divider />
          <CardBody>
            <form onSubmit={handleProfileUpdate} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Ad"
                  placeholder="Adınızı girin"
                  value={profileForm.firstName}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, firstName: e.target.value }))}
                  isRequired
                />
                <Input
                  label="Soyad"
                  placeholder="Soyadınızı girin"
                  value={profileForm.lastName}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, lastName: e.target.value }))}
                  isRequired
                />
              </div>

              <Input
                label="E-posta"
                value={user?.email || ""}
                isReadOnly
                description="E-posta adresi değiştirilemez"
              />

              <Input
                label="Telefon Numarası"
                placeholder="05XX XXX XX XX"
                value={profileForm.phoneNumber}
                onChange={(e) => setProfileForm(prev => ({ ...prev, phoneNumber: e.target.value }))}
              />

              <Input
                label="Doğum Tarihi"
                type="date"
                value={profileForm.dateOfBirth}
                onChange={(e) => setProfileForm(prev => ({ ...prev, dateOfBirth: e.target.value }))}
              />

              <Select
                label="Cinsiyet"
                placeholder="Cinsiyet seçin"
                selectedKeys={profileForm.gender ? [profileForm.gender] : []}
                onSelectionChange={(keys) => {
                  const value = Array.from(keys)[0] as string;
                  setProfileForm(prev => ({ ...prev, gender: value }));
                }}
              >
                <SelectItem key="Male">Erkek</SelectItem>
                <SelectItem key="Female">Kadın</SelectItem>
                <SelectItem key="Other">Diğer</SelectItem>
              </Select>

              {user && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium mb-2">Hesap Bilgileri</h3>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>Hesap Oluşturma Tarihi: {formatDate(user.createdAt)}</p>
                    <p>Hesap Durumu: {user.isActive ? "Aktif" : "Pasif"}</p>
                  </div>
                </div>
              )}

              <Button
                type="submit"
                color="primary"
                isLoading={isSaving}
                className="w-full md:w-auto"
              >
                {isSaving ? "Güncelleniyor..." : "Profili Güncelle"}
              </Button>
            </form>
          </CardBody>
        </Card>
      )}

      {/* Şifre Tab */}
      {activeTab === "password" && (
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">Şifre Değiştir</h2>
          </CardHeader>
          <Divider />
          <CardBody>
            <form onSubmit={handlePasswordChange} className="space-y-6 max-w-md">
              <Input
                label="Mevcut Şifre"
                type="password"
                placeholder="Mevcut şifrenizi girin"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                isRequired
              />

              <Input
                label="Yeni Şifre"
                type="password"
                placeholder="Yeni şifrenizi girin"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                isRequired
                description="En az 6 karakter olmalıdır"
              />

              <Input
                label="Yeni Şifre Tekrar"
                type="password"
                placeholder="Yeni şifrenizi tekrar girin"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                isRequired
              />

              <Button
                type="submit"
                color="primary"
                isLoading={isChangingPassword}
                className="w-full md:w-auto"
              >
                {isChangingPassword ? "Değiştiriliyor..." : "Şifre Değiştir"}
              </Button>
            </form>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
