import { prisma } from "@/lib/prisma";
import { FeedbackForm } from "@/components/FeedbackForm";

export default async function FeedbackPage() {
  const feedback = await prisma.feedback.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <h1 className="text-3xl font-black mb-6">Feedback</h1>
        {feedback.length === 0 ? (
          <div className="card text-center py-16 text-muted">No feedback yet — be the first!</div>
        ) : (
          <div className="space-y-3">
            {feedback.map((f) => (
              <div key={f.id} className="card">
                <p className="text-accent mb-1">{"★".repeat(f.rating)}{"☆".repeat(5 - f.rating)}</p>
                {f.comment && <p className="text-sm text-fg/80">{f.comment}</p>}
                <p className="text-xs text-muted mt-2">
                  {f.name || "Anonymous"} · {f.createdAt.toLocaleString("en-IN")}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
      <div>
        <FeedbackForm />
      </div>
    </div>
  );
}
