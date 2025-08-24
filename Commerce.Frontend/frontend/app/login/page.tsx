"use client";

import { useState } from "react";
import { Card, CardHeader, CardBody, CardFooter } from "@heroui/card";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { Link } from "@heroui/link";
import { EyeFilledIcon, EyeSlashFilledIcon } from "@/components/icons";
import NextLink from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { authAPI } from "@/lib/api";
import { TokenResponseDto } from "@/types";
import { clearAuthData, logAuthState } from '@/utils/auth';

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isVisible, setIsVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirectUrl = searchParams.get('redirect') || '/';

    const toggleVisibility = () => setIsVisible(!isVisible);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");
        
        try {
            // Önce mevcut auth verilerini temizle
            clearAuthData();
            console.log('🧹 Cleared existing auth data');
            
            const response = await authAPI.login({ email, password });
            console.log('📥 Login response:', response);

            if (response.success && response.data) {
                const tokenData = response.data as TokenResponseDto;
                console.log('🔑 Token payload:', tokenData);
                
                // Token'ları localStorage'a kaydet
                localStorage.setItem('accessToken', tokenData.accessToken);
                localStorage.setItem('refreshToken', tokenData.refreshToken);
                localStorage.setItem('tokenExpiry', tokenData.expiresAt);

                // Yazdıktan sonra doğrula
                console.log('📦 localStorage after set:', {
                    accessToken: localStorage.getItem('accessToken')?.slice(0,20) + '...',
                    refreshToken: (localStorage.getItem('refreshToken') || '').length,
                    tokenExpiry: localStorage.getItem('tokenExpiry')
                });
                
                logAuthState(); // Auth durumunu logla

                // Kullanıcı bilgilerini almaya çalış (başarısız olursa da devam et)
                console.log('🔍 Login: Attempting to get current user...');
                
                try {
                    const userResponse = await authAPI.getCurrentUser();
                    console.log('📤 Login: getCurrentUser response:', userResponse);
                    
                    if (userResponse.success && userResponse.data) {
                        localStorage.setItem('userInfo', JSON.stringify(userResponse.data));
                        console.log('💾 Login: User info saved successfully');
                    } else {
                        console.warn('⚠️ Login: getCurrentUser failed, continuing anyway');
                    }
                } catch (userError: any) {
                    console.warn('⚠️ Login: Error getting user info, continuing anyway:', userError.message);
                }
                
                // Giriş başarılı - header'ı bilgilendir
                window.dispatchEvent(new Event('userInfoChanged'));
                
                // Kısa delay sonra redirect (gözlem için biraz artırıldı)
                console.log('✅ Login: Login completed, redirecting in 800ms...');
                setTimeout(() => {
                    // SPA navigasyonu
                    try { router.push(redirectUrl || '/'); } catch { window.location.href = redirectUrl || '/'; }
                }, 800);
                
            } else {
                setError(response.message || 'Giriş başarısız.');
            }
        } catch (error: any) {
            // Detaylı hata loglama
            console.error('🔥 Login Error Details:', {
                error: error,
                message: error.message,
                name: error.name,
                stack: error.stack
            });
            
            // Detaylı hata mesajı
            let errorMessage = 'Giriş başarısız. ';
            
            if (error.message?.includes('session expired')) {
                errorMessage += 'Oturum süresi dolmuş. Lütfen tekrar deneyin.';
                localStorage.clear();
            } else if (error.message?.includes('bağlanılamıyor') || error.message?.includes('Network error')) {
                errorMessage += 'Sunucuya bağlanılamıyor. SSL sertifikasını kabul ettiniz mi?';
            } else if (error.message?.includes('401')) {
                errorMessage += 'E-posta veya şifre hatalı.';
            } else if (error.message?.includes('404')) {
                errorMessage += 'API endpoint bulunamadı. API çalışıyor mu?';
            } else if (error.message?.includes('fetch')) {
                errorMessage += 'Bağlantı hatası. SSL sertifikasını kabul edin: https://localhost:7057';
            } else {
                errorMessage += error.message || 'Lütfen bilgilerinizi kontrol edin.';
            }
            
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">
                        Hoş Geldiniz
                    </h1>
                    <p className="text-gray-600">
                        Hesabınıza giriş yaparak alışverişe devam edin
                    </p>
                </div>

                <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                    <form onSubmit={handleLogin}>
                        <CardBody className="gap-6 p-8">
                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                                    {error}
                                    {error.includes("aktif değil") && (
                                        <div className="mt-3">
                                            <Link 
                                                as={NextLink} 
                                                href={`/verify-email?email=${encodeURIComponent(email)}`}
                                                className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500 hover:underline"
                                            >
                                                📧 Email doğrulama sayfasına git
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            )}

                            <Input
                                type="text"
                                label="E-posta veya Kullanıcı Adı"
                                placeholder="E-posta adresinizi veya kullanıcı adınızı girin"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                isRequired
                                variant="bordered"
                                size="lg"
                                classNames={{
                                    input: "text-base",
                                    inputWrapper: "border-gray-200 hover:border-primary focus-within:border-primary"
                                }}
                            />

                            <Input
                                label="Şifre"
                                placeholder="Şifrenizi girin"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
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
                            />

                            <div className="text-right">
                                <Link 
                                    as={NextLink} 
                                    href="/forgot-password" 
                                    color="primary"
                                    className="text-sm hover:underline"
                                >
                                    Şifremi unuttum
                                </Link>
                            </div>

                            <Button
                                type="submit"
                                color="primary"
                                size="lg"
                                className="w-full font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg"
                                isLoading={isLoading}
                                disabled={isLoading}
                            >
                                {isLoading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
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
                                    Hesabınız yok mu?{" "}
                                    <Link 
                                        as={NextLink} 
                                        href="/register" 
                                        color="primary"
                                        className="font-semibold hover:underline"
                                    >
                                        Hemen kayıt olun
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
