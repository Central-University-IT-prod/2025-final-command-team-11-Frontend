import { QRScanner } from "./qr-scanner";

export function VerificationView() {
  return (
    <div className="flex flex-col gap-4">
      <QRScanner />
    </div>
  );
}
