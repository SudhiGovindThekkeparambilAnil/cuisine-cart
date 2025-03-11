'use client';

import Hero from "@/components/content/home/Hero";
import Features from "@/components/content/home/Features";
import About from "@/components/content/home/About";
import Testimonials from "@/components/content/home/Testimonials";
import Contact from "@/components/content/home/Contact";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import axios from "axios";


export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
        const res = await axios.get("/api/auth/session");
        if (res.status == 201) {
          if (res.data.role == 'diner') {
            router.push('/diner/dashboard');
          } else {
            router.push('/chef/dashboard');
          }
        } 
      
    };
    fetchUser();
  }, [router]);

  return (
    <>
      <div className="fixed bottom-4 right-4">
        <a
          href="#hero"
          className="text-white p-2 bg-orange-600 rounded-full shadow-lg hover:bg-orange-700">
          ↑
        </a>
      </div>
      <Hero />
      <Features />
      <About />
      <Testimonials />
      <Contact />
    </>
  );
}
