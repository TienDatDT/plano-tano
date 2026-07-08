import { LoginLeftPanel } from "./components/LoginLeftPanel";
import { LoginForm } from "./components/LoginForm";
import { authService } from "@/modules/auth/services/auth.service";
import { redirect } from "next/navigation";

export default async function LoginPage() {
  const session = await authService.getServerSession();
  
  if (session) {
    redirect("/admin/dashboard");
  }

  return (
    <div className="flex min-h-screen w-full bg-white dark:bg-black">
      <LoginLeftPanel />
      <LoginForm />
    </div>
  );
}
