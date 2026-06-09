# MoneyWave

### Modern Personal Finance Manager

---

# Product Vision

MoneyWave is a modern offline-first personal finance manager designed to help users track income, expenses, budgets, recurring payments, and financial analytics through a premium fintech experience inspired by modern applications like CRED.

Version 1 is a web application with no authentication, no cloud dependency, and complete local ownership of data.

The application should feel fast, elegant, and intuitive while providing powerful financial insights.

---

# Objectives

MoneyWave should allow users to:

* Track income and expenses
* Manage multiple wallets/accounts
* Analyze spending habits
* Set budgets
* Monitor recurring payments
* Receive in-app reminders
* View monthly and yearly analytics
* Export and import data
* Use the application completely offline
* Install the application as a Progressive Web App (PWA)

---

# Technology Stack

Use the following stack:

## Frontend

* Next.js 15 (App Router)
* TypeScript
* Tailwind CSS
* Shadcn/UI
* Framer Motion

## State Management

* Zustand

## Local Database

* Dexie.js
* IndexedDB

## Charts

* Recharts

## Theme Management

* next-themes

## PWA

* next-pwa
* Service Workers
* Offline Cache

---

# Core Principles

## Offline First

The application must function without internet.

## Local Ownership

All data remains on the user's device.

## No Authentication

No login or signup required.

## Fast Experience

Instant page transitions and data updates.

## Mobile Ready

Responsive design with future mobile app support.

---

# User Profile

Single-user profile.

Fields:

* Name
* Theme Preference
* Currency (INR)

Profile stored locally.

---

# Navigation Structure

Header Navigation:

1. Dashboard
2. Transactions
3. Wallets
4. Analytics
5. Budgets
6. Categories
7. Recurring
8. Notifications
9. Settings

Theme Toggle available in header.

---

# Dashboard

## Financial Overview

Display:

* Current Total Balance
* Month Start Balance
* Total Income This Month
* Total Expense This Month
* Savings This Month
* Budget Remaining

---

## Monthly Balance Calculation

When a new month begins:

Month Start Balance = Previous Month Ending Balance

Example:

May Ending Balance = ₹25,000

June Starting Balance = ₹25,000

---

## Dashboard Widgets

### Monthly Spending Trend

Line Chart

Compare:

* Current Month
* Previous Month

---

### Income vs Expense

Line Chart

Display daily comparison.

---

### Spending by Category

Pie Chart

Show spending distribution.

---

### Top Spending Category

Card showing highest spending category.

---

### Recent Transactions

Display latest transactions.

Allow quick edit.

---

# Wallet Management

Users can create multiple wallets.

---

## Suggested Wallet Types

* Cash
* UPI
* Bank Account

---

## Custom Wallet Names

Examples:

* HDFC Salary
* SBI Savings
* ICICI Account
* Cash Wallet
* Personal UPI

---

## Wallet Fields

* Wallet Name
* Wallet Type
* Initial Balance
* Current Balance
* Notes

---

# Transactions

## Transaction Types

### Income

Money received.

### Expense

Money spent.

### Transfer

Transfer between wallets.

---

## Transaction Fields

* Amount
* Transaction Type
* Category
* Wallet
* Date
* Notes
* Payment Method

---

## Payment Methods

* Cash
* UPI
* Card

---

## Backdated Transactions

Users can add transactions for previous dates.

Example:

Forgot to enter yesterday's expense.

User can:

* Open transaction form
* Select previous date from calendar
* Save transaction

All balances and analytics update automatically.

---

# Quick Add Feature

Provide a smart quick-entry input.

Examples:

₹120 Food

₹50 Metro

₹3000 Salary

₹800 Electricity Bill

System should auto-detect:

* Amount
* Category
* Transaction Type

User confirms before saving.

---

# Categories

## Expense Categories

* Food
* Transport
* Shopping
* Rent
* Bills
* Entertainment
* Health
* Education
* Subscriptions
* Travel
* Investments
* Other

---

## Income Categories

