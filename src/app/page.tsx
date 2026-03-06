export default function HomePage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-navy-dark">
      <h1 className="text-5xl font-bold text-gold mb-4">
        GeoVisual Intelligence
      </h1>
      <p className="text-xl text-gray-300 mb-8">
        AI-Powered Global Geopolitical Mapping
      </p>
      <a
        href="/map"
        className="px-8 py-3 bg-gold text-navy-dark font-bold rounded-lg hover:bg-gold-light transition"
      >
        Launch Map →
      </a>
    </main>
  );
}
