import QrCode from "qrcode";
import toSJIS from "qrcode/helper/to-sjis";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function CreateQrComponent(url: string) {
  const [qrData, setQrdata] = useState<string>("");
  const qrCodeGenerator = async () => {
    const qrcode = await QrCode.toDataURL("Text", {
      width: 250,
      margin: 2,
      errorCorrectionLevel: "H",
    });

    setQrdata(qrcode);
  };
  useEffect(() => {
    qrCodeGenerator();
  }, []);

  return (
    <div>
      <Image height={250} width={250} src={qrData} alt="qr-code"></Image>
    </div>
  );
}
