import { useEffect, useRef } from "react";

export function useTelegramChatWatcher(onChatChange) {
  const lastHashRef = useRef(window.location.hash);

  useEffect(() => {
    let frameId;

    const checkHash = () => {
      const currentHash = window.location.hash;
      if (currentHash !== lastHashRef.current) {
        lastHashRef.current = currentHash;
        onChatChange();
      }
      frameId = requestAnimationFrame(checkHash);
    };

    frameId = requestAnimationFrame(checkHash);

    return () => cancelAnimationFrame(frameId);
  }, [onChatChange]);
}