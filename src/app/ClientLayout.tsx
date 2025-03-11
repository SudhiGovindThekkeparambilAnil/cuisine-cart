"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Loader from "@/components/Loader"; 

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (pathname === "/") {
      const timer = setTimeout(() => {
        setLoading(false);
        router.push("/user-selections/user-selection"); 
      }, 5000); 

      return () => {
        clearTimeout(timer);
      };
    } else {
      setLoading(false); 
    }
  }, [router, pathname]);

  return <>{loading ? <Loader /> : <main>{children}</main>}</>;
}