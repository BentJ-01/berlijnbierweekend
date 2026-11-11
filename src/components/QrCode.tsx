import { useEffect, useState } from 'react'
import QRCode from 'qrcode'

export function QrCode({ value, size = 260 }: { value: string; size?: number }) {
  const [src, setSrc] = useState<string | null>(null)

  useEffect(() => {
    let alive = true
    QRCode.toDataURL(value, { margin: 2, width: size * 2, errorCorrectionLevel: 'M' })
      .then((url) => alive && setSrc(url))
      .catch(() => alive && setSrc(null))
    return () => {
      alive = false
    }
  }, [value, size])

  return src ? (
    <img src={src} width={size} height={size} alt={`QR-code ${value}`} className="block" style={{ imageRendering: 'pixelated' }} />
  ) : (
    <div style={{ width: size, height: size }} />
  )
}
