"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import type { ReactNode } from "react";
import { Menu, X, Home, Scale, GraduationCap, ShieldCheck, FileText, Cpu, Award, CalendarDays, ShieldHalf, MapPin, BookOpenCheck, Activity, BookOpen } from "lucide-react";

const navIcons: Record<string, ReactNode> = {
  "/": <Home className="h-4 w-4" />,
  "/basics": <BookOpen className="h-4 w-4" />,
  "/guides": <BookOpenCheck className="h-4 w-4" />,
  "/prevention": <Activity className="h-4 w-4" />,
  "/quiz": <ShieldCheck className="h-4 w-4" />,
  "/simulation": <Cpu className="h-4 w-4" />,
  "/certificates": <Award className="h-4 w-4" />,
  "/events": <CalendarDays className="h-4 w-4" />,
  "/admin": <FileText className="h-4 w-4" />,
};

export default function Nav() {
  const pathname = usePathname();
  const { t, i18n } = useTranslation("common");
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedLang = localStorage.getItem("i18nextLng") || "en";
    i18n.changeLanguage(savedLang);
  }, [i18n]);

  const toggleLanguage = (lang: "en" | "te") => {
    i18n.changeLanguage(lang);
    localStorage.setItem("i18nextLng", lang);
  };

  const navLinks = [
    { href: "/", label: t("home"), bracket: null, key: "/" },
    { href: "/basics", label: "Basics", bracket: "For All", key: "/basics" },
    { href: "/simulation", label: t("simulation"), bracket: "School", key: "/simulation" },
    { href: "/quiz", label: t("quiz"), bracket: "Inter", key: "/quiz" },
    { href: "/guides", label: "Guides", bracket: "Undergrad", key: "/guides" },
    { href: "/prevention", label: "Prevention", bracket: "Graduation", key: "/prevention" },
    { href: "/events", label: t("events"), bracket: null, key: "/events" },
    { href: "/certificates", label: t("certificates"), bracket: null, key: "/certificates" },
    { href: "/admin", label: t("admin"), bracket: null, key: "/admin" },
  ];

  if (!mounted) return null;

  return (
    <header className="sticky top-0 z-50 backdrop-blur bg-white/92 border-b border-emerald-100 shadow-[0_6px_20px_rgba(0,109,74,0.08)]">
      <div className="rs-container">
        <div className="flex h-20 items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-emerald-200 bg-white shadow-[0_8px_18px_rgba(13,148,94,0.18)]">
              <Image
                src="/assets/leadership/CM.png"
                alt={t("chiefMinisterAlt") || "Chief Minister of Telangana"}
                width={48}
                height={48}
                className="h-12 w-12 rounded-full object-cover"
                priority
              />
            </div>
            <Link href="/" className="flex items-center">
              <div className="h-14 w-14 rounded-full border-2 border-emerald-200 bg-white flex items-center justify-center shadow-[0_8px_18px_rgba(13,148,94,0.18)]">
                <Image
                  src="/assets/logo/Telangana-LOGO.png"
                  alt={t("telanganaGovernmentLogo") || "Telangana Government Logo"}
                  width={48}
                  height={48}
                  priority
                  className="h-12 w-12 object-contain"
                />
              </div>
            </Link>
            <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-emerald-200 bg-white shadow-[0_8px_18px_rgba(13,148,94,0.18)]">
              <Image
                src="/assets/minister/Sri-Ponnam-Prabhakar.jpg"
                alt={t("transportMinisterAlt") || "Transport Minister of Telangana"}
                width={48}
                height={48}
                className="h-12 w-12 rounded-full object-cover"
                priority
              />
            </div>
          </div>

          <nav className="hidden xl:flex items-center gap-2 rounded-full border border-emerald-100 bg-white/70 px-2 py-1 shadow-[0_12px_24px_rgba(24,90,64,0.1)]">
            {navLinks.map((link) => {
              const active = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  title={link.bracket ? `${link.label} (${link.bracket})` : link.label}
                  className={`relative flex flex-col items-center gap-0.5 rounded-full px-2.5 py-1.5 text-xs font-medium transition-all group ${
                    active
                      ? "bg-emerald-600 text-white shadow-[0_10px_20px_rgba(7,80,55,0.3)]"
                      : "text-slate-600 hover:bg-emerald-50"
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm">{navIcons[link.key]}</span>
                    <span className="whitespace-nowrap">{link.label}</span>
                  </div>
                  {link.bracket && (
                    <span className={`text-[10px] leading-tight ${active ? "text-white/90" : "text-slate-500"}`}>
                      ({link.bracket})
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            <div className="rs-pill-toggle">
              {mounted && (
                <>
                  <button 
                    data-active={i18n.language === "en"} 
                    onClick={() => toggleLanguage("en")}
                    className="text-xs font-semibold px-3 py-1.5 rounded-full transition-all"
                  >
                    EN
                  </button>
                  <button 
                    data-active={i18n.language === "te"} 
                    onClick={() => toggleLanguage("te")}
                    className="text-xs font-semibold px-3 py-1.5 rounded-full transition-all"
                  >
                    TE
                  </button>
                </>
              )}
            </div>
            <button
              className="xl:hidden inline-flex h-11 w-11 items-center justify-center rounded-full border border-emerald-200 text-emerald-800 shadow-[0_8px_18px_rgba(0,123,79,0.15)]"
              onClick={() => setIsOpen(!isOpen)}
              aria-label={t("toggleMenu") || "Toggle menu"}
            >
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {isOpen && (
          <div className="xl:hidden pb-4">
            <div className="grid gap-2 rounded-2xl border border-emerald-100 bg-white/90 p-4 shadow-[0_12px_28px_rgba(7,80,55,0.15)]">
              {navLinks.map((link) => {
                const active = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className={`flex flex-col gap-0.5 rounded-xl px-3 py-3 text-sm font-semibold transition ${
                      active ? "bg-emerald-600 text-white" : "text-slate-700 hover:bg-emerald-50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {navIcons[link.key]}
                      <span>{link.label}</span>
                    </div>
                    {link.bracket && (
                      <span className={`text-xs ml-7 ${active ? "text-white/90" : "text-slate-500"}`}>
                        ({link.bracket})
                      </span>
                    )}
                  </Link>
                );
              })}
              <div className="flex items-center justify-center pt-2 border-t border-emerald-100 mt-2">
                <div className="rs-pill-toggle">
                  <button 
                    data-active={i18n.language === "en"} 
                    onClick={() => toggleLanguage("en")}
                    className="text-xs font-semibold px-3 py-1.5 rounded-full transition-all"
                  >
                    EN
                  </button>
                  <button 
                    data-active={i18n.language === "te"} 
                    onClick={() => toggleLanguage("te")}
                    className="text-xs font-semibold px-3 py-1.5 rounded-full transition-all"
                  >
                    TE
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
