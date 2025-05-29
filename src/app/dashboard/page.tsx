import Stream from "./stream/Stream";

export const metadata = {
  title: "Fraud Detection Dashboard",
  description: "Dashboard de détection de fraude en temps réel",
};

export default function Page() {
  return (
    <section className="p-4 md:p-8 max-w-[1600px] mx-auto">
      <div className="fade-in space-y-2 mb-10">
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
          Dashboard de détection de fraude
        </h1>
        <p className="text-muted-foreground text-sm md:text-base max-w-2xl">
          Analyse en temps réel des transactions et détection des activités suspectes
        </p>
      </div>
      <Stream />
    </section>
  );
} 