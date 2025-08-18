"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardBody, CardHeader } from '@heroui/card';
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from '@heroui/table';
import { Button } from '@heroui/button';
import { Chip } from '@heroui/chip';
import { Select, SelectItem } from '@heroui/select';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from '@heroui/modal';
import { Divider } from '@heroui/divider';
import { orderAPI } from '@/lib/api';
import { addToast } from '@heroui/toast';
import { BackendOrder, BackendOrderItem } from '@/types';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<BackendOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<BackendOrder | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    loadOrders();
  }, [statusFilter]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const params = statusFilter ? { status: statusFilter } : undefined;
      const response = await orderAPI.getAll(params);
      console.log('Orders API response:', response);
      
      if (response.success && response.data) {
        setOrders(response.data as BackendOrder[]);
      } else {
        console.error('Failed to load orders:', response.message);
        addToast({
          title: "Hata",
          description: "Siparişler yüklenirken bir hata oluştu!",
          color: "danger",
          timeout: 3000,
          shouldShowTimeoutProgress: true,
        });
      }
    } catch (error) {
      console.error('Load orders error:', error);
      addToast({
        title: "Hata",
        description: "Siparişler yüklenirken bir hata oluştu!",
        color: "danger",
        timeout: 3000,
        shouldShowTimeoutProgress: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: number, newStatus: string) => {
    try {
      setUpdatingStatus(true);
      const response = await orderAPI.updateStatus(orderId, { status: newStatus });
      
      if (response.success) {
        addToast({
          title: "Başarılı",
          description: `Sipariş durumu "${newStatus}" olarak güncellendi!`,
          color: "success",
          timeout: 3000,
          shouldShowTimeoutProgress: true,
        });
        
        // Siparişleri yeniden yükle
        await loadOrders();
        onClose();
      } else {
        throw new Error(response.message || 'Durum güncellenemedi');
      }
    } catch (error: any) {
      console.error('Update status error:', error);
      addToast({
        title: "Hata",
        description: error.message || "Sipariş durumu güncellenirken bir hata oluştu!",
        color: "danger",
        timeout: 3000,
        shouldShowTimeoutProgress: true,
      });
    } finally {
      setUpdatingStatus(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'warning';
      case 'confirmed':
        return 'primary';
      case 'shipped':
        return 'success';
      case 'delivered':
        return 'success';
      case 'cancelled':
        return 'danger';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'Beklemede';
      case 'confirmed':
        return 'Onaylandı';
      case 'shipped':
        return 'Kargoda';
      case 'delivered':
        return 'Teslim Edildi';
      case 'cancelled':
        return 'İptal Edildi';
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
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

  const openOrderDetails = (order: BackendOrder) => {
    setSelectedOrder(order);
    onOpen();
  };

  const statusOptions = [
    { key: '', label: 'Tüm Durumlar' },
    { key: 'Pending', label: 'Beklemede' },
    { key: 'Confirmed', label: 'Onaylandı' },
    { key: 'Shipped', label: 'Kargoda' },
    { key: 'Delivered', label: 'Teslim Edildi' },
    { key: 'Cancelled', label: 'İptal Edildi' }
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl">Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Sipariş Yönetimi</h1>
        <div className="flex gap-4">
          <Select
            label="Durum Filtresi"
            placeholder="Durum seçin"
            className="w-48"
            selectedKeys={statusFilter ? [statusFilter] : []}
            onSelectionChange={(keys) => {
              const selected = Array.from(keys)[0] as string;
              setStatusFilter(selected || '');
            }}
          >
            {statusOptions.map((option) => (
              <SelectItem key={option.key}>
                {option.label}
              </SelectItem>
            ))}
          </Select>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-0">
          <h2 className="text-xl font-semibold">Siparişler ({orders.length})</h2>
        </CardHeader>
        <CardBody>
          <Table aria-label="Siparişler tablosu">
            <TableHeader>
              <TableColumn>Sipariş No</TableColumn>
              <TableColumn>Müşteri</TableColumn>
              <TableColumn>Tarih</TableColumn>
              <TableColumn>Tutar</TableColumn>
              <TableColumn>Durum</TableColumn>
              <TableColumn>İşlemler</TableColumn>
            </TableHeader>
            <TableBody emptyContent="Sipariş bulunamadı">
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{order.orderNumber}</div>
                      <div className="text-sm text-gray-500">#{order.id}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{order.userName}</div>
                      <div className="text-sm text-gray-500">{order.orderItems.length} ürün</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {formatDate(order.orderDate)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-lg">
                      {formatPrice(order.totalAmount)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      color={getStatusColor(order.status)}
                      variant="flat"
                      size="sm"
                    >
                      {getStatusText(order.status)}
                    </Chip>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="flat"
                        onPress={() => openOrderDetails(order)}
                      >
                        Detay
                      </Button>
                      {order.status === 'Pending' && (
                        <Button
                          size="sm"
                          color="success"
                          onPress={() => updateOrderStatus(order.id, 'Confirmed')}
                          isLoading={updatingStatus}
                        >
                          Onayla
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardBody>
      </Card>

      {/* Sipariş Detay Modal */}
      <Modal 
        isOpen={isOpen} 
        onClose={onClose}
        size="3xl"
        scrollBehavior="inside"
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            <h3>Sipariş Detayları</h3>
            {selectedOrder && (
              <div className="text-sm text-gray-500">
                {selectedOrder.orderNumber} - {formatDate(selectedOrder.orderDate)}
              </div>
            )}
          </ModalHeader>
          <ModalBody>
            {selectedOrder && (
              <div className="space-y-6">
                {/* Sipariş Bilgileri */}
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardBody>
                      <h4 className="font-semibold mb-2">Sipariş Bilgileri</h4>
                      <div className="space-y-2 text-sm">
                        <div><strong>Sipariş No:</strong> {selectedOrder.orderNumber}</div>
                        <div><strong>Tarih:</strong> {formatDate(selectedOrder.orderDate)}</div>
                        <div><strong>Durum:</strong> 
                          <Chip 
                            color={getStatusColor(selectedOrder.status)}
                            variant="flat"
                            size="sm"
                            className="ml-2"
                          >
                            {getStatusText(selectedOrder.status)}
                          </Chip>
                        </div>
                        <div><strong>Toplam Tutar:</strong> {formatPrice(selectedOrder.totalAmount)}</div>
                      </div>
                    </CardBody>
                  </Card>

                  <Card>
                    <CardBody>
                      <h4 className="font-semibold mb-2">Müşteri Bilgileri</h4>
                      <div className="space-y-2 text-sm">
                        <div><strong>Ad Soyad:</strong> {selectedOrder.userName}</div>
                        <div><strong>Teslimat Adresi:</strong> {selectedOrder.shippingAddress}</div>
                      </div>
                    </CardBody>
                  </Card>
                </div>

                <Divider />

                {/* Sipariş Ürünleri */}
                <div>
                  <h4 className="font-semibold mb-4">Sipariş Ürünleri</h4>
                  <Table aria-label="Sipariş ürünleri">
                    <TableHeader>
                      <TableColumn>Ürün</TableColumn>
                      <TableColumn>Adet</TableColumn>
                      <TableColumn>Birim Fiyat</TableColumn>
                      <TableColumn>Toplam</TableColumn>
                    </TableHeader>
                    <TableBody>
                      {selectedOrder.orderItems.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>{item.productName}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>{formatPrice(item.unitPrice)}</TableCell>
                          <TableCell className="font-medium">{formatPrice(item.totalPrice)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Durum Güncelleme */}
                {selectedOrder.status !== 'Delivered' && selectedOrder.status !== 'Cancelled' && (
                  <div>
                    <Divider className="mb-4" />
                    <h4 className="font-semibold mb-4">Durum Güncelle</h4>
                    <div className="flex gap-2">
                      {selectedOrder.status === 'Pending' && (
                        <>
                          <Button
                            color="success"
                            onPress={() => updateOrderStatus(selectedOrder.id, 'Confirmed')}
                            isLoading={updatingStatus}
                          >
                            Onayla
                          </Button>
                          <Button
                            color="danger"
                            variant="flat"
                            onPress={() => updateOrderStatus(selectedOrder.id, 'Cancelled')}
                            isLoading={updatingStatus}
                          >
                            İptal Et
                          </Button>
                        </>
                      )}
                      {selectedOrder.status === 'Confirmed' && (
                        <Button
                          color="primary"
                          onPress={() => updateOrderStatus(selectedOrder.id, 'Shipped')}
                          isLoading={updatingStatus}
                        >
                          Kargoya Ver
                        </Button>
                      )}
                      {selectedOrder.status === 'Shipped' && (
                        <Button
                          color="success"
                          onPress={() => updateOrderStatus(selectedOrder.id, 'Delivered')}
                          isLoading={updatingStatus}
                        >
                          Teslim Edildi
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button color="danger" variant="light" onPress={onClose}>
              Kapat
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
