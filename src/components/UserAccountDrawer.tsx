"use client";

import { useState, useEffect } from "react";
import {
  X,
  User,
  Phone,
  MapPin,
  KeyRound,
  CheckCircle2,
  Clock,
  Truck,
  LogOut,
  Edit3,
  Receipt,
  Sparkles,
  Copy,
  Check,
  RefreshCw,
} from "lucide-react";
import { useShop } from "@/lib/store/shop-store";
import { formatWeight } from "@/lib/utils/delivery";

export function UserAccountDrawer() {
  const {
    isAccountOpen,
    setIsAccountOpen,
    currentUser,
    userOrders,
    userOrdersLoading,
    loginWithPhone,
    saveUserAccount,
    logoutUser,
    refreshUserOrders,
    setActiveReceipt,
  } = useShop();

  const [step, setStep] = useState<"PHONE" | "OTP" | "PROFILE_SETUP" | "DASHBOARD">("PHONE");
  const [phoneInput, setPhoneInput] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState<string | null>(null);
  const [otpInput, setOtpInput] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [addressInput, setAddressInput] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (currentUser) {
      setStep("DASHBOARD");
      setNameInput(currentUser.name);
      setAddressInput(currentUser.address);
      setGeneratedOtp(null);
    } else {
      setStep("PHONE");
    }
  }, [currentUser, isAccountOpen]);

  if (!isAccountOpen) return null;

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = phoneInput.replace(/\D/g, "");
    if (cleanPhone.length !== 10) {
      setErrorMsg("Please enter a valid 10-digit mobile number.");
      return;
    }
    setErrorMsg("");
    const randomOtp = Math.floor(1000 + Math.random() * 9000).toString();
    setGeneratedOtp(randomOtp);
    setOtpInput("");
    setStep("OTP");
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!generatedOtp || otpInput.trim() !== generatedOtp) {
      setErrorMsg("Invalid OTP! Please enter the 4-digit OTP shown on screen.");
      return;
    }

    setErrorMsg("");
    setSubmitting(true);
    setGeneratedOtp(null);

    const cleanPhone = phoneInput.replace(/\D/g, "").slice(-10);
    const result = await loginWithPhone(cleanPhone);
    setSubmitting(false);

    // Agar user pehle se registered hai, toh seedha DASHBOARD par bhejo!
    if (result.exists && result.user) {
      setStep("DASHBOARD");
    } else {
      // Naya user hai toh profile setup maango
      setNameInput("");
      setAddressInput("");
      setStep("PROFILE_SETUP");
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim() || !addressInput.trim()) {
      setErrorMsg("Please enter your full name and complete delivery address.");
      return;
    }

    setErrorMsg("");
    setSubmitting(true);
    const targetPhone = currentUser ? currentUser.phone : phoneInput.replace(/\D/g, "").slice(-10);
    const saved = await saveUserAccount({
      phone: targetPhone,
      name: nameInput.trim(),
      address: addressInput.trim(),
    });
    setSubmitting(false);

    if (saved) {
      setIsEditingProfile(false);
      setStep("DASHBOARD");
    }
  };

  const handleCopyOrderId = (receiptId: string) => {
    try {
      navigator.clipboard.writeText(receiptId);
      setCopiedId(receiptId);
      setTimeout(() => setCopiedId(null), 1500);
    } catch {}
  };

  const handleLogout = () => {
    logoutUser();
    setPhoneInput("");
    setOtpInput("");
    setGeneratedOtp(null);
    setStep("PHONE");
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm">
      <div className="relative flex h-full w-full max-w-md flex-col bg-gray-50 shadow-2xl">
        <div className="flex items-center justify-between bg-slate-900 text-white px-5 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-accent text-green-950 font-black">
              <User className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold leading-tight">
                {currentUser ? `Namaste, ${currentUser.name}` : "Customer Account"}
              </h2>
              <p className="text-[11px] text-slate-400">
                {currentUser
                  ? `+91 ${currentUser.phone} | Live Order & History`
                  : "Instant 0-Cost On-Screen OTP Login"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsAccountOpen(false)}
            className="rounded-full bg-slate-800 p-2 text-slate-300 hover:bg-slate-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {step === "PHONE" && (
            <div className="rounded-2xl bg-white p-5 shadow-sm border border-gray-100 space-y-4">
              <div>
                <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-0.5 text-[10px] font-extrabold uppercase text-brand-green mb-2">
                  <Sparkles className="h-3 w-3" /> Instant Login
                </span>
                <h3 className="text-base font-black text-gray-900">
                  Login or Create Account
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  Enter your 10-digit mobile number. If registered, your account and past orders load instantly!
                </p>
              </div>

              <form onSubmit={handleSendOtp} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Mobile Number (ID)
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      placeholder="Enter 10-digit mobile number"
                      value={phoneInput}
                      onChange={(e) => setPhoneInput(e.target.value.replace(/\D/g, ""))}
                      className="w-full rounded-xl border border-gray-200 pl-10 pr-3 py-2.5 text-sm font-bold text-gray-900 focus:border-brand-green focus:outline-none"
                    />
                  </div>
                </div>

                {errorMsg && <p className="text-xs font-bold text-red-600">{errorMsg}</p>}

                <button
                  type="submit"
                  className="w-full rounded-xl bg-brand-green py-3 text-xs font-extrabold uppercase tracking-wider text-white hover:bg-brand-dark transition shadow-sm"
                >
                  Generate Instant 4-Digit OTP
                </button>
              </form>
            </div>
          )}

          {step === "OTP" && (
            <div className="space-y-4">
              {generatedOtp && (
                <div className="rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 p-4 text-white shadow-lg border border-amber-300 animate-pulse">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider bg-black/20 px-2 py-0.5 rounded">
                      Auto Screen OTP (Free)
                    </span>
                    <span className="text-[11px] font-semibold opacity-90">
                      Disappears on Login
                    </span>
                  </div>
                  <p className="mt-2 text-xs font-medium">
                    Your 4-digit verification OTP for <strong>+91 {phoneInput}</strong> is:
                  </p>
                  <div className="mt-1.5 flex items-center justify-between bg-white/95 text-slate-900 rounded-xl px-4 py-2.5">
                    <span className="font-mono text-2xl font-black tracking-[0.25em] text-brand-green">
                      {generatedOtp}
                    </span>
                    <button
                      type="button"
                      onClick={() => setOtpInput(generatedOtp)}
                      className="rounded-lg bg-brand-green px-2.5 py-1 text-[11px] font-extrabold text-white hover:bg-brand-dark"
                    >
                      Auto-Fill OTP
                    </button>
                  </div>
                </div>
              )}

              <div className="rounded-2xl bg-white p-5 shadow-sm border border-gray-100 space-y-4">
                <div>
                  <h3 className="text-base font-black text-gray-900">Verify 4-Digit OTP</h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Enter the 4-digit OTP displayed on your screen above.
                  </p>
                </div>

                <form onSubmit={handleVerifyOtp} className="space-y-3">
                  <div className="relative">
                    <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      required
                      maxLength={4}
                      placeholder="Enter 4-digit OTP"
                      value={otpInput}
                      onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ""))}
                      className="w-full rounded-xl border border-gray-200 pl-10 pr-3 py-2.5 text-center font-mono text-lg font-black tracking-widest text-gray-900 focus:border-brand-green focus:outline-none"
                    />
                  </div>

                  {errorMsg && <p className="text-xs font-bold text-red-600">{errorMsg}</p>}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full rounded-xl bg-brand-green py-3 text-xs font-extrabold uppercase tracking-wider text-white hover:bg-brand-dark transition shadow-sm disabled:opacity-50"
                  >
                    {submitting ? "Verifying..." : "Verify & Login Now"}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setGeneratedOtp(null);
                      setStep("PHONE");
                    }}
                    className="w-full text-center text-xs font-bold text-gray-500 hover:underline pt-1"
                  >
                    Change Mobile Number
                  </button>
                </form>
              </div>
            </div>
          )}

          {step === "PROFILE_SETUP" && (
            <div className="rounded-2xl bg-white p-5 shadow-sm border border-gray-100 space-y-4">
              <div>
                <h3 className="text-base font-black text-gray-900">
                  Complete Your Profile
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Save your name and delivery address once—it will be permanently linked to this mobile number!
                </p>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Ramesh Kumar"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-xs font-semibold focus:border-brand-green focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Default Delivery Address
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="House No, Street, Colony, Landmark..."
                    value={addressInput}
                    onChange={(e) => setAddressInput(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs font-semibold focus:border-brand-green focus:outline-none"
                  />
                </div>

                {errorMsg && <p className="text-xs font-bold text-red-600">{errorMsg}</p>}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full rounded-xl bg-brand-green py-3 text-xs font-extrabold uppercase tracking-wider text-white hover:bg-brand-dark transition shadow-sm"
                >
                  {submitting ? "Saving..." : "Save Profile & Open Account"}
                </button>
              </form>
            </div>
          )}

          {step === "DASHBOARD" && currentUser && (
            <div className="space-y-4">
              <div className="rounded-2xl bg-white p-4 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-brand-green bg-green-50 px-2.5 py-0.5 rounded-full">
                    Saved Delivery Profile
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsEditingProfile(!isEditingProfile)}
                      className="inline-flex items-center gap-1 text-xs font-bold text-gray-600 hover:text-brand-green"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                      <span>{isEditingProfile ? "Cancel" : "Edit"}</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="inline-flex items-center gap-1 text-xs font-bold text-red-600 hover:underline ml-2"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>

                {isEditingProfile ? (
                  <form onSubmit={handleSaveProfile} className="space-y-2.5 mt-3 pt-2 border-t border-gray-100">
                    <input
                      type="text"
                      required
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      placeholder="Full Name"
                      className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs font-bold"
                    />
                    <textarea
                      rows={2}
                      required
                      value={addressInput}
                      onChange={(e) => setAddressInput(e.target.value)}
                      placeholder="Delivery Address"
                      className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs font-semibold"
                    />
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full rounded-xl bg-brand-green py-2 text-xs font-extrabold text-white"
                    >
                      {submitting ? "Updating..." : "Update Saved Details"}
                    </button>
                  </form>
                ) : (
                  <div className="text-xs space-y-1 text-gray-700">
                    <p className="font-extrabold text-gray-900 text-sm">{currentUser.name}</p>
                    <p className="flex items-center gap-1.5 text-gray-500 font-semibold">
                      <Phone className="h-3.5 w-3.5 text-brand-green" /> +91 {currentUser.phone}
                    </p>
                    <p className="flex items-start gap-1.5 text-gray-600 pt-0.5">
                      <MapPin className="h-3.5 w-3.5 text-brand-green shrink-0 mt-0.5" />
                      <span>{currentUser.address}</span>
                    </p>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between px-1">
                <div>
                  <h3 className="text-sm font-black text-gray-900">
                    My Orders & Live Status ({userOrders.length})
                  </h3>
                  <p className="text-[11px] text-gray-500">
                    Your complete order history linked to your mobile number
                  </p>
                </div>
                <button
                  type="button"
                  onClick={refreshUserOrders}
                  className="inline-flex items-center gap-1 rounded-lg bg-white border border-gray-200 px-2.5 py-1.5 text-xs font-bold text-gray-700 hover:bg-gray-100"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${userOrdersLoading ? "animate-spin" : ""}`} />
                  <span>Refresh</span>
                </button>
              </div>

              {userOrders.length === 0 ? (
                <div className="rounded-2xl bg-white p-8 text-center border border-gray-100">
                  <Receipt className="mx-auto h-9 w-9 text-gray-300 mb-2" />
                  <p className="text-sm font-bold text-gray-800">No Orders Found Yet</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Any order placed with mobile number <strong>{currentUser.phone}</strong> will appear here instantly.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {userOrders.map((order) => {
                    const isDelivered = order.status === "Delivered";
                    const isOut = order.status === "Out for Delivery";

                    return (
                      <div
                        key={order.receipt_id}
                        className="rounded-2xl bg-white p-4 shadow-sm border border-gray-100 space-y-3 hover:border-brand-green/40 transition"
                      >
                        <div className="flex items-center justify-between gap-2 border-b border-gray-100 pb-2.5">
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono text-xs font-black text-brand-green bg-green-50 px-2 py-0.5 rounded-md border border-green-200">
                                #{order.receipt_id}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleCopyOrderId(order.receipt_id)}
                                className="inline-flex items-center gap-1 rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-bold text-gray-600 hover:bg-gray-200"
                              >
                                {copiedId === order.receipt_id ? (
                                  <>
                                    <Check className="h-2.5 w-2.5 text-brand-green" /> Copied
                                  </>
                                ) : (
                                  <>
                                    <Copy className="h-2.5 w-2.5" /> Copy ID
                                  </>
                                )}
                              </button>
                            </div>
                            <p className="text-[11px] text-gray-400 mt-0.5">{order.timestamp}</p>
                          </div>

                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-extrabold border ${
                              isDelivered
                                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                : isOut
                                ? "bg-amber-50 text-amber-800 border-amber-300"
                                : "bg-blue-50 text-blue-800 border-blue-200"
                            }`}
                          >
                            {isDelivered ? (
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                            ) : isOut ? (
                              <Truck className="h-3.5 w-3.5 text-amber-600 animate-bounce" />
                            ) : (
                              <Clock className="h-3.5 w-3.5 text-blue-600" />
                            )}
                            <span>{order.status}</span>
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-1.5">
                          {order.items.map((item, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center rounded-lg bg-gray-50 px-2 py-1 text-[11px] font-bold text-gray-700 border border-gray-200/70"
                            >
                              {item.name} ({formatWeight(item.weight_kg)}) - Rs. {item.line_total}
                            </span>
                          ))}
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                          <div>
                            <span className="text-[10px] font-bold uppercase text-gray-400 block">
                              Grand Total
                            </span>
                            <span className="text-sm font-black text-gray-900">
                              Rs. {order.grand_total}
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              setActiveReceipt(order);
                              setIsAccountOpen(false);
                            }}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-brand-light border border-brand-green/30 px-3 py-1.5 text-xs font-extrabold text-brand-green hover:bg-brand-green hover:text-white transition"
                          >
                            <Receipt className="h-3.5 w-3.5" />
                            <span>View Digital Rashid</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}