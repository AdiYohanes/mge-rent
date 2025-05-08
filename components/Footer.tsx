import { FaYoutube, FaInstagram, FaTiktok, FaFacebook } from "react-icons/fa";
import { MapPin, Clock, Phone, Mail } from "lucide-react";
import Image from "next/image";

// Social media links
const SOCIAL_MEDIA_LINKS = [
  { name: "Youtube", icon: <FaYoutube size={24} />, url: "#" },
  { name: "Instagram", icon: <FaInstagram size={24} />, url: "#" },
  { name: "Tiktok", icon: <FaTiktok size={24} />, url: "#" },
  { name: "Facebook", icon: <FaFacebook size={24} />, url: "#" },
];

// Map component
const SimpleMap = () => {
  return (
    <div className="rounded-lg overflow-hidden shadow-lg border-2 border-[#b99733]/20">
      <iframe
        title="Google Map"
        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d126974.38659730626!2d98.6606489546906!3d3.595196785185863!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x303131eae1fdf4e7%3A0x168a35d8f1dd6a44!2sMedan%2C%20Indonesia!5e0!3m2!1sen!2s!4v1586879930014!5m2!1sen!2s"
        width="100%"
        height="250"
        style={{ border: 0 }}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        className="w-full"
      ></iframe>
    </div>
  );
};

// Contact info component
const ContactInfo = () => {
  return (
    <div className="mt-6 text-gray-200 space-y-4">
      <div className="flex items-start">
        <MapPin className="w-5 h-5 text-[#b99733] mt-1 mr-3 shrink-0" />
        <div>
          <div className="font-bold text-white mb-1">Address:</div>
          <div className="text-sm">
            Jl. Jendral Sudirman No. 67, Medan Sunggal, Sumatera Utara
          </div>
        </div>
      </div>

      <div className="flex items-start">
        <Clock className="w-5 h-5 text-[#b99733] mt-1 mr-3 shrink-0" />
        <div>
          <div className="font-bold text-white mb-1">Operational Hours:</div>
          <div className="text-sm">Monday - Sunday: 09.00 - 21.00</div>
        </div>
      </div>

      <div className="flex items-start">
        <Phone className="w-5 h-5 text-[#b99733] mt-1 mr-3 shrink-0" />
        <div>
          <div className="font-bold text-white mb-1">Phone:</div>
          <div className="text-sm">+62 876-9084-0987</div>
        </div>
      </div>

      <div className="flex items-start">
        <Mail className="w-5 h-5 text-[#b99733] mt-1 mr-3 shrink-0" />
        <div>
          <div className="font-bold text-white mb-1">Email:</div>
          <div className="text-sm">info@medangaming.com</div>
        </div>
      </div>
    </div>
  );
};

// Footer Component
const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen flex flex-col">
      <main className="grow">{/* Main content here */}</main>

      <footer className="bg-[#1B1010] text-white py-10">
        <div className="max-w-[theme(screens.3xl)] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Column 1: Company Info */}
            <div className="space-y-6">
              <div className="flex items-center">
                <div className="relative w-12 h-12 mr-3">
                  <Image
                    src="/images/logo.png"
                    alt="Medan Gaming Ecosystem Logo"
                    fill
                    className="object-contain"
                  />
                </div>
                <div className="text-xl font-bold">Medan Gaming</div>
              </div>

              <p className="text-gray-300 text-sm leading-relaxed">
                Medan Gaming Ecosystem provides the ultimate gaming experience
                with state-of-the-art equipment, comfortable gaming rooms, and a
                vibrant community of gamers from all skill levels.
              </p>

              {/* Social Media Links */}
              <div className="flex space-x-4">
                {SOCIAL_MEDIA_LINKS.map((social) => (
                  <a
                    key={social.name}
                    href={social.url}
                    className="bg-gray-800 hover:bg-[#b99733] p-2 rounded-full transition-colors duration-300 flex items-center justify-center"
                    aria-label={social.name}
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>

            {/* Column 2: Map and Contact */}
            <div className="lg:col-span-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-bold mb-4 text-white">Find Us</h3>
                  <SimpleMap />
                </div>

                <div>
                  <h3 className="text-xl font-bold mb-4 text-white">
                    Contact Us
                  </h3>
                  <ContactInfo />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-700">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="flex flex-wrap justify-center md:justify-start gap-6 mb-6 md:mb-0">
                <a
                  href="#"
                  className="hover:text-[#b99733] transition-colors duration-300 text-sm font-medium"
                >
                  Home
                </a>
                <a
                  href="#"
                  className="hover:text-[#b99733] transition-colors duration-300 text-sm font-medium"
                >
                  Terms
                </a>
                <a
                  href="#"
                  className="hover:text-[#b99733] transition-colors duration-300 text-sm font-medium"
                >
                  Privacy
                </a>
                <a
                  href="#"
                  className="hover:text-[#b99733] transition-colors duration-300 text-sm font-medium"
                >
                  Legal
                </a>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-700 text-center">
            <div className="text-gray-400 text-sm">
              <p>
                © {currentYear} Medan Gaming Ecosystem. All rights reserved.
              </p>
              <p className="mt-2">
                Designed and developed with ❤️ for gamers. Unauthorized
                reproduction or distribution of any material from this site is
                strictly prohibited.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Footer;
