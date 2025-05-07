import Link from "next/link";
import { Button } from "./ui/button";
import Image from "next/image";

const Homepage = () => {
  return (
    <div
      className="relative w-screen h-screen bg-cover bg-center"
      style={{ backgroundImage: `url('/images/bg-hero.png')` }}
    >
      {/* Overlay for better contrast */}

      {/* Content */}
      <div className="relative z-10 flex flex-col justify-center items-center text-center text-white p-6 md:p-12 h-full">
        {/* Eye-catching h1 */}
        <h1 className="text-5xl md:text-9xl font-minecraft mb-4 leading-tight tracking-wide">
          Medan Gaming Ecosystem
        </h1>

        {/* Motto text */}
        <p className="text-xl md:text-3xl mb-10 font-minecraft">
          Make Good Enough.
        </p>

        {/* CTA Buttons */}
        <Link href="/pricelist">
          <Button className="bg-[#B99733] hover:bg-[#8a7127] px-12 py-6 text-xl rounded-none font-semibold transition duration-300 cursor-pointer mb-6 transform hover:scale-105">
            <Image
              src="/images/icon-price.png"
              width={25}
              height={25}
              alt="Price Icon"
              className="mr-3"
            />
            Pricelist
          </Button>
        </Link>

        <Link href="/booking">
          <Button className="bg-[#B99733] hover:bg-[#8a7127] px-12 py-6 text-xl rounded-none font-semibold transition duration-300 cursor-pointer transform hover:scale-105">
            <Image
              src="/images/mobile-icon.png"
              width={25}
              height={25}
              alt="Booking Icon"
              className="mr-3"
            />
            Book a room
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default Homepage;
