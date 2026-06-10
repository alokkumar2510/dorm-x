/**
 * Generates the QR Code Image URL for a given Outpass/Leave request ID
 * @param id Outpass ID
 * @returns QR Code Image URL
 */
export const getQrCodeUrl = (id: string): string => {
  return `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=DORMX_AUTH_${id}`;
};

/**
 * Fetches the QR code image and triggers a client-side download
 */
export const downloadQrCode = async (id: string, name: string): Promise<boolean> => {
  try {
    const url = getQrCodeUrl(id);
    const response = await fetch(url);
    if (!response.ok) throw new Error('Network response was not ok');
    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = `DORMX_OUTPASS_${name.replace(/\s+/g, '_')}_${id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(blobUrl);
    return true;
  } catch (error) {
    console.error('Failed to download QR code:', error);
    return false;
  }
};
