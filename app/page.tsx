import Dashboard from "@/components/dashboard";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center p-8">
      <h1 className="text-4xl font-bold mb-8">Money Manager</h1>

      <Dashboard />
    </main>
  );
}
