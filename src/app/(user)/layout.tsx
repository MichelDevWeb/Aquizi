const UserPagesLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="max-w-5xl mx-auto px-2 sm:px-4 md:px-6 min-h-[calc(100vh-4rem)] py-3 sm:py-4 md:py-6">
      {children}
    </div>
  );
};

export default UserPagesLayout;
