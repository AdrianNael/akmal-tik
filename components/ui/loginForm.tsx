import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { UserAuthForm } from "./user-auth-form";

export default function LoginForm() {
  return (
    <Card className="mx-auto  dark:bg-neutral-900 max-w-3xl grid grid-cols-1 lg:grid-cols-2 overflow-hidden">
      <div className="bg-zinc-50 border-r flex flex-col p-10 justify-between">
        <div className="flex items-center text-lg font-bold text-zinc-900">
          <div className="relative h-10 w-10 mr-3">
            {/* Gunakan img biasa dulu jika Image bermasalah, tapi pastikan sizingnya benar */}
            <img src="/logo.png" alt="Logo Universitas Pertamina" className="h-full w-full object-contain" />
          </div>
          Universitas Pertamina
        </div>
        <blockquote className="leading-normal text-balance mt-8 text-zinc-700 italic">
          &ldquo;Inovasi berasal dari keberanian untuk mencoba hal baru dan pantang menyerah.&rdquo;
        </blockquote>
      </div>

      <CardContent className=" flex flex-col justify-center p-8">
        <div className="mt-6">
          <UserAuthForm />
        </div>

        <p className="text-muted-foreground px-4 text-center text-sm mt-6">
          Dengan melanjutkan, Anda menyetujui{" "}
          <Link
            href="/terms"
            className="hover:text-primary underline underline-offset-4"
          >
            Syarat Layanan
          </Link>{" "}
          dan{" "}
          <Link
            href="/privacy"
            className="hover:text-primary underline underline-offset-4"
          >
            Kebijakan Privasi
          </Link>
          kami.
        </p>
      </CardContent>
    </Card>
  );
}
