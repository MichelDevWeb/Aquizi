import React from "react";

interface Props {
  value: number;
  className?: string;
}

const ProgressBar = ({ value, className }: Props) => {
  return (
    <div className={`w-full bg-muted rounded-full h-2 ${className || ''}`}>
      <div
        className="bg-primary h-2 rounded-full transition-all duration-300"
        style={{ width: `${value * 100}%` }}
      />
    </div>
  );
};

export default ProgressBar;
