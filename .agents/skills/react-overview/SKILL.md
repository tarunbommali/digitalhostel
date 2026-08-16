---
name: react-overview
description: >-
  Provides the architecture, tooling (Vite, TypeScript, Tailwind CSS v4, Redux Toolkit), and file layout of the client app.
---

# Digital Hostel Frontend Overview

## Stack & Architecture
- **Framework**: React 19 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS v4 + Radix UI Primitives + Lucide Icons
- **State Management**: Redux Toolkit (`@reduxjs/toolkit`) + Context API
- **Form Management**: `react-hook-form` + `zod`
- **Routing**: `react-router-dom` v6

## Folder Layout
```
client/src/
├── App.tsx             # Root routing, route guards, layout wrappers
├── main.tsx            # React root mount, Redux Provider
├── core/               # App-wide layouts, navigation, auth context/slices
├── modules/            # Domain feature modules (students, rooms, billing, attendance, etc.)
├── components/         # Shared UI components (Button, Modal, Input, DataTable, Badge)
├── hooks/              # Reusable custom hooks
├── utils/              # Helper utilities, debounce, formatting, store config
└── styles.css          # Tailwind imports and global style variables
```
