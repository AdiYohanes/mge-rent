import { useState, useEffect } from "react";

/**
 * A hook to safely handle client-side only code and prevent hydration mismatches
 * Returns true when the component has mounted on the client-side
 */
export function useMounted() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return mounted;
}
