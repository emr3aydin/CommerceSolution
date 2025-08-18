"use client";

import { useState } from "react";
import { Card, CardHeader, CardBody, CardFooter } from "@heroui/card";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { Link } from "@heroui/link";
import { EyeFilledIcon, EyeSlashFilledIcon } from "@/components/icons";
import NextLink from "next/link";
import { authAPI } from "@/lib/api";
import { TokenResponseDto } from "@/types";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isVisible, setIsVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const toggleVisibility = () => setIsVisible(!isVisible);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            const response = await authAPI.login({ email, password });

            console.log('Login response:', response);

            if (response.success && response.data) {
                const tokenData = response.data as TokenResponseDto;
                
                // Token'ları localStorage'a kaydet
                localStorage.setItem('accessToken', tokenData.accessToken);
                localStorage.setItem('refreshToken', tokenData.refreshToken);
                localStorage.setItem('tokenExpiry', tokenData.expiresAt);

                // Kullanıcı bilgilerini al
                try {
                    const userResponse = await authAPI.getCurrentUser();
                    if (userResponse.success && userResponse.data) {
                        localStorage.setItem('userInfo', JSON.stringify(userResponse.data));
                    }
                } catch (userError) {
                    console.error('User info fetch error:', userError);
                }

                // Ana sayfaya yönlendir
                window.location.href = '/';
            } else {
                setError(response.message || 'Giriş başarısız.');
            }
        } catch (error: any) {
            console.error('Login error:', error);
            setError(error.message || 'Giriş başarısız. Lütfen bilgilerinizi kontrol edin.');
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
