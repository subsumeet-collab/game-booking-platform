const FAQS = [
  {
    q: "How does booking a game work?",
    a: "Browse games in your city, pick one with open spots, and confirm your spot (plus up to 4 guests). There's no online payment — you pay the host directly.",
  },
  {
    q: "What happens if a game is full?",
    a: "You can join the waitlist. If a confirmed player cancels, the longest-waiting eligible person on the waitlist is automatically promoted.",
  },
  {
    q: "How do I pay for a game?",
    a: "Pay your host directly (cash, UPI, whatever you've agreed on). The host marks you paid once they've received it, and you can track what you still owe on the Outstanding Payments page.",
  },
  {
    q: "What happens if I cancel?",
    a: "Cancel at least 4 hours before kickoff and you're off the hook for the fee. Cancelling later still means you owe the host the spot fee, per the game's cancellation policy.",
  },
  {
    q: "How do I host a game?",
    a: "Host accounts see a \"Host a Game\" tab where you can set the venue, date/time, format, price per spot, and capacity.",
  },
  {
    q: "How do hosts track payments?",
    a: "From \"Games You Host\", open \"Manage Payments\" on any game to see who owes what and mark players paid or unpaid — the totals update immediately.",
  },
  {
    q: "What happens if the host cancels?",
    a: "Every confirmed and waitlisted player is notified and nobody owes anything for a game that didn't happen.",
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
