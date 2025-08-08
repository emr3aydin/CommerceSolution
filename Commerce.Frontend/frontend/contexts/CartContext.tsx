"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, Cart, CartItem as BackendCartItem, BackendCart } from '@/types';
import { cartAPI } from '@/lib/api';
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
                stock: 999, 
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
      const token = localStorage.getItem('authToken');
      console.log('AddToCart - Token:', token ? 'exists' : 'null');
      console.log('AddToCart - Product:', product);
      console.log('AddToCart - Quantity:', quantity);
      
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
          addToast({
            title: `${product.name}`,
            color: "success",
            description: "Ürün sepete eklendi!",
            timeout: 3000,
            shouldShowTimeoutProgress: true,
          });
        } else {
          throw new Error(response.message);
        }
      } else {
        // Local storage'a ekle
        console.log('AddToCart - No token, adding to localStorage');
        setItems(prevItems => {
          const existingItem = prevItems.find(item => item.product.id === product.id);
          
          let newItems;
          if (existingItem) {
            newItems = prevItems.map(item =>
              item.product.id === product.id
                ? { ...item, quantity: item.quantity + quantity }
                : item
            );
          } else {
            const newItem: CartItem = {
              id: `local-${product.id}-${Date.now()}`,
              product,
              quantity,
              price: product.price
            };
            newItems = [...prevItems, newItem];
          }
          
          // localStorage'a kaydet
          localStorage.setItem('cart', JSON.stringify(newItems));
          return newItems;
        });
        
        addToast({
          title: `${product.name}`,
          color: "success",
          description: "Ürün sepete eklendi!",
          timeout: 3000,
          shouldShowTimeoutProgress: true,
        });
      }
    } catch (error: any) {
      console.error('Add to cart error:', error);
      addToast({
        title: "Hata",
        color: "danger",
        description: error.message || "Ürün sepete eklenirken bir hata oluştu!",
        timeout: 3000,
        shouldShowTimeoutProgress: true,
      });
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
            addToast({
              title: item.product.name,
              color: "warning",
              description: "Ürün sepetten kaldırıldı!",
              timeout: 3000,
              shouldShowTimeoutProgress: true,
            });
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
            addToast({
              title: item.product.name,
              color: "warning",
              description: "Ürün sepetten kaldırıldı!",
              timeout: 3000,
              shouldShowTimeoutProgress: true,
            });
          }
          
          return newItems;
        });
      }
    } catch (error: any) {
      console.error('Remove from cart error:', error);
      addToast({
        title: "Hata",
        color: "danger",
        description: error.message || "Ürün sepetten kaldırılırken bir hata oluştu!",
        timeout: 3000,
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
        setItems(prevItems => {
          const newItems = prevItems.map(item =>
            item.product.id === productId
              ? { ...item, quantity }
              : item
          );
          localStorage.setItem('cart', JSON.stringify(newItems));
          return newItems;
        });
      }
    } catch (error: any) {
      console.error('Update quantity error:', error);
      addToast({
        title: "Hata",
        color: "danger",
        description: error.message || "Miktar güncellenirken bir hata oluştu!",
        timeout: 3000,
        shouldShowTimeoutProgress: true,
      });
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
          addToast({
            title: "Sepet temizlendi",
            color: "success",
            description: "Tüm ürünler sepetten kaldırıldı!",
            timeout: 3000,
            shouldShowTimeoutProgress: true,
          });
        } else {
          throw new Error(response.message);
        }
      } else {
        // Local storage'ı temizle
        setItems([]);
        localStorage.removeItem('cart');
        addToast({
          title: "Sepet temizlendi",
          color: "success",
          description: "Tüm ürünler sepetten kaldırıldı!",
          timeout: 3000,
          shouldShowTimeoutProgress: true,
        });
      }
    } catch (error: any) {
      console.error('Clear cart error:', error);
      addToast({
        title: "Hata",
        color: "danger",
        description: error.message || "Sepet temizlenirken bir hata oluştu!",
        timeout: 3000,
        shouldShowTimeoutProgress: true,
      });
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
