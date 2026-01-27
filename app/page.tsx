// app/page.tsx
import RemoveBgTool from "@/components/ui/rmbgtools";
import AppHeader from "@/components/ui/app-header";

export default function Home() {
  return (
    <div className="container mx-auto px-4 max-w-4xl">
      <AppHeader />
      <RemoveBgTool />
    </div>
  );
}
