"use client";

import React from 'react';
import { Card, CardBody, CardHeader } from '@heroui/card';
import { Button } from '@heroui/button';
import { Divider } from '@heroui/divider';
import { Badge } from '@heroui/badge';
import NextLink from 'next/link';
import { useCart } from '@/contexts/CartContext';
import { addToast } from '@heroui/toast';
import { ShoppingCartIcon, TrashIcon } from '@/components/icons';

interface CartPreviewProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CartPreview: React.FC<CartPreviewProps> = ({ isOpen, onClose }) => {
  const { items, removeFromCart, updateQuantity, getTotalPrice, getTotalItems } = useCart();

  const handleRemoveFromCart = async (productId: string | number, productName: string) => {
    await removeFromCart(productId);
  };

  const handleUpdateQuantity = async (productId: string | number, quantity: number) => {
    await updateQuantity(productId, quantity);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end pt-16 pr-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/20" 
        onClick={onClose}
      />
      
      {/* Cart Preview Panel */}
      <Card className="relative w-96 max-h-[80vh] overflow-hidden">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center w-full">
            <div className="flex items-center gap-2">
              <ShoppingCartIcon size={20} />
              <h3 className="font-semibold">Sepetim</h3>
              <Badge content={getTotalItems()} color="primary" size="sm">
                <span className="sr-only">Cart items</span>
              </Badge>
            </div>
            <Button
              isIconOnly
              variant="light"
              size="sm"
              onPress={onClose}
            >
              ✕
            </Button>
          </div>
        </CardHeader>

        <CardBody className="p-0">
          {items.length === 0 ? (
            <div className="text-center py-8 px-4">
              <ShoppingCartIcon size={48} className="mx-auto mb-4 text-gray-400" />
              <p className="text-gray-500">Sepetiniz boş</p>
              <Button
                as={NextLink}
                href="/products"
                color="primary"
                variant="flat"
                className="mt-4"
                onPress={onClose}
              >
                Alışverişe Başla
              </Button>
            </div>
          ) : (
            <>
              {/* Cart Items */}
              <div className="max-h-96 overflow-y-auto px-4">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3 py-3 border-b last:border-b-0">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      {item.product.imageUrl ? (
                        <img
                          src={item.product.imageUrl}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <ShoppingCartIcon size={20} />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm line-clamp-1">{item.product.name}</h4>
                      <p className="text-small text-primary font-semibold">
                        ₺{item.price.toFixed(2)}
                      </p>
                      
                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2 mt-1">
                        <Button
                          isIconOnly
                          size="sm"
                          variant="flat"
                          onPress={() => handleUpdateQuantity(item.product.id, item.quantity - 1)}
                          className="w-6 h-6 min-w-0"
                        >
                          -
                        </Button>
                        <span className="text-sm min-w-[20px] text-center">{item.quantity}</span>
                        <Button
                          isIconOnly
                          size="sm"
                          variant="flat"
                          onPress={() => handleUpdateQuantity(item.product.id, item.quantity + 1)}
                          className="w-6 h-6 min-w-0"
                        >
                          +
                        </Button>
                      </div>
                    </div>
                    
                    <Button
                      isIconOnly
                      size="sm"
                      variant="light"
                      color="danger"
                      onPress={() => handleRemoveFromCart(item.product.id, item.product.name)}
                      className="self-start"
                    >
                      <TrashIcon size={16} />
                    </Button>
                  </div>
                ))}
              </div>

              <Divider />

              {/* Total and Actions */}
              <div className="p-4 space-y-3">
                <div className="flex justify-between items-center font-semibold">
                  <span>Toplam:</span>
                  <span className="text-primary">₺{getTotalPrice().toFixed(2)}</span>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    as={NextLink}
                    href="/cart"
                    variant="flat"
                    onPress={onClose}
                  >
                    Sepeti Görüntüle
                  </Button>
                  <Button
                    as={NextLink}
                    href="/cart"
                    color="primary"
                    onPress={onClose}
                  >
                    Ödemeye Geç
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardBody>
      </Card>
    </div>
  );
};
