"use client";

import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { motion } from "framer-motion";

const BEANS = [
  { left: "8%", top: "15%", delay: 0, size: 28 },
  { left: "88%", top: "12%", delay: 0.8, size: 20 },
  { left: "4%", top: "72%", delay: 1.4, size: 24 },
  { left: "92%", top: "68%", delay: 0.4, size: 18 },
  { left: "50%", top: "5%", delay: 1.0, size: 16 },
  { left: "22%", top: "88%", delay: 0.6, size: 22 },
  { left: "75%", top: "82%", delay: 1.8, size: 20 },
  { left: "38%", top: "92%", delay: 1.2, size: 14 },
];

export default function LandingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session) router.replace("/dashboard");
  }, [session, router]);

  if (status === "loading") {
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
    <div className="min-h-screen bg-dark-base relative overflow-hidden flex flex-col items-center justify-center px-4">
      {/* Radial glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(200,149,108,0.08) 0%, transparent 70%)",
          }}
        />
      </div>

      {/* Floating beans */}
      {BEANS.map((bean, i) => (
        <motion.div
          key={i}
          className="absolute select-none pointer-events-none text-coffee-900"
          style={{ left: bean.left, top: bean.top, fontSize: bean.size }}
          animate={{ y: [-8, 8, -8], rotate: [0, 20, -10, 0] }}
          transition={{
            duration: 4 + i * 0.5,
            repeat: Infinity,
            delay: bean.delay,
            ease: "easeInOut",
          }}
        >
          ☕
        </motion.div>
      ))}

      {/* Main card */}
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 text-center max-w-lg w-full"
      >
        {/* Coffee cup hero */}
        <div className="relative inline-block mb-8">
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            className="text-[96px] leading-none select-none"
          >
            ☕
          </motion.div>
          {/* Steam wisps */}
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 flex gap-3">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-[3px] rounded-full bg-coffee-300"
                style={{ height: 20 }}
                animate={{
                  opacity: [0, 0.8, 0],
                  y: [0, -22],
                  scaleX: [1, 1.8, 0.4],
                }}
                transition={{
                  duration: 1.6,
                  repeat: Infinity,
                  delay: i * 0.45,
                  ease: "easeOut",
                }}
              />
            ))}
          </div>
        </div>

        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
          className="text-5xl md:text-6xl font-serif font-bold mb-4 gradient-text"
        >
          Wanna Coffi
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-coffee-400 text-lg md:text-xl mb-3 leading-relaxed"
        >
          Send a beautiful coffee date invite.
          <br />
          <span className="text-coffee-500 text-base">
            Pick a spot, set a time, write a note.
          </span>
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55 }}
          className="flex gap-6 justify-center text-coffee-700 text-sm mb-10"
        >
          <span>📍 Map locations</span>
          <span>🕐 Pick a time</span>
          <span>✉️ One link</span>
        </motion.div>

        <motion.button
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.7 }}
          whileHover={{ scale: 1.04, y: -2 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => signIn("google")}
          className="flex items-center gap-3 mx-auto bg-white text-gray-800 px-8 py-4 rounded-2xl font-semibold text-base shadow-2xl hover:shadow-coffee-900/40 transition-all duration-200 cursor-pointer"
        >
          <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Continue with Google
        </motion.button>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="text-coffee-800 text-xs mt-5"
        >
          New here? We&apos;ll create your account automatically.
        </motion.p>
      </motion.div>

      {/* Bottom gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-coffee-950/30 to-transparent pointer-events-none" />
    </div>
  );
}
