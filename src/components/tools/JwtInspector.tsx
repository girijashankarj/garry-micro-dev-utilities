import { useState, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { InfoTooltip } from '@/components/ui/tooltip';
import { toast } from 'sonner';

interface JwtPayload {
  [key: string]: unknown;
  exp?: number;
  iat?: number;
  nbf?: number;
}

export function JwtInspector() {
  const [token, setToken] = useState('');
  const [header, setHeader] = useState<JwtPayload | null>(null);
  const [payload, setPayload] = useState<JwtPayload | null>(null);
  const [error, setError] = useState<string | null>(null);

  const decodeToken = useCallback(() => {
    if (!token.trim()) {
      setError('Please enter a JSON Web Token (JWT)');
      return;
    }

    try {
      const parts = token.trim().split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid JSON Web Token (JWT) format');
      }

      const decodedHeader = JSON.parse(atob(parts[0].replace(/-/g, '+').replace(/_/g, '/')));
      const decodedPayload = jwtDecode<JwtPayload>(token);

      setHeader(decodedHeader);
      setPayload(decodedPayload);
      setError(null);
      toast.success('JSON Web Token (JWT) decoded successfully');
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to decode JSON Web Token (JWT)';
      setError(errorMessage);
      setHeader(null);
      setPayload(null);
      toast.error('Failed to decode JSON Web Token (JWT)');
    }
  }, [token]);

  const isExpired = payload?.exp ? payload.exp * 1000 < Date.now() : false;
  const expiresIn = payload?.exp
    ? Math.max(0, Math.floor((payload.exp * 1000 - Date.now()) / 1000 / 60 / 60 / 24))
    : null;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CardTitle>JSON Web Token (JWT) inspector</CardTitle>
            <InfoTooltip content="Decode JSON Web Tokens (JWT) without sending them to any server. View the header (algorithm, token type) and payload (claims, expiration). All processing happens locally in your browser for security." />
          </div>
          <CardDescription>
            Decode and inspect JSON Web Token (JWT) strings offline. View header, payload, and
            expiration warnings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">JSON Web Token (JWT)</label>
              <InfoTooltip content="Paste a JSON Web Token (JWT), format: header.payload.signature. The token is decoded to show the header and payload. No signature verification is performed — inspection only." />
            </div>
            <Textarea
              placeholder="Paste your JSON Web Token (JWT) here…"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="font-mono text-sm"
              rows={4}
            />
          </div>
          <Button onClick={decodeToken} className="w-full">
            Decode Token
          </Button>
          {error && (
            <div className="p-3 bg-destructive/10 text-destructive rounded-md text-sm">{error}</div>
          )}
        </CardContent>
      </Card>

      {header && payload && (
        <>
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <CardTitle>Header</CardTitle>
                <InfoTooltip content="The JSON Web Token (JWT) header contains metadata: algorithm (alg), token type (typ), and optional fields. It is base64url-encoded." />
              </div>
            </CardHeader>
            <CardContent>
              <pre className="bg-muted p-4 rounded-md overflow-auto text-sm">
                {JSON.stringify(header, null, 2)}
              </pre>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CardTitle>Payload</CardTitle>
                  <InfoTooltip content="The JSON Web Token (JWT) payload contains claims (data). Common claims: exp (expiration), iat (issued at), sub (subject), and custom claims. Expiration status is shown automatically." />
                </div>
                {isExpired && <Badge variant="destructive">Expired</Badge>}
                {!isExpired && expiresIn !== null && (
                  <Badge variant={expiresIn < 7 ? 'destructive' : 'secondary'}>
                    Expires in {expiresIn} days
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <pre className="bg-muted p-4 rounded-md overflow-auto text-sm">
                {JSON.stringify(payload, null, 2)}
              </pre>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
