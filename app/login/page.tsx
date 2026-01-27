// app/page.tsx
import { Button } from "@/components/ui/button";

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import RemoveBgTool from "@/components/ui/rmbgtools";
import LoginForm from "@/components/ui/loginForm";

export default function Login() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex min-h-screen items-center justify-center">
        <LoginForm />
        {/* <RemoveBgTool></RemoveBgTool>                       */}
      </main>
    </div>
  );
}
