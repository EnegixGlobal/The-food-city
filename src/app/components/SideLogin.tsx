import React, { useState } from "react";
import { FiX } from "react-icons/fi";
import Input from "./Input";
import Button from "./Button";

const SideLogin = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  // const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle login/signup logic here

  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      {/* Login Panel */}
      <div
        className={`fixed 
          md:top-0 md:right-0 md:h-full md:w-96 md:rounded-none 
          top-80 bottom-0  right-0 w-full rounded-t-3xl 
          bg-white z-50 shadow-2xl transform transition-transform duration-300 ease-in-out ${
          isOpen 
            ? "md:translate-x-0 translate-y-0" 
            : "md:translate-x-full translate-y-full"
        }`}>
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute md:top-4 md:left-4 top-4 right-4 text-gray-500 hover:text-red-900 transition p-2 z-10 cursor-pointer">
          <FiX size={24} />
        </button>

        {/* Content */}
        <div className="h-full flex flex-col p-6 md:p-8 pt-16 md:pt-16">
          {/* Header */}
          <div className="text-left mb-8">
            <h2 className="text-3xl font  mb-2">
              {isLogin ? "Login" : "Sign Up"}
            </h2>
            <p className="text-gray-600">
              or{" "}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-red-900 text-sm font-bold hover:underline">
                Create an account
              </button>
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
            <div className="space-y-6">
              {/* Email Field */}
              <div className="relative">
                <Input
                  type="phone"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your Phone Number"
                  className=""
                  required
                />
              </div>

              {!isLogin && (
                <>
                  {/* Name Field (for signup) */}
                  <div className="relative">
                    <Input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your Name"
                      className=""
                      required
                    />
                  </div>

                  {/* Email Field (for signup) */}
                  <div className="relative">
                    <Input
                      type="email"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Your Email"
                      className=""
                      required
                    />
                  </div>
                </>
              )}
            </div>

            {/* Submit Button */}
            <Button type="submit" className="mt-6 py-3!">
              {isLogin ? "Login" : "Create Account"}
            </Button>
          </form>
        </div>
      </div>
    </>
  );
};

export default SideLogin;
