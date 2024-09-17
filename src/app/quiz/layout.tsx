const QuizPageLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="max-w-5xl mx-auto">
      <main className="p-8 mx-auto max-w-7xl">{children}</main>
    </div>
  );
};

export default QuizPageLayout;
