"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Lock,
  Mail,
  User,
  Eye,
  EyeOff,
  Loader2,
  ArrowRight,
  Gift,
  CheckCircle,
  Zap,
  ShieldCheck,
  Brain,
  Smartphone,
  MessageCircle,
  Download,
  Trophy,
  TrendingUp,
  Camera,
  ExternalLink,
} from "lucide-react";
import Image from "next/image";
import { useAuth } from "../context/AuthContext";
import { ForcedLegalModal } from "../components/legal/LegalModal";
import { adminApi } from "../api/adminApi";
import { authApi } from "../api/authApi";

interface AuthPageProps {
  onSuccess?: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onSuccess }) => {
  const router = useRouter();
  const { login, register } = useAuth();

  const [mode, setMode] = useState<"LOGIN" | "SIGNUP">("SIGNUP");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showLegalModal, setShowLegalModal] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [telegramLinked, setTelegramLinked] = useState(false);
  const [linkUrl, setLinkUrl] = useState<string | null>(null);
  const [registeredUser, setRegisteredUser] = useState<any>(null);

  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (mode === "SIGNUP") {
      setShowLegalModal(true);
      return;
    }

    setIsSubmitting(true);
    try {
      await login({ email, password });
      if (onSuccess) onSuccess();
    } catch (err: any) {
      const errorDetail = err.response?.data?.detail;
      const status = err.response?.status;
      
      if (status === 401 || status === 403) {
        try {
          const adminData = await adminApi.login(email, password);
          localStorage.setItem("admin_token", adminData.access_token);
          localStorage.setItem("admin_role", adminData.role);
          router.replace("/admin");
          return;
        } catch (adminErr: any) {
          const adminErrorDetail = adminErr.response?.data?.detail;
          if (Array.isArray(adminErrorDetail)) {
            setErrorMessage(adminErrorDetail[0]?.msg || "Validation error");
          } else if (typeof adminErrorDetail === "string") {
            setErrorMessage(adminErrorDetail);
          } else {
            setErrorMessage("Authentication failed. Please check your credentials and network connection.");
          }
        }
      } else if (Array.isArray(errorDetail)) {
        setErrorMessage(errorDetail[0]?.msg || "Validation error");
      } else if (typeof errorDetail === "string") {
        setErrorMessage(errorDetail);
      } else {
        setErrorMessage("Authentication failed. Please check your credentials and network connection.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLegalAccept = async () => {
    setShowLegalModal(false);
    setIsSubmitting(true);
    try {
      const response = await register({
        full_name: fullName,
        username: username.trim().toLowerCase(),
        email,
        password,
        referral_code: referralCode.trim() || undefined,
      });
      setRegisteredUser(response.user);
      setLinkUrl(response.link_url || null);
      setShowOnboarding(true);
    } catch (err: any) {
      const errorDetail = err.response?.data?.detail;
      if (Array.isArray(errorDetail)) {
        setErrorMessage(errorDetail[0]?.msg || "Validation error");
      } else if (typeof errorDetail === "string") {
        setErrorMessage(errorDetail);
      } else {
        setErrorMessage("Registration failed. Please check your information and try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const result = await authApi.uploadProfileImage(file);
      setUploadedImage(result.profile_image_url);
    } catch (err: any) {
      setErrorMessage(err.response?.data?.detail || "Failed to upload image");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleCompleteOnboarding = () => {
    setShowOnboarding(false);
    if (onSuccess) onSuccess();
  };

  const openTelegramLink = () => {
    if (linkUrl) {
      window.open(linkUrl, "_blank");
      setTelegramLinked(true);
    }
  };

  return (
    <div className="min-h-screen bg-black text-gray-100 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[300px] h-[300px] bg-blue-500/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md bg-gray-900/90 border border-gray-800 backdrop-blur-xl rounded-3xl p-8 shadow-2xl relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-3">
            <Image src="/logo.png" alt="TaskEarn Logo" width={120} height={120} className="mx-auto" />
          </div>
          <h2 className="text-2xl font-bold text-white">
            {mode === "LOGIN" ? "Welcome Back" : "Create an Account"}
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            {mode === "LOGIN"
              ? "Access your micro-task ledger, crypto wallet, and P2P exchange"
              : "Join TaskEarn to start completing micro-tasks and trading TCoin"}
          </p>
        </div>

        {!showOnboarding ? (
          <>
            <div className="flex p-1.5 bg-gray-950 rounded-2xl border border-gray-800/80 mb-6">
              <button
                type="button"
                onClick={() => { setMode("SIGNUP"); setErrorMessage(null); }}
                className={`flex-1 py-2.5 text-xs font-semibold rounded-xl transition-all ${
                  mode === "SIGNUP"
                    ? "bg-emerald-500 text-black shadow-md shadow-emerald-500/20 font-bold"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Sign Up
              </button>
              <button
                type="button"
                onClick={() => { setMode("LOGIN"); setErrorMessage(null); }}
                className={`flex-1 py-2.5 text-xs font-semibold rounded-xl transition-all ${
                  mode === "LOGIN"
                    ? "bg-emerald-500 text-black shadow-md shadow-emerald-500/20 font-bold"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Log In
              </button>
            </div>

            {errorMessage && (
              <div className="mb-5 p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-400 flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === "SIGNUP" && (
                <>
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-gray-400 ml-1">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full pl-10 pr-4 py-3 bg-gray-950 border border-gray-800 rounded-xl text-xs text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500 transition-colors"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-gray-400 ml-1">Username</label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-x-1/2 -translate-y-1/2 text-gray-500 text-xs font-mono">@</span>
                      <input
                        type="text"
                        required
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="johndoe"
                        className="w-full pl-10 pr-4 py-3 bg-gray-950 border border-gray-800 rounded-xl text-xs text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500 transition-colors"
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-gray-400 ml-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-10 pr-4 py-3 bg-gray-950 border border-gray-800 rounded-xl text-xs text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center ml-1">
                  <label className="text-[11px] font-medium text-gray-400">Password</label>
                  {mode === "LOGIN" && (
                    <button type="button" className="text-[11px] text-emerald-400 hover:underline">
                      Forgot?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-3 bg-gray-950 border border-gray-800 rounded-xl text-xs text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-x-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {mode === "SIGNUP" && (
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-gray-400 ml-1">
                    Referral Code <span className="text-gray-600">(Optional)</span>
                  </label>
                  <div className="relative">
                    <Gift className="absolute left-3.5 top-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type="text"
                      value={referralCode}
                      onChange={(e) => setReferralCode(e.target.value)}
                      placeholder="REF12345"
                      className="w-full pl-10 pr-4 py-3 bg-gray-950 border border-gray-800 rounded-xl text-xs text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500 transition-colors uppercase font-mono"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 mt-2 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/10 transition-all disabled:opacity-50"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>{mode === "LOGIN" ? "Sign In" : "Create Account"}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-gray-800/80 text-center">
              <p className="text-[11px] text-gray-500 flex items-center justify-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                Protected by 256-bit encryption & FastAPI Ledger
              </p>
            </div>
          </>
        ) : (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-bold text-white mb-1">Complete Your Profile</h3>
              <p className="text-xs text-gray-400">Upload a profile picture and link your Telegram</p>
            </div>

            <div className="space-y-4">
              <div className="flex flex-col items-center gap-3">
                <div className="w-20 h-20 rounded-full bg-gray-800 border-2 border-gray-700 flex items-center justify-center overflow-hidden">
                  {uploadedImage ? (
                    <img src={uploadedImage} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <User size={32} className="text-gray-500" />
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingImage}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-xl text-xs font-medium transition-all disabled:opacity-50"
                >
                  {uploadingImage ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Camera size={14} />
                  )}
                  {uploadedImage ? "Change Photo" : "Upload Photo"}
                </button>
              </div>

              <div className="p-4 bg-gray-950/60 rounded-xl border border-gray-800">
                <div className="flex items-center gap-3 mb-3">
                  <MessageCircle className="w-5 h-5 text-blue-400" />
                  <div>
                    <p className="text-xs font-medium text-white">Link Telegram Account</p>
                    <p className="text-[10px] text-gray-500">Connect your Telegram to receive earnings & alerts</p>
                  </div>
                </div>
                {linkUrl ? (
                  <button
                    type="button"
                    onClick={openTelegramLink}
                    className={`w-full py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2 ${
                      telegramLinked
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                        : "bg-blue-500 hover:bg-blue-400 text-white"
                    }`}
                  >
                    {telegramLinked ? (
                      <>
                        <CheckCircle size={14} />
                        Telegram Linked
                      </>
                    ) : (
                      <>
                        <ExternalLink size={14} />
                        Open Telegram Bot
                      </>
                    )}
                  </button>
                ) : (
                  <p className="text-[10px] text-gray-500">Telegram linking not configured</p>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={handleCompleteOnboarding}
              className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/10 transition-all"
            >
              Complete Setup
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        <ForcedLegalModal
          isOpen={showLegalModal}
          onAccept={handleLegalAccept}
          onClose={() => setShowLegalModal(false)}
        />
      </div>
    </div>
  );
};

export default AuthPage;
