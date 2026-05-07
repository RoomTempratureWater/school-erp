'use client';

import { useEffect } from 'react';

export default function AutoPrint() {
  useEffect(() => {
    // A slight delay ensures the browser has painted the styles before the print dialog opens
    const timer = setTimeout(() => {
      window.print();
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  return null;
}
