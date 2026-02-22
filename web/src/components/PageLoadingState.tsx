type PageLoadingStateProps = {
  title: string;
  message: string;
};

export function PageLoadingState({ title, message }: PageLoadingStateProps) {
  return (
    <section className="rounded-3xl border border-slate-200/20 bg-slate-900/50 p-7 shadow-xl backdrop-blur">
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      <p className="mt-3 text-sm text-slate-300">{message}</p>
    </section>
  );
}
