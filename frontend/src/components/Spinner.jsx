/**
 * Spinner component – animated loading indicator
 */
export default function Spinner({ size = "md" }) {
  const sizeClasses = {
    sm: "w-4 h-4 border-2",
    md: "w-8 h-8 border-4",
    lg: "w-12 h-12 border-4",
  };

  return (
    <div className="flex items-center justify-center">
      <div
        className={`${sizeClasses[size]} rounded-full border-brand-200 border-t-brand-500 animate-spin-slow`}
      />
    </div>
  );
}
