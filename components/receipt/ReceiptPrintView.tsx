import Image from "next/image";
import React, { useEffect, useState } from "react";
import { getRoomsForDisplay, RoomItem } from "@/api/room/publicRoomApi";
import {
  getConsolesFlattened,
  ConsoleItem,
} from "@/api/console/publicConsoleApi";
import { getPublicFnbs, FnbItem } from "@/api/fnb/publicFnbApi";

type ReceiptItem = {
  id: string | number;
  item_type: string;
  item_id: string;
  quantity: number;
  price: string | number;
  duration?: number;
};

const ReceiptPrintView = ({ data, onBack }) => {
  const [rooms, setRooms] = useState<RoomItem[]>([]);
  const [consoles, setConsoles] = useState<ConsoleItem[]>([]);
  const [fnbs, setFnbs] = useState<FnbItem[]>([]);

  useEffect(() => {
    getRoomsForDisplay()
      .then(setRooms)
      .catch(() => setRooms([]));
    getConsolesFlattened()
      .then(setConsoles)
      .catch(() => setConsoles([]));
    getPublicFnbs()
      .then((res) => {
        // Flatten all FNBs into a single array
        const allFnbs = [
          ...res.data.snack,
          ...res.data.beverage,
          ...res.data.food,
        ];
        setFnbs(allFnbs);
      })
      .catch(() => setFnbs([]));
  }, []);

  return (
    <div className="flex flex-col items-center w-full min-h-screen bg-gray-100 py-8 print:bg-white">
      <div className="bg-white w-[420px] shadow-lg rounded-lg px-4 py-6 relative print:shadow-none print:rounded-none print:w-full print:max-w-[420px]">
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
          <h2 className="font-minecraft text-5xl text-[#B99733] tracking-widest mb-1">
            Receipt
          </h2>
          <div className="text-center text-xs text-gray-700 leading-tight font-funnel">
            <span className="font-bold">{data.toko}</span>
            <br />
            Setiabudi Square (Komplek Tasbi 1),
            <br />
            JL Setia Budi C-3, Tj. Sari, Kec. Medan Selayang, Kota Medan,
            <br />
            Sumatera Utara, 20132
          </div>
        </div>
        {/* Info */}
        <div className="text-center mb-3 font-funnel">
          <div className="text-xs mb-1 font-bold">NO. RECEIPT</div>
          <div className="text-sm font-normal">
            {data.no_receipt.toUpperCase()}
          </div>
        </div>
        <div className="grid grid-cols-3 text-xs mb-2 font-funnel text-center">
          <div>
            <div className="font-bold">DATE</div>
            <div className="font-normal">{data.date}</div>
          </div>
          <div>
            <div className="font-bold">TABLE</div>
            <div className="font-normal">{data.table}</div>
          </div>
          <div>
            <div className="font-bold">CASHIER</div>
            <div className="font-normal">{data.cashier}</div>
          </div>
        </div>
        {/* Items Table */}
        <div className="border-t border-b border-dashed border-gray-400 py-2 mb-2">
          <div className="flex justify-between font-semibold text-xs mb-1 font-funnel">
            <span>ITEMS</span>
            <span>PRICE</span>
          </div>
          {data.items.map((item: ReceiptItem) => {
            let left: React.ReactNode = "";
            if (item.item_type === "room") {
              const matchedRoom = rooms.find(
                (room) => String(room.id) === String(item.item_id)
              );
              left = (
                <span className="font-bold">
                  {matchedRoom ? matchedRoom.name : item.item_id}
                </span>
              );
            } else if (item.item_type === "console") {
              const matchedConsole = consoles.find(
                (console) => String(console.id) === String(item.item_id)
              );
              left = (
                <span className="flex flex-col">
                  <span className="font-bold">
                    {matchedConsole ? matchedConsole.model : item.item_id}
                  </span>
                  <span className="text-[10px] text-gray-500 font-normal">
                    {item.duration} jam
                    {item.duration && Number(item.duration) > 0 && (
                      <>
                        {" "}
                        x{" "}
                        {`Rp${(
                          Number(item.price) / Number(item.duration)
                        ).toLocaleString("id-ID")}`}
                      </>
                    )}
                  </span>
                </span>
              );
            } else if (item.item_type === "fnb") {
              const matchedFnb = fnbs.find(
                (fnb) => String(fnb.id) === String(item.item_id)
              );
              left = (
                <span className="flex flex-col">
                  <span className="font-bold">
                    {matchedFnb ? matchedFnb.name : item.item_id}
                  </span>
                  <span className="text-[10px] text-gray-500 font-normal">
                    {item.quantity} x{" "}
                    {item.quantity && Number(item.quantity) > 0
                      ? `Rp${(
                          Number(item.price) / Number(item.quantity)
                        ).toLocaleString("id-ID")}`
                      : "-"}
                  </span>
                </span>
              );
            } else {
              left = item.item_id;
            }
            return (
              <div
                key={item.id}
                className="flex justify-between text-xs mb-1 font-funnel items-center"
              >
                <span>{left}</span>
                <span>
                  Rp{parseFloat(item.price as string).toLocaleString("id-ID")}
                </span>
              </div>
            );
          })}
        </div>
        {/* Subtotal, Tax, Total */}
        <div className="text-xs mb-1 flex flex-col gap-1 font-funnel">
          <div className="flex justify-between">
            <span>SUBTOTAL</span>
            <span>Rp{data.subtotal.toLocaleString("id-ID")}</span>
          </div>
          <div className="flex justify-between">
            <span>TAX (10%)</span>
            <span>Rp{data.tax.toLocaleString("id-ID")}</span>
          </div>
        </div>
        <div className="flex justify-between items-center font-bold text-base border-t border-b border-black py-2 mb-1 font-funnel">
          <span>TOTAL</span>
          <span>Rp{data.total.toLocaleString("id-ID")}</span>
        </div>
        <div className="flex justify-between text-xs mb-2 font-funnel">
          <span>BAYAR (CASH)</span>
          <span>Rp{data.bayar.toLocaleString("id-ID")}</span>
        </div>
        {/* Footer */}
        <div className="border-t border-dashed border-gray-400 pt-2 mt-2 text-xs text-gray-700 font-funnel">
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
            className="px-4 py-1 bg-gray-200 rounded hover:bg-gray-300 text-xs font-funnel"
          >
            Kembali
          </button>
          <button
            onClick={() => window.print()}
            className="px-4 py-1 bg-[#B99733] text-white rounded hover:bg-[#a07f2a] text-xs font-funnel"
          >
            Cetak
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReceiptPrintView;
