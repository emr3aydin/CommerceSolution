"use client";

import { useState } from "react";
import { Card, CardHeader, CardBody, CardFooter } from "@heroui/card";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { Link } from "@heroui/link";
import { EyeFilledIcon, EyeSlashFilledIcon } from "@/components/icons";
import NextLink from "next/link";
import { authAPI } from "@/lib/api";

export default function ResetPasswordPage() {
    const [email, setEmail] = useState("");
    const [resetCode, setResetCode] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isVisible, setIsVisible] = useState(false);
    const [isConfirmVisible, setIsConfirmVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const toggleVisibility = () => setIsVisible(!isVisible);
    const toggleConfirmVisibility = () => setIsConfirmVisible(!isConfirmVisible);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        // Şifre kontrolleri
        if (newPassword !== confirmPassword) {
            setError("Şifreler eşleşmiyor. Lütfen kontrol edin.");
            setIsLoading(false);
            return;
        }

        if (newPassword.length < 6) {
            setError("Şifre en az 6 karakter olmalıdır.");
            setIsLoading(false);
            return;
        }

        try {
            const response = await authAPI.resetPassword(email, resetCode, newPassword);

            if (response.success) {
                setSuccess(true);
            } else {
                setError(response.message || 'Şifre sıfırlanamadı. Lütfen bilgilerinizi kontrol edin.');
            }
        } catch (error: any) {
            console.error('Reset password error:', error);
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
                                Şifre Başarıyla Sıfırlandı!
                            </h1>
                            
                            <p className="text-gray-600 mb-6">
                                Şifreniz başarıyla güncellendi. Artık yeni şifrenizle giriş yapabilirsiniz.
                            </p>

                            <Button
                                as={NextLink}
                                href="/login"
                                color="primary"
                                size="lg"
                                className="w-full font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg"
                            >
                                Giriş Yap
                            </Button>
                        </CardBody>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">
                        Şifre Sıfırla
                    </h1>
                    <p className="text-gray-600">
                        E-postanıza gelen kodu ve yeni şifrenizi girin
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
                                description="Şifre sıfırlama kodu gönderilen e-posta adresi"
                            />

                            <Input
                                type="text"
                                label="Sıfırlama Kodu"
                                placeholder="6 haneli kodu girin"
                                value={resetCode}
                                onChange={(e) => setResetCode(e.target.value)}
                                isRequired
                                variant="bordered"
                                size="lg"
                                maxLength={6}
                                classNames={{
                                    input: "text-base font-mono text-center",
                                    inputWrapper: "border-gray-200 hover:border-primary focus-within:border-primary"
                                }}
                                description="E-postanıza gönderilen 6 haneli kod"
                            />

                            <Input
                                label="Yeni Şifre"
                                placeholder="Yeni şifrenizi girin"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
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
                                description="En az 6 karakter olmalıdır"
                            />

                            <Input
                                label="Yeni Şifre (Tekrar)"
                                placeholder="Yeni şifrenizi tekrar girin"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
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
                                description="Şifrenizi doğrulamak için tekrar girin"
                            />

                            <Button
                                type="submit"
                                color="primary"
                                size="lg"
                                className="w-full font-semibold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg"
                                isLoading={isLoading}
                                disabled={isLoading}
                            >
                                {isLoading ? 'Şifre sıfırlanıyor...' : 'Şifreyi Sıfırla'}
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
                                    Kod almadınız mı?{" "}
                                    <Link 
                                        as={NextLink} 
                                        href="/forgot-password" 
                                        color="primary"
                                        className="font-semibold hover:underline"
                                    >
                                        Yeniden gönder
                                    </Link>
                                </p>
                                <p className="text-sm text-gray-600">
                                    Giriş sayfasına dönmek için{" "}
                                    <Link 
                                        as={NextLink} 
                                        href="/login" 
                                        color="primary"
                                        className="font-semibold hover:underline"
                                    >
                                        tıklayın
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
