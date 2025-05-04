
import Dashboard from "@/components/Dashboard/SimpleDashboard";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col bg-white text-black">
      <header className="py-2 px-3 border-b">
        <h1 className="text-lg font-bold">SimpleTrack</h1>
      </header>
      <main className="flex-1 px-3 py-2 space-y-2 overflow-y-auto">
        <Dashboard />
      </main>
    </div>
  );
};

export default Index;
