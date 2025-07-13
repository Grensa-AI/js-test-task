/**
 * Custom React hook that polls `window.location.hash` every second
 * to detect changes and update the returned hash value.
 *
 * This hook returns the current URL hash and updates it when the hash changes.
 *
 * Note: Uses polling instead of the 'hashchange' event as telegram web doesn't 
 * trigger 'hashchange' or 'popstate'
 *
 * @returns {string} The current value of window.location.hash.
 */
import { useEffect, useState, useRef } from "react";

export default function useHashChange() {
  const [hash, setHash] = useState(() => window.location.hash);
  const lastHashRef = useRef(hash);

  useEffect(() => {
    const interval = setInterval(() => {
      const currentHash = window.location.hash;
      if (currentHash !== lastHashRef.current) {
        lastHashRef.current = currentHash;
        setHash(currentHash);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return hash;
}
