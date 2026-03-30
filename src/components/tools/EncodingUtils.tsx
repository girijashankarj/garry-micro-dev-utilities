import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';

function decodeBase64Unicode(value: string): string {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padding = '='.repeat((4 - (normalized.length % 4)) % 4);
  const binary = atob(normalized + padding);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

function decodeJwtWithoutLibrary(token: string): {
  header: unknown;
  payload: unknown;
  signature: string;
} {
  const parts = token.trim().split('.');
  if (parts.length !== 3) {
    throw new Error('Invalid JWT format');
  }

  const [headerRaw, payloadRaw, signature] = parts;
  return {
    header: JSON.parse(decodeBase64Unicode(headerRaw)),
    payload: JSON.parse(decodeBase64Unicode(payloadRaw)),
    signature,
  };
}

export function EncodingUtils() {
  const [base64Input, setBase64Input] = useState('');
  const [base64Output, setBase64Output] = useState('');

  const [jwtInput, setJwtInput] = useState('');
  const [jwtHeader, setJwtHeader] = useState('');
  const [jwtPayload, setJwtPayload] = useState('');
  const [jwtSignature, setJwtSignature] = useState('');

  const tokenExpiry = useMemo(() => {
    if (!jwtPayload) return 'Unknown';
    try {
      const parsed = JSON.parse(jwtPayload) as { exp?: number };
      if (!parsed.exp) return 'No exp claim';
      const date = new Date(parsed.exp * 1000);
      return date.toLocaleString();
    } catch {
      return 'Unknown';
    }
  }, [jwtPayload]);

  const handleDecodeBase64 = () => {
    if (!base64Input.trim()) {
      toast.error('Enter Base64 input first');
      return;
    }
    try {
      const decoded = decodeBase64Unicode(base64Input.trim());
      setBase64Output(decoded);
      toast.success('Base64 decoded');
    } catch {
      toast.error('Invalid Base64 input');
      setBase64Output('');
    }
  };

  const handleDecodeJwt = () => {
    if (!jwtInput.trim()) {
      toast.error('Enter JWT token first');
      return;
    }
    try {
      const decoded = decodeJwtWithoutLibrary(jwtInput);
      setJwtHeader(JSON.stringify(decoded.header, null, 2));
      setJwtPayload(JSON.stringify(decoded.payload, null, 2));
      setJwtSignature(decoded.signature);
      toast.success('JWT decoded');
    } catch {
      toast.error('Invalid JWT token');
      setJwtHeader('');
      setJwtPayload('');
      setJwtSignature('');
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Base64 Decode</CardTitle>
          <CardDescription>Decode Base64 text in-browser. No server calls.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea
            value={base64Input}
            onChange={(e) => setBase64Input(e.target.value)}
            placeholder="Paste Base64 text..."
            className="font-mono text-sm min-h-28"
          />
          <Button onClick={handleDecodeBase64} className="w-full">
            Decode Base64
          </Button>
          <Textarea
            value={base64Output}
            readOnly
            placeholder="Decoded output will appear here"
            className="font-mono text-sm min-h-28"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>JSON Web Token (JWT) decode</CardTitle>
          <CardDescription>
            Decode JWT header and payload without third-party JWT packages.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea
            value={jwtInput}
            onChange={(e) => setJwtInput(e.target.value)}
            placeholder="Paste JWT token..."
            className="font-mono text-sm min-h-24"
          />
          <Button onClick={handleDecodeJwt} className="w-full">
            Decode JWT
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            <div className="space-y-2">
              <div className="text-sm font-medium">Header</div>
              <Textarea readOnly value={jwtHeader} className="font-mono text-sm min-h-36" />
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium">Payload</div>
              <Textarea readOnly value={jwtPayload} className="font-mono text-sm min-h-36" />
            </div>
          </div>

          <div className="text-sm">
            <span className="font-medium">Signature:</span>{' '}
            <span className="font-mono break-all">{jwtSignature || '-'}</span>
          </div>
          <div className="text-sm">
            <span className="font-medium">Token expiry:</span> {tokenExpiry}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
