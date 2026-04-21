"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import Image from "next/image";
import { format } from "date-fns";

const MapPicker = dynamic(() => import("@/components/MapPicker"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-56 rounded-2xl bg-dark-elevated border border-dark-border flex items-center justify-center">
      <span className="text-coffee-700 text-sm">Loading map…</span>
    </div>
  ),
});

interface InviteData {
  id: string;
  message: string;
  locationName: string;
  locationLat: number;
  locationLng: number;
  scheduledAt: string;
  status: "pending" | "accepted" | "declined";
  sender: {
    name: string | null;
    image: string | null;
    email: string | null;
  };
}

export default function InvitePage({ params }: { params: { id: string } }) {
  const [invite, setInvite] = useState<InviteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [responding, setResponding] = useState<"accepted" | "declined" | null>(
    null
  );
  const [responded, setResponded] = useState(false);
  const [response, setResponse] = useState<"accepted" | "declined" | null>(
    null
  );

  useEffect(() => {
    fetch(`/api/dates/${params.id}`)
      .then((r) => {
        if (r.status === 404) {
          setNotFound(true);
          return null;
        }
        return r.json();
      })
      .then((data) => {
        if (data) {
          setInvite(data);
          if (data.status !== "pending") {
            setResponse(data.status);
            setResponded(true);
          }
        }
      })
      .finally(() => setLoading(false));
  }, [params.id]);

  const respond = async (status: "accepted" | "declined") => {
    setResponding(status);
    try {
      const res = await fetch(`/api/dates/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setResponse(status);
        setResponded(true);
      }
    } finally {
      setResponding(null);
    }
  };

  if (loading) {
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

  if (notFound || !invite) {
    return (
      <div className="min-h-screen bg-dark-base flex items-center justify-center px-4">
        <div className="text-center">
          <div className="text-6xl mb-5">🫗</div>
          <h2 className="text-2xl font-serif text-coffee-300 mb-2">
            Invite not found
          </h2>
          <p className="text-coffee-600 text-sm">
            This invite may have been removed or the link is incorrect.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-base relative overflow-hidden flex items-center justify-center px-4 py-10">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(200,149,108,0.06) 0%, transparent 70%)",
          }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="relative z-10 w-full max-w-lg"
      >
        {/* Invitation card */}
        <div className="bg-dark-card border border-dark-border rounded-3xl overflow-hidden shadow-2xl">
          {/* Top band */}
          <div
            className="h-2 w-full"
            style={{
              background:
                "linear-gradient(90deg, #6b3f2a, #c8956c, #6b3f2a)",
            }}
          />

          <div className="p-7 space-y-6">
            {/* Sender info */}
            <div className="flex items-center gap-4">
              {invite.sender.image ? (
                <Image
                  src={invite.sender.image}
                  alt={invite.sender.name ?? ""}
                  width={52}
                  height={52}
                  className="rounded-full border-2 border-coffee-800"
                />
              ) : (
                <div className="w-13 h-13 rounded-full bg-coffee-800 flex items-center justify-center text-xl">
                  ☕
                </div>
              )}
              <div>
                <p className="text-coffee-700 text-xs uppercase tracking-widest mb-1">
                  Coffee invite from
                </p>
                <p className="text-coffee-100 font-semibold text-lg leading-tight">
                  {invite.sender.name ?? invite.sender.email}
                </p>
              </div>
              <div className="ml-auto text-4xl select-none">☕</div>
            </div>

            {/* Divider */}
            <div className="border-t border-dark-border" />

            {/* Message */}
            <blockquote className="relative">
              <span className="absolute -top-2 -left-1 text-coffee-800 text-5xl font-serif leading-none select-none">
                &ldquo;
              </span>
              <p className="text-coffee-200 text-[15px] leading-relaxed pl-5 italic font-serif">
                {invite.message}
              </p>
            </blockquote>

            {/* Date & Location */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-dark-elevated border border-dark-border rounded-2xl p-4">
                <p className="text-coffee-700 text-xs uppercase tracking-wider mb-1.5">
                  When
                </p>
                <p className="text-coffee-200 font-semibold text-sm">
                  {format(new Date(invite.scheduledAt), "EEE, MMM d")}
                </p>
                <p className="text-coffee-400 text-xs mt-0.5">
                  {format(new Date(invite.scheduledAt), "h:mm a")}
                </p>
              </div>
              <div className="bg-dark-elevated border border-dark-border rounded-2xl p-4">
                <p className="text-coffee-700 text-xs uppercase tracking-wider mb-1.5">
                  Where
                </p>
                <p className="text-coffee-200 font-semibold text-sm line-clamp-2 leading-snug">
                  {invite.locationName}
                </p>
              </div>
            </div>

            {/* Map */}
            <MapPicker
              lat={invite.locationLat}
              lng={invite.locationLng}
              locationName={invite.locationName}
              readonly
            />

            {/* Response buttons / status */}
            <AnimatePresence mode="wait">
              {!responded ? (
                <motion.div
                  key="buttons"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="grid grid-cols-2 gap-3"
                >
                  <motion.button
                    whileHover={{ scale: 1.03, y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => respond("accepted")}
                    disabled={!!responding}
                    className="py-4 rounded-2xl bg-emerald-900/40 border border-emerald-800 hover:bg-emerald-800/50 text-emerald-300 font-semibold text-base transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {responding === "accepted" ? (
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
                    ) : (
                      <>
                        <span className="text-xl">✓</span> Accept
                      </>
                    )}
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.03, y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => respond("declined")}
                    disabled={!!responding}
                    className="py-4 rounded-2xl bg-red-900/20 border border-red-900 hover:bg-red-900/40 text-red-400 font-semibold text-base transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {responding === "declined" ? (
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
                    ) : (
                      <>
                        <span className="text-xl">✕</span> Decline
                      </>
                    )}
                  </motion.button>
                </motion.div>
              ) : (
                <motion.div
                  key="response"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 18 }}
                  className={`text-center py-6 rounded-2xl border ${
                    response === "accepted"
                      ? "bg-emerald-900/30 border-emerald-800"
                      : "bg-red-900/20 border-red-900"
                  }`}
                >
                  <motion.div
                    animate={
                      response === "accepted"
                        ? { y: [0, -8, 0] }
                        : { rotate: [0, -5, 5, 0] }
                    }
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="text-4xl mb-3"
                  >
                    {response === "accepted" ? "☕" : "🙅"}
                  </motion.div>
                  <p
                    className={`font-serif font-semibold text-xl mb-1 ${
                      response === "accepted"
                        ? "text-emerald-300"
                        : "text-red-400"
                    }`}
                  >
                    {response === "accepted"
                      ? "See you there!"
                      : "Maybe next time"}
                  </p>
                  <p className="text-coffee-600 text-sm">
                    {response === "accepted"
                      ? `Looking forward to coffee with ${invite.sender.name?.split(" ")[0] ?? "you"}`
                      : "Your response has been sent"}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <p className="text-center text-coffee-900 text-xs mt-5">
          Powered by{" "}
          <span className="text-coffee-700">Wanna Coffi ☕</span>
        </p>
      </motion.div>
    </div>
  );
}
