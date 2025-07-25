"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import { Chip } from "@heroui/chip";
import { SearchIcon } from "@/components/icons";
import { productAPI, categoryAPI } from "@/lib/api";
import { Product, Category } from "@/types";

interface User {
  id: string;
  email: string;
  userName: string;
  firstName: string;
  lastName: string;
  roles: string[];
}

export default function AdminProductsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 12;
  const router = useRouter();

  // Form states
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    imageUrl: "",
    sku: "",
    categoryId: "",
    isActive: true
  });

  useEffect(() => {
    checkAuth();
    loadCategories();
  }, []);

  useEffect(() => {
    if (user) {
      loadProducts();
    }
  }, [currentPage, selectedCategory, searchTerm, user]);

  const checkAuth = () => {
    if (typeof window !== 'undefined') {
      const userInfo = localStorage.getItem('userInfo');
      if (userInfo) {
        const parsedUser = JSON.parse(userInfo);
        if (parsedUser.roles?.includes('Admin')) {
          setUser(parsedUser);
        } else {
          router.push('/');
        }
      } else {
        router.push('/auth/login');
      }
    }
  };

  const loadCategories = async () => {
    try {
      const response = await categoryAPI.getAll() as Category[];
      setCategories(response);
    } catch (error) {
      console.error("Kategoriler yüklenirken hata:", error);
    }
  };

  const loadProducts = async () => {
    setLoading(true);
    try {
      const params = {
        pageNumber: currentPage,
        pageSize: pageSize,
        ...(searchTerm && { searchTerm }),
        ...(selectedCategory && selectedCategory !== "all" && { categoryId: parseInt(selectedCategory) })
      };

      const response = await productAPI.getAll(params) as any;
      
      if (response.items) {
        setProducts(response.items);
        setTotalPages(Math.ceil(response.totalCount / pageSize));
      } else if (Array.isArray(response)) {
        setProducts(response);
        setTotalPages(1);
      } else {
        setProducts([]);
        setTotalPages(1);
      }
    } catch (error) {
      console.error("Ürünler yüklenirken hata:", error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProduct = async () => {
    try {
      if (!formData.name || !formData.price || !formData.stock || !formData.categoryId) {
        alert("Lütfen tüm zorunlu alanları doldurun.");
        return;
      }

      const productData = {
        name: formData.name,
        description: formData.description || "",
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        imageUrl: formData.imageUrl || "",
        sku: formData.sku || `SKU${Date.now()}`,
        categoryId: parseInt(formData.categoryId),
        isActive: formData.isActive
      };

      await productAPI.create(productData);
      setShowCreateForm(false);
      resetForm();
      loadProducts();
      alert("Ürün başarıyla oluşturuldu!");
    } catch (error) {
      console.error("Ürün oluşturulurken hata:", error);
      alert("Ürün oluşturulurken bir hata oluştu.");
    }
  };

  const handleUpdateProduct = async () => {
    try {
      if (!editingProduct || !formData.name || !formData.price || !formData.stock || !formData.categoryId) {
        alert("Lütfen tüm zorunlu alanları doldurun.");
        return;
      }

      const productData = {
        id: editingProduct.id,
        name: formData.name,
        description: formData.description || "",
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        imageUrl: formData.imageUrl || "",
        sku: formData.sku || `SKU${Date.now()}`,
        categoryId: parseInt(formData.categoryId),
        isActive: formData.isActive
      };

      await productAPI.update(editingProduct.id, productData);
      setEditingProduct(null);
      resetForm();
      loadProducts();
      alert("Ürün başarıyla güncellendi!");
    } catch (error) {
      console.error("Ürün güncellenirken hata:", error);
      alert("Ürün güncellenirken bir hata oluştu.");
    }
  };

  const handleDeleteProduct = async (productId: number) => {
    if (confirm("Bu ürünü silmek istediğinizden emin misiniz?")) {
      try {
        await productAPI.delete(productId);
        loadProducts();
        alert("Ürün başarıyla silindi!");
      } catch (error) {
        console.error("Ürün silinirken hata:", error);
        alert("Ürün silinirken bir hata oluştu.");
      }
    }
  };

  const openEditForm = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || "",
      price: product.price.toString(),
      stock: product.stock.toString(),
      imageUrl: product.imageUrl || "",
      sku: "", // SKU backend'de otomatik olarak oluşturuluyor
      categoryId: product.categoryId.toString(),
      isActive: product.isActive
    });
    setShowCreateForm(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      stock: "",
      imageUrl: "",
      sku: "",
      categoryId: "",
      isActive: true
    });
    setEditingProduct(null);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(price);
  };

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (loading && products.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Ürün Yönetimi</h1>
        <Button
          color="primary"
          onPress={() => {
            resetForm();
            setShowCreateForm(true);
          }}
        >
          Yeni Ürün
        </Button>
      </div>

      {/* Filtreler */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Ürün ara..."
            startContent={<SearchIcon className="w-4 h-4" />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
        </div>
        <div className="w-full lg:w-64">
          <Select
            placeholder="Kategori seçin"
            selectedKeys={selectedCategory ? [selectedCategory] : []}
            onSelectionChange={(keys) => {
              const selected = Array.from(keys)[0] as string;
              setSelectedCategory(selected);
            }}
          >
            <SelectItem key="all">
              Tüm Kategoriler
            </SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id.toString()}>
                {category.name}
              </SelectItem>
            ))}
          </Select>
        </div>
      </div>

      {/* Form */}
      {showCreateForm && (
        <Card className="p-6">
          <CardHeader>
            <h2 className="text-xl font-bold">
              {editingProduct ? "Ürün Düzenle" : "Yeni Ürün Ekle"}
            </h2>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Ürün Adı"
                placeholder="Ürün adını girin"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                isRequired
              />
              <Select
                label="Kategori"
                placeholder="Kategori seçin"
                selectedKeys={formData.categoryId ? [formData.categoryId] : []}
                onSelectionChange={(keys) => {
                  const selected = Array.from(keys)[0] as string;
                  setFormData({ ...formData, categoryId: selected });
                }}
                isRequired
              >
                {categories.map((category) => (
                  <SelectItem key={category.id.toString()}>
                    {category.name}
                  </SelectItem>
                ))}
              </Select>
              <Input
                label="Fiyat"
                placeholder="0.00"
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                isRequired
              />
              <Input
                label="Stok"
                placeholder="0"
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                isRequired
              />
              <Input
                label="Resim URL"
                placeholder="https://example.com/image.jpg"
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                className="md:col-span-2"
              />
              <div className="md:col-span-2">
                <Input
                  label="Açıklama"
                  placeholder="Ürün açıklamasını girin"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
            </div>
            <div className="flex gap-4 mt-6">
              <Button
                color="primary"
                onPress={editingProduct ? handleUpdateProduct : handleCreateProduct}
              >
                {editingProduct ? "Güncelle" : "Oluştur"}
              </Button>
              <Button
                variant="flat"
                onPress={() => {
                  setShowCreateForm(false);
                  resetForm();
                }}
              >
                İptal
              </Button>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Ürün Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => (
          <Card key={product.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <div className="w-full">
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-full h-48 bg-default-200 rounded-lg flex items-center justify-center">
                    <span className="text-default-500">Resim Yok</span>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardBody className="pt-0">
              <div className="space-y-2">
                <h3 className="font-semibold text-lg line-clamp-2">{product.name}</h3>
                <p className="text-small text-default-500 line-clamp-2">
                  {product.description}
                </p>
                
                <div className="flex justify-between items-center">
                  <Chip size="sm" color="secondary" variant="flat">
                    {product.categoryName}
                  </Chip>
                  <Chip size="sm" color={product.stock > 0 ? "success" : "danger"}>
                    {product.stock > 0 ? `${product.stock} adet` : "Tükendi"}
                  </Chip>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-xl font-bold text-primary">
                    {formatPrice(product.price)}
                  </span>
                  <Chip size="sm" color={product.isActive ? "success" : "warning"}>
                    {product.isActive ? "Aktif" : "Pasif"}
                  </Chip>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    color="primary"
                    variant="flat"
                    size="sm"
                    onPress={() => openEditForm(product)}
                    className="flex-1"
                  >
                    Düzenle
                  </Button>
                  <Button
                    color="danger"
                    variant="flat"
                    size="sm"
                    onPress={() => handleDeleteProduct(product.id)}
                    className="flex-1"
                  >
                    Sil
                  </Button>
                </div>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Navigation */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 pt-6">
          <Button
            variant="bordered"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            isDisabled={currentPage === 1}
          >
            Önceki
          </Button>
          <Chip variant="solid" color="primary">
            {currentPage} / {totalPages}
          </Chip>
          <Button
            variant="bordered"
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            isDisabled={currentPage === totalPages}
          >
            Sonraki
          </Button>
        </div>
      )}

      {products.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-lg text-default-500">Ürün bulunamadı.</p>
        </div>
      )}
    </div>
  );
}
