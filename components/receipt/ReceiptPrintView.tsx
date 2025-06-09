import Image from "next/image";
import React from "react";

const ReceiptPrintView = ({ data, onBack }) => {
  return (
    <div className="flex flex-col items-center w-full min-h-screen bg-gray-100 py-8 print:bg-white">
      <div className="bg-white w-[350px] shadow-lg rounded-lg px-4 py-6 relative print:shadow-none print:rounded-none print:w-full print:max-w-[350px]">
        {/* Logo & Header */}
        <div className="flex flex-col items-center mb-2">
          <Image
            src={data.logoUrl || "/images/logo.png"}
            alt="Logo"
            width={48}
            height={48}
            className="h-12 mb-1"
            style={{ objectFit: "contain" }}
          />
          <h2 className="font-minecraft text-3xl text-[#B99733] tracking-widest mb-1">
            Receipt
          </h2>
          <div className="text-center text-xs text-gray-700 font-semibold leading-tight">
            {data.toko}
            <br />
            {data.alamat}
          </div>
        </div>
        {/* Info */}
        <div className="grid grid-cols-2 text-xs my-2">
          <div className="flex flex-col gap-1">
            <div>No. RECEIPT</div>
            <div>DATE</div>
            <div>ITEMS</div>
          </div>
          <div className="flex flex-col gap-1 text-right">
            <div>{data.no_receipt}</div>
            <div>{data.date}</div>
            <div>{data.items.length}</div>
          </div>
        </div>
        <div className="grid grid-cols-2 text-xs mb-2">
          <div className="flex flex-col gap-1">
            <div>TABLE</div>
            <div>CASHIER</div>
          </div>
          <div className="flex flex-col gap-1 text-right">
            <div>{data.table}</div>
            <div>{data.cashier}</div>
          </div>
        </div>
        {/* Items Table */}
        <div className="border-t border-b border-dashed border-gray-400 py-2 mb-2">
          <div className="flex justify-between font-semibold text-xs mb-1">
            <span>ITEMS</span>
            <span>PRICE</span>
          </div>
          {data.items.map((item) => (
            <div key={item.id} className="flex justify-between text-xs mb-1">
              <span>
                {item.name || item.item_type}{" "}
                {item.duration ? `${item.duration} jam` : ""}
                {item.quantity > 1 ? ` x${item.quantity}` : ""}
              </span>
              <span>Rp{parseFloat(item.price).toLocaleString("id-ID")}</span>
            </div>
          ))}
        </div>
        {/* Subtotal, Tax, Total */}
        <div className="text-xs mb-1 flex flex-col gap-1">
          <div className="flex justify-between">
            <span>SUBTOTAL</span>
            <span>Rp{data.subtotal.toLocaleString("id-ID")}</span>
          </div>
          <div className="flex justify-between">
            <span>TAX (10%)</span>
            <span>Rp{data.tax.toLocaleString("id-ID")}</span>
          </div>
        </div>
        <div className="flex justify-between items-center font-bold text-base border-t border-b border-black py-2 mb-1">
          <span>TOTAL</span>
          <span>Rp{data.total.toLocaleString("id-ID")}</span>
        </div>
        <div className="flex justify-between text-xs mb-2">
          <span>BAYAR (CASH)</span>
          <span>Rp{data.bayar.toLocaleString("id-ID")}</span>
        </div>
        {/* Footer */}
        <div className="border-t border-dashed border-gray-400 pt-2 mt-2 text-xs text-gray-700">
          <div className="mb-1">Make Good Enough</div>
          <div className="flex justify-between mb-1">
            <span>Wi-Fi Password</span>
            <span>{data.wifi}</span>
          </div>
          <div className="flex flex-col gap-1 mb-1">
            <span>WhatsApp: {data.whatsapp}</span>
            <span>Instagram: {data.instagram}</span>
          </div>
          <div className="flex justify-center mt-2">
            <Image
              src={data.qrUrl || "/images/qr_mge.png"}
              alt="QR Code"
              width={64}
              height={64}
              className="object-contain"
            />
          </div>
        </div>
        {/* Tombol Print & Kembali */}
        <div className="flex justify-between mt-4 print:hidden">
          <button
            onClick={onBack}
            className="px-4 py-1 bg-gray-200 rounded hover:bg-gray-300 text-xs"
          >
            Kembali
          </button>
          <button
            onClick={() => window.print()}
            className="px-4 py-1 bg-[#B99733] text-white rounded hover:bg-[#a07f2a] text-xs"
          >
            Cetak
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReceiptPrintView;
