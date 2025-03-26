"use client";
import { Dialog, DialogPanel } from "@headlessui/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import axios from "axios";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface User {
  email: string;
  role: string;
  name: string;
}

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get("/api/auth/session");
        if (res.status === 200) {
          console.log(res);
          setUser(res.data);
        }
      } catch {
        setUser(null);
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
    { name: "Dishes", href: "/diner/dishes" },
    { name: "Chefs", href: "/diner/chefs" },
    { name: "My Subscription", href: "/diner/subscriptions" },
    { name: "Profile", href: "/diner/profile" },
  ];

  // Hide header on login and signup pages
  if (pathname === "/auth/login" || pathname === "/auth/signup") {
    return null;
  }

  // Logout functionality
  const handleLogout = async () => {
    try {
      await axios.post("/api/auth/logout");
      setUser(null);
      localStorage.removeItem("role"); 
      toast.info("Logout Successful!", {
        description: "Session has been logged out.",
      });
      router.push("/");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  // to open confirm modal for logout
  const openModal = () => setIsModalOpen(true);
  // to close the logout confirm modal
  const closeModal = () => setIsModalOpen(false);

  // If confirmed, calling the logout function and closing the mdoal.
  const confirmLogout = () => {
    handleLogout();
    closeModal();
  };

  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto flex justify-between items-center p-6">
        <div className="flex items-center">
        <Image
            src="/logo.png"
            alt="Company Logo"
            width={90}
            height={90}
            className="w-20 h-20 sm:w-22 sm:h-22 md:w-24 md:h-24 lg:w-26 lg:h-26 me-3 rounded"
          />
        <p className="text-2xl font-bold text-gray-800">
          {" "}
         
          Cuisine Cart
        </p>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex space-x-8">
          {user ? (
            (user.role === "chef" ? chefNavigation : dinerNavigation).map((item) => (
              <Link
                key={item.name}
                href={item.href || "/"}
                className="text-gray-600 hover:text-blue-600">
                {item.name}
              </Link>
            ))
          ) : (
            <>
              <Link href="/auth/login" className="text-gray-600 hover:text-blue-600">
                Login
              </Link>
              <Link href="/user-selection" className="text-gray-600 hover:text-blue-600">
                Signup
              </Link>
            </>
          )}
          {user && (
            <button onClick={openModal} className="text-red-600 hover:text-red-800">
              Logout
            </button>
          )}
        </nav>

        {/* Mobile Menu Toggle */}
        <div className="lg:hidden">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="text-gray-800 focus:outline-none">
            <Bars3Icon className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <Dialog
        as="div"
        className="lg:hidden"
        open={mobileMenuOpen}
        onClose={setMobileMenuOpen}
      >
        <div className="fixed inset-0 z-10 bg-black bg-opacity-50" />
        <div className="fixed inset-0 z-20 flex flex-col justify-between items-center bg-white">
          <DialogPanel className="w-full h-full p-6 flex flex-col justify-between">
            {/* Logo Section */}
            <div className="text-center mb-6">
              <p className="text-3xl font-bold text-gray-800">Cuisine Cart</p>
            </div>

            <nav className="flex flex-col items-center space-y-6 mb-12">
              {user ? (
                (user.role === "chef" ? chefNavigation : dinerNavigation).map((item) => (
                  <Link
                    key={item.name}
                    href={item.href || "/"}
                    className="text-xl text-gray-600 hover:text-blue-600"
                    onClick={() => setMobileMenuOpen(false)}>
                    {item.name}
                  </Link>
                ))
              ) : (
                <>
                  <Link href="/auth/login" className="text-xl text-gray-600 hover:text-blue-600">
                    Login
                  </Link>
                  <Link href="/auth/signup" className="text-xl text-gray-600 hover:text-blue-600">
                    Signup
                  </Link>
                </>
              )}
            </nav>

            {user && (
              <div className="flex justify-center">
                <button
                  onClick={handleLogout}
                  className="block bg-red-600 text-white py-3 px-8 rounded-full text-lg font-semibold mb-4 hover:bg-red-700 transition duration-300">
                  Logout
                </button>
              </div>
            )}
          </DialogPanel>

          <div className="absolute top-4 right-4">
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="text-gray-800 focus:outline-none">
              <XMarkIcon className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
        </div>
      </Dialog>

      {/* Confirmation Modal */}
      <Dialog open={isModalOpen} onClose={closeModal}>
        <div className="fixed inset-0 z-10 bg-black bg-opacity-50" />
        <DialogPanel className="fixed inset-0 z-20 flex justify-center items-center">
          <div className="bg-white p-8 rounded-lg shadow-lg max-w-sm w-full">
            <h3 className="text-xl font-semibold text-gray-800">
              Confirm Logout
            </h3>
            <p className="text-gray-600 mt-4">
              Are you sure you want to log out?
            </p>
            <div className="mt-6 flex justify-end space-x-4">
              <button
                onClick={closeModal}
                className="bg-gray-300 text-gray-800 py-2 px-4 rounded-md">
                Cancel
              </button>
              <button
                onClick={confirmLogout}
                className=" bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded-md">
                Logout
              </button>
            </div>
          </div>
        </DialogPanel>
      </Dialog>
    </header>
  );
}
