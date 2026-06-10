/**
 * Generates the QR Code Image URL for a given Outpass/Leave request ID
 * @param id Outpass ID
 * @returns QR Code Image URL
 */
export const getQrCodeUrl = (id: string): string => {
  return `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=DORMX_AUTH_${id}`;
};
