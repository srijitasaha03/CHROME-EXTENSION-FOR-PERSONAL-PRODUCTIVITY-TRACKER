import { useWebsiteTracking } from "@/hooks/useSimpleWebsiteTracking";

const WebsiteTracker = () => {
  const { websiteData, isLoading } = useWebsiteTracking();

  // Format time for display (convert minutes to hours and minutes)
  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours === 0) return `${mins}m`;
    return `${hours}h ${mins}m`;
  };

  if (isLoading) {
    return <div>Loading website data...</div>;
  }

  return (
    <div>
      {websiteData.length === 0 ? (
        <div className="text-gray-500 text-center py-2">No website data available yet.</div>
      ) : (
        <ul className="space-y-2">
          {websiteData.map((site, index) => (
            <li key={index} className="border p-2 rounded flex items-center">
              <div className="flex-1">
                <div className="font-medium">{site.domain}</div>
                <div className="text-sm text-gray-500">
                  {site.category === 'productive' ? 
                    <span className="text-green-600">Productive</span> : 
                    <span className="text-red-600">Distracting</span>
                  }
                </div>
              </div>
              <div className="text-right">
                <div className="font-medium">{formatTime(site.timeSpent)}</div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default WebsiteTracker;
