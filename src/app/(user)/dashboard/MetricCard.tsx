import { roundIfNumber } from "@/lib/utils";
import { ReactNode } from "react";

type Props = {
  value: number | string | null;
  label: string;
  icon?: ReactNode;
};

const MetricCard = (props: Props) => {
  const { value, label, icon } = props;

  return (
    <div className="p-4 sm:p-6 border rounded-md bg-card hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-2">
        <p className="text-muted-foreground text-sm">{label}</p>
        {icon && <div className="flex-shrink-0">{icon}</div>}
      </div>
      <p className="text-2xl sm:text-3xl font-bold">{roundIfNumber(value)}</p>
    </div>
  );
};

export default MetricCard;
