'use client';

import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';

interface QRCodeImageProps {
  text: string;
  className?: string;
  alt?: string;
}

export const QRCodeImage: React.FC<QRCodeImageProps> = ({ text, className = '', alt = 'QR Code' }) => {
  const [dataUrl, setDataUrl] = useState<string>('');

  useEffect(() => {
    let active = true;
    QRCode.toDataURL(text, { 
      width: 300, 
      margin: 1,
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    })
      .then((url) => {
        if (active) setDataUrl(url);
      })
      .catch((err) => {
        console.error('Failed to generate local QR Code:', err);
      });
    return () => {
      active = false;
    };
  }, [text]);

  if (!dataUrl) {
    return (
      <div 
        className={`flex items-center justify-center bg-slate-900 border border-white/10 rounded-2xl text-slate-500 font-bold uppercase tracking-widest text-[8px] animate-pulse ${className}`} 
        style={{ minWidth: '120px', minHeight: '120px' }}
      >
        Generating...
      </div>
    );
  }

  return <img src={dataUrl} alt={alt} className={className} />;
};

export default QRCodeImage;
