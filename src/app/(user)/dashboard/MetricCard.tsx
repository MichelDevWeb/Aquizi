import { roundIfNumber } from "@/lib/utils";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Props = {
  value: number | string | null;
  label: string;
  icon?: ReactNode;
  className?: string;
};

const MetricCard = (props: Props) => {
  const { value, label, icon, className } = props;

  // Format value for display
  const displayValue = roundIfNumber(value);
  
  // Determine if value is a number and positive
  const isPositiveNumber = typeof displayValue === 'number' && displayValue > 0;

  return (
    <div className={cn(
      "p-2 sm:p-3 md:p-4 border rounded-md bg-card hover:shadow-md transition-shadow relative overflow-hidden",
      className
    )}>
      <div className="flex items-center justify-between mb-1 sm:mb-2 relative z-10">
        <p className="text-muted-foreground text-xs sm:text-sm truncate pr-2 font-medium">{label}</p>
        {icon && <div className="flex-shrink-0 scale-75 sm:scale-90 md:scale-100 text-primary/80">{icon}</div>}
      </div>
      <p className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold relative z-10">
        {displayValue}
      </p>
      
      {/* Background gradient for visual appeal */}
      {isPositiveNumber && (
        <div 
          className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-primary/20 to-primary/40 rounded-b-md"
          style={{ 
            width: `${Math.min(100, displayValue * 5)}%`,
            transition: 'width 0.5s ease-in-out'
          }}
        />
      )}
    </div>
  );
};

export default MetricCard;
