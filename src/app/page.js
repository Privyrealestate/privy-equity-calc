export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-privy-ledger">
      <div className="z-10 max-w-5xl w-full items-center justify-center font-mono text-sm flex flex-col gap-4">
        
        {/* Brand Logo Area */}
        <h1 className="font-serif text-6xl text-privy-dominion mb-4">
          privy
        </h1>
        
        {/* System Status Badge */}
        <div className="bg-privy-dominion/10 px-4 py-2 rounded-full border border-privy-dominion/20">
          <p className="text-privy-dominion uppercase tracking-widest text-xs font-bold">
            System Online
          </p>
        </div>

        <p className="text-center mt-8 max-w-md text-privy-dominion/80 font-sans">
          The Hidden Equity Calculator is initializing...
        </p>

      </div>
    </main>
  )
}
