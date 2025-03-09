export const metadata = {
  title: "Quiz | Aquizi",
  description: "Quiz yourself on anything!",
};

const QuizPageLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="max-w-5xl mx-auto">
      <main className="p-3 sm:p-5 md:p-8 mx-auto max-w-7xl">{children}</main>
    </div>
  );
};

export default QuizPageLayout;
