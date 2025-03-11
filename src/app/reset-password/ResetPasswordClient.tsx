"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Loader } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import axios from "axios";

export default function ResetPasswordClient() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showReTypePassword, setshowReTypePassword] = useState(false);
  const [form, setForm] = useState({
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({
    password: "",
    confirmPassword: "",
  });

  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,16}$/;

  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  // Validate Form Inputs
  const validateFormInputs = () => {
    let isValid: boolean = true;

    const errors = {
      password: "",
      confirmPassword: "",
    };

    if (!passwordRegex.test(form.password)) {
      errors.password = `Password must be valid format.`;
      isValid = false;
    }
    if (!form.confirmPassword) {
      errors.confirmPassword = "Confirm Password is required.";
      isValid = false;
    }
    if (form.password !== form.confirmPassword) {
      errors.confirmPassword = "Passwords do not match.";
      isValid = false;
    }
    setErrors(errors);
    return isValid;
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    e.preventDefault();
    setLoading(true);
    if (!validateFormInputs()) {
      setLoading(false);
      toast.error("Invalid inputs", {
        description: "Please provide valid details",
      });
      return;
    }
    try {
      const res = await axios.post("/api/auth/reset-password", {
        token,
        password: form.password.trim(),
      });
      if (res.status === 200) {
        setLoading(false);
        toast.success("Password reset successfully", {
          description: "You can now login with your new password",
        });
        router.push("/auth/login");
      }
    } catch (error: any) {
      console.error(error);
      toast.error("Password reset failed", {
        description: `Error: ${error.response.data.message}`,
      });
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[url('/images/login-bg.jpg')] bg-cover bg-no-repeat">
      <div className="relative lg:w-[50%] md:w-[80%] sm:w-full flex flex-col items-center bg-white rounded-lg  p-5 py-10">
        {/* Form Section */}
        <form
          onSubmit={handleResetPassword}
          className="space-y-2 w-[100%] max-w-[400px]"
        >
          <h2 className="text-xl text-center font-bold ">
            Reset Password
          </h2>
          <p className="text-sm text-center text-wrap py-4 font-medium">
            Please enter your new password to reset.
          </p>

          {/* Password Input */}
          <div className="relative mb-3">
            <Label className="block text-gray-700 font-semibold mb-1">
              New Password
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2">
                <Image
                  src="/icons/password.svg"
                  alt="Password Icon"
                  width={22}
                  height={22}
                  className="filter invert-0 brightness-0"
                />
              </span>
              <Input
                placeholder="Enter your password"
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full h-12 p-3 pl-12 pr-12 border border-[#FF9A1F] rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <span
                className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer"
                onClick={() => setShowPassword(!showPassword)}
              >
                <Image
                  src={
                    showPassword
                      ? "/icons/visibility-off.svg"
                      : "/icons/visibility-on.svg"
                  }
                  alt="Toggle Password"
                  width={22}
                  height={22}
                  className="filter invert-0 brightness-0"
                />
              </span>
            </div>
            {errors.password && (
              <p className="text-red-500 text-xs font-bold">
                {errors.password}
              </p>
            )}
            <p className="text-gray-600 text-xs">
              Password must be 8-16 characters, include at least:
              <br />✔ One uppercase letter
              <br />✔ One lowercase letter
              <br />✔ One number
              <br />✔ One special character (@, #, $, etc.)
            </p>
          </div>
          {/* Retype -Password Input */}
          <div className="relative mb-3">
            <Label className="block text-gray-700 font-semibold mb-1">
              Re-Type Password
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2">
                <Image
                  src="/icons/password.svg"
                  alt="Password Icon"
                  width={22}
                  height={22}
                  className="filter invert-0 brightness-0"
                />
              </span>
              <Input
                placeholder="Re-Enter your password"
                type={showPassword ? "text" : "password"}
                value={form.confirmPassword}
                onChange={(e) =>
                  setForm({ ...form, confirmPassword: e.target.value })
                }
                className="w-full h-12 p-3 pl-12 pr-12 border border-[#FF9A1F] rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <span
                className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer"
                onClick={() => setshowReTypePassword(!showReTypePassword)}
              >
                <Image
                  src={
                    showReTypePassword
                      ? "/icons/visibility-off.svg"
                      : "/icons/visibility-on.svg"
                  }
                  alt="Toggle Password"
                  width={22}
                  height={22}
                  className="filter invert-0 brightness-0"
                />
              </span>
            </div>
            {errors.confirmPassword && (
              <p className="text-red-500 text-xs  font-bold">
                {errors.confirmPassword}
              </p>
            )}
          </div>

          {/* Login Button */}
          <div className="w-full flex justify-center pt-4">
            <Button
              type="submit"
              className="w-[80%] text-white bg-orange-500 hover:bg-orange-600 font-semibold py-3 transition duration-200"
            >
              {loading ? <Loader /> : "Reset Password"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
