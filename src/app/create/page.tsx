"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import Link from "next/link";
import DateTimePicker from "@/components/DateTimePicker";

const MapPicker = dynamic(() => import("@/components/MapPicker"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-80 rounded-2xl bg-dark-elevated border border-dark-border flex items-center justify-center">
      <motion.span
        animate={{ rotate: 360 }}
        transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
        className="text-3xl"
      >
        🗺️
      </motion.span>
    </div>
  ),
});

type Step = 1 | 2 | 3;

export default function CreatePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [step, setStep] = useState<Step>(1);
  const [recipientName, setRecipientName] = useState("");
  const [message, setMessage] = useState("");
  const [location, setLocation] = useState<{
    name: string;
    lat: number;
    lng: number;
  } | null>(null);
  const [scheduledAt, setScheduledAt] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [createdId, setCreatedId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/");
  }, [status, router]);

  const canNext1 = message.trim().length >= 10;
  const canNext2 = !!location;
  const canSubmit = !!scheduledAt;

  const handleSubmit = async () => {
    if (!location || !scheduledAt || !canNext1) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/dates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientName: recipientName.trim() || null,
          message: message.trim(),
          locationName: location.name,
          locationLat: location.lat,
          locationLng: location.lng,
          scheduledAt,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setCreatedId(data.id);
      }
    } catch {
      // ignore
    } finally {
      setSubmitting(false);
    }
  };

  const inviteUrl = createdId
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/invite/${createdId}`
    : "";

  const copyLink = async () => {
    await navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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

  // Success state
  if (createdId) {
    return (
      <div className="min-h-screen bg-dark-base flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="max-w-md w-full text-center"
        >
          <motion.div
            animate={{ y: [0, -12, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-7xl mb-6"
          >
            ☕
          </motion.div>
          <h2 className="text-3xl font-serif font-bold gradient-text mb-3">
            Invite created!
          </h2>
          <p className="text-coffee-500 text-sm mb-8">
            Share this link with the person you want to have coffee with
          </p>

          <div className="bg-dark-card border border-dark-border rounded-2xl p-4 mb-4 flex items-center gap-3">
            <span className="text-coffee-500 text-sm truncate flex-1 font-mono">
              {inviteUrl}
            </span>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={copyLink}
              className="shrink-0 bg-coffee-800 hover:bg-coffee-700 text-coffee-100 px-4 py-2 rounded-xl text-sm font-medium transition-colors"
            >
              {copied ? "Copied ✓" : "Copy"}
            </motion.button>
          </div>

          <div className="flex gap-3">
            <Link href="/dashboard" className="flex-1">
              <button className="w-full bg-dark-elevated border border-dark-border hover:border-coffee-700 text-coffee-400 py-3 rounded-xl text-sm transition-colors">
                Dashboard
              </button>
            </Link>
            <button
              onClick={() => {
                setCreatedId(null);
                setMessage("");
                setLocation(null);
                setScheduledAt("");
                setStep(1);
              }}
              className="flex-1 bg-coffee-800 hover:bg-coffee-700 text-coffee-100 py-3 rounded-xl text-sm font-medium transition-colors"
            >
              New invite
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-base">
      {/* Header */}
      <header className="glass-card border-b border-dark-border sticky top-0 z-40">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="text-coffee-600 hover:text-coffee-400 text-sm transition-colors flex items-center gap-2">
            ← Back
          </Link>
          <span className="font-serif text-coffee-300 text-sm">
            New coffee invite
          </span>
          {/* Step dots */}
          <div className="flex gap-2">
            {([1, 2, 3] as Step[]).map((s) => (
              <div
                key={s}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  s === step
                    ? "bg-coffee-400 w-5"
                    : s < step
                    ? "bg-coffee-700"
                    : "bg-dark-border"
                }`}
              />
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-10">
        <AnimatePresence mode="wait">
          {/* Step 1: Message */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.35 }}
            >
              <div className="mb-8">
                <h2 className="text-3xl font-serif font-bold text-coffee-100 mb-2">
                  Write your note ✍️
                </h2>
                <p className="text-coffee-600 text-sm">
                  What do you want to say? Be genuine.
                </p>
              </div>

              {/* To field */}
              <div className="mb-4">
                <input
                  type="text"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder="To (e.g. Sarah, John…)"
                  maxLength={60}
                  className="w-full bg-dark-card border border-dark-border focus:border-coffee-600 rounded-2xl px-5 py-3.5 text-coffee-100 placeholder-coffee-800 outline-none transition-colors text-[15px]"
                />
                <p className="text-coffee-800 text-xs mt-1.5 pl-1">
                  Optional — only visible to you on your dashboard
                </p>
              </div>

              <div className="relative">
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Hey! I'd love to grab a coffee with you and catch up. How about we meet up this week? ☕"
                  maxLength={500}
                  rows={6}
                  autoFocus
                  className="w-full bg-dark-card border border-dark-border focus:border-coffee-600 rounded-2xl px-5 py-4 text-coffee-100 placeholder-coffee-800 resize-none outline-none transition-colors text-[15px] leading-relaxed"
                />
                <span
                  className={`absolute bottom-3 right-4 text-xs ${
                    message.length > 450 ? "text-coffee-500" : "text-coffee-800"
                  }`}
                >
                  {message.length}/500
                </span>
              </div>

              <div className="mt-2 flex items-center gap-2 text-coffee-800 text-xs">
                {message.length > 0 && message.length < 10 && (
                  <span className="text-coffee-600">
                    Write at least 10 characters
                  </span>
                )}
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setStep(2)}
                disabled={!canNext1}
                className="mt-8 w-full bg-coffee-800 hover:bg-coffee-700 disabled:opacity-30 disabled:cursor-not-allowed text-coffee-100 py-4 rounded-2xl font-semibold text-base transition-all"
              >
                Next — Pick a location →
              </motion.button>
            </motion.div>
          )}

          {/* Step 2: Location */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.35 }}
            >
              <div className="mb-6">
                <h2 className="text-3xl font-serif font-bold text-coffee-100 mb-2">
                  Where to meet? 📍
                </h2>
                <p className="text-coffee-600 text-sm">
                  Search for a place or click on the map.
                </p>
              </div>

              <MapPicker
                lat={location?.lat}
                lng={location?.lng}
                locationName={location?.name}
                onSelect={(lat, lng, name) =>
                  setLocation({ lat, lng, name })
                }
              />

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 bg-dark-elevated border border-dark-border hover:border-coffee-700 text-coffee-500 py-4 rounded-2xl text-sm transition-colors"
                >
                  ← Back
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setStep(3)}
                  disabled={!canNext2}
                  className="flex-[2] bg-coffee-800 hover:bg-coffee-700 disabled:opacity-30 disabled:cursor-not-allowed text-coffee-100 py-4 rounded-2xl font-semibold text-base transition-all"
                >
                  Next — Set a time →
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Date & Time */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.35 }}
            >
              <div className="mb-8">
                <h2 className="text-3xl font-serif font-bold text-coffee-100 mb-2">
                  When to meet? 🕐
                </h2>
                <p className="text-coffee-600 text-sm">
                  Pick a date and time that works for you.
                </p>
              </div>

              <DateTimePicker value={scheduledAt} onChange={setScheduledAt} />

              {/* Preview */}
              {scheduledAt && location && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-5 bg-dark-elevated border border-coffee-900 rounded-2xl p-5 space-y-3"
                >
                  <p className="text-coffee-600 text-xs uppercase tracking-wider mb-3">
                    Preview
                  </p>
                  <p className="text-coffee-300 text-sm italic leading-relaxed line-clamp-3">
                    &ldquo;{message}&rdquo;
                  </p>
                  <div className="flex gap-4 text-xs text-coffee-500 pt-1">
                    <span>📍 {location.name}</span>
                    <span>
                      🕐{" "}
                      {new Date(scheduledAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </motion.div>
              )}

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setStep(2)}
                  className="flex-1 bg-dark-elevated border border-dark-border hover:border-coffee-700 text-coffee-500 py-4 rounded-2xl text-sm transition-colors"
                >
                  ← Back
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSubmit}
                  disabled={!canSubmit || submitting}
                  className="flex-[2] bg-coffee-800 hover:bg-coffee-700 disabled:opacity-30 disabled:cursor-not-allowed text-coffee-100 py-4 rounded-2xl font-semibold text-base transition-all flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <motion.span
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 0.8,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                      >
                        ☕
                      </motion.span>
                      Creating…
                    </>
                  ) : (
                    "Create invite ☕"
                  )}
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
