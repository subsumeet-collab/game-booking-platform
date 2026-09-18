const FAQS = [
  {
    q: "How does booking a game work?",
    a: "Browse games in your city, pick one with open spots, and book your spot (plus up to 4 guests) using your wallet balance.",
  },
  {
    q: "What happens if a game is full?",
    a: "You can join the waitlist. If a confirmed player cancels, the longest-waiting eligible person on the waitlist is automatically promoted and charged.",
  },
  {
    q: "How do refunds work?",
    a: "Cancel at least 4 hours before kickoff for a full refund to your wallet. Later cancellations forfeit the spot fee, per the game's cancellation policy.",
  },
  {
    q: "How do I host a game?",
    a: "Host accounts see a \"Host a Game\" tab where you can set the venue, date/time, format, price per spot, and capacity.",
  },
  {
    q: "What happens if the host cancels?",
    a: "Every confirmed and waitlisted player is notified and confirmed players are fully refunded to their wallet.",
  },
];

export default function FaqPage() {
  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-black mb-6">FAQ</h1>
      <div className="space-y-3">
        {FAQS.map((item) => (
          <div key={item.q} className="card">
            <h3 className="font-bold mb-1">{item.q}</h3>
            <p className="text-sm text-muted">{item.a}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
