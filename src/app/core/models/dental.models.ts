// ==============================================================================
// DENTAL CLINIC MANAGEMENT SYSTEM - CORE MODELS & TYPES
// ==============================================================================

// ------------------------------------------------------------------------------
// 1. ENUMS & CONSTANTS
// ------------------------------------------------------------------------------

export enum RoleType {
  ROLE_ADMIN = 'ROLE_ADMIN',
  ROLE_DOCTOR = 'ROLE_DOCTOR',
  ROLE_PATIENT = 'ROLE_PATIENT'
}

export type UserRole = 'ADMIN' | 'DOCTOR' | 'PATIENT' | 'ROLE_ADMIN' | 'ROLE_DOCTOR' | 'ROLE_PATIENT';

export enum AppointmentStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export enum TreatmentStageStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED'
}

export enum PaymentMethod {
  CASH = 'CASH',
  BANK_TRANSFER = 'BANK_TRANSFER',
  CREDIT_CARD = 'CREDIT_CARD',
  VNPAY = 'VNPAY',
  MOMO = 'MOMO'
}

// ------------------------------------------------------------------------------
// 2. COMMON HTTP & PAGINATION WRAPPERS
// ------------------------------------------------------------------------------

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp?: string;
}

export interface PageResponse<T> {
  items: T[];
  pageNo: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface PageParams {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc' | 'ASC' | 'DESC';
}

// ------------------------------------------------------------------------------
// 3. ENTITIES & DTO RESPONSES
// ------------------------------------------------------------------------------

export interface Role {
  id: number;
  name: RoleType | string;
}

export interface User {
  id: number;
  fullname: string;
  phone: string;
  email: string;
  birthDate?: string;
  address?: string;
  avatar?: string;
  role: Role;
  createdAt?: string;
}

export interface Doctor {
  id: number;
  userId: number;
  specialization: string;
  experienceYears: number;
  user?: User;
}

export interface DentalService {
  id: number;
  name: string;
  description?: string;
  price: number;
  image?: string;
}

export interface Appointment {
  id: number;
  userId: number;
  user?: User;
  doctorId: number;
  doctor?: Doctor;
  serviceId: number;
  service?: DentalService;
  appointmentDate: string; // ISO yyyy-MM-dd HH:mm:ss
  status: AppointmentStatus;
  note?: string;
  stageName?: string;
  createdAt?: string;
}

export interface TreatmentRoute {
  id: number;
  title: string;
  description?: string;
  createdAt?: string;
}

export interface TreatmentStage {
  id: number;
  treatmentRouteId: number;
  stageName: string;
  sequenceOrder: number;
  status: TreatmentStageStatus;
  appointmentDate?: string;
  note?: string;
  createdAt?: string;
  updatedAt?: string;
  cost: number;
  delay: number;
}

export interface MedicalRecord {
  id: number;
  userId: number;
  user?: User;
  doctorId: number;
  doctor?: Doctor;
  serviceId: number;
  service?: DentalService;
  treatmentRouteId?: number;
  treatmentRoute?: TreatmentRoute;
  diagnosis: string;
  createdAt?: string;
}

export interface Payment {
  id: number;
  userId: number;
  user?: User;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  createdAt?: string;
  treatmentStageId?: number;
  treatmentStage?: TreatmentStage;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  user: User;
}

// ------------------------------------------------------------------------------
// 4. REQUEST PAYLOADS (CREATE / UPDATE / FILTER)
// ------------------------------------------------------------------------------

export interface LoginRequest {
  username: string; // email or phone
  password: string;
}

export interface RegisterRequest {
  fullname: string;
  phone: string;
  email: string;
  password: string;
  birthDate?: string;
  address?: string;
  avatar?: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface UserCreateRequest {
  fullname: string;
  phone: string;
  email: string;
  password: string;
  birthDate?: string;
  address?: string;
  avatar?: string;
  roleId: number;
}

export interface UserUpdateRequest {
  fullname?: string;
  phone?: string;
  email?: string;
  birthDate?: string;
  address?: string;
  avatar?: string;
  roleId?: number;
}

export interface RoleRequest {
  name: string;
}

export interface DoctorCreateRequest {
  userId: number;
  specialization: string;
  experienceYears: number;
}

export interface DoctorUpdateRequest {
  specialization?: string;
  experienceYears?: number;
}

export interface MedicalServiceRequest {
  name: string;
  description?: string;
  price: number;
  image?: string;
}

export interface AppointmentCreateRequest {
  userId: number;
  doctorId: number;
  serviceId: number;
  appointmentDate: string; // format: yyyy-MM-dd HH:mm:ss
  note?: string;
  stageName?: string;
}

export interface AppointmentUpdateRequest {
  doctorId?: number;
  serviceId?: number;
  appointmentDate?: string;
  note?: string;
  stageName?: string;
}

export interface AppointmentStatusUpdateRequest {
  status: AppointmentStatus;
  note?: string;
}

export interface AppointmentFilterParams extends PageParams {
  userId?: number;
  doctorId?: number;
  status?: AppointmentStatus;
}

export interface TreatmentRouteCreateRequest {
  title: string;
  description?: string;
}

export interface TreatmentRouteUpdateRequest {
  title?: string;
  description?: string;
}

export interface TreatmentStageCreateRequest {
  treatmentRouteId: number;
  stageName: string;
  sequenceOrder: number;
  status?: TreatmentStageStatus;
  appointmentDate?: string;
  note?: string;
  cost?: number;
  delay?: number;
}

export interface TreatmentStageUpdateRequest {
  stageName?: string;
  sequenceOrder?: number;
  status?: TreatmentStageStatus;
  appointmentDate?: string;
  note?: string;
  cost?: number;
  delay?: number;
}

export interface MedicalRecordCreateRequest {
  userId: number;
  doctorId: number;
  serviceId: number;
  treatmentRouteId?: number;
  diagnosis: string;
}

export interface MedicalRecordUpdateRequest {
  doctorId?: number;
  serviceId?: number;
  treatmentRouteId?: number;
  diagnosis?: string;
}

export interface MedicalRecordFilterParams extends PageParams {
  userId?: number;
  doctorId?: number;
  keyword?: string;
}

export interface PaymentCreateRequest {
  userId: number;
  amount: number;
  method: PaymentMethod;
  treatmentStageId?: number;
}

export interface PaymentConfirmRequest {
  status: PaymentStatus;
  transactionRef: string;
  note?: string;
}

export interface PaymentFilterParams extends PageParams {
  userId?: number;
  status?: PaymentStatus;
}

