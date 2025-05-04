import { useWebsiteTracking } from "@/hooks/useSimpleWebsiteTracking";
import SimpleTaskList from "./SimpleTaskList";
import SimpleWebsiteTracker from "./SimpleWebsiteTracker";

const Dashboard = () => {
  const { stats, isLoading } = useWebsiteTracking();
  
  const formatHours = (hours: number) => {
    return hours.toFixed(1);
  };

  return (
    <div className="space-y-3 pb-4">
      {/* Basic stats */}
      <div className="grid grid-cols-2 gap-2">
        {/* Productive Hours */}
        <StatCard 
          title="Productive Hours"
          value={isLoading ? "-" : formatHours(stats?.productiveHours || 0)}
        />
        
        {/* Distracting Hours */}
        <StatCard 
          title="Distracting Hours"
          value={isLoading ? "-" : formatHours(stats?.distractingHours || 0)}
        />
      </div>
      
      {/* Main content - simplified to just include essential components */}
      <div className="space-y-3">
        <div className="border rounded p-2">
          <h3 className="text-md font-medium mb-2">Website Tracking</h3>
          <SimpleWebsiteTracker />
        </div>
        
        <div className="border rounded p-2">
          <h3 className="text-md font-medium mb-2">Tasks</h3>
          <SimpleTaskList />
        </div>
      </div>
    </div>
  );
};

interface StatCardProps {
  title: string;
  value: string;
}

const StatCard = ({ title, value }: StatCardProps) => {
  return (
    <div className="border p-2 rounded">
      <div className="flex flex-col">
        <span className="text-xs font-medium text-gray-600 mb-0.5">{title}</span>
        <div className="text-lg font-bold">{value}</div>
      </div>
    </div>
  );
};

export default Dashboard;
