"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, Cart, CartItem as BackendCartItem, BackendCart } from '@/types';
import { cartAPI, productAPI } from '@/lib/api';
import { addToast } from '@heroui/toast';

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

  // Cart items değiştiğinde localStorage'a kaydet ve event dispatch et
  useEffect(() => {
    if (mounted && typeof window !== 'undefined') {
      const totalItems = items.reduce((total, item) => total + item.quantity, 0);
      console.log('🛒 CartContext: Items changed, total items:', totalItems);
      
      localStorage.setItem('cartItemCount', totalItems.toString());
      localStorage.setItem('cart', JSON.stringify(items));
      
      // Cart updated event dispatch et
      console.log('🛒 CartContext: Dispatching cartUpdated event');
      window.dispatchEvent(new Event('cartUpdated'));
    }
  }, [items, mounted]);

  useEffect(() => {
    setMounted(true);
    refreshCart();
  }, []);

  const refreshCart = async () => {
    if (typeof window !== 'undefined') {
      try {
        const token = localStorage.getItem('accessToken');
        console.log('RefreshCart - Token:', token ? 'exists' : 'null');

        if (!token) {
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
      const token = localStorage.getItem('accessToken');
      
      if (!token) {
        addToast({
          title: 'Giriş yapmalısınız!',
          description: 'Sepete ürün eklemek için lütfen giriş yapın.',
          color: 'warning',
          timeout: 5000,
          shouldShowTimeoutProgress: true,
        });
        return;
      }
      
      const productResponse = await productAPI.getById(product.id);
      
      if (!productResponse.success || !productResponse.data) {
        addToast({
              title: `${product.name} bulunamadı!`,
              description: `Ürün bulunamadı.`,
              color: "warning",
              timeout: 5000,
              shouldShowTimeoutProgress: true,
            });
        return;
      }

      const currentProduct = productResponse.data as Product;
      
      if (currentProduct.stock <= 0) {
        addToast({
          title: `${currentProduct.name} stokta yok!`,
          description: 'Bu ürünü sepete ekleyemezsiniz.',
          color: 'danger',
          timeout: 5000,
          shouldShowTimeoutProgress: true,
        });
        return;
      }

      const existingItem = items.find(item => item.product.id === product.id);
      const currentCartQuantity = existingItem ? existingItem.quantity : 0;
      const totalRequestedQuantity = currentCartQuantity + quantity;

      if (totalRequestedQuantity > currentProduct.stock) {
        const availableQuantity = currentProduct.stock - currentCartQuantity;
        
        if (availableQuantity <= 0) {
          addToast({
            title: `${currentProduct.name} için stok sorunu!`,
            description: `Maksimum ${currentProduct.stock} adet alabilirsiniz.`,
            color: 'warning',
            timeout: 5000,
            shouldShowTimeoutProgress: true,
          });
          return;
        }
      
        quantity = availableQuantity;
      }
      
      const response = await cartAPI.addToCart({
        productId: product.id,
        quantity: quantity
      });

      if (response.success) {
        await refreshCart(); 
        addToast({
          title: `${product.name} sepete eklendi!`,
          description: `Sepetinizde ${quantity} adet ${product.name} var.`,
          color: 'success',
          timeout: 5000,
          shouldShowTimeoutProgress: true,
        });
      } else {
        throw new Error(response.message);
      }
      
    } catch (error: any) {
      console.error('Add to cart error:', error);
      addToast({
        title: 'Sepete ekleme hatası!',
        description: error.message || 'Ürün sepete eklenirken bir hata oluştu.',
        color: 'danger',
        timeout: 5000,
        shouldShowTimeoutProgress: true,
      });
    }
  };

  const removeFromCart = async (productId: string | number) => {
    try {
      const token = localStorage.getItem('accessToken');

      if (token) {
        const item = items.find(item => item.product.id === productId);
        if (item && !item.id.startsWith('local-')) {
          const response = await cartAPI.removeFromCart(parseInt(item.id));
          if (response.success) {
            await refreshCart();
            console.log(`${item.product.name} sepetten kaldırıldı`);
            addToast({
              title: `${item.product.name} sepetten kaldırıldı!`,
              description: 'Ürün sepetinizden başarıyla kaldırıldı.',
              color: 'success',
              timeout: 5000,
              shouldShowTimeoutProgress: true,
            });
          } else {
            throw new Error(response.message);
          }
        }
      } else {
     
        setItems(prevItems => {
          const item = prevItems.find(item => item.product.id === productId);
          const newItems = prevItems.filter(item => item.product.id !== productId);
          localStorage.setItem('cart', JSON.stringify(newItems));

          if (item) {
            console.log(`${item.product.name} sepetten kaldırıldı`);
            addToast({
              title: `${item.product.name} sepetten kaldırıldı!`,
              description: 'Ürün sepetinizden başarıyla kaldırıldı.',
              color: 'success',
              timeout: 5000,
              shouldShowTimeoutProgress: true,
            });
          }

          return newItems;
        });
      }
    } catch (error: any) {
      console.error('Remove from cart error:', error);
      console.log("Hata: Ürün sepetten kaldırılırken bir hata oluştu!");
      addToast({
        title: 'Sepetten kaldırma hatası!',
        description: error.message || 'Ürün sepetten kaldırılırken bir hata oluştu.',
        color: 'danger',
        timeout: 5000,
        shouldShowTimeoutProgress: true,
      });
    }
  };

  const updateQuantity = async (productId: string | number, quantity: number) => {
    if (quantity <= 0) {
      await removeFromCart(productId);
      return;
    }

    try {
      
      const productResponse = await productAPI.getById(Number(productId));
      if (!productResponse.success || !productResponse.data) {
        console.error('Ürün bulunamadı');
        addToast({
          title: 'Ürün bulunamadı!',
          description: 'Bu ürünü güncelleyemiyoruz.',
          color: 'warning',
          timeout: 5000,
          shouldShowTimeoutProgress: true,
        });
        return;
      }

      const currentProduct = productResponse.data as Product;

     
      if (currentProduct.stock <= 0) {
        console.error('Ürün stokta yok, sepetten kaldırılıyor');
        addToast({
          title: `${currentProduct.name} stokta yok!`,
          description: 'Bu ürünü sepetinizden kaldırıyoruz.',
          color: 'danger',
          timeout: 5000,
          shouldShowTimeoutProgress: true,
        });
        await removeFromCart(productId);
        return;
      }

      
      if (quantity > currentProduct.stock) {
        console.warn(`Stok yetersiz. Maksimum ${currentProduct.stock} adet alabilirsiniz.`);
        addToast({
          title: `${currentProduct.name} için stok sorunu!`,
          description: `Maksimum ${currentProduct.stock} adet alabilirsiniz.`,
          color: 'warning',
          timeout: 5000,
          shouldShowTimeoutProgress: true,
        });
        quantity = currentProduct.stock; 
      }

      const token = localStorage.getItem('accessToken');

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
      const token = localStorage.getItem('accessToken');

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
