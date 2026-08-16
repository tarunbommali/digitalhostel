---
name: react-components
description: >-
  Component design patterns, Radix UI primitive integrations, TypeScript prop typing, and Tailwind styling rules.
---

# React Component Development Guide

## Component Guidelines
1. **Functional Components with TypeScript**:
   ```tsx
   interface StudentBadgeProps {
     status: 'Active' | 'Inactive' | 'Vacated';
     className?: string;
   }

   export const StudentBadge: React.FC<StudentBadgeProps> = ({ status, className }) => {
     return (
       <span className={cn('px-2.5 py-0.5 rounded-full text-xs font-medium', className)}>
         {status}
       </span>
     );
   };
   ```
2. **Composition with Radix UI & Lucide Icons**:
   - Build accessible modal dialogs, dropdowns, popovers, and accordions using Radix primitives.
   - Use Lucide icons with consistent sizes (e.g. `size={16}` or `size={20}`).
3. **Class Merging**:
   - Always use the `cn()` helper (`clsx` + `tailwind-merge`) when allowing custom `className` overrides.
