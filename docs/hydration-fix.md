# Handling Hydration Issues in Next.js

Hydration errors occur when the HTML rendered on the server doesn't match what the client-side JavaScript tries to render. This document outlines common causes and solutions for hydration issues in our codebase.

## Common Causes of Hydration Issues

1. **Using browser-only APIs during initial render**

   - `window`, `document`, `localStorage`, etc. don't exist during server-side rendering
   - They should only be accessed in useEffect or after checking if code is running on the client

2. **Dynamic content that differs between server and client**

   - Random IDs or values
   - Date/time values
   - Conditional rendering based on client-side state

3. **Missing `use client` directive**
   - Components that use hooks or browser APIs must be marked with `"use client"` directive

## Recommended Solution: The `useMounted` Hook

We've created a custom hook to safely handle client-side only code:

```tsx
// hooks/use-mounted.ts
import { useState, useEffect } from "react";

export function useMounted() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return mounted;
}
```

## How to Use the `useMounted` Hook

1. **Import the hook**:

   ```tsx
   import { useMounted } from "@/hooks/use-mounted";
   ```

2. **Use it in your component**:

   ```tsx
   const mounted = useMounted();
   ```

3. **Access browser APIs safely**:

   ```tsx
   useEffect(() => {
     if (mounted) {
       // Safe to access window, document, localStorage, etc.
       const data = localStorage.getItem("user");
       // ...
     }
   }, [mounted]);
   ```

4. **Conditional rendering to prevent hydration mismatch**:

   ```tsx
   if (!mounted) {
     // Return a simple skeleton or placeholder that matches the server-rendered HTML
     return (
       <div className="h-80 flex items-center justify-center">Loading...</div>
     );
   }

   // Full client-side rendered content
   return <div>{/* Content that requires browser APIs or dynamic data */}</div>;
   ```

## Best Practices

1. **Always use the `useMounted` hook** when accessing browser APIs or rendering content that might differ between server and client
2. **Return a simple initial UI when not mounted** that closely resembles what will be rendered on the server
3. **Keep server and client markup similar** for the initial render to avoid hydration mismatches
4. **Avoid accessing `window`, `document`, or `localStorage` directly** in your component render function
5. **Move client-side only logic to `useEffect`** hooks that run after component has mounted

By following these patterns, you'll ensure consistent rendering between server and client, avoiding hydration errors.
