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
          width: 200,
          margin: 2,
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
    <Card className="border-neon-purple/30 bg-card/50 backdrop-blur">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-center justify-center">
          <QrCode className="w-5 h-5 text-neon-purple" />
          <span className="text-neon-purple">{title}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center space-y-4">
        {qrCodeUrl && (
          <div className="p-4 bg-white rounded-lg shadow-lg">
            <img src={qrCodeUrl} alt="QR Code" className="w-48 h-48" />
          </div>
        )}
        <div className="text-center space-y-2">
          <div className="flex items-center gap-2 justify-center">
            <Smartphone className="w-4 h-4 text-neon-cyan" />
            <Badge variant="outline" className="border-neon-cyan text-neon-cyan">
              Mobile Optimized
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground max-w-xs">
            Scan with your phone camera to quickly access the rating page
          </p>
        </div>
      </CardContent>
    </Card>
  );
}