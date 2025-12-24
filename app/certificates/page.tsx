"use client";

import Link from "next/link";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import { Award, Sparkles, ArrowRight, MapPin } from "lucide-react";
import { useMemo } from "react";
import { REGIONAL_AUTHORITIES } from "@/lib/regional";

interface CertificateInfo {
  code: string;
  title: string;
  purpose: string;
}

const getCertificateList = (tc: (key: string) => string): CertificateInfo[] => [
  { code: "ORG", title: tc("certificateOrgTitle"), purpose: tc("certificateOrgPurpose") },
  { code: "PAR", title: tc("certificateParTitle"), purpose: tc("certificateParPurpose") },
  { code: "QUIZ", title: tc("certificateQuizTitle"), purpose: tc("certificateQuizPurpose") },
  { code: "SIM", title: tc("certificateSimTitle"), purpose: tc("certificateSimPurpose") },
  { code: "VOL", title: tc("certificateVolTitle"), purpose: tc("certificateVolPurpose") },
  { code: "SCH", title: tc("certificateSchTitle"), purpose: tc("certificateSchPurpose") },
  { code: "COL", title: tc("certificateColTitle"), purpose: tc("certificateColPurpose") },
  { code: "TOPPER", title: tc("certificateTopperTitle"), purpose: tc("certificateTopperPurpose") },
];

export default function CertificatesPage() {
  const { t } = useTranslation("common");
  const { t: tc } = useTranslation("content");
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
  
  // Regional sections (merged from regional page)
  const REGIONAL_SECTIONS = useMemo(() => {
    return Object.values(REGIONAL_AUTHORITIES);
  }, []);

  return (
    <div className="rs-container py-14 space-y-10">
      <div className="rs-card p-8 md:p-10 bg-gradient-to-br from-emerald-50 to-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-3">
            <span className="rs-chip flex items-center gap-2">
              <Award className="h-4 w-4" /> {tc("certificatesHub")}
            </span>
            <h1 className="text-3xl font-semibold text-emerald-900">{t("certificates")}</h1>
            <p className="text-slate-600 max-w-2xl">
              {tc("certificatesDescription") || "Telangana Road Safety Month issues official certificates in eight categories. Each template carries the Telangana emblem, minister signature, dynamic personalisation, and a verification-ready reference ID."}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/certificates/generate" className="rs-btn-primary">
              <Sparkles className="h-4 w-4" /> {t("generateCertificate")}
            </Link>
          </div>
        </div>
      </div>

      <div className="rs-table-wrapper">
        <table className="rs-table text-sm min-w-[640px]">
          <thead>
            <tr>
              <th className="text-left">{tc("code") || "Code"}</th>
              <th className="text-left">{tc("certificateTitle") || "Certificate Title"}</th>
              <th className="text-left">{tc("purposeEligibleRecipient") || "Purpose / Eligible Recipient"}</th>
            </tr>
          </thead>
          <tbody>
            {getCertificateList(tc).map((item) => (
              <tr key={item.code}>
                <td className="font-semibold text-emerald-700">{item.code}</td>
                <td className="font-medium text-emerald-900">{item.title}</td>
                <td className="text-slate-600">{item.purpose}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-slate-500 sm:hidden">
        {tc("tipDragSideways") || "Tip: drag sideways to view the full certificate table."}
      </p>

      {/* Regional Certificates Section (merged from regional page) */}
      <div className="rs-card bg-gradient-to-br from-emerald-50 to-white p-8 md:p-10">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="space-y-3">
            <span className="rs-chip flex items-center gap-2">
              <MapPin className="h-4 w-4" /> Regional Certificates
            </span>
            <h2 className="text-3xl font-semibold text-emerald-900">{tc("districtLevelCertificateAddons") || "District-Level Certificate Add-ons"}</h2>
            <p className="text-slate-600 max-w-3xl">
              {tc("recogniseDistrictLedEvents") || "Recognise district-led Road Safety Month events with certificates that highlight your Regional Transport Authority (RTA) leadership alongside the Hon'ble Chief Minister and Transport Minister. Select a regional profile below to pre-fill the certificate generator."}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {REGIONAL_SECTIONS.map((region) => (
          <div key={region.code} className="rs-card p-6 flex flex-col gap-5">
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
              <div className="relative mx-auto h-40 w-40 overflow-hidden rounded-full border-4 border-emerald-100 shadow-[0_18px_38px_rgba(0,0,0,0.15)]">
                <Image
                  src={region.photo}
                  alt={region.officerName}
                  width={320}
                  height={320}
                  className="h-full w-full object-cover"
                  priority
                />
              </div>
              <div className="space-y-2 text-center md:text-left">
                <p className="text-xs uppercase tracking-wide text-emerald-600">{region.district}</p>
                <h3 className="text-2xl font-semibold text-emerald-900">{region.officerName}</h3>
                <p className="text-sm text-emerald-700">{region.officerTitle}</p>
              </div>
            </div>
            <p className="text-sm text-slate-600">{region.description}</p>
            <div className="flex flex-wrap gap-3">
              <Link
                href={`/certificates/generate?rta=${region.code}&district=${encodeURIComponent(region.district)}`}
                className="rs-btn-primary"
              >
                <Sparkles className="h-4 w-4" /> {tc("generateRegionalCertificate") || "Generate Regional Certificate"}
              </Link>
              <Link
                href={`/certificates/preview?type=ORG&name=Regional%20Event&district=${encodeURIComponent(
                  region.district
                )}&date=${encodeURIComponent(today)}&ref=${encodeURIComponent(`REG-${region.code.toUpperCase()}`)}&rta=${region.code}`}
                className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700"
              >
                {tc("quickPreview") || "Quick preview"} <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        ))}
      </div>

      <div className="rs-card p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-emerald-900">{tc("needToVerifyCertificate") || "Need to verify a certificate?"}</h2>
          <p className="text-sm text-slate-600">{tc("useReferenceIdToVerify") || "Use the reference ID printed on the certificate to confirm its authenticity."}</p>
        </div>
        <Link href="/certificates/generate" className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700">
          {tc("generateOrVerifyNow") || "Generate or verify now"} <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}





