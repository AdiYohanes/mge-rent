import Image from "next/image";
import pricelistBanner from "../../../public/images/pricelist.png";

export default function PricelistPage() {
  return (
    <div style={{ position: "sticky", top: 0, zIndex: 10 }}>
      <Image
        src={pricelistBanner}
        alt="Pricelist Banner"
        style={{ width: "100%" }}
      />
    </div>
  );
}
