"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";
import { Divider } from "@heroui/divider";
import { Image } from "@heroui/image";
import { ArrowLeftIcon, ShoppingCartIcon, HeartIcon } from "@/components/icons";
import { productAPI } from "@/lib/api";
import { useCart } from "@/contexts/CartContext";
import { Product } from "@/types";
import { addToast } from "@heroui/toast";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = parseInt(params.id as string);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const { addToCart } = useCart();

  useEffect(() => {
    if (productId) {
      loadProduct();
    }
  }, [productId]);

  const loadProduct = async () => {
    setLoading(true);
    try {
      const response = await productAPI.getById(productId);
      if (response.success && response.data) {
        setProduct(response.data as Product);
      } else {
        console.error("Ürün bulunamadı:", response.message);
        addToast({
          title: "Ürün bulunamadı",
          description: "Aradığınız ürün mevcut değil.",
          color: "danger",
          timeout: 3000,
        });
        router.push('/products');
      }
    } catch (error) {
      console.error("Ürün yüklenirken hata:", error);
      addToast({
        title: "Bir hata oluştu",
        description: "Ürün bilgileri yüklenirken hata oluştu.",
        color: "danger",
        timeout: 3000,
      });
      router.push('/products');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;

    setIsAddingToCart(true);
    try {
      await addToCart(product, quantity);
      addToast({
        title: "Sepete eklendi!",
        description: `${product.name} sepetinize ${quantity} adet eklendi.`,
        color: "success",
        timeout: 3000,
      });
    } catch (error) {
      console.error("Sepete ekleme hatası:", error);
      addToast({
        title: "Hata",
        description: "Ürün sepete eklenirken bir hata oluştu.",
        color: "danger",
        timeout: 3000,
      });
    } finally {
      setIsAddingToCart(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(price);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Ürün bulunamadı</h1>
          <Button onClick={() => router.push('/products')}>
            Ürünlere Geri Dön
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Geri Dön Butonu */}
      <div className="mb-6">
        <Button
          variant="flat"
          startContent={<ArrowLeftIcon className="w-4 h-4" />}
          onClick={() => router.back()}
        >
          Geri Dön
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
        {/* Ürün Görseli */}
        <div className="space-y-4">
          <Card>
            <CardBody className="p-4">
              {product.imageUrl ? (
                <Image
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-96 object-cover rounded-lg"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-96 bg-default-200 rounded-lg flex items-center justify-center">
                  <span className="text-default-500 text-lg">Resim Yok</span>
                </div>
              )}
            </CardBody>
          </Card>
        </div>

        {/* Ürün Bilgileri */}
        <div className="space-y-6">
          <div>
            <Chip size="sm" color="secondary" variant="flat" className="mb-2">
              {product.categoryName}
            </Chip>
            <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
            <p className="text-default-600 text-lg leading-relaxed">
              {product.description}
            </p>
          </div>

          <Divider />

          {/* Fiyat ve Stok */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold text-primary">
                {formatPrice(product.price)}
              </span>
              <Chip 
                size="lg" 
                color={product.stock > 0 ? "success" : "danger"}
                variant="flat"
              >
                {product.stock > 0 ? `${product.stock} adet stokta` : "Stokta yok"}
              </Chip>
            </div>

            {/* Miktar Seçimi */}
            {product.stock > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <span className="font-medium">Miktar:</span>
                  <div className="flex items-center gap-2">
                    <Button
                      isIconOnly
                      variant="flat"
                      size="sm"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      isDisabled={quantity <= 1}
                    >
                      -
                    </Button>
                    <span className="w-12 text-center font-semibold text-lg">
                      {quantity}
                    </span>
                    <Button
                      isIconOnly
                      variant="flat"
                      size="sm"
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      isDisabled={quantity >= product.stock}
                    >
                      +
                    </Button>
                  </div>
                </div>

                {/* Toplam Fiyat */}
                <div className="flex items-center justify-between p-4 bg-default-50 rounded-lg">
                  <span className="font-medium">Toplam:</span>
                  <span className="text-2xl font-bold text-primary">
                    {formatPrice(product.price * quantity)}
                  </span>
                </div>
              </div>
            )}
          </div>

          <Divider />

          {/* Aksiyon Butonları */}
          <div className="space-y-3">
            <Button
              color="primary"
              size="lg"
              className="w-full"
              startContent={<ShoppingCartIcon className="w-5 h-5" />}
              onClick={handleAddToCart}
              isLoading={isAddingToCart}
              isDisabled={product.stock === 0}
            >
              {product.stock === 0 ? "Stokta Yok" : "Sepete Ekle"}
            </Button>

            <Button
              variant="bordered"
              size="lg"
              className="w-full"
              startContent={<HeartIcon className="w-5 h-5" />}
            >
              Favorilere Ekle
            </Button>
          </div>

          {/* Ürün Özellikleri */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Ürün Özellikleri</h3>
            </CardHeader>
            <CardBody className="space-y-2">
              <div className="flex justify-between">
                <span className="text-default-600">Kategori:</span>
                <span className="font-medium">{product.categoryName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-default-600">Stok Durumu:</span>
                <span className={`font-medium ${product.stock > 0 ? 'text-success' : 'text-danger'}`}>
                  {product.stock > 0 ? `${product.stock} adet` : "Stokta yok"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-default-600">Ürün ID:</span>
                <span className="font-medium">#{product.id}</span>
              </div>
              {product.createdAt && (
                <div className="flex justify-between">
                  <span className="text-default-600">Eklenme Tarihi:</span>
                  <span className="font-medium">
                    {new Date(product.createdAt).toLocaleDateString('tr-TR')}
                  </span>
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
