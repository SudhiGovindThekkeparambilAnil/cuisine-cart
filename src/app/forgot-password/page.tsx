"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import axios from "axios";
import { Loader } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post("/api/auth/forgot-password", { email:  email.trim() });
      if (response.status === 200) {
        setMessage("");
        setEmailSent(true);
        toast.success("Reset Link Sent!",
        //    {
        //   description: `${response.response.}`
        // }
      )
      }
    } catch(error: any) {
      console.log(error)
      setMessage(`Error sending reset link!, ${error.response.data.message}`);
      toast.error("Error sending reset link", {
        description: `${error.response.data.message}`
      });
    } finally {
      setLoading(false);
    }
  }
   
  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full bg-[url('/images/login-bg.jpg')] bg-cover bg-no-repeat">
      <div className="relative w-[80%] md:w-[70%] lg:w-[50%] rounded flex flex-col items-center bg-white  p-5 m-2 pt-20">
      { !emailSent ? (
          <>
        {/* Form Section */}
        <form
          onSubmit={handleForgotPassword}
          className="space-y-2 w-[100%] max-w-[400px]"
        >
          <h2 className="text-xl text-center font-bold ">Forgot Password</h2>
          <p className="text-sm text-center text-wrap py-4 font-medium">Please enter your email linked with this account.</p>

          {/* Email Input */}
          <div>
            <Label className="block text-gray-700 font-semibold mb-1">
              Email
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2">
                <Image
                  src="/icons/mail.svg"
                  alt="Email Icon"
                  width={22}
                  height={22}
                  className="filter invert-0 brightness-0"
                />
              </span>
              <Input
                required
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-12 p-3 pl-12 border border-[#FF9A1F] rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            {message && <p className="text-sm text-red-700 font-bold mt-2">{message}</p>}
          </div>

          <Button
            type="submit"
            className="w-[100%] bg-orange-500 hover:bg-orange-600 text-center font-semibold text-white py-3 transition duration-200"
          >
            {loading ? <Loader /> : "Send Reset Link"}
          </Button>
        </form>
        {/* Signup Link */}
        <p className="text-center text-gray-600 mx-5 py-4 text-xs">
          Remember your Password?{" "}
          <span
            className="text-orange-500 font-semibold cursor-pointer hover:underline"
            onClick={() => router.push("/auth/login")}
          >
            Login
          </span>
        </p>
        </>
        ) : (
          // Confirmation Message Box
          <div className="flex flex-col items-center p-6">
            <Image src="/sendEmail.png" alt="Email Sent" width={200} height={200} />
            <h2 className="text-xl font-bold mt-4">Reset Link Sent!</h2>
            <p className="text-sm text-center text-gray-600 mt-2">
              A reset link has been sent to your <span className="font-semibold text-black">{email}</span>.
            </p>
            <p className="text-sm text-center text-gray-600 mt-2" > Please check your inbox.</p>
          </div>
        )}
      </div>
    </div>
  );
}
