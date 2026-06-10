import QRCode from 'qrcode';

/**
 * Generates a local QR code Data URL asynchronously
 * @param text Content to encode
 * @returns Promise resolving to base64 Data URL
 */
export const getQrCodeDataUrl = async (text: string): Promise<string> => {
  try {
    return await QRCode.toDataURL(text, { width: 300, margin: 2 });
  } catch (err) {
    console.error('Failed to generate local QR Code:', err);
    return '';
  }
};

/**
 * Compatibility function (falls back to local QR Server URL for synchronous requests)
 */
export const getQrCodeUrl = (id: string): string => {
  return `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=DORMX_AUTH_${id}`;
};

/**
 * Generates the QR code image locally and triggers a client-side download
 * @param id Outpass ID / Token ID
 * @param name Student name
 */
export const downloadQrCode = async (id: string, name: string): Promise<boolean> => {
  try {
    const dataUrl = await QRCode.toDataURL(`DORMX_AUTH_${id}`, { 
      width: 500, 
      margin: 2,
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    });
    
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `DORMX_OUTPASS_${name.replace(/\s+/g, '_')}_${id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return true;
  } catch (error) {
    console.error('Failed to download QR code:', error);
    return false;
  }
};
