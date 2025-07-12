import { useEffect, useState, useRef } from "react";

/* 
 *
 * I am going to poll window.location.hash every second to observe if hash has changed
 * 
 * */
export default function useHashChange() {
  const [hash, setHash] = useState(() => window.location.hash);
  const lastHashRef = useRef(hash);

  useEffect(() => {
    const interval = setInterval(() => {
      const currentHash = window.location.hash;
      if (currentHash !== lastHashRef.current) {
        lastHashRef.current = currentHash;
        setHash(currentHash)
      }
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return hash;
}
