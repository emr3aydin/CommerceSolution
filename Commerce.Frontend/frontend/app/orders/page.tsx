"use client";

import { useState, useEffect } from "react";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";
import { Divider } from "@heroui/divider";
import { Select, SelectItem } from "@heroui/select";
import { Pagination } from "@heroui/pagination";
import { Spinner } from "@heroui/spinner";
import { EyeFilledIcon } from "@/components/icons";
import { orderAPI } from "@/lib/api";

interface OrderItem {
  id: number;
  productId: number;
  productName: string;
  productImageUrl: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface Order {
  id: number;
  userId: string;
  orderDate: string;
  status: string;
  totalAmount: number;
  deliveryAddress: string;
  paymentMethod: string;
  orderItems: OrderItem[];
  approvedBy?: string;
  approvedAt?: string;
}

const statusColors = {
  "Pending": "warning",
  "Processing": "primary", 
  "Shipped": "secondary",
  "Delivered": "success",
  "Cancelled": "danger"
} as const;

const statusTexts = {
  "Pending": "Beklemede",
  "Processing": "İşleniyor",
  "Shipped": "Kargoda", 
  "Delivered": "Teslim Edildi",
  "Cancelled": "İptal Edildi"
} as const;

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const pageSize = 10;

  useEffect(() => {
    loadOrders();
  }, [currentPage, selectedStatus]);

  const loadOrders = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const params = {
        pageNumber: currentPage,
        pageSize: pageSize,
        ...(selectedStatus !== "all" && { status: selectedStatus })
      };

      const response = await orderAPI.getAll(params);
      
      if (response.success && response.data) {
        setOrders(response.data.data || []);
        setTotalPages(response.data.totalPages || 1);
      } else {
        setError(response.message || "Siparişler yüklenirken bir hata oluştu.");
      }
    } catch (error: any) {
      console.error("Orders loading error:", error);
      setError("Siparişler yüklenirken bir hata oluştu.");
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(price);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-96">
          <Spinner size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Siparişlerim</h1>
      </div>

      {/* Filtreler */}
      <div className="mb-6">
        <Select
          value={selectedStatus}
          onChange={(e) => {
            setSelectedStatus(e.target.value);
            setCurrentPage(1);
          }}
          placeholder="Sipariş Durumu"
          className="max-w-xs"
        >
          <SelectItem key="all" value="all">Tümü</SelectItem>
          <SelectItem key="Pending" value="Pending">Beklemede</SelectItem>
          <SelectItem key="Processing" value="Processing">İşleniyor</SelectItem>
          <SelectItem key="Shipped" value="Shipped">Kargoda</SelectItem>
          <SelectItem key="Delivered" value="Delivered">Teslim Edildi</SelectItem>
          <SelectItem key="Cancelled" value="Cancelled">İptal Edildi</SelectItem>
        </Select>
      </div>

      {error && (
        <Card className="mb-6 border-danger">
          <CardBody>
            <p className="text-danger">{error}</p>
          </CardBody>
        </Card>
      )}

      {/* Siparişler Listesi */}
      <div className="space-y-4">
        {orders.length === 0 ? (
          <Card>
            <CardBody className="text-center py-12">
              <p className="text-gray-500">Henüz siparişiniz bulunmuyor.</p>
            </CardBody>
          </Card>
        ) : (
          orders.map((order) => (
            <Card key={order.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold">Sipariş #{order.id}</h3>
                  <p className="text-gray-600">{formatDate(order.orderDate)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Chip 
                    color={statusColors[order.status as keyof typeof statusColors] || "default"}
                    variant="flat"
                  >
                    {statusTexts[order.status as keyof typeof statusTexts] || order.status}
                  </Chip>
                  <Button
                    variant="light"
                    size="sm"
                    startContent={<EyeFilledIcon className="w-4 h-4" />}
                    onClick={() => setSelectedOrder(order)}
                  >
                    Detay
                  </Button>
                </div>
              </CardHeader>
              <Divider />
              <CardBody>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Toplam Tutar</p>
                    <p className="font-semibold text-lg">{formatPrice(order.totalAmount)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Ödeme Yöntemi</p>
                    <p className="font-medium">{order.paymentMethod}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Teslimat Adresi</p>
                    <p className="font-medium truncate">{order.deliveryAddress}</p>
                  </div>
                </div>
                
                {order.orderItems && order.orderItems.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-600 mb-2">Ürünler ({order.orderItems.length} adet)</p>
                    <div className="flex flex-wrap gap-2">
                      {order.orderItems.slice(0, 3).map((item) => (
                        <div key={item.id} className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {item.productName} x{item.quantity}
                        </div>
                      ))}
                      {order.orderItems.length > 3 && (
                        <div className="text-xs bg-gray-100 px-2 py-1 rounded">
                          +{order.orderItems.length - 3} ürün daha
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardBody>
            </Card>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-8">
          <Pagination
            total={totalPages}
            page={currentPage}
            onChange={setCurrentPage}
            showControls
          />
        </div>
      )}

      {/* Sipariş Detay Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-4xl w-full max-h-[80vh] overflow-y-auto">
            <CardHeader className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Sipariş Detayı #{selectedOrder.id}</h2>
              <Button
                variant="light"
                onClick={() => setSelectedOrder(null)}
              >
                Kapat
              </Button>
            </CardHeader>
            <Divider />
            <CardBody className="space-y-6">
              {/* Sipariş Bilgileri */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-3">Sipariş Bilgileri</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Sipariş Tarihi:</span>
                      <span>{formatDate(selectedOrder.orderDate)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Durum:</span>
                      <Chip 
                        color={statusColors[selectedOrder.status as keyof typeof statusColors] || "default"}
                        variant="flat"
                        size="sm"
                      >
                        {statusTexts[selectedOrder.status as keyof typeof statusTexts] || selectedOrder.status}
                      </Chip>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Toplam Tutar:</span>
                      <span className="font-semibold">{formatPrice(selectedOrder.totalAmount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Ödeme Yöntemi:</span>
                      <span>{selectedOrder.paymentMethod}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-3">Teslimat Bilgileri</h3>
                  <div className="space-y-2">
                    <div>
                      <span className="text-gray-600">Adres:</span>
                      <p className="mt-1">{selectedOrder.deliveryAddress}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sipariş Ürünleri */}
              <div>
                <h3 className="font-semibold mb-3">Sipariş Ürünleri</h3>
                <div className="space-y-3">
                  {selectedOrder.orderItems?.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 p-3 border rounded-lg">
                      <img
                        src={item.productImageUrl || "/placeholder.jpg"}
                        alt={item.productName}
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium">{item.productName}</h4>
                        <p className="text-gray-600">Birim Fiyat: {formatPrice(item.unitPrice)}</p>
                        <p className="text-gray-600">Adet: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatPrice(item.totalPrice)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      )}
    </div>
  );
}
