"use client";

import Image from "next/image";
import Link from "next/link";
import { FaFacebook, FaInstagram, FaTwitter } from "react-icons/fa";
import { useEffect, useState } from "react";
import axios from "axios";
import { usePathname } from "next/navigation";

const Footer = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get("/api/auth/session");
        if (res.status === 200) {
          setUser(res.data);
        }
      } catch {
        setUser(null); // only set to null on error
      } finally {
        setLoading(false); // fix: was incorrectly setting setUser(null)
      }
    };

    const token = localStorage.getItem("token");
    if (token) {
      fetchUser();
    } else {
      setUser(null);
      setLoading(false);
    }
  }, [
    pathname,
    typeof window !== "undefined" && localStorage.getItem("token"),
  ]);

  const chefNavigation = [
    { name: "Dashboard", href: "/chef/dashboard" },
    { name: "Meal Plans", href: "/chef/meal-plans" },
    { name: "Dishes", href: "/chef/dishes" },
    { name: "Profile", href: "/chef/profile" },
  ];

  const dinerNavigation = [
    { name: "Dashboard", href: "/diner/dashboard" },
    { name: "Meal Plans", href: "/diner/meal-plans" },
    { name: "Dishes", href: "/diner/dishes" },
    { name: "Profile", href: "/diner/profile" },
  ];

  const commonLinks = [
    { name: "Home", href: "/" },
    { name: "About Us", href: "/about" },
    { name: "Contact Us", href: "/contact" },
  ];

  const isAuthPage = pathname === "/auth/login" || pathname === "/auth/signup";

  if (loading) {
    return (
      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p>Loading footer...</p>
        </div>
      </footer>
    );
  }

  return (
    <footer className="bg-gray-800 text-white py-8">
      <div className="container mx-auto px-4">
        {/* Logo and Social Section */}
        <div className="flex flex-col items-center md:flex-row md:justify-between md:items-center space-y-6 md:space-y-0">
          {/* Logo and Name */}
          <div className="flex flex-col items-center md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
            <Image
              src="/logo.png"
              alt="Company Logo"
              width={80}
              height={80}
              className="rounded-full w-16 h-16 md:w-20 md:h-20"
            />
            <div className="text-center md:text-left">
              <h1 className="font-bold text-lg md:text-xl">Cuisine Cart</h1>
              <p className="text-xs md:text-sm mt-1 md:mt-2 text-gray-400">
                &copy; {new Date().getFullYear()} Cuisine Cart. All rights
                reserved.
              </p>
            </div>
          </div>

          {/* Social Media Links */}
          <div className="flex space-x-6">
            <Link
              href="https://www.facebook.com"
              target="_blank"
              aria-label="Facebook"
            >
              <FaFacebook
                size={20}
                className="hover:text-blue-500 transition-colors"
              />
            </Link>
            <Link
              href="https://www.instagram.com"
              target="_blank"
              aria-label="Instagram"
            >
              <FaInstagram
                size={20}
                className="hover:text-pink-500 transition-colors"
              />
            </Link>
            <Link
              href="https://www.twitter.com"
              target="_blank"
              aria-label="Twitter"
            >
              <FaTwitter
                size={20}
                className="hover:text-blue-400 transition-colors"
              />
            </Link>
          </div>
        </div>

        {/* Footer Links */}
        {!isAuthPage && (
          <div className="mt-8">
            <div className="flex flex-col space-y-8 sm:space-y-0 sm:grid sm:grid-cols-2 md:grid-cols-3 gap-8">
              {/* Common Links */}
              <div className="text-center sm:text-left">
                <h3 className="font-bold text-lg mb-4">Company</h3>
                <ul className="space-y-2 text-gray-400">
                  {commonLinks.map((item) => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className="hover:text-white transition-colors block py-1"
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Role-specific Links */}
              {user && (
                <div className="text-center sm:text-left">
                  <h3 className="font-bold text-lg mb-4">
                    {user.role === "chef"
                      ? "Chef's Navigation"
                      : "Diner's Navigation"}
                  </h3>
                  <ul className="space-y-2 text-gray-400">
                    {(user.role === "chef"
                      ? chefNavigation
                      : dinerNavigation
                    ).map((item) => (
                      <li key={item.name}>
                        <Link
                          href={item.href}
                          className="hover:text-white transition-colors block py-1"
                        >
                          {item.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Contact Information */}
              <div className="text-center sm:text-left">
                <h3 className="font-bold text-lg mb-4">Contact</h3>
                <ul className="text-gray-400 space-y-2">
                  <li>
                    <span className="block py-1">
                      Email: support@cuisinecart.com
                    </span>
                  </li>
                  <li>
                    <span className="block py-1">Phone: +1 800-123-4567</span>
                  </li>
                  <li>
                    <span className="block py-1">
                      Address: 123 Food St, City, Country
                    </span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Auth Links for Non-Logged In Users */}
            {!user && (
              <div className="mt-8 flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6">
                <Link
                  href="/auth/login"
                  className="hover:text-white transition-colors text-center py-2"
                >
                  Login
                </Link>
                <Link
                  href="/auth/signup"
                  className="hover:text-white transition-colors text-center py-2"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </footer>
  );
};

export default Footer;
