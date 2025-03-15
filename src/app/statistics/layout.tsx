const StatisticsLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="max-w-5x">
      <main className="p-2 sm:p-4 md:p-6 max-w-7xl min-h-[calc(100vh-4rem)] flex flex-col mx-auto">{children}</main>
    </div>
  );
};

export default StatisticsLayout; 