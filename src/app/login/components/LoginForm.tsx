'use client';

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, Lock, Eye, EyeOff, AlertCircle, Globe } from "lucide-react";
import { useRouter } from "next/navigation";
import { ThemeSwitcher } from "@/shared/theme/components/ThemeSwitcher";
import { useTranslation } from "react-i18next";
import { signInAction } from "@/modules/auth/actions/auth.actions";
import { loginSchema, LoginFormValues } from "@/modules/auth/types";
import { toast } from "sonner";

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { i18n } = useTranslation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const getErrorMessage = (errMessage: string) => {
    if (errMessage.includes("Invalid login credentials")) return "Email hoặc mật khẩu không đúng";
    if (errMessage.includes("Email not confirmed")) return "Vui lòng xác nhận email trước khi đăng nhập";
    if (errMessage.includes("Too many requests")) return "Quá nhiều lần thử. Vui lòng đợi vài phút";
    return errMessage;
  };

  const onSubmit = async (data: LoginFormValues) => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await signInAction(data);
      if (!res.success) {
        throw new Error(res.error);
      }
      toast.success("Đăng nhập thành công!");
      router.push("/admin/dashboard");
      router.refresh();
    } catch (err: any) {
      setError(getErrorMessage(err.message));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex w-full flex-col items-center justify-center bg-white px-8 py-12 dark:bg-[oklch(0.18_0.02_85)] lg:w-1/2">
      {/* Header Top-Right */}
      <div className="absolute right-6 top-6 flex items-center gap-3">
        <ThemeSwitcher />
        <button
          type="button"
          className="flex h-8 items-center gap-1.5 rounded-xl border border-premium-border bg-white px-3 text-xs font-bold uppercase text-premium-muted shadow-sm transition-colors hover:bg-premium-bg dark:bg-black"
          onClick={() => i18n.changeLanguage(i18n.language === "en" ? "vi" : "en")}
        >
          <Globe className="h-3.5 w-3.5" />
          {i18n.language}
        </button>
      </div>

      {/* Form Container */}
      <div className="w-full max-w-sm animate-in fade-in slide-in-from-bottom-8 duration-500">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">Chào mừng trở lại 👋</h2>
          <p className="mt-1.5 text-sm text-premium-muted">Đăng nhập để tiếp tục quản lý hệ thống</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-neutral-700 dark:text-neutral-300">
              Tên đăng nhập hoặc Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-premium-muted/60" />
              <input
                {...register("identifier")}
                type="text"
                placeholder="admin hoặc email@congty.com"
                disabled={isLoading}
                className={`w-full rounded-xl border bg-white py-3 pl-10 pr-4 text-sm text-neutral-900 placeholder:text-neutral-400 transition-all focus:border-premium-primary/50 focus:ring-4 focus:ring-premium-primary/8 dark:bg-[oklch(0.22_0.03_85)] dark:text-white ${
                  errors.identifier || error ? "border-red-400 ring-4 ring-red-100 dark:ring-red-900/20" : "border-premium-border"
                }`}
              />
            </div>
            {errors.identifier && (
              <p className="mt-1.5 text-xs font-medium text-red-500">{errors.identifier.message}</p>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-neutral-700 dark:text-neutral-300">
              Mật khẩu
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-premium-muted/60" />
              <input
                {...register("password")}
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                disabled={isLoading}
                className={`w-full rounded-xl border bg-white py-3 pl-10 pr-11 text-sm text-neutral-900 placeholder:text-neutral-400 transition-all focus:border-premium-primary/50 focus:ring-4 focus:ring-premium-primary/8 dark:bg-[oklch(0.22_0.03_85)] dark:text-white ${
                  errors.password || error ? "border-red-400 ring-4 ring-red-100 dark:ring-red-900/20" : "border-premium-border"
                }`}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-premium-muted transition-colors hover:text-premium-primary"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1.5 text-xs font-medium text-red-500">{errors.password.message}</p>
            )}
          </div>

          <div className="flex justify-end">
            <a href="#" className="text-xs font-semibold text-premium-primary transition-colors hover:text-premium-secondary">
              Quên mật khẩu?
            </a>
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 dark:border-red-900/30 dark:bg-red-900/10 shake">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
              <p className="text-xs font-medium text-red-700 dark:text-red-400">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className={`relative mt-2 w-full overflow-hidden rounded-xl bg-[image:var(--image-gold-gradient)] py-3 text-sm font-bold text-white shadow-[var(--shadow-gold)] transition-all duration-200 hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70 ${
              isLoading ? "" : "btn-shimmer"
            }`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                <span>Đang đăng nhập...</span>
              </div>
            ) : (
              "Đăng nhập"
            )}
          </button>
        </form>

        <p className="mt-10 text-center text-xs text-neutral-400">© 2025 TanaPlano</p>
      </div>
    </div>
  );
}