* Salary
* Freelance
* Business
* Bonus
* Investments
* Gifts
* Other

---

# Credit & Debit Logic

## Credit

Money received.

Examples:

* Salary
* Refund
* Freelance Payment

---

## Debit

Money spent.

Examples:

* Food
* Transport
* Rent

---

# Budget Management

Users can create monthly budgets.

Example:

Food Budget = ₹5000

---

## Budget Card

Display:

* Budget Amount
* Amount Spent
* Remaining Budget
* Usage Percentage

---

## Budget Alerts

Generate notifications when:

* 80% budget reached
* Budget exceeded

---

# Recurring Transactions

Support recurring financial events.

Examples:

* Rent
* Salary
* Netflix
* Internet Bill
* EMI

---

## Fields

* Title
* Amount
* Category
* Wallet
* Frequency
* Next Due Date
* Reminder Days Before

---

## Frequency Options

* Daily
* Weekly
* Monthly
* Yearly

---

## Behavior

Recurring entries should:

1. Automatically create transactions.
2. Generate reminders before due date.
3. Appear in notification center.

---

# Notification Center

In-app notifications only.

---

## Notification Types

* Upcoming Recurring Payment
* Budget Warning
* Budget Exceeded
* Low Balance Alert
* Recurring Transaction Created

---

## Features

* Mark Read
* Mark Unread
* Delete Notification

---

# Analytics Module

## Monthly Spending Trend

Line Chart

---

## Income vs Expense

Line Chart

---

## Category Breakdown

Pie Chart

---

## Wallet Wise Spending

Bar Chart

---

## Yearly Spending Comparison

Line Chart

---

## Filters

* Date Range
* Wallet
* Category

---

# Transaction History

Display complete transaction history.

---

## Search

Search by:

* Category
* Wallet Name
* Notes

---

## Filters

* Income
* Expense
* Transfer
* Wallet
* Category
* Date Range

---

## Sorting

* Newest First
* Oldest First
* Highest Amount
* Lowest Amount

---

# Data Backup & Restore

## Export

Supported Formats:

* JSON
* CSV

---

## Import

Supported Formats:

* JSON

---

## Requirements

Imported data should:

* Validate structure
* Prevent corruption
* Merge safely

---

# Categories Page

Dedicated page showing:

* Total spent per category
* Percentage of total spending
* Pie chart visualization
* Monthly category comparison

---

# Settings

## User Settings

* Name
* Theme

---

## Data Management

* Export Data
* Import Data
* Clear All Data

---

## Appearance

* Dark Mode
* Light Mode

Dark mode should be default.

---

# Design System

## Design Inspiration

Premium fintech experience similar to modern financial applications.

---

## Visual Characteristics

* Clean
* Elegant
* Minimal
* Premium
* Modern
* Smooth Animations
* High Readability

---

## Dark Theme

Primary theme.

Use:

* Rich Black Backgrounds
* Soft Gray Surfaces
* Premium Accent Colors

---

## Light Theme

Maintain the same layout hierarchy and experience.

---

# Accessibility

Support:

* Keyboard Navigation
* Screen Readers
* High Contrast
* Responsive Layouts

---

# PWA Requirements

MoneyWave should be installable.

Requirements:

* Web App Manifest
* Service Worker
* Offline Cache
* Install Prompt

Should feel like a native application.

---

# Future Mobile Expansion

Application architecture should be prepared for future:

* React Native
* Expo

Business logic must remain reusable.

---

# Suggested Folder Structure

```text
app/
components/
features/
stores/
hooks/
db/
wallets/
transactions/
budgets/
analytics/
notifications/
categories/
settings/
types/
utils/
public/
```

---

# Success Criteria

A user should be able to:

* Create wallets
* Track income
* Track expenses
* Transfer money between wallets
* Backdate transactions
* Create budgets
* Monitor recurring payments
* Receive reminders
* Analyze spending patterns
* Search transaction history
* Export backups
* Restore backups
* Use the application completely offline

without requiring login, internet access, or third-party services.
