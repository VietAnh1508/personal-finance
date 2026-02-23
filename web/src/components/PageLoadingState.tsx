type PageLoadingStateProps = {
  title: string;
  message: string;
};

export function PageLoadingState({ title, message }: PageLoadingStateProps) {
  return (
    <section className="pf-card p-7">
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      <p className="pf-muted-text mt-3 text-sm">{message}</p>
    </section>
  );
}
