"use client";

import { useState } from "react";
import { Card, CardHeader, CardBody, CardFooter } from "@heroui/card";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { Link } from "@heroui/link";
import NextLink from "next/link";
import { authAPI } from "@/lib/api";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            const response = await authAPI.forgotPassword(email);

            if (response.success) {
                setSuccess(true);
            } else {
                setError(response.message || 'Bir hata oluştu. Lütfen tekrar deneyin.');
            }
        } catch (error: any) {
            console.error('Forgot password error:', error);
            setError(error.message || 'Bir hata oluştu. Lütfen tekrar deneyin.');
        } finally {
            setIsLoading(false);
        }
    };

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
                                E-posta Gönderildi!
                            </h1>
                            
                            <p className="text-gray-600 mb-6">
                                Şifre sıfırlama kodunuz <strong>{email}</strong> adresine gönderildi. 
                                E-postanızı kontrol edin ve kodu kullanarak şifrenizi sıfırlayın.
                            </p>

                            <div className="space-y-4">
                                <Button
                                    as={NextLink}
                                    href="/reset-password"
                                    color="primary"
                                    size="lg"
                                    className="w-full font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg"
                                >
                                    Şifre Sıfırla
                                </Button>

                                <Button
                                    as={NextLink}
                                    href="/login"
                                    variant="light"
                                    size="lg"
                                    className="w-full"
                                >
                                    Giriş Sayfasına Dön
                                </Button>
                            </div>
                        </CardBody>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">
                        Şifremi Unuttum
                    </h1>
                    <p className="text-gray-600">
                        E-posta adresinizi girin, size şifre sıfırlama kodu gönderelim
                    </p>
                </div>

                <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                    <form onSubmit={handleSubmit}>
                        <CardBody className="gap-6 p-8">
                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                                    {error}
                                </div>
                            )}

                            <Input
                                type="email"
                                label="E-posta Adresi"
                                placeholder="ornek@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                isRequired
                                variant="bordered"
                                size="lg"
                                classNames={{
                                    input: "text-base",
                                    inputWrapper: "border-gray-200 hover:border-primary focus-within:border-primary"
                                }}
                                description="Kayıtlı e-posta adresinizi girin"
                            />

                            <Button
                                type="submit"
                                color="primary"
                                size="lg"
                                className="w-full font-semibold bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 shadow-lg"
                                isLoading={isLoading}
                                disabled={isLoading}
                            >
                                {isLoading ? 'Gönderiliyor...' : 'Sıfırlama Kodu Gönder'}
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

                            <div className="text-center space-y-2">
                                <p className="text-sm text-gray-600">
                                    Şifrenizi hatırladınız mı?{" "}
                                    <Link 
                                        as={NextLink} 
                                        href="/login" 
                                        color="primary"
                                        className="font-semibold hover:underline"
                                    >
                                        Giriş yapın
                                    </Link>
                                </p>
                                <p className="text-sm text-gray-600">
                                    Hesabınız yok mu?{" "}
                                    <Link 
                                        as={NextLink} 
                                        href="/register" 
                                        color="primary"
                                        className="font-semibold hover:underline"
                                    >
                                        Kayıt olun
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
