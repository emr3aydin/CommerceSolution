"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardBody, CardHeader } from '@heroui/card';
import { Button } from '@heroui/button';
import { Input } from '@heroui/input';
import { Select, SelectItem } from '@heroui/select';
import { Divider } from '@heroui/divider';
import { Chip } from '@heroui/chip';
import NextLink from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import { ShoppingCartIcon, TrashIcon } from '@/components/icons';
import { orderAPI, authAPI, productAPI, cartAPI } from '@/lib/api';
import { CreateOrderCommand } from '@/types';
import { addToast } from '@heroui/toast';

export default function CartPage() {
  const { items, removeFromCart, updateQuantity, getTotalPrice, getTotalItems, clearCart } = useCart();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [step, setStep] = useState<'cart' | 'checkout' | 'payment'>('cart');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Checkout form data - tüm state'ler en üstte olmalı
  const [checkoutData, setCheckoutData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    district: '',
    postalCode: '',
    notes: ''
  });

  // Auth kontrolü
  useEffect(() => {
    console.log('Cart page - checking authentication...');
    const token = localStorage.getItem('accessToken');
    console.log('Cart page - token found:', !!token);
    
    if (!token) {
      console.log('Cart page - no token, redirecting to login');
      router.push('/login?redirect=/cart');
      return;
    }
    console.log('Cart page - authenticated, showing cart');
    setIsAuthenticated(true);
    setLoading(false);
  }, [router]);

  // Yükleniyor durumu
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl">Yükleniyor...</div>
      </div>
    );
  }

  // Giriş yapılmamışsa hiçbir şey render etme
  if (!isAuthenticated) {
    return null;
  } const handleCheckout = async () => {
    if (items.length === 0) {
      console.log("Sepet boş!");
      return;
    }

    setIsCheckingOut(true);

    try {
      // Tüm ürünler için stok kontrolü yap
      let hasStockIssue = false;

      for (const item of items) {
        try {
          const productResponse = await productAPI.getById(item.product.id);
          if (!productResponse.success || !productResponse.data) {
            console.error(`Ürün bilgisi alınamadı: ${item.product.name}`);
            continue;
          }

          const productData = productResponse.data as any;

          // Stok kontrolü
          if (productData.stock <= 0) {
            addToast({
              title: `${item.product.name} stokta yok!`,
              description: 'Bu ürünü sepetinizden kaldırıyoruz.',
              color: 'danger',
              timeout: 5000,
              shouldShowTimeoutProgress: true,
            });
            console.error(`${item.product.name} stokta yok, sepetten kaldırılıyor`);
            await removeFromCart(item.product.id);
            hasStockIssue = true;
          } else if (productData.stock < item.quantity) {
            addToast({
              title: `${item.product.name} için stok sorunu!`,
              description: `Maksimum ${productData.stock} adet alabilirsiniz.`,
              color: "warning",
              timeout: 5000,
              shouldShowTimeoutProgress: true,
            });
            console.warn(`${item.product.name} için yeterli stok yok. Maksimum ${productData.stock} adet alabilirsiniz. Sepet güncelleniyor...`);
            await updateQuantity(item.product.id, productData.stock);
            hasStockIssue = true;
          }
        } catch (error) {
          console.error(`Stok kontrolü hatası: ${item.product.name}`, error);
          hasStockIssue = true;
        }
      }

      if (hasStockIssue) {
        console.log("Stok sorunları nedeniyle sepet güncellendi. Lütfen kontrol edin.");
        setIsCheckingOut(false);
        return;
      }

      // Stok sorunları yoksa checkout'a geç
      setStep('checkout');
    } catch (error) {
      console.error('Checkout hatası:', error);
    } finally {
      setIsCheckingOut(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!checkoutData.firstName || !checkoutData.lastName || !checkoutData.email ||
      !checkoutData.phone || !checkoutData.address || !checkoutData.city) {
      console.log("Lütfen tüm zorunlu alanları doldurun!");
      return;
    }

    // Kullanıcı giriş yapmış mı kontrol et
    const token = localStorage.getItem('accessToken');
    console.log('Order creation - checking token:', !!token);

    if (!token) {
      console.log("Sipariş vermek için giriş yapmanız gerekiyor!");
      addToast({
        title: "Sipariş vermek için giriş yapmanız gerekiyor!",
        description: "Lütfen giriş yapın.",
        color: "warning",
        timeout: 5000,
        shouldShowTimeoutProgress: true,
      });
      router.push('/login?redirect=/cart');
      return;
    }

    setIsCheckingOut(true);

    try {
      // User bilgilerini al
      const userResponse = await authAPI.getCurrentUser();

      if (!userResponse.success || !userResponse.data) {
        throw new Error('Kullanıcı bilgileri alınamadı');
      }

      const user = userResponse.data as any;

      // Sipariş adresini tam adres olarak birleştir
      const fullAddress = `${checkoutData.firstName} ${checkoutData.lastName}, ${checkoutData.phone}, ${checkoutData.address}, ${checkoutData.district}, ${checkoutData.city} ${checkoutData.postalCode}`;

      // Order API'sine gönderilecek veri yapısı
      const orderData: CreateOrderCommand = {
        userId: user.id,
        shippingAddress: fullAddress,
        orderItems: items.map(item => ({
          productId: item.product.id,
          quantity: item.quantity
        }))
      };

      const response = await orderAPI.create(orderData);

      if (response.success) {
        console.log("Sipariş başarıyla oluşturuldu!");
        addToast({
          title: "Sipariş başarıyla oluşturuldu!",
          description: "Siparişiniz alındı ve işleme konuldu.",
          color: "success",
          timeout: 5000,
          shouldShowTimeoutProgress: true,
        });
        clearCart();
        setStep('cart');
        setCheckoutData({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          address: '',
          city: '',
          district: '',
          postalCode: '',
          notes: ''
        });
        // Ana sayfaya yönlendir
        router.push('/');
      } else {
        throw new Error(response.message || 'Sipariş oluşturulamadı');
      }
    } catch (error) {
      console.error('Order creation error:', error);
      console.log("Sipariş oluşturulurken bir hata oluştu!");
      addToast({
        title: "Sipariş oluşturulurken bir hata oluştu!",
        description: "Lütfen tekrar deneyin.",
        color: "danger",
        timeout: 5000,
        shouldShowTimeoutProgress: true,
      });
    } finally {
      setIsCheckingOut(false);
    }
  };

  if (step === 'cart') {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-2 mb-6">
            <ShoppingCartIcon className="h-8 w-8" />
            <h1 className="text-3xl font-bold">Sepetim ({getTotalItems()} ürün)</h1>
          </div>

          {items.length === 0 ? (
            <Card>
              <CardBody className="text-center py-12">
                <ShoppingCartIcon className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                <h2 className="text-xl font-semibold mb-2">Sepetiniz boş</h2>
                <p className="text-gray-500 mb-4">Sepetinizde henüz ürün bulunmuyor.</p>
                <Button
                  as={NextLink}
                  href="/products"
                  color="primary"
                  size="lg"
                >
                  Alışverişe Başla
                </Button>
              </CardBody>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                {items.map((item) => (
                  <Card key={item.id}>
                    <CardBody>
                      <div className="flex gap-4">
                        {/* Product Image */}
                        <div className="w-24 h-24 bg-gray-100 rounded-lg flex-shrink-0">
                          {item.product.imageUrl ? (
                            <img
                              src={item.product.imageUrl}
                              alt={item.product.name}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              Resim Yok
                            </div>
                          )}
                        </div>

                        {/* Product Info */}
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-1">{item.product.name}</h3>
                          <p className="text-gray-600 text-sm mb-2">{item.product.description}</p>
                          <div className="flex items-center gap-4">
                            <span className="text-xl font-bold text-green-600">
                              ₺{item.product.price.toFixed(2)}
                            </span>
                            <Chip size="sm" variant="flat" color="primary">
                              Stok: {(item.product as any).stock || 0}
                            </Chip>
                          </div>
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex flex-col items-end gap-2">
                          <Button
                            isIconOnly
                            variant="flat"
                            color="danger"
                            size="sm"
                            onPress={() => removeFromCart(item.product.id)}
                          >
                            <TrashIcon className="h-4 w-4" />
                          </Button>

                          <div className="flex items-center gap-2">
                            <Button
                              isIconOnly
                              variant="flat"
                              size="sm"
                              onPress={() => updateQuantity(item.product.id, item.quantity - 1)}
                              isDisabled={item.quantity <= 1}
                            >
                              -
                            </Button>
                            <span className="w-8 text-center font-semibold">{item.quantity}</span>
                            <Button
                              isIconOnly
                              variant="flat"
                              size="sm"
                              onPress={() => updateQuantity(item.product.id, item.quantity + 1)}
                            >
                              +
                            </Button>
                          </div>

                          <div className="text-right">
                            <div className="text-sm text-gray-500">Toplam</div>
                            <div className="font-bold text-lg">
                              ₺{(item.product.price * item.quantity).toFixed(2)}
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
                  <CardHeader>
                    <h3 className="text-xl font-bold">Sipariş Özeti</h3>
                  </CardHeader>
                  <CardBody className="space-y-4">
                    <div className="flex justify-between">
                      <span>Ara Toplam ({getTotalItems()} ürün)</span>
                      <span>₺{getTotalPrice().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Kargo</span>
                      <span className="text-green-600">Ücretsiz</span>
                    </div>
                    <Divider />
                    <div className="flex justify-between text-xl font-bold">
                      <span>Toplam</span>
                      <span>₺{getTotalPrice().toFixed(2)}</span>
                    </div>
                    <Button
                      color="primary"
                      size="lg"
                      className="w-full"
                      onPress={handleCheckout}
                      isLoading={isCheckingOut}
                    >
                      Ödemeye Geç
                    </Button>
                    <Button
                      variant="flat"
                      color="danger"
                      size="lg"
                      className="w-full"
                      onPress={clearCart}
                    >
                      Sepeti Temizle
                    </Button>
                  </CardBody>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (step === 'checkout') {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-2 mb-6">
            <Button
              variant="flat"
              onPress={() => setStep('cart')}
            >
              ← Sepete Dön
            </Button>
            <h1 className="text-3xl font-bold">Sipariş Bilgileri</h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Checkout Form */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <h3 className="text-xl font-bold">Teslimat Bilgileri</h3>
                </CardHeader>
                <CardBody className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Ad"
                      placeholder="Adınızı girin"
                      value={checkoutData.firstName}
                      onChange={(e) => setCheckoutData(prev => ({ ...prev, firstName: e.target.value }))}
                      isRequired
                    />
                    <Input
                      label="Soyad"
                      placeholder="Soyadınızı girin"
                      value={checkoutData.lastName}
                      onChange={(e) => setCheckoutData(prev => ({ ...prev, lastName: e.target.value }))}
                      isRequired
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="E-posta"
                      type="email"
                      placeholder="E-posta adresinizi girin"
                      value={checkoutData.email}
                      onChange={(e) => setCheckoutData(prev => ({ ...prev, email: e.target.value }))}
                      isRequired
                    />
                    <Input
                      label="Telefon"
                      placeholder="Telefon numaranızı girin"
                      value={checkoutData.phone}
                      onChange={(e) => setCheckoutData(prev => ({ ...prev, phone: e.target.value }))}
                      isRequired
                    />
                  </div>

                  <Input
                    label="Adres"
                    placeholder="Tam adresinizi girin"
                    value={checkoutData.address}
                    onChange={(e) => setCheckoutData(prev => ({ ...prev, address: e.target.value }))}
                    isRequired
                  />

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input
                      label="İl"
                      placeholder="İl"
                      value={checkoutData.city}
                      onChange={(e) => setCheckoutData(prev => ({ ...prev, city: e.target.value }))}
                      isRequired
                    />
                    <Input
                      label="İlçe"
                      placeholder="İlçe"
                      value={checkoutData.district}
                      onChange={(e) => setCheckoutData(prev => ({ ...prev, district: e.target.value }))}
                    />
                    <Input
                      label="Posta Kodu"
                      placeholder="Posta Kodu"
                      value={checkoutData.postalCode}
                      onChange={(e) => setCheckoutData(prev => ({ ...prev, postalCode: e.target.value }))}
                    />
                  </div>

                  <Input
                    label="Sipariş Notu (Opsiyonel)"
                    placeholder="Sipariş hakkında not ekleyebilirsiniz"
                    value={checkoutData.notes}
                    onChange={(e) => setCheckoutData(prev => ({ ...prev, notes: e.target.value }))}
                  />
                </CardBody>
              </Card>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-4">
                <CardHeader>
                  <h3 className="text-xl font-bold">Sipariş Özeti</h3>
                </CardHeader>
                <CardBody className="space-y-4">
                  {items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span>{item.product.name} x{item.quantity}</span>
                      <span>₺{(item.product.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                  <Divider />
                  <div className="flex justify-between">
                    <span>Ara Toplam</span>
                    <span>₺{getTotalPrice().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Kargo</span>
                    <span className="text-green-600">Ücretsiz</span>
                  </div>
                  <Divider />
                  <div className="flex justify-between text-xl font-bold">
                    <span>Toplam</span>
                    <span>₺{getTotalPrice().toFixed(2)}</span>
                  </div>
                  <Button
                    color="primary"
                    size="lg"
                    className="w-full"
                    onPress={handlePlaceOrder}
                    isLoading={isCheckingOut}
                  >
                    Siparişi Tamamla
                  </Button>
                </CardBody>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
