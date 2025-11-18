export default function Header() {
  return (
    <header className="bg-white dark:bg-zinc-900 shadow-sm border-b border-zinc-200 dark:border-zinc-800">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">
              Exam Practice
            </h1>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
              AI-powered question generation and evaluation for undergraduates
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
