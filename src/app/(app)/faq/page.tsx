const FAQS = [
  {
    q: "Do I need an account?",
    a: "No. Browse games, pick one with open spots, and confirm your spot by typing your name — no signup, no password.",
  },
  {
    q: "How does booking a game work?",
    a: "Pick a game with open spots and confirm your spot (plus up to 4 guests) with just your name. There's no online payment — you pay the host directly.",
  },
  {
    q: "What happens if a game is full?",
    a: "You can join the waitlist with your name. If a confirmed player cancels, the longest-waiting eligible person on the waitlist is automatically promoted.",
  },
  {
    q: "How do I pay for a game?",
    a: "Pay your host directly (cash, UPI, whatever you've agreed on). The host marks you paid once they've received it, and you can check what you still owe on the My Games page.",
  },
  {
    q: "How do I see or cancel my bookings?",
    a: "Go to \"My Games\" and enter the exact name you booked with. You'll see every game you're in, what you owe, and a Cancel button where it applies.",
  },
  {
    q: "What happens if I cancel?",
    a: "Cancel at least 4 hours before kickoff and you're off the hook for the fee. Cancelling later still means you owe the host the spot fee, per the game's cancellation policy.",
  },
  {
    q: "How do I host a game?",
    a: "Hosting is limited to a small set of accounts. If you're one of them, log in (\"Host login\" at the bottom of the menu) to see \"Host a Game\", where you can set the venue, date/time, format, price per spot, and capacity.",
  },
  {
    q: "How do hosts track payments?",
    a: "From \"Games You Host\", open \"Manage Payments\" on any game to see who owes what and mark players paid or unpaid — the totals update immediately. \"All Payments\" gives a single ledger across every game.",
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
