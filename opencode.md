# opencode.md

# Project

You are building a production-ready Electrical Shop Management System (ESMS).

This system must be scalable, modular, secure, maintainable, and suitable for both small retail shops and multi-branch businesses.

Never generate placeholder implementations when a complete implementation is feasible.

---

# Primary Objective

Develop a full-featured ERP system that enables the business owner to:

* Manage inventory in real time
* Track purchases
* Record sales
* Manage customers
* Manage suppliers
* Handle returns
* Track expenses
* Manage employees
* Generate invoices
* Print receipts
* Produce business reports
* Calculate profits
* Track cash flow
* Monitor stock movement
* Support barcode scanning
* Support multiple branches
* Operate offline with synchronization capability

---

# Preferred Technology Stack

Backend

* Python
* Django
* Django REST Framework

Frontend

* React
* TypeScript
* Vite

Database

* PostgreSQL

Caching

* Redis

Storage

* MinIO or S3-compatible storage

Authentication

* JWT
* Refresh Tokens

ORM

* Django ORM

Background Jobs

* Celery

Message Broker

* Redis

Reports

* PDF
* Excel

Barcode

* Code128
* QR Codes

Deployment

* Docker
* Docker Compose
* Nginx
* Gunicorn

---

# Architecture

Use Clean Architecture.

Separate into:

* Core
* Domain
* Services
* Repositories
* API
* UI
* Infrastructure

Business logic must never depend on UI.

---

# Modules

## Dashboard

Display:

* Daily sales
* Weekly sales
* Monthly sales
* Low stock
* Out of stock
* Recent invoices
* Expenses
* Profit
* Cash balance
* Top selling products
* Best customers
* Purchase summary

---

## Authentication

Roles

* Owner
* Manager
* Cashier
* Store Keeper
* Salesperson
* Accountant

Permissions must be role based.

---

## Products

Each product contains

* SKU
* Barcode
* Product Name
* Description
* Brand
* Category
* Unit
* Cost Price
* Selling Price
* Wholesale Price
* Retail Price
* Quantity
* Minimum Stock
* Reorder Level
* Supplier
* VAT
* Warranty
* Image
* Location
* Status

Support

* Bulk Import
* Bulk Export
* Barcode Printing
* QR Code Printing
* Image Upload

---

## Categories

Unlimited nested categories.

Example

Electrical

* Switches
* Sockets
* Breakers
* Cable
* Lighting
* Solar
* Plumbing
* Accessories

---

## Inventory

Track

* Stock In
* Stock Out
* Transfers
* Adjustments
* Damage
* Theft
* Expired Items
* Returns

Every movement must create a stock history record.

Inventory must never become negative.

---

## Suppliers

Store

* Company
* Contact Person
* Phone
* Email
* Address
* Tax Number
* Balance
* Payment History

Track supplier debt.

---

## Customers

Store

* Name
* Phone
* Email
* Address
* Credit Limit
* Outstanding Balance
* Purchase History
* Loyalty Points

---

## Purchases

Purchase Order

Receiving

Partial Receiving

Supplier Invoice

Purchase Returns

Supplier Payments

Purchase History

---

## Sales

POS Interface

Barcode Scanner

Search Products

Multiple Payment Methods

Discounts

Tax

Receipt Printing

Invoice Printing

Quotation

Returns

Credit Sales

Partial Payments

Outstanding Balance

---

## Payments

Support

Cash

Mobile Money

Bank Transfer

Cheque

Card

Mixed Payments

---

## Expenses

Track

Rent

Transport

Utilities

Salaries

Maintenance

Miscellaneous

---

## Accounting

Automatically calculate

Revenue

Expenses

Profit

Gross Profit

Net Profit

Cash Flow

Stock Value

Customer Debt

Supplier Debt

Inventory Valuation

---

## Reports

Daily Sales

Monthly Sales

Yearly Sales

Sales by Product

Sales by Category

Profit Report

Purchase Report

Inventory Report

Stock Movement

Supplier Report

Customer Report

Expense Report

Cash Flow

Tax Report

Employee Sales

Fast Moving Products

Slow Moving Products

Dead Stock

---

## Employees

Store

Name

Role

Salary

Attendance

Performance

Login History

---

## Notifications

Notify when

Stock is low

Stock reaches reorder level

Invoice overdue

Customer debt overdue

Supplier payment due

Daily sales completed

Backup required

---

## Barcode System

Generate

Code128

EAN13

QR Codes

Support USB barcode scanners.

---

## Search

Support

Product search

Barcode search

Supplier search

Customer search

Invoice search

Purchase search

Global search

---

## Backup

Automatic backups.

Manual backups.

Restore backups.

---

## Audit Log

Record

User

Action

Timestamp

Device

IP Address

Old Value

New Value

No business-critical operation should occur without an audit trail.

---

## Security

Hash passwords.

Use JWT authentication.

Validate all inputs.

Protect against:

SQL Injection

XSS

CSRF

SSRF

Command Injection

Rate limiting

Secure file uploads

Never expose secrets.

---

## API

REST API.

OpenAPI documentation.

Version APIs.

---

## Performance

Lazy loading.

Pagination.

Database indexing.

Redis caching.

Avoid N+1 queries.

Optimize database access.

---

## UI Requirements

Responsive.

Desktop-first.

Tablet support.

Mobile support.

Dark mode.

Light mode.

Professional dashboard.

Fast navigation.

Keyboard shortcuts for POS.

---

## Data Integrity Rules

Never allow negative inventory.

Every sale must reduce inventory.

Every purchase must increase inventory.

Returns must reverse inventory changes.

Deleting historical transactions is prohibited.

Use soft deletes where appropriate.

Financial records are immutable once finalized.

---

## Coding Standards

Follow

SOLID

DRY

KISS

YAGNI

PEP8

Type hints

Comprehensive error handling

Meaningful logging

Repository pattern

Service layer

Environment-based configuration

---

## Testing

Generate

Unit Tests

Integration Tests

API Tests

Permission Tests

Inventory Validation Tests

Financial Calculation Tests

Target high test coverage for business logic.

---

## Documentation

Generate

README

API documentation

Database schema

ER diagrams

Architecture diagrams

Deployment guide

User manual

Administrator manual

Developer guide

---

## Deployment

Support

Docker

Docker Compose

Nginx

Gunicorn

HTTPS

Automatic migrations

Health checks

Environment configuration

---

## Future Enhancements

Design the architecture so it can later support

Multiple branches

Warehouse management

Mobile app

WhatsApp order integration

SMS notifications

Email notifications

E-commerce storefront

Supplier portal

Customer portal

Accounting software integration

AI-powered sales forecasting

Demand prediction

Automatic reorder suggestions

Business intelligence dashboards

---

# Final Rule

Always implement complete, production-quality solutions.

Never remove existing functionality unless explicitly instructed.

Preserve backward compatibility where practical.

Prioritize correctness, maintainability, security, and business data integrity over convenience or speed.
