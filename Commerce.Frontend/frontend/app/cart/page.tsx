"use client";

import { useEffect } from "react";
import {
  Card,
  CardBody,
  Image,
  Button,
  Divider,
  Chip,
} from "@heroui/react";
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { useCartStore } from "@/store/cart";
import { useAuthStore } from "@/store/auth";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function CartPage() {
  const { cart, fetchCart, removeFromCart, clearCart, isLoading } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    }
  }, [isAuthenticated, fetchCart]);

  const handleRemoveItem = async (cartItemId: number) => {
    try {
      await removeFromCart(cartItemId);
      toast.success("Ürün sepetten çıkarıldı");
    } catch (error) {
      toast.error("Ürün çıkarılırken bir hata oluştu");
    }
  };

  const handleClearCart = async () => {
    try {
      await clearCart();
      toast.success("Sepet temizlendi");
    } catch (error) {
      toast.error("Sepet temizlenirken bir hata oluştu");
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(price);
  };

  const handleCheckout = () => {
    router.push("/checkout");
  };

  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <Card className="max-w-md w-full mx-4">
            <CardBody className="text-center p-8">
              <div className="text-6xl mb-4">🔒</div>
              <h2 className="text-2xl font-bold mb-4">Giriş Gerekli</h2>
              <p className="text-gray-600 mb-6">
                Sepetinizi görüntülemek için giriş yapmanız gerekiyor.
              </p>
              <div className="space-y-3">
                <Button
                  color="primary"
                  className="w-full"
                  onPress={() => router.push("/auth/login")}
                >
                  Giriş Yap
                </Button>
                <Button
                  variant="bordered"
                  className="w-full"
                  onPress={() => router.push("/auth/register")}
                >
                  Kayıt Ol
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center gap-4">
              <Button
                isIconOnly
                variant="light"
                onPress={() => router.back()}
              >
                <ArrowLeft size={20} />
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Sepetim</h1>
                <p className="text-gray-600">
                  {cart?.totalItems || 0} ürün sepetinizde
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {!cart || cart.items.length === 0 ? (
            /* Empty Cart */
            <div className="text-center py-16">
              <div className="text-gray-400 text-8xl mb-6">🛒</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Sepetiniz boş
              </h2>
              <p className="text-gray-600 mb-8">
                Henüz sepetinize ürün eklemediniz. Alışverişe başlamak için ürünleri keşfedin.
              </p>
              <Button
                color="primary"
                size="lg"
                onPress={() => router.push("/products")}
                startContent={<ShoppingBag size={20} />}
              >
                Alışverişe Başla
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">Sepet Ürünleri</h2>
                  <Button
                    color="danger"
                    variant="light"
                    size="sm"
                    onPress={handleClearCart}
                    startContent={<Trash2 size={16} />}
                    isLoading={isLoading}
                  >
                    Sepeti Temizle
                  </Button>
                </div>

                {cart.items.map((item) => (
                  <Card key={item.id}>
                    <CardBody className="p-6">
                      <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-shrink-0">
                          <Image
                            src={item.product.imageUrl || "/api/placeholder/150/150"}
                            alt={item.product.name}
                            className="w-24 h-24 object-cover rounded-lg"
                          />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-lg mb-2">
                            {item.product.name}
                          </h3>
                          
                          {item.product.description && (
                            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                              {item.product.description}
                            </p>
                          )}

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-600">Adet:</span>
                                <Chip color="primary" variant="flat">
                                  {item.quantity}
                                </Chip>
                              </div>
                              
                              <div className="flex flex-col">
                                <span className="text-sm text-gray-600">Birim Fiyat</span>
                                <span className="font-medium">
                                  {formatPrice(item.unitPrice)}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-4">
                              <div className="text-right">
                                <span className="text-sm text-gray-600 block">Toplam</span>
                                <span className="text-lg font-bold text-primary">
                                  {formatPrice(item.totalPrice)}
                                </span>
                              </div>
                              
                              <Button
                                isIconOnly
                                color="danger"
                                variant="light"
                                size="sm"
                                onPress={() => handleRemoveItem(item.id)}
                                isLoading={isLoading}
                              >
                                <Trash2 size={16} />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                ))}
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <Card className="sticky top-4">
                  <CardBody className="p-6">
                    <h3 className="text-xl font-semibold mb-4">Sipariş Özeti</h3>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>Ara Toplam:</span>
                        <span>{formatPrice(cart.totalAmount)}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span>Kargo:</span>
                        <span className="text-green-600">Ücretsiz</span>
                      </div>
                      
                      <Divider />
                      
                      <div className="flex justify-between text-lg font-bold">
                        <span>Toplam:</span>
                        <span className="text-primary">
                          {formatPrice(cart.totalAmount)}
                        </span>
                      </div>
                      
                      <div className="text-sm text-gray-600 text-center">
                        200 TL ve üzeri alışverişlerde kargo ücretsiz
                      </div>
                    </div>

                    <Divider className="my-6" />

                    <div className="space-y-3">
                      <Button
                        color="primary"
                        size="lg"
                        className="w-full"
                        onPress={handleCheckout}
                      >
                        Siparişi Tamamla
                      </Button>
                      
                      <Button
                        variant="bordered"
                        size="lg"
                        className="w-full"
                        onPress={() => router.push("/products")}
                      >
                        Alışverişe Devam Et
                      </Button>
                    </div>

                    {/* Security Info */}
                    <div className="mt-6 p-4 bg-green-50 rounded-lg">
                      <div className="flex items-center gap-2 text-green-700">
                        <div className="text-xl">🔒</div>
                        <div className="text-sm">
                          <div className="font-medium">Güvenli Ödeme</div>
                          <div>256-bit SSL şifreleme</div>
                        </div>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
