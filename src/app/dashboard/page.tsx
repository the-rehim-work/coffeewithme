"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { format } from "date-fns";
import Link from "next/link";

interface CoffeeDate {
  id: string;
  message: string;
  locationName: string;
  scheduledAt: string;
  status: "pending" | "accepted" | "declined";
  createdAt: string;
}

const STATUS_CONFIG = {
  pending: {
    label: "Awaiting",
    color: "text-coffee-400",
    bg: "bg-coffee-900/40",
    border: "border-coffee-800",
    icon: "⏳",
  },
  accepted: {
    label: "Accepted",
    color: "text-emerald-400",
    bg: "bg-emerald-900/30",
    border: "border-emerald-800",
    icon: "✓",
  },
  declined: {
    label: "Declined",
    color: "text-red-400",
    bg: "bg-red-900/20",
    border: "border-red-900",
    icon: "✕",
  },
};

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [dates, setDates] = useState<CoffeeDate[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/");
  }, [status, router]);

  const fetchDates = useCallback(async () => {
    try {
      const res = await fetch("/api/dates");
      const data = await res.json();
      setDates(Array.isArray(data) ? data : []);
    } catch {
      setDates([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (session) fetchDates();
  }, [session, fetchDates]);

  const copyLink = async (id: string) => {
    const url = `${window.location.origin}/invite/${id}`;
    await navigator.clipboard.writeText(url);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  if (status === "loading" || !session) {
    return (
      <div className="min-h-screen bg-dark-base flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
          className="text-5xl"
        >
          ☕
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-base">
      {/* Header */}
      <header className="sticky top-0 z-40 glass-card border-b border-dark-border">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">☕</span>
            <span className="font-serif text-xl font-semibold gradient-text">
              Wanna Coffi
            </span>
          </div>
          <div className="flex items-center gap-3">
            {session.user.image && (
              <Image
                src={session.user.image}
                alt={session.user.name ?? "User"}
                width={36}
                height={36}
                className="rounded-full border-2 border-coffee-800"
              />
            )}
            <span className="text-coffee-400 text-sm hidden sm:block">
              {session.user.name?.split(" ")[0]}
            </span>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="text-coffee-700 hover:text-coffee-400 text-sm transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-10">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-serif font-semibold text-coffee-100">
              Your invites
            </h1>
            <p className="text-coffee-600 text-sm mt-1">
              {dates.length === 0
                ? "No coffee dates yet"
                : `${dates.length} invite${dates.length !== 1 ? "s" : ""} sent`}
            </p>
          </div>
          <Link href="/create">
            <motion.button
              whileHover={{ scale: 1.04, y: -1 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2 bg-coffee-800 hover:bg-coffee-700 text-coffee-100 px-5 py-2.5 rounded-xl font-medium text-sm transition-colors shadow-lg shadow-coffee-950/50"
            >
              <span className="text-lg">+</span> New invite
            </motion.button>
          </Link>
        </div>

        {/* Date cards */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-36 rounded-2xl bg-dark-card border border-dark-border animate-pulse"
              />
            ))}
          </div>
        ) : dates.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-24"
          >
            <div className="text-6xl mb-5">☕</div>
            <p className="text-coffee-500 text-lg font-serif">
              No invites yet
            </p>
            <p className="text-coffee-700 text-sm mt-2 mb-8">
              Send your first coffee date invite
            </p>
            <Link href="/create">
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                className="bg-coffee-800 hover:bg-coffee-700 text-coffee-100 px-8 py-3 rounded-xl font-medium transition-colors"
              >
                Create invite
              </motion.button>
            </Link>
          </motion.div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {dates.map((date, i) => {
                const s = STATUS_CONFIG[date.status];
                return (
                  <motion.div
                    key={date.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.07 }}
                    className="bg-dark-card border border-dark-border rounded-2xl p-5 hover:border-coffee-800 transition-colors group"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        {/* Status badge */}
                        <div className="flex items-center gap-2 mb-3">
                          <span
                            className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-lg border ${s.bg} ${s.color} ${s.border}`}
                          >
                            <span>{s.icon}</span>
                            {s.label}
                          </span>
                          <span className="text-coffee-700 text-xs">
                            {format(new Date(date.scheduledAt), "MMM d, h:mm a")}
                          </span>
                        </div>

                        {/* Message */}
                        <p className="text-coffee-200 text-sm leading-relaxed line-clamp-2 mb-3">
                          &ldquo;{date.message}&rdquo;
                        </p>

                        {/* Location */}
                        <p className="text-coffee-600 text-xs flex items-center gap-1.5">
                          <span>📍</span>
                          <span className="truncate">{date.locationName}</span>
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-2 shrink-0">
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          onClick={() => copyLink(date.id)}
                          className="text-xs px-3 py-2 rounded-lg bg-dark-elevated border border-dark-border hover:border-coffee-700 text-coffee-400 hover:text-coffee-200 transition-all flex items-center gap-1.5"
                        >
                          {copied === date.id ? (
                            <>
                              <span>✓</span> Copied
                            </>
                          ) : (
                            <>
                              <span>🔗</span> Copy link
                            </>
                          )}
                        </motion.button>
                        <Link href={`/invite/${date.id}`} target="_blank">
                          <button className="w-full text-xs px-3 py-2 rounded-lg bg-dark-elevated border border-dark-border hover:border-coffee-700 text-coffee-600 hover:text-coffee-400 transition-all">
                            Preview
                          </button>
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </main>
    </div>
  );
}
