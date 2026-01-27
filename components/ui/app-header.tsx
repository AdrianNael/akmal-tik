"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

import { useRouter } from "next/navigation";

export default function AppHeader() {
    const router = useRouter();

    const handleLogout = async () => {
        try {
            await fetch("/api/logout", {
                method: "POST",
            });
            router.push("/login");
        } catch (error) {
            console.error("Logout error:", error);
        }
    };

    return (
        <Card className="w-full mt-5 py-4 px-5 mb-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Akmal App</h1>
                <div className="flex gap-4 items-center">

                    <Button onClick={() => router.push("/gallery")} variant="outline" size="sm">
                        File Manager
                    </Button>
                    <Button onClick={handleLogout} variant="destructive" size="sm">
                        Logout
                    </Button>
                </div>
            </div>
        </Card>
    );
}
