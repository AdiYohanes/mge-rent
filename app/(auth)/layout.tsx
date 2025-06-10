import Image from "next/image";
import Link from "next/link";

// Optionally, you can uncomment and dynamically set metadata for SEO.
// export const metadata = {
//   title: "MGE - Login",
//   description: "Rental PS Medan",
// };

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="relative flex h-screen overflow-hidden flex-col md:flex-row">
      {/* Background Image - Full Screen on Mobile */}
      <div className="absolute inset-0 md:hidden">
        <Image
          src="/images/background-login.png"
          alt="Background"
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* Left side: content */}
      <div className="relative flex w-full flex-col md:w-1/2">
        <header className="p-4 sm:p-6">
          <div className="relative mb-2 sm:mb-4 flex flex-col items-center">
            <Link
              href="/"
              className="inline-block cursor-pointer"
              aria-label="Go to homepage"
            >
              <Image
                src="/images/logo.png"
                alt="Logo"
                width={200}
                height={200}
                className="h-24 w-24 sm:h-10 sm:w-10 md:h-24 md:w-24 lg:h-36 lg:w-36 object-contain hover:opacity-80 transition-opacity duration-300"
                priority
              />
            </Link>
            {/* Highlight Text */}
            <div className="mt-2 text-center">
              <span className="text-white text-sm sm:text-xs md:text-[#b99733] md:text-base lg:text-lg font-minecraft tracking-wider bg-gradient-to-r from-[#B99733] to-[#967515] bg-clip-text md:bg-none md:text-transparent-none">
                Make Good Enough
              </span>
            </div>
            {/* Divider with colored dots */}
            <div className="flex items-center justify-center w-full mt-2 sm:mt-3">
              <div className="h-[1px] w-16 sm:w-24 bg-gray-200"></div>
              <div className="flex space-x-2 sm:space-x-3 mx-3 sm:mx-4">
                <div className="h-2 w-2 sm:h-3 sm:w-3 rounded-none bg-[#B99733]"></div>
                <div className="h-2 w-2 sm:h-3 sm:w-3 rounded-none bg-black"></div>
                <div className="h-2 w-2 sm:h-3 sm:w-3 rounded-none bg-[#B99733]"></div>
              </div>
              <div className="h-[1px] w-16 sm:w-24 bg-gray-200"></div>
            </div>
          </div>
        </header>

        {/* Main content area */}
        <main className="flex-1 flex items-start justify-center pt-4 sm:pt-8">
          {children}
        </main>
      </div>

      {/* Right side: hero image - Only visible on desktop */}
      <div className="hidden md:block relative h-auto w-1/2">
        <Image
          src="/images/background-login.png"
          alt="Hero illustration"
          fill
          className="object-cover"
          priority
        />
      </div>
    </div>
  );
}
