"use client";

import React, { useState } from 'react';
import { Card, CardBody, CardHeader } from '@heroui/card';
import { Button } from '@heroui/button';
import { Input } from '@heroui/input';
import { Select, SelectItem } from '@heroui/select';
import { Divider } from '@heroui/divider';
import { Chip } from '@heroui/chip';
import NextLink from 'next/link';
import { useCart } from '@/contexts/CartContext';
import { addToast } from '@heroui/toast';
import { ShoppingCartIcon, TrashIcon } from '@/components/icons';
import { orderAPI, authAPI, productAPI, cartAPI } from '@/lib/api';
import { CreateOrderCommand } from '@/types';
import { toast } from '@heroui/theme';

export default function CartPage() {
  const { items, removeFromCart, updateQuantity, getTotalPrice, getTotalItems, clearCart } = useCart();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [step, setStep] = useState<'cart' | 'checkout' | 'payment'>('cart');
  
  // Checkout form data
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

  const handleRemoveFromCart = (productId: string | number, productName: string) => {
    removeFromCart(productId);
    addToast({
      title: `${productName}`,
      description: "Ürün sepetten kaldırıldı!",
      timeout: 3000,
      shouldShowTimeoutProgress: true,
    });
  };

  const handleClearCart = () => {
    if (items.length > 0) {
      clearCart();
      addToast({
        title: "Sepet temizlendi",
        description: "Tüm ürünler sepetten kaldırıldı!",
        timeout: 3000,
        shouldShowTimeoutProgress: true,
      });
    }
  };

  const  handleCheckout = async () => {
    if(items.length>0) {
      for (const item of items) {
        // Stok kontrolü yap
          try {
            const productResponse = await productAPI.getById(item.product.id);
            if (!productResponse.success || !productResponse.data) {
              throw new Error(`Ürün bilgisi alınamadı: ${item.product.name}`);
            }
            const productData = productResponse.data;
            // Stok kontrolü
            if (productData.stock < item.quantity) {
              if (productData.stock <= 0) {
                addToast({
                  title: "Stok Tükendi",
                  description: `${item.product.name} ürünü stokta kalmadı!`,
                  timeout: 3000,
                  shouldShowTimeoutProgress: true,
                });
                await cartAPI.removeFromCart(Number(item.id));
              setTimeout(() => {
                window.location.reload();
              }, 3000);
                return;
              } else {
                await cartAPI.removeFromCart(Number(item.id));
                await cartAPI.addToCart({
                  productId: item.product.id,
                  quantity: productData.stock
              });
            }
              



              // Kullanıcıya bilgi ver
              console.error(`Yetersiz stok: ${item.product.name} için sadece ${productData.stock} adet mevcut.`);
              // Toast mesajı göster


              addToast({
                title: "Yetersiz Stok",
                description: `${item.product.name} için yeterli stok bulunmuyor!`,
                timeout: 3000,
                shouldShowTimeoutProgress: true,
              });

              // Toast mesajı gösterildikten sonra sayfa yenile
              setTimeout(() => {
                window.location.reload();
              }, 3000);
              return;
            }
          
          } catch (error) {

            addToast({
              title: "Stok Kontrol Hatası",
              description: error instanceof Error ? error.message : "Stok kontrolü sırasında bir hata oluştu.",
              timeout: 3000,
              shouldShowTimeoutProgress: true,
            });
            throw error;
            
          }

        }
    }
  

    if (items.length === 0) {
      addToast({
        title: "Sepet Boş",
        description: "Sepetinizde ürün bulunmuyor!",
        timeout: 3000,
        shouldShowTimeoutProgress: true,
      });
      return;
    }
    setStep('checkout');
  };

  const handlePlaceOrder = async () => {
    if (!checkoutData.firstName || !checkoutData.lastName || !checkoutData.email || 
        !checkoutData.phone || !checkoutData.address || !checkoutData.city) {
      addToast({
        title: "Eksik Bilgi",
        description: "Lütfen tüm zorunlu alanları doldurun!",
        timeout: 3000,
        shouldShowTimeoutProgress: true,
      });
      return;
    }

    // Kullanıcı giriş yapmış mı kontrol et
    const token = localStorage.getItem('authToken');
    
    if (!token) {
      addToast({
        title: "Giriş Gerekli",
        description: "Sipariş vermek için giriş yapmanız gerekiyor!",
        timeout: 3000,
        shouldShowTimeoutProgress: true,
      });
      return;
    }

    setIsCheckingOut(true);
    
    try {
      // /api/Auth/me API'sinden kullanıcı bilgilerini al
      console.log('Getting user info from /api/Auth/me');
      const userResponse = await authAPI.getCurrentUser();
      console.log('User API response:', userResponse);
      
      if (!userResponse.success || !userResponse.data) {
        throw new Error('Kullanıcı bilgileri alınamadı');
      }
      
      const user = userResponse.data;
      console.log('User data:', user);
      
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

      console.log('Creating order with data:', orderData);
      
      // Gerçek API çağrısı
      const response = await orderAPI.create(orderData);
      console.log('Order API response:', response);
      
      if (response.success) {
        addToast({
          title: "Sipariş Başarılı!",
          description: "Siparişiniz başarıyla alındı! Havale bilgileri e-posta adresinize gönderilecek.",
          timeout: 5000,
          shouldShowTimeoutProgress: true,
        });
        
        // Sipariş başarılı olursa sepeti temizle
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
      } else {
        throw new Error(response.message || 'Sipariş oluşturulamadı');
      }
      
    } catch (error: any) {
      console.error('Order error:', error);
      addToast({
        title: "Sipariş Hatası",
        description: error.message || "Sipariş verirken bir hata oluştu. Lütfen tekrar deneyin.",
        timeout: 3000,
        shouldShowTimeoutProgress: true,
      });
    } finally {
      setIsCheckingOut(false);
    }
  };

  if (step === 'cart') {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Sepetim</h1>
          <Chip color="primary" variant="flat">
            {getTotalItems()} ürün
          </Chip>
        </div>

        {items.length === 0 ? (
          <Card className="text-center py-12">
            <CardBody>
              <ShoppingCartIcon size={64} className="mx-auto mb-4 text-gray-400" />
              <h2 className="text-xl font-semibold mb-2">Sepetiniz boş</h2>
              <p className="text-gray-500 mb-6">Alışverişe başlamak için ürünlerimize göz atın</p>
              <Button as={NextLink} href="/products" color="primary">
                Alışverişe Başla
              </Button>
            </CardBody>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <Card key={item.id}>
                  <CardBody className="p-4">
                    <div className="flex gap-4">
                      <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        {item.product.imageUrl ? (
                          <img
                            src={item.product.imageUrl}
                            alt={item.product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <ShoppingCartIcon size={24} />
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-1">{item.product.name}</h3>
                        <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                          {item.product.description}
                        </p>
                        <p className="text-primary font-bold text-lg">
                          ₺{item.price.toFixed(2)}
                        </p>
                      </div>
                      
                      <div className="flex flex-col items-end gap-2">
                        <Button
                          isIconOnly
                          size="sm"
                          variant="light"
                          color="danger"
                          onPress={() => handleRemoveFromCart(item.product.id, item.product.name)}
                        >
                          <TrashIcon size={16} />
                        </Button>
                        
                        {/* Quantity Controls */}
                        <div className="flex items-center gap-2">
                          <Button
                            isIconOnly
                            size="sm"
                            variant="flat"
                            onPress={() => updateQuantity(item.product.id, item.quantity - 1)}
                            className="w-8 h-8 min-w-0"
                          >
                            -
                          </Button>
                          <span className="text-sm min-w-[30px] text-center font-semibold">
                            {item.quantity}
                          </span>
                          <Button
                            isIconOnly
                            size="sm"
                            variant="flat"
                            onPress={() => updateQuantity(item.product.id, item.quantity + 1)}
                            className="w-8 h-8 min-w-0"
                          >
                            +
                          </Button>
                        </div>
                        
                        <p className="text-sm font-semibold">
                          Toplam: ₺{(item.price * item.quantity).toFixed(2)}
                        </p>
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
                  <h3 className="font-semibold text-lg">Sipariş Özeti</h3>
                </CardHeader>
                <CardBody className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Ürünler ({getTotalItems()})</span>
                      <span>₺{getTotalPrice().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Kargo</span>
                      <span className="text-green-600">Ücretsiz</span>
                    </div>
                    <Divider />
                    <div className="flex justify-between font-bold text-lg">
                      <span>Toplam</span>
                      <span className="text-primary">₺{getTotalPrice().toFixed(2)}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Button
                      color="primary"
                      size="lg"
                      className="w-full"
                      onPress={handleCheckout}
                    >
                      Ödemeye Geç
                    </Button>
                    <Button
                      variant="flat"
                      color="danger"
                      size="sm"
                      className="w-full"
                      onPress={handleClearCart}
                    >
                      Sepeti Temizle
                    </Button>
                  </div>
                </CardBody>
              </Card>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (step === 'checkout') {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="light"
            onPress={() => setStep('cart')}
          >
            ← Sepete Dön
          </Button>
          <h1 className="text-3xl font-bold">Ödeme Bilgileri</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <h3 className="font-semibold text-lg">Teslimat Bilgileri</h3>
              </CardHeader>
              <CardBody className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Ad"
                    placeholder="Adınızı girin"
                    value={checkoutData.firstName}
                    onChange={(e) => setCheckoutData({...checkoutData, firstName: e.target.value})}
                    isRequired
                  />
                  <Input
                    label="Soyad"
                    placeholder="Soyadınızı girin"
                    value={checkoutData.lastName}
                    onChange={(e) => setCheckoutData({...checkoutData, lastName: e.target.value})}
                    isRequired
                  />
                  <Input
                    label="E-posta"
                    type="email"
                    placeholder="E-posta adresinizi girin"
                    value={checkoutData.email}
                    onChange={(e) => setCheckoutData({...checkoutData, email: e.target.value})}
                    isRequired
                  />
                  <Input
                    label="Telefon"
                    placeholder="Telefon numaranızı girin"
                    value={checkoutData.phone}
                    onChange={(e) => setCheckoutData({...checkoutData, phone: e.target.value})}
                    isRequired
                  />
                </div>
                
                <Input
                  label="Adres"
                  placeholder="Tam adresinizi girin"
                  value={checkoutData.address}
                  onChange={(e) => setCheckoutData({...checkoutData, address: e.target.value})}
                  isRequired
                />
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input
                    label="Şehir"
                    placeholder="Şehir"
                    value={checkoutData.city}
                    onChange={(e) => setCheckoutData({...checkoutData, city: e.target.value})}
                    isRequired
                  />
                  <Input
                    label="İlçe"
                    placeholder="İlçe"
                    value={checkoutData.district}
                    onChange={(e) => setCheckoutData({...checkoutData, district: e.target.value})}
                  />
                  <Input
                    label="Posta Kodu"
                    placeholder="Posta kodu"
                    value={checkoutData.postalCode}
                    onChange={(e) => setCheckoutData({...checkoutData, postalCode: e.target.value})}
                  />
                </div>
                
                <Input
                  label="Sipariş Notu (İsteğe bağlı)"
                  placeholder="Özel talepleriniz varsa belirtebilirsiniz"
                  value={checkoutData.notes}
                  onChange={(e) => setCheckoutData({...checkoutData, notes: e.target.value})}
                />
              </CardBody>
            </Card>

            {/* Payment Method */}
            <Card className="mt-6">
              <CardHeader>
                <h3 className="font-semibold text-lg">Ödeme Yöntemi</h3>
              </CardHeader>
              <CardBody>
                <div className="p-4 border border-primary rounded-lg bg-primary-50">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-primary">Havale/EFT</h4>
                      <p className="text-sm text-gray-600">
                        Sipariş onaylandıktan sonra havale bilgileri e-posta adresinize gönderilecektir.
                      </p>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <h3 className="font-semibold text-lg">Sipariş Özeti</h3>
              </CardHeader>
              <CardBody className="space-y-4">
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="line-clamp-1">
                        {item.product.name} x{item.quantity}
                      </span>
                      <span>₺{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                
                <Divider />
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Ara Toplam</span>
                    <span>₺{getTotalPrice().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Kargo</span>
                    <span className="text-green-600">Ücretsiz</span>
                  </div>
                  <Divider />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Toplam</span>
                    <span className="text-primary">₺{getTotalPrice().toFixed(2)}</span>
                  </div>
                </div>
                
                <Button
                  color="primary"
                  size="lg"
                  className="w-full"
                  onPress={handlePlaceOrder}
                  isLoading={isCheckingOut}
                  disabled={isCheckingOut}
                >
                  {isCheckingOut ? 'Sipariş Veriliyor...' : 'Siparişi Tamamla'}
                </Button>
              </CardBody>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
