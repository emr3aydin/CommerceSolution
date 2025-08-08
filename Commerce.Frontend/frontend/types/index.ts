import { SVGProps } from "react";

export type IconSvgProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

// E-ticaret type tanımlamaları

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  categoryId: number;
  categoryName?: string;
  isActive: boolean;
  imageUrl?: string;
  sku?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
  imageUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
  productCount: number;
}

export interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  isActive: boolean;
}

export interface CartItem {
  id: number;
  productId: number;
  product: Product;
  quantity: number;
  price: number;
}

export interface Cart {
  id: number;
  userId: string;
  items: CartItem[];
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
}

// Backend'den gelen Cart yapısı
export interface BackendCart {
  id: number;
  userId: string;
  cartItems: BackendCartItem[];
  totalAmount: number;
  totalItems: number;
}

export interface BackendCartItem {
  id: number;
  productId: number;
  productName: string;
  productImageUrl: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
}

export interface Order {
  id: number;
  userId: string;
  totalAmount: number;
  status: string;
  orderDate: string;
  items: OrderItem[];
}

// Backend'den gelen Order yapısı
export interface BackendOrder {
  id: number;
  orderNumber: string;
  orderDate: string;
  totalAmount: number;
  shippingAddress: string;
  status: string;
  createdAt: string;
  approvedAt: string;
  userId: string;
  userName: string;
  orderItems: BackendOrderItem[];
}

export interface BackendOrderItem {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface OrderItem {
  id: number;
  productId: number;
  product: Product;
  quantity: number;
  price: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

// API DTO Interfaces
export interface RegisterDto {
  email: string;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  phoneNumber: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface CreateAdminDto {
  email: string;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  phoneNumber: string;
}

export interface AddToCartRequest {
  productId: number;
  quantity: number;
}

export interface CreateCategoryCommand {
  name: string;
  description: string;
  imageUrl: string;
  isActive: boolean;
}

export interface UpdateCategoryCommand {
  id: number;
  name: string;
  description: string;
  imageUrl: string;
  isActive: boolean;
}

export interface CreateProductCommand {
  name: string;
  description: string;
  price: number;
  stock: number;
  imageUrl: string;
  sku: string;
  categoryId: number;
  isActive: boolean;
}

export interface UpdateProductCommand {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  imageUrl: string;
  sku: string;
  categoryId: number;
  isActive: boolean;
}

export interface CreateOrderCommand {
  userId: string;
  shippingAddress: string;
  orderItems: CreateOrderItemCommand[];
}

export interface CreateOrderItemCommand {
  productId: number;
  quantity: number;
}

export interface UpdateOrderStatusRequest {
  status: string;
}

// Paginated responses
export interface PaginatedProductsResponse {
  data: Product[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

// Log interface'leri
export interface Log {
  id: number;
  message: string;
  level: string;
  timestamp: string;
  exception?: string;
  properties?: string;
}

export interface LogStats {
  totalLogs: number;
  errorLogs: number;
  todayLogs: number;
  thisWeekLogs: number;
  thisMonthLogs: number;
  levelDistribution: { level: string; count: number }[];
}

export interface PaginatedLogsResponse {
  data: Log[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}
