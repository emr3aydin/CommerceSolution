"use client";

import {
  Card,
  CardBody,
  CardFooter,
  Image,
  Button,
  Chip,
} from "@heroui/react";
import { ShoppingCart, Heart, Eye } from "lucide-react";
import { Product } from "@/types";
import { useCartStore } from "@/store/cart";
import { useAuthStore } from "@/store/auth";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart, isLoading } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.error("Sepete ürün eklemek için giriş yapmalısınız");
      router.push("/auth/login");
      return;
    }

    try {
      await addToCart({ productId: product.id, quantity: 1 });
      toast.success("Ürün sepete eklendi!");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Ürün sepete eklenirken bir hata oluştu");
    }
  };

  const handleViewProduct = () => {
    router.push(`/products/${product.id}`);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(price);
  };

  return (
    <Card className="w-full max-w-[300px] hover:shadow-lg transition-shadow duration-300">
      <CardBody className="p-0">
        <div className="relative">
          <Image
            shadow="sm"
            radius="lg"
            width="100%"
            alt={product.name}
            className="w-full object-cover h-[200px]"
            src={product.imageUrl || "/api/placeholder/300/200"}
          />
          
          {/* Stok durumu */}
          <div className="absolute top-2 left-2">
            {product.stock > 0 ? (
              <Chip color="success" size="sm" variant="solid">
                Stokta
              </Chip>
            ) : (
              <Chip color="danger" size="sm" variant="solid">
                Tükendi
              </Chip>
            )}
          </div>

          {/* Favori butonu */}
          <Button
            isIconOnly
            className="absolute top-2 right-2 bg-white/80 backdrop-blur-sm"
            size="sm"
            variant="light"
          >
            <Heart size={16} />
          </Button>
        </div>

        <div className="p-4">
          <div className="mb-2">
            <h4 className="font-semibold text-large line-clamp-2 h-12">
              {product.name}
            </h4>
          </div>
          
          {product.description && (
            <p className="text-small text-default-500 line-clamp-2 mb-2">
              {product.description}
            </p>
          )}

          <div className="flex items-center justify-between mb-3">
            <span className="text-xl font-bold text-primary">
              {formatPrice(product.price)}
            </span>
            {product.stock > 0 && (
              <span className="text-small text-default-500">
                {product.stock} adet
              </span>
            )}
          </div>
        </div>
      </CardBody>

      <CardFooter className="pt-0 px-4 pb-4">
        <div className="flex gap-2 w-full">
          <Button
            size="sm"
            variant="bordered"
            onPress={handleViewProduct}
            startContent={<Eye size={16} />}
            className="flex-1"
          >
            İncele
          </Button>
          <Button
            size="sm"
            color="primary"
            onPress={handleAddToCart}
            startContent={<ShoppingCart size={16} />}
            isLoading={isLoading}
            isDisabled={product.stock === 0}
            className="flex-1"
          >
            Sepete Ekle
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
