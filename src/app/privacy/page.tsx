import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — Wanna Coffi",
  description: "How Wanna Coffi collects and uses your data.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-dark-base text-coffee-200 px-4 py-14">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-coffee-600 hover:text-coffee-400 text-sm mb-10 transition-colors"
        >
          ← Wanna Coffi
        </Link>

        <h1 className="text-4xl font-serif font-bold gradient-text mb-2">
          Privacy Policy
        </h1>
        <p className="text-coffee-600 text-sm mb-10">
          Last updated: April 21, 2025
        </p>

        <div className="space-y-10 text-[15px] leading-relaxed text-coffee-300">
          <section>
            <h2 className="text-coffee-100 font-semibold text-lg mb-3">
              1. What we collect
            </h2>
            <p className="text-coffee-400">
              When you sign in with Google, we receive and store:
            </p>
            <ul className="mt-3 space-y-2 list-none">
              {[
                "Your name",
                "Your email address",
                "Your profile picture URL",
                "A Google account identifier (used only for sign-in)",
              ].map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2 text-coffee-400"
                >
                  <span className="text-coffee-700 mt-0.5">—</span>
                  {item}
                </li>
              ))}
            </ul>
            <p className="mt-3 text-coffee-500 text-sm">
              We do not access your contacts, calendar, messages, or any other
              Google data.
            </p>
          </section>

          <div className="border-t border-dark-border" />

          <section>
            <h2 className="text-coffee-100 font-semibold text-lg mb-3">
              2. What you create
            </h2>
            <p className="text-coffee-400">
              When you use Wanna Coffi, we store the coffee date invites you
              create, including:
            </p>
            <ul className="mt-3 space-y-2 list-none">
              {[
                "Your message to the recipient",
                "The chosen meeting location (coordinates + place name)",
                "The proposed date and time",
                "The response status (pending / accepted / declined)",
              ].map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2 text-coffee-400"
                >
                  <span className="text-coffee-700 mt-0.5">—</span>
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <div className="border-t border-dark-border" />

          <section>
            <h2 className="text-coffee-100 font-semibold text-lg mb-3">
              3. How we use your data
            </h2>
            <p className="text-coffee-400">
              Your data is used solely to operate the service:
            </p>
            <ul className="mt-3 space-y-2 list-none">
              {[
                "To authenticate you via Google",
                "To display your name and photo to invite recipients",
                "To show you the invites you have sent and their status",
              ].map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2 text-coffee-400"
                >
                  <span className="text-coffee-700 mt-0.5">—</span>
                  {item}
                </li>
              ))}
            </ul>
            <p className="mt-4 text-coffee-500 text-sm">
              We do not sell your data, share it with advertisers, or use it
              for marketing.
            </p>
          </section>

          <div className="border-t border-dark-border" />

          <section>
            <h2 className="text-coffee-100 font-semibold text-lg mb-3">
              4. Data storage
            </h2>
            <p className="text-coffee-400">
              All data is stored in a secure PostgreSQL database hosted by{" "}
              <span className="text-coffee-300">Neon</span> (neon.tech), located
              in the US East region. Data is encrypted in transit via TLS and
              at rest. Sessions are managed securely using signed cookies.
            </p>
          </section>

          <div className="border-t border-dark-border" />

          <section>
            <h2 className="text-coffee-100 font-semibold text-lg mb-3">
              5. Third-party services
            </h2>
            <div className="space-y-4">
              {[
                {
                  name: "Google OAuth",
                  desc: "Used for sign-in only. We request the minimum scopes: name, email, and profile picture. Google's privacy policy applies.",
                  href: "https://policies.google.com/privacy",
                },
                {
                  name: "OpenStreetMap / Nominatim",
                  desc: "Used to display the map and reverse-geocode clicked locations. No personal data is sent — only coordinates.",
                  href: "https://osmfoundation.org/wiki/Privacy_Policy",
                },
                {
                  name: "Vercel",
                  desc: "Hosts the web application. Request logs may be retained briefly for debugging.",
                  href: "https://vercel.com/legal/privacy-policy",
                },
              ].map((s) => (
                <div key={s.name}>
                  <p className="text-coffee-200 font-medium">{s.name}</p>
                  <p className="text-coffee-500 text-sm mt-0.5">{s.desc}</p>
                </div>
              ))}
            </div>
          </section>

          <div className="border-t border-dark-border" />

          <section>
            <h2 className="text-coffee-100 font-semibold text-lg mb-3">
              6. Recipients of invites
            </h2>
            <p className="text-coffee-400">
              People who receive an invite link do not need to create an account
              or provide any personal information. No data about recipients is
              stored beyond their accept/decline response.
            </p>
          </section>

          <div className="border-t border-dark-border" />

          <section>
            <h2 className="text-coffee-100 font-semibold text-lg mb-3">
              7. Your rights
            </h2>
            <p className="text-coffee-400">
              You can request deletion of your account and all associated data
              at any time by contacting us at the email below. Upon request, we
              will permanently delete your profile, invites, and session data
              within 7 days.
            </p>
          </section>

          <div className="border-t border-dark-border" />

          <section>
            <h2 className="text-coffee-100 font-semibold text-lg mb-3">
              8. Contact
            </h2>
            <p className="text-coffee-400">
              Questions or deletion requests:{" "}
              <a
                href="mailto:rehimturkic@gmail.com"
                className="text-coffee-300 hover:text-coffee-100 underline underline-offset-2 transition-colors"
              >
                rehimturkic@gmail.com
              </a>
            </p>
          </section>
        </div>

        <div className="mt-16 pt-8 border-t border-dark-border flex items-center justify-between">
          <span className="text-coffee-800 text-xs">
            © {new Date().getFullYear()} Wanna Coffi
          </span>
          <Link
            href="/"
            className="text-coffee-700 hover:text-coffee-400 text-sm transition-colors"
          >
            ☕ Back to app
          </Link>
        </div>
      </div>
    </div>
  );
}
