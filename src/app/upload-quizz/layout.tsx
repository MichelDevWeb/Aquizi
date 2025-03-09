export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="flex flex-col flex-1 max-w-96 w-full mx-auto px-3 sm:px-4 md:px-6 min-h-[calc(100vh-4rem)] py-4 sm:py-6 gap-4 sm:gap-6">
        {children}
      </div>
    </>
  );
}
