import React from "react";
import Image from "next/image";

const Pricelist = () => {
  const playstationData = [
    {
      id: 1,
      model: "PlayStation 5",
      description:
        "This is a place for you to grab a PlayStation, dive into epic games, and play without limits—no commitments, just pure gaming joy!",
    },
    {
      id: 2,
      model: "PlayStation 4 ",
      description:
        "This is a place for you to grab a PlayStation, dive into epic games, and play without limits—no commitments, just pure gaming joy!",
    },
    {
      id: 3,
      model: "PlayStation 5 ",
      description:
        "This is a place for you to grab a PlayStation, dive into epic games, and play without limits—no commitments, just pure gaming joy!",
    },
  ];

  return (
    <>
      <div className="flex flex-col ">
        <div className="flex p-4">
          {/* Title section (half width) make it center*/}
          <div className="w-1/2 p-2 flex justify-center items-center gap-6">
            <div className="bg-[#B99733] w-4 h-4" />
            <h1 className="font-minecraft text-black text-9xl">Pricelist</h1>
            <div className="bg-[#B99733] w-4 h-4" />
          </div>

          {/* Text content section (half width) */}
          <div className="flex flex-col w-1/2 p-4 space-y-6">
            {playstationData.map((console) => (
              <div key={console.id} className="flex flex-col space-y-4">
                <div className="flex items-center space-x-4 cursor-pointer hover:gap-10">
                  <h2 className="text-6xl font-minecraft text-[#b99733]">
                    {console.model}
                  </h2>
                  <Image
                    src="/images/arrow-gold.png"
                    width={60}
                    height={60}
                    alt="Arrow Icon"
                    className="w-20 h-20"
                  />
                </div>
                <p className="text-xl font-light">{console.description}</p>
              </div>
            ))}
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
