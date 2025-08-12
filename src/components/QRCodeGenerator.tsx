import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { QrCode, Smartphone } from 'lucide-react';

interface QRCodeGeneratorProps {
  url: string;
  title?: string;
  size?: number;
}

export function QRCodeGenerator({ url, title = "Scan to Rate", size = 120 }: QRCodeGeneratorProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');

  useEffect(() => {
    const generateQR = async () => {
      try {
        const qrUrl = await QRCode.toDataURL(url, {
          width: size,
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
  }, [url, size]);

  return (
    <Card className="border-neon-purple/30 bg-card/50 backdrop-blur">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-center justify-center text-sm">
          <QrCode className="w-4 h-4 text-neon-purple" />
          <span className="text-neon-purple">{title}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center space-y-2 pb-3">
        {qrCodeUrl && (
          <div className="p-2 bg-white rounded-lg shadow-lg">
            <img src={qrCodeUrl} alt="QR Code" style={{ width: size, height: size }} className="rounded" />
          </div>
        )}
        <div className="text-center">
          <div className="flex items-center gap-1 justify-center mb-1">
            <Smartphone className="w-3 h-3 text-neon-cyan" />
            <Badge variant="outline" className="border-neon-cyan text-neon-cyan text-xs">
              Mobile Ready
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            Scan to rate instantly
          </p>
        </div>
      </CardContent>
    </Card>
  );
}