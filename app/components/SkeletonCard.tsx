const SkeletonCard = () => {
    return (
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-4 animate-pulse">
        {/* Image skeleton */}
        <div className="aspect-square rounded-lg bg-gray-700 mb-4" />
        
        {/* Title skeleton */}
        <div className="h-6 bg-gray-700 rounded-md mb-4 w-3/4" />
        
        {/* Attributes skeleton */}
        <div className="space-y-2">
          <div className="h-4 bg-gray-700 rounded w-2/3" />
          <div className="h-4 bg-gray-700 rounded w-1/2" />
        </div>
        
        {/* Price skeleton */}
        <div className="mt-4 bg-gray-700/50 rounded-lg p-4">
          <div className="space-y-2">
            <div className="h-4 bg-gray-700 rounded w-1/4" />
            <div className="h-6 bg-gray-700 rounded w-1/2" />
            <div className="h-4 bg-gray-700 rounded w-1/3" />
          </div>
        </div>
      </div>
    );
  };
  
  export default SkeletonCard;