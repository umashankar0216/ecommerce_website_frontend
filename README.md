# E-Commerce Platform - Client Application

A modern, responsive e-commerce web application built with React and Vite. It features dynamic storefront browsing, interactive product search and filtering, user session management, a persistent cart, and a dedicated administrative management dashboard.

## Features

- **Authentication & Profile:** Registration, user login, profile management, and multiple shipping address handling.
- **Product Discovery & Catalog:** Dynamic category carousels, specification-driven product search, category filtering, and single-product detail views.
- **Shopping Cart & Checkout:** Persistent shopping cart, real-time inventory checks, and an interactive payment gateway integration using Stripe.
- **Order Management:** Order placement history tracking, order cancellation options, and product review submission capabilities.
- **Admin Management Dashboard:** Dedicated protected dashboard featuring sidebar navigation for product catalog management, category creation, and stock updates.

## Tech Stack

- React
- Vite
- React Router DOM
- Axios
- Tailwind CSS / CSS Modules
- Lucide React Icons

## Architecture / How It Works

Client Application (React) → Axios Client with Interceptors → REST API (Spring Boot)
                                                                ↓
                                                     Supabase Auth / JWT Session

The application is structured using a **Feature-Driven Modular Architecture**. Business domains (Auth, Catalog, Cart, Orders, Admin) encapsulate their own pages, components, and local state. Public routes (storefront) and protected routes (admin dashboard) use specialized outer layout wrappers for navigation isolation. Network communications are centralized through an Axios client with automated interceptors for dynamic JWT injection.

## Key Engineering Concepts

- **Feature-Driven Modular Architecture:** Isolates components and domain logic into self-contained feature capsules (e.g., `features/catalog`, `features/cart`).
- **Encapsulated Boundaries:** Uses module-level `index.js` files as encapsulation barriers to keep internal components private and maintainable.
- **State Management & Routing:** Leverages React Context API (`AuthContext`) for global auth status and React Router DOM (`createBrowserRouter`, `<Outlet>`) for dynamic navigation.
- **Modular Styling:** Component-isolated CSS Modules and Tailwind CSS prevent style leakage across routes.

## Setup & Installation

```bash
git clone <frontend-repository-url>
cd <frontend-project-folder>
npm install
npm run dev
