"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";
import { Button, Input, Badge, Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, Icons } from "@/components/ui";

export default function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [keepSignedIn, setKeepSignedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!email || !password) {
      setErrorMessage("Harap masukkan email dan kata sandi.");
      return;
    }

    setIsLoading(true);
    try {
      const result = await login(email, password, keepSignedIn);
      if (result.success) {
        router.push("/persediaan");
      } else {
        setErrorMessage(result.error);
      }
    } catch {
      setErrorMessage("Terjadi kesalahan sistem saat mencoba masuk.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickFill = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setErrorMessage("");
  };

  return (
    <div
      data-slot="login-container"
      className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 bg-surface-canvas relative overflow-hidden select-none"
    >
      {/* Background Subtle Gradient & Tactical Glow */}
      <div
        data-slot="background-glow"
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-surface-subtle via-surface-canvas to-surface-canvas opacity-85 pointer-events-none"
      />
      <div
        data-slot="background-grid"
        className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_70%,transparent_100%)] pointer-events-none"
      />

      <div data-slot="login-card-wrapper" className="w-full max-w-md relative z-10 flex flex-col gap-6">
        {/* Brand Header */}
        <div data-slot="brand-header" className="flex flex-col items-center text-center gap-2">
          
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-text-primary">
            Masuk ke Sistem Gudang
          </h1>
          <p className="text-xs text-text-secondary max-w-xs leading-relaxed">
            Akses pemantauan persediaan realtime, mutasi stok, dan verifikasi fisik inventaris.
          </p>
        </div>

        {/* Card Form */}
        <Card
          data-slot="card"
          className="border border-border-default bg-surface-card/90 backdrop-blur-md shadow-2xl rounded-2xl transition-[border-color,box-shadow] duration-200"
        >
          <CardHeader className="pb-2 pt-6 px-6 sm:px-8">
            <CardTitle className="text-base font-bold text-text-primary">Autentikasi Staf Gudang</CardTitle>
            <CardDescription className="text-xs text-text-muted">
              Gunakan kredensial akun terdaftar untuk melanjutkan sesi operasional.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-6 sm:p-8 pt-2">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4.5" noValidate>
              {/* Error Alert with Emil-style smooth entry */}
              {errorMessage && (
                <div
                  data-slot="alert-error"
                  role="alert"
                  className="p-3 text-xs rounded-xl bg-accent-red-surface/50 border border-accent-red-border text-accent-red flex items-start gap-2.5 transition-[opacity,transform] duration-200 ease-out animate-in fade-in zoom-in-[0.98]"
                >
                  <span className="font-bold text-accent-red shrink-0 mt-0.5">✕</span>
                  <span className="flex-1 leading-relaxed text-xs">{errorMessage}</span>
                </div>
              )}

              {/* Email Form Item */}
              <div data-slot="form-item" className="flex flex-col gap-1.5">
                <label
                  htmlFor="email"
                  data-slot="label"
                  className="text-xs font-semibold text-text-primary uppercase tracking-wider font-mono cursor-pointer"
                >
                  Alamat Email
                </label>
                <div className="relative flex items-center">
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@choral.id"
                    required
                    disabled={isLoading}
                    autoComplete="email"
                    icon={Icons.Mail}
                    size="lg"
                    className="bg-surface-muted text-xs focus-visible:ring-1 focus-visible:ring-accent-yellow/50"
                  />
                </div>
              </div>

              {/* Password Form Item */}
              <div data-slot="form-item" className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="password"
                    data-slot="label"
                    className="text-xs font-semibold text-text-primary uppercase tracking-wider font-mono cursor-pointer"
                  >
                    Kata Sandi
                  </label>
                </div>
                <div className="relative flex items-center w-full">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    disabled={isLoading}
                    autoComplete="current-password"
                    icon={Icons.Lock}
                    size="lg"
                    className="bg-surface-muted text-xs pr-11 focus-visible:ring-1 focus-visible:ring-accent-yellow/50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={0}
                    aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                    className="absolute right-3 p-1 rounded-md text-text-muted hover:text-text-primary focus:outline-none focus-visible:ring-1 focus-visible:ring-accent-yellow/50 active:scale-90 transition-[color,transform] duration-150 ease-out"
                  >
                    {showPassword ? (
                      <Icons.EyeOff className="size-4 shrink-0" />
                    ) : (
                      <Icons.Eye className="size-4 shrink-0" />
                    )}
                  </button>
                </div>
              </div>

              {/* Checkbox Keep Me Signed In */}
              <div data-slot="form-item" className="pt-0.5">
                <label
                  htmlFor="keep-signed-in"
                  className="flex items-start gap-3 cursor-pointer select-none group"
                >
                  <input
                    id="keep-signed-in"
                    name="keep-signed-in"
                    type="checkbox"
                    checked={keepSignedIn}
                    onChange={(e) => setKeepSignedIn(e.target.checked)}
                    disabled={isLoading}
                    className="mt-0.5 size-4 rounded border-border-default bg-surface-muted text-accent-yellow focus:ring-accent-yellow/40 focus:ring-offset-0 cursor-pointer accent-amber-400 shrink-0 transition-[border-color,background-color] duration-150"
                  />
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-medium text-text-primary group-hover:text-accent-yellow transition-colors duration-150">
                      Tetap masuk di perangkat ini (Keep me signed in)
                    </span>
                    <span className="text-[11px] text-text-muted leading-relaxed">
                      Centang di HP/perangkat scanner pribadi. Jangan centang di komputer bersama.
                    </span>
                  </div>
                </label>
              </div>

              {/* Submit Button with Emil tactile active state */}
              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={isLoading}
                data-slot="submit-button"
                className="w-full mt-2 font-bold tracking-wide active:scale-[0.98] transition-[transform,background-color,box-shadow] duration-150 ease-out"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="size-4 rounded-full border-2 border-black border-t-transparent animate-spin [animation-duration:500ms]" />
                    <span>Mengotentikasi...</span>
                  </span>
                ) : (
                  <span>Masuk ke Dashboard</span>
                )}
              </Button>
            </form>
          </CardContent>

          {/* Quick-fill testing credentials pill */}
          <CardFooter className="px-6 sm:px-8 pb-6 pt-0 border-t border-border-subtle/50 flex flex-col gap-2.5">
            <div className="w-full pt-4 flex items-center justify-between text-[11px] text-text-muted font-mono">
              <span>Akun Demo / Uji Coba:</span>
              <button
                type="button"
                onClick={() => handleQuickFill("admin@choral.id", "choral2026")}
                className="text-accent-yellow hover:underline cursor-pointer font-semibold active:scale-95 transition-transform duration-100"
              >
                Isi Kredensial
              </button>
            </div>
          </CardFooter>
        </Card>

        {/* Security Trust Note */}
        <div data-slot="security-note" className="text-center">
          <p className="text-[11px] text-text-muted flex items-center justify-center gap-1.5 font-mono">
            <Icons.ShieldCheck className="size-3.5 text-accent-green" />
            <span>Terlindungi dengan Firebase Auth &amp; Firestore Rules</span>
          </p>
        </div>
      </div>
    </div>
  );
}
