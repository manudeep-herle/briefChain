import { cn } from "./utils";

// Animated loader with interesting pulse and wave effects
function Loader({ className, size = "default", text, variant = "dots", ...props }) {
  const sizeClasses = {
    sm: "w-4 h-4",
    default: "w-6 h-6", 
    lg: "w-8 h-8",
    xl: "w-12 h-12"
  };

  if (variant === "dots") {
    return (
      <div className={cn("flex flex-col items-center gap-3", className)} {...props}>
        <div className="flex space-x-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={cn(
                "bg-blue-600 rounded-full animate-pulse",
                sizeClasses[size]
              )}
              style={{
                animationDelay: `${i * 0.2}s`,
                animationDuration: "1.2s"
              }}
            />
          ))}
        </div>
        {text && <span className="text-sm text-gray-600 text-center">{text}</span>}
      </div>
    );
  }

  if (variant === "bars") {
    return (
      <div className={cn("flex flex-col items-center gap-3", className)} {...props}>
        <div className="flex space-x-1 items-end">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-blue-600 rounded-sm animate-pulse"
              style={{
                width: size === "sm" ? "3px" : size === "lg" ? "6px" : "4px",
                height: `${12 + (i % 2) * 8}px`,
                animationDelay: `${i * 0.15}s`,
                animationDuration: "1s"
              }}
            />
          ))}
        </div>
        {text && <span className="text-sm text-gray-600 text-center">{text}</span>}
      </div>
    );
  }

  if (variant === "wave") {
    return (
      <div className={cn("flex flex-col items-center gap-3", className)} {...props}>
        <div className="flex space-x-1">
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={cn(
                "bg-blue-600 rounded-full",
                size === "sm" ? "w-2 h-2" : size === "lg" ? "w-4 h-4" : "w-3 h-3"
              )}
              style={{
                transform: "translateY(0px)",
                animation: `wave 1.4s ease-in-out ${i * 0.1}s infinite`
              }}
            />
          ))}
        </div>
        {text && <span className="text-sm text-gray-600 text-center">{text}</span>}
        <style jsx>{`
          @keyframes wave {
            0%, 60%, 100% {
              transform: translateY(0px);
            }
            30% {
              transform: translateY(-10px);
            }
          }
        `}</style>
      </div>
    );
  }

  // Default pulse variant
  return (
    <div className={cn("flex flex-col items-center gap-3", className)} {...props}>
      <div className="flex space-x-2">
        <div className={cn("bg-blue-600 rounded-full animate-pulse", sizeClasses[size])} />
        <div 
          className={cn("bg-blue-400 rounded-full animate-pulse", sizeClasses[size])}
          style={{ animationDelay: "0.2s" }}
        />
        <div 
          className={cn("bg-blue-300 rounded-full animate-pulse", sizeClasses[size])}
          style={{ animationDelay: "0.4s" }}
        />
      </div>
      {text && <span className="text-sm text-gray-600 text-center">{text}</span>}
    </div>
  );
}

export { Loader };