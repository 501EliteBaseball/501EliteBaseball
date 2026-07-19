import ExecutiveNavigation from "@/components/executive/ExecutiveNavigation";

export default function ExecutiveLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-dvh bg-[#F4F7FC]"><ExecutiveNavigation />{children}</div>;
}
