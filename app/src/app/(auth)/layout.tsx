import React from 'react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div 
      className="min-h-screen w-full flex items-center justify-center bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/epiphany-bg.png')" }}
    >
      <div className="w-full h-full flex items-center justify-center bg-black/20 backdrop-blur-sm">
        {children}
      </div>
    </div>
  );
}
