"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, Cart, CartItem as BackendCartItem, BackendCart } from '@/types';
import { cartAPI, productAPI } from '@/lib/api';

export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
  price: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number) => Promise<void>;
  removeFromCart: (productId: string | number) => Promise<void>;
  updateQuantity: (productId: string | number, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  getTotalPrice: () => number;
  getTotalItems: () => number;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Sayfa yüklendiğinde sepeti yükle (token varsa backend'den, yoksa localStorage'dan)
    refreshCart();
  }, []);

  const refreshCart = async () => {
    if (typeof window !== 'undefined') {
      try {
        const token = localStorage.getItem('authToken');
        console.log('RefreshCart - Token:', token ? 'exists' : 'null');

        if (!token) {
          // Kullanıcı giriş yapmamışsa localStorage'dan yükle
          console.log('RefreshCart - No token, loading from localStorage');
          const savedCart = localStorage.getItem('cart');
          console.log('RefreshCart - Saved cart:', savedCart);
          if (savedCart && savedCart !== 'undefined') {
            setItems(JSON.parse(savedCart));
          }
          return;
        }

        console.log('RefreshCart - Making API call to:', `${process.env.NEXT_PUBLIC_API_URL || 'https://localhost:7057'}/api/Carts`);
        const response = await cartAPI.getCart();
        console.log('RefreshCart - API response:', response);

        if (response.success && response.data) {
          const cart = response.data as BackendCart;
          console.log('RefreshCart - Cart object:', cart);
          console.log('RefreshCart - Cart items (cartItems):', cart.cartItems);

          if (cart && cart.cartItems && Array.isArray(cart.cartItems)) {
            const cartItems: CartItem[] = cart.cartItems.map((item) => ({
              id: `${item.id}`,
              product: {
                id: item.productId,
                name: item.productName,
                price: item.unitPrice,
                imageUrl: item.productImageUrl,
                description: '',
                stock: item.productStock || 0,
                categoryId: 0,
                category: null,
                sku: '',
                isActive: true,
                createdAt: new Date().toISOString()
              },
              quantity: item.quantity,
              price: item.unitPrice
            }));
            console.log('RefreshCart - Mapped cart items:', cartItems);
            setItems(cartItems);
          } else {
            console.log('RefreshCart - Cart items is empty or undefined, setting empty array');
            setItems([]);
          }
        }
      } catch (error) {
        console.error('Cart loading error:', error);
        console.error('Error details:', {
          message: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined,
          name: error instanceof Error ? error.name : 'Unknown'
        });
        // Hata durumunda localStorage'dan yükle
        console.log('RefreshCart - Error occurred, falling back to localStorage');
        try {
          const savedCart = localStorage.getItem('cart');
          if (savedCart && savedCart !== 'undefined') {
            setItems(JSON.parse(savedCart));
          }
        } catch (localError) {
          console.error('Local cart loading error:', localError);
          localStorage.removeItem('cart');
        }
      }
    }
  };

  const addToCart = async (product: Product, quantity: number = 1) => {
    try {
      // Önce stok kontrolü yap
      const productResponse = await productAPI.getById(product.id);
      if (!productResponse.success || !productResponse.data) {
        console.error('Ürün bulunamadı');
        return;
      }

      const currentProduct = productResponse.data as Product;

      // Stok kontrolü
      if (currentProduct.stock <= 0) {
        console.error('Ürün stokta yok');
        return;
      }

      // Sepetteki mevcut miktar
      const existingItem = items.find(item => item.product.id === product.id);
      const currentCartQuantity = existingItem ? existingItem.quantity : 0;
      const totalRequestedQuantity = currentCartQuantity + quantity;

      // Toplam istenen miktar stoktan fazla mı?
      if (totalRequestedQuantity > currentProduct.stock) {
        const availableQuantity = currentProduct.stock - currentCartQuantity;
        if (availableQuantity <= 0) {
          console.error('Bu üründen daha fazla ekleyemezsiniz, stok yetersiz');
          return;
        }
        // Sadece mevcut kadarını ekle
        quantity = availableQuantity;
        console.warn(`Stok yetersiz. Sadece ${quantity} adet eklenebilir.`);
      }

      const token = localStorage.getItem('authToken');
      console.log('AddToCart - Token:', token ? 'exists' : 'null');
      console.log('AddToCart - Product:', product);
      console.log('AddToCart - Requested quantity:', quantity);
      console.log('AddToCart - Available stock:', currentProduct.stock);

      if (token) {
        // Backend'e gönder
        console.log('AddToCart - Making API call to add product');
        const response = await cartAPI.addToCart({
          productId: product.id,
          quantity: quantity
        });
        console.log('AddToCart - API response:', response);

        if (response.success) {
          await refreshCart(); // Sepeti yenile
          console.log(`${product.name} sepete eklendi!`);
        } else {
          throw new Error(response.message);
        }
      } else {
        // Giriş yapılmadan sepet kullanımını engelle
        console.error('Sepete ürün eklemek için giriş yapmalısınız');
        return;
      }
    } catch (error: any) {
      console.error('Add to cart error:', error);
      console.log("Hata: Ürün sepete eklenirken bir hata oluştu!");
    }
  };

  const removeFromCart = async (productId: string | number) => {
    try {
      const token = localStorage.getItem('authToken');

      if (token) {
        const item = items.find(item => item.product.id === productId);
        if (item && !item.id.startsWith('local-')) {
          const response = await cartAPI.removeFromCart(parseInt(item.id));
          if (response.success) {
            await refreshCart();
            console.log(`${item.product.name} sepetten kaldırıldı`);
          } else {
            throw new Error(response.message);
          }
        }
      } else {
        // Local storage'dan kaldır
        setItems(prevItems => {
          const item = prevItems.find(item => item.product.id === productId);
          const newItems = prevItems.filter(item => item.product.id !== productId);
          localStorage.setItem('cart', JSON.stringify(newItems));

          if (item) {
            console.log(`${item.product.name} sepetten kaldırıldı`);
          }

          return newItems;
        });
      }
    } catch (error: any) {
      console.error('Remove from cart error:', error);
      console.log("Hata: Ürün sepetten kaldırılırken bir hata oluştu!");
    }
  };

  const updateQuantity = async (productId: string | number, quantity: number) => {
    if (quantity <= 0) {
      await removeFromCart(productId);
      return;
    }

    try {
      // Stok kontrolü yap
      const productResponse = await productAPI.getById(Number(productId));
      if (!productResponse.success || !productResponse.data) {
        console.error('Ürün bulunamadı');
        return;
      }

      const currentProduct = productResponse.data as Product;

      // Stok kontrolü
      if (currentProduct.stock <= 0) {
        console.error('Ürün stokta yok, sepetten kaldırılıyor');
        await removeFromCart(productId);
        return;
      }

      // İstenen miktar stoktan fazla mı?
      if (quantity > currentProduct.stock) {
        console.warn(`Stok yetersiz. Maksimum ${currentProduct.stock} adet alabilirsiniz.`);
        quantity = currentProduct.stock; // Maksimum stoğa ayarla
      }

      const token = localStorage.getItem('authToken');

      if (token) {
        const item = items.find(item => item.product.id === productId);
        if (item && !item.id.startsWith('local-')) {
          await cartAPI.removeFromCart(parseInt(item.id));
          await cartAPI.addToCart({
            productId: item.product.id,
            quantity: quantity
          });
          await refreshCart();
        }
      } else {
        // Giriş yapılmadan sepet güncellenemez
        console.error('Sepeti güncellemek için giriş yapmalısınız');
        return;
      }
    } catch (error: any) {
      console.error('Update quantity error:', error);
      console.log("Hata: Miktar güncellenirken bir hata oluştu!");
    }
  };

  const clearCart = async () => {
    try {
      const token = localStorage.getItem('authToken');

      if (token) {
        // Backend'den temizle
        const response = await cartAPI.clearCart();
        if (response.success) {
          setItems([]);
          console.log("Sepet temizlendi");
        } else {
          throw new Error(response.message);
        }
      } else {
        // Local storage'ı temizle
        setItems([]);
        localStorage.removeItem('cart');
        console.log("Sepet temizlendi");
      }
    } catch (error: any) {
      console.error('Clear cart error:', error);
      console.log("Hata: Sepet temizlenirken bir hata oluştu!");
    }
  };

  const getTotalPrice = () => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  const value: CartContextType = {
    items,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalPrice,
    getTotalItems,
    refreshCart
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
