import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { QrCode, Smartphone } from 'lucide-react';

interface QRCodeGeneratorProps {
  url: string;
  title?: string;
}

export function QRCodeGenerator({ url, title = "Scan to Rate" }: QRCodeGeneratorProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');

  useEffect(() => {
    const generateQR = async () => {
      try {
        const qrUrl = await QRCode.toDataURL(url, {
          width: 120,
          margin: 1,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        });
        setQrCodeUrl(qrUrl);
      } catch (error) {
        console.error('Error generating QR code:', error);
      }
    };

    generateQR();
  }, [url]);

  return (
    <Card className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-center justify-center text-sm">
          <QrCode className="w-4 h-4 text-[#0044ff]" />
          <span className="text-gray-900 dark:text-gray-100">{title}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center space-y-2 pb-3">
        {qrCodeUrl && (
          <div className="p-2 bg-white rounded-lg shadow-sm border border-gray-200">
            <img src={qrCodeUrl} alt="QR Code" className="w-24 h-24" />
          </div>
        )}
        <div className="text-center">
          <div className="flex items-center gap-1 justify-center mb-1">
            <Smartphone className="w-3 h-3 text-[#0044ff]" />
            <Badge variant="outline" className="border-[#0044ff] text-[#0044ff] text-xs">
              Mobile Ready
            </Badge>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Scan to rate instantly
          </p>
        </div>
      </CardContent>
    </Card>
  );
}