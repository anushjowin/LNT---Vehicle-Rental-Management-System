# Vehicle Rental Management System

## Problem Statement
A backend system for a car/bike rental company allowing customers to browse available vehicles, book rentals for a date range, and enabling staff to manage the vehicle fleet, bookings, and returns with damage/fuel checks.

## Tech Stack
- **Backend:** Node.js + Express.js
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** JWT with bcrypt password hashing
- **Validation:** express-validator

## Setup Instructions
1. Clone the repository
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env` and configure your MongoDB URI and JWT secret
4. Start MongoDB locally or provide a cloud MongoDB URI
5. Run the server: `npm start` (or `npm run dev` for auto-reload)

## Implemented Modules
| # | Module | Status |
|---|--------|--------|
| 1 | User Registration & Authentication | Implemented |
| 2 | Branch Management | Implemented |
| 3 | Vehicle Master & Fleet Management | Implemented |
| 4 | Availability Search Engine | Implemented |
| 5 | Booking Workflow | Implemented |
| 6 | Pickup Inspection Module | Implemented |
| 7 | Return Inspection & Damage Charges | Implemented |
| 8 | Booking Status Management | Implemented |
| 9 | Pricing & Add-On Management | Implemented |
| 10 | Cancellation Policy Engine | Implemented |
| 11 | Customer Rental History | Implemented |
| 12 | Branch Fleet Utilization Reports | Implemented |
| 13 | Role-Based Access Control | Implemented |

## API Endpoints
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | /api/auth/register | Register user | None |
| POST | /api/auth/login | Login | None |
| GET | /api/auth/profile | Get profile | JWT |
| POST | /api/branches | Create branch | Admin |
| GET | /api/branches | List branches | None |
| GET | /api/branches/:id | Get branch | None |
| PUT | /api/branches/:id | Update branch | Admin |
| DELETE | /api/branches/:id | Delete branch | Admin |
| POST | /api/vehicles | Create vehicle | Admin/Staff |
| GET | /api/vehicles | List vehicles | None |
| GET | /api/vehicles/:id | Get vehicle | None |
| PUT | /api/vehicles/:id | Update vehicle | Admin/Staff |
| DELETE | /api/vehicles/:id | Delete vehicle | Admin |
| GET | /api/vehicles/search | Search available vehicles | None |
| POST | /api/bookings | Create booking | Customer |
| GET | /api/bookings/:id | Get booking | JWT |
| POST | /api/bookings/:id/pickup | Record pickup | Staff/Admin |
| POST | /api/bookings/:id/return | Record return | Staff/Admin |
| POST | /api/bookings/:id/cancel | Cancel booking | JWT |
| GET | /api/bookings/customer/:id | Rental history | JWT |
| GET | /api/admin/reports/utilization | Fleet utilization | Admin/Staff |
| GET | /api/admin/reports/revenue | Revenue report | Admin/Staff |

## Database Schema
- **users** - name, email, passwordHash, role, branchId
- **branches** - name, city, address, phone
- **vehicles** - branchId, type, model, brand, year, licensePlate, perDayRate, status
- **bookings** - customerId, vehicleId, branchId, startDate, endDate, status, baseRate, totalDays, addOns, totalAmount
- **inspections** - bookingId, stage, odometer, fuelLevel, damageNotes, inspectedBy

## Booking Status Flow
```
reserved → picked_up → returned
reserved → cancelled
```

## Cancellation Policy
- More than 48 hours before pickup: No charge
- 24-48 hours before pickup: 25% charge
- Less than 24 hours before pickup: 50% charge
- After pickup: 50% charge
