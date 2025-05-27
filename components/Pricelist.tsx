import React from "react";
import Image from "next/image";

const Pricelist = () => {
  return (
    <>
      <div className="flex flex-col">
        <div className="flex p-4">
          {/* Title section (half width) */}
          <div className="w-1/2 p-2 flex justify-center items-center gap-6">
            <div className="bg-[#B99733] w-4 h-4" />
            <h1 className="font-minecraft text-black text-9xl">Pricelist</h1>
            <div className="bg-[#B99733] w-4 h-4" />
          </div>

          {/* Image section (half width) */}
          <div className="w-1/2 p-4 flex justify-center items-center">
            <div className="relative w-full h-[500px]">
              <Image
                src="/images/pricelist.png"
                alt="Pricelist"
                fill
                className="object-contain"
              />
            </div>
          </div>
        </div>
        <div className="flex w-full justify-center gap-10 py-10">
          <div className="bg-[#B99733] w-4 h-4" />
          <div className="bg-black w-4 h-4" />
          <div className="bg-[#B99733] w-4 h-4" />
        </div>
      </div>
    </>
  );
};

export default Pricelist;
