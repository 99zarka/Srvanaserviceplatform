import { useEffect, useState } from "react";
import "./Loader.css";

export function Loader() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Hide loader after 2 seconds
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="loader-overlay">
      <div className="spinner">
        <div className="spinner1"></div>
      </div>
    </div>
  );
}
