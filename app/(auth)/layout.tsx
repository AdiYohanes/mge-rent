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
    <div className="flex h-screen overflow-hidden flex-col md:flex-row">
      {/* Left side: content */}
      <div className="flex w-full flex-col bg-white md:w-1/2">
        <header className="p-6">
          <div className="relative mb-2">
            <Link
              href="/"
              className="inline-block cursor-pointer"
              aria-label="Go to homepage"
            >
              <Image
                src="/images/logo.png"
                alt="Logo"
                width={40}
                height={40}
                className="h-auto w-auto object-contain hover:opacity-80 transition-opacity duration-300"
                priority
              />
            </Link>
            {/* Divider with colored dots */}
            <div className="flex items-center justify-center w-full">
              <div className="h-[1px] w-16 bg-gray-200"></div>
              <div className="flex space-x-3 mx-4">
                <div className="h-3 w-3 rounded-none bg-[#B99733]"></div>
                <div className="h-3 w-3 rounded-none bg-black"></div>
                <div className="h-3 w-3 rounded-none bg-[#B99733]"></div>
              </div>
              <div className="h-[1px] w-16 bg-gray-200"></div>
            </div>
          </div>
        </header>

        {/* Main content area */}
        <main className="flex-1 flex items-start justify-center ">
          {children}
        </main>
      </div>

      {/* Right side: hero image */}
      <div className="relative h-64 w-full md:h-auto md:w-1/2">
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
