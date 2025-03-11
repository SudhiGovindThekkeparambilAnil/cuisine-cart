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
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [pathname]);

  const chefNavigation = [
    { name: "Dashboard", href: "/chef/dashboard" },
    { name: "Meals", href: "/chef/meals" },
    { name: "Dishes", href: "/chef/dishes" },
    { name: "Subscribers", href: "/chef/subscribers" },
    { name: "Profile", href: "/chef/profile" },
  ];

  const dinerNavigation = [
    { name: "Dashboard", href: "/diner/dashboard" },
    { name: "Meals", href: "/diner/meals" },
    { name: "Chefs", href: "/diner/chefs" },
    { name: "My Subscription", href: "/diner/subscriptions" },
    { name: "Profile", href: "/diner/profile" },
  ];

  const commonLinks = [
    { name: "Home", href: "/" },
    { name: "About Us", href: "/about" },
    { name: "Contact Us", href: "/contact" },
  ];

  // Check if we are on login or signup page
  const isAuthPage = pathname === "/auth/login" || pathname === "/auth/signup";

  if (loading) {
    return (
      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-6 text-center">
          <p>Loading footer...</p>
        </div>
      </footer>
    );
  }

  return (
    <footer className="bg-gray-800 text-white py-8">
      <div className="container mx-auto px-6">
        {/* Logo and Description Section */}
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          {/* Left Section - Logo and Name */}
          <div className="flex items-center space-x-4">
            <Image
              src="/logo.png"
              alt="Company Logo"
              width={120}
              height={120}
              className="rounded-full"
            />
            <div>
              <h1 className="font-bold text-xl">Cuisine Cart</h1>
              <p className="text-sm mt-2 text-gray-400">
                &copy; {new Date().getFullYear()} Cuisine Cart. All rights
                reserved.
              </p>
            </div>
          </div>

          {/* Right Section - Social Media Links */}
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link href="https://www.facebook.com" target="_blank">
              <FaFacebook size={24} className="hover:text-blue-500" />
            </Link>
            <Link href="https://www.instagram.com" target="_blank">
              <FaInstagram size={24} className="hover:text-pink-500" />
            </Link>
            <Link href="https://www.twitter.com" target="_blank">
              <FaTwitter size={24} className="hover:text-blue-400" />
            </Link>
          </div>
        </div>

        {/* Conditionally Render Footer Links */}
        {!isAuthPage && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 mt-8">
            {/* Common Links for All Users */}
            <div>
              <h3 className="font-bold text-lg mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                {commonLinks.map((item) => (
                  <li key={item.name}>
                    <Link href={item.href} className="hover:text-white">
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Conditional Links for Chef/Diner */}
            {user ? (
              <div>
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
                      <Link href={item.href} className="hover:text-white">
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {/* Contact Information */}
            <div>
              <h3 className="font-bold text-lg mb-4">Contact</h3>
              <ul className="text-gray-400">
                <li className="mb-2">
                  <span className="block">Email: support@cuisinecart.com</span>
                </li>
                <li className="mb-2">
                  <span className="block">Phone: +1 800-123-4567</span>
                </li>
                <li>
                  <span className="block">
                    Address: 123 Food St, City, Country
                  </span>
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* Links for non-logged in users */}
        {!user && !isAuthPage && (
          <div className="mt-8 text-center">
            <Link href="/auth/login" className="hover:text-white mx-2">
              Login
            </Link>
            <Link href="/auth/signup" className="hover:text-white mx-2">
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </footer>
  );
};

export default Footer;
