"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import axios from "axios";
import { Loader } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import AuthContainer from "@/components/AuthContainer";

export default function SignupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showReTypePassword, setshowReTypePassword] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "",
  });
  const [errors, setErrors] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const nameRegex = /^(?! )[A-Za-z]+(?: [A-Za-z]+)*$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,16}$/;

  useEffect(() => {
    // const storedRole = localStorage.getItem("role") || "";
    // setForm((prev) => ({ ...prev, role: storedRole }));
    const storedRole = localStorage.getItem("role") || "";
    if (storedRole) {
      setForm((prev) => ({ ...prev, role: storedRole }));
    } else {
      toast.error("Role not selected. Please select a role before signing up.");
    }

  }, []);

  // Validate Form Inputs
  const validateFormInputs = () => {
    let isValid: boolean = true;

    const errors = {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    };

    if (!nameRegex.test(form.name)) {
      errors.name = "Name must be alphabets and spaces only.";
      isValid = false;
    }
    if (!emailRegex.test(form.email)) {
      errors.email = "Invalid email address.";
      isValid = false;
    }
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const storedRole = localStorage.getItem("role");

    if (!storedRole) {
      // If role is not selected, redirect to role selection page
      router.push("/user-selection");
      setLoading(false);
      return;
    }

    setLoading(true);
    if (!validateFormInputs()) {
      setLoading(false);
      toast.error("Invalid inputs", {
        description: "Please provide valid details",
      });
      return;
    }
    try {
      const requsetBody = {
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password.trim(),
        role: form.role.trim(),
      };
      const res = await axios.post("/api/auth/signup", requsetBody);
      if (res.status === 201) {
        toast.success("Signup Successful!", {
          description: "Your account has been created.",
        });
        router.push("/auth/login");
      } 
    } catch (error: any) {
      toast.error(`${error.response.data.error}`, {
        description: `Please try again with valid input details.`,
      });
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContainer>
      <div className="flex items-center justify-center min-h-screen bg-[#FFF6EC] p-4">
        {/* Login Container */}
        <div className="relative bg-white shadow-lg rounded-3xl overflow-hidden w-full max-w-6xl h-[750px] border border-[#FF9A1F] flex flex-col items-center my-6">
          {/* Half Circle at the Top */}

          <div className="flex flex-grow w-full">
            {/* Left Side - Image Section */}
            <div className="hidden md:flex w-1/2 h-full bg-orange-100 items-center justify-center p-0">
              <div className="relative w-full h-full">
                <Image
                  src="/images/login-bg.jpg"
                  alt="Login Illustration"
                  layout="fill"
                  objectFit="cover"
                  className="rounded-l-3xl"
                />
              </div>
            </div>

            {/* Right Side - Form Section */}
            <div className="relative w-full md:w-1/2 flex flex-col items-center p-10">
              {/* Half Circle at the Top */}
              <div className="absolute top-[-50px] left-1/2 transform -translate-x-1/2 w-[280px] h-[120px] bg-orange-500 rounded-b-full flex items-center justify-center">
                <h2 className="text-2xl mt-10 font-semibold text-black">
                  {form.role ? `Signup as ${form.role}` : "Signup"}
                </h2>
              </div>

              <div className="relative w-full flex flex-col items-center  lg:p-10 py-8">
                {/* Form Section */}
                <form
                  onSubmit={handleSubmit}
                  className="space-y-2 w-[100%] max-w-[400px]"
                >
                  {/* Name Input */}
                  <div className="mb-3">
                    <Label className="block text-gray-700 font-semibold mb-1">
                      Name
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2">
                        <Image
                          src="/icons/user-icon.svg"
                          alt="User Icon"
                          width={22}
                          height={22}
                          className="filter invert-0 brightness-0"
                        />
                      </span>
                      <Input
                        placeholder="Enter your Name"
                        type="text"
                        value={form.name}
                        onChange={(e) =>
                          setForm({ ...form, name: e.target.value })
                        }
                        className="w-full h-12 p-3 pl-12 border border-[#FF9A1F] rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                    {errors.name && (
                      <p className="text-red-500 text-xs  font-bold">{errors.name}</p>
                    )}
                  </div>
                  {/* Email Input */}
                  <div className="mb-3">
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
                        placeholder="Enter your email"
                        type="email"
                        value={form.email}
                        onChange={(e) =>
                          setForm({ ...form, email: e.target.value })
                        }
                        className="w-full h-12 p-3 pl-12 border border-[#FF9A1F] rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                    {errors.email && (
                      <p className="text-red-500 text-xs  font-bold">{errors.email}</p>
                    )}
                  </div>

                  {/* Password Input */}
                  <div className="relative mb-3">
                    <Label className="block text-gray-700 font-semibold mb-1">
                      Password
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
                        onChange={(e) =>
                          setForm({ ...form, password: e.target.value })
                        }
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
                      <p className="text-red-500 text-xs font-bold">{errors.password}</p>
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
                        onClick={() =>
                          setshowReTypePassword(!showReTypePassword)
                        }
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
                    {errors.confirmPassword && <p className="text-red-500 text-xs  font-bold">{errors.confirmPassword}</p>}
                  </div>

                  {/* Login Button */}
                  <div className="w-full flex justify-center pt-4">
                    <Button
                      type="submit"
                      className="w-[80%] bg-orange-500 hover:bg-orange-600 font-semibold py-3 transition duration-200"
                    >
                      {loading ? <Loader /> : "Signup"}
                    </Button>
                  </div>
                </form>
              {/* Signup Link */}
              <p className="text-center text-gray-600 mx-5 py-4 text-xs">
                Already have an account?{" "}
                <span
                  className="text-orange-500 font-semibold cursor-pointer hover:underline"
                  onClick={() => router.push("/auth/login")}
                >
                  Login
                </span>
              </p>
              </div>

            </div>
          </div>
        </div>
      </div>
    </AuthContainer>
  );
}
