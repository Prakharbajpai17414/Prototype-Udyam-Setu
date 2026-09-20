import React, { useState, useMemo } from "react";
import {
  Home, FileText, ClipboardList, Settings, Bell, LogOut, CheckCircle2,
  AlertTriangle, Clock, Upload, MessageSquare, Calendar, ShieldCheck,
  Users, Building2, Search, ChevronRight, ChevronLeft, X, Info,
  ClipboardCheck, FileWarning, Landmark, Gauge, BookOpen, ListChecks
} from "lucide-react";

/* ============================================================
   DESIGN TOKENS
   ============================================================ */
const C = {
  primary: "#1B3A5C",
  primaryDark: "#122840",
  accent: "#2C5F8A",
  bg: "#F3F5F8",
  surface: "#FFFFFF",
  border: "#D8DEE4",
  borderStrong: "#B7C1CC",
  text: "#1A2332",
  textMuted: "#5A6472",
  success: "#1F7A4D",
  successBg: "#E5F3EB",
  warning: "#8A6100",
  warningBg: "#FBF1D6",
  danger: "#A82A21",
  dangerBg: "#FBEAE8",
  info: "#2C5F8A",
  infoBg: "#E7EEF6",
  purple: "#5B3E85",
  purpleBg: "#EFE8F6",
  slate: "#5A6472",
  slateBg: "#EEF1F4",
};

/* ============================================================
   SEED DATA
   ============================================================ */
const DEPARTMENTS = [
  { id: "municipal", name: "Urban Local Body / Municipal Department", contact: "helpdesk-ulb@mp.gov.in" },
  { id: "fire", name: "Fire Department", contact: "fire-dept@mp.gov.in" },
  { id: "pcb", name: "Madhya Pradesh Pollution Control Board", contact: "mppcb@mp.gov.in" },
  { id: "labour", name: "Labour Department (Factories)", contact: "labour-factories@mp.gov.in" },
  { id: "food", name: "Food Safety Department", contact: "fssai-mp@mp.gov.in" },
  { id: "planning", name: "Town & Country Planning Department", contact: "tcp-dept@mp.gov.in" },
  { id: "environment", name: "State Environment Impact Assessment Authority", contact: "seiaa-mp@mp.gov.in" },
];

const INSPECTORS = {
  fire: ["R. K. Sharma (Fire Inspector)", "A. Verma (Fire Inspector)"],
  pcb: ["S. Chouhan (Environmental Engineer)"],
  labour: ["M. Tiwari (Factory Inspector)"],
  food: ["P. Nair (Food Safety Officer)"],
  planning: ["D. Rathore (Junior Engineer)"],
  environment: ["S. Chouhan (Environmental Engineer)"],
  municipal: ["V. Joshi (Revenue Inspector)"],
};

const DOC_KEYWORDS = {
  "Building Layout Plan": ["layout", "plan", "building"],
  "Fire Safety Plan": ["fire", "safety"],
  "Site Ownership / Lease Proof": ["lease", "ownership", "sale", "deed", "rent"],
  "Fire Equipment Installation Certificate": ["fire", "equipment", "installation", "certificate"],
  "Project Report (DPR)": ["project", "report", "dpr"],
  "Effluent Treatment Plan": ["effluent", "treatment", "etp"],
  "Land Ownership Document": ["land", "ownership", "deed"],
  "Udyam / MSME Registration": ["udyam", "msme", "registration"],
  "Factory Building Plan": ["factory", "building", "plan"],
  "List of Machinery": ["machinery", "equipment", "list"],
  "Employee Welfare Facility Plan": ["welfare", "facility", "employee"],
  "Identity / Address Proof of Occupier": ["identity", "address", "proof", "aadhaar", "pan"],
  "Food Safety Management Plan": ["food", "safety", "plan", "fssai"],
  "Water Testing Report": ["water", "test", "report"],
  "List of Food Products": ["product", "list", "food"],
  "Layout Plan of Processing Unit": ["layout", "plan", "processing"],
  "Site Plan": ["site", "plan"],
  "Building Design / Structural Drawing": ["building", "design", "structural", "drawing"],
  "Land Title Document": ["land", "title", "deed"],
  "Architect Certificate": ["architect", "certificate"],
  "PAN / Business Registration Proof": ["pan", "registration", "certificate", "incorporation"],
  "Rent Agreement / Property Proof": ["rent", "agreement", "property", "lease"],
  "Environmental Impact Assessment Report": ["eia", "environment", "impact", "assessment"],
  "Public Hearing Record": ["hearing", "public", "record"],
};

function mkDocs(names) {
  return names.map((n, i) => ({
    docId: n.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    name: n,
    mandatory: true,
    fileName: null,
    status: "missing", // missing | uploaded | under_verification | accepted
    warning: null,
  }));
}

const APPROVAL_CATALOG = {
  "trade-license": {
    id: "trade-license",
    name: "Trade License",
    deptId: "municipal",
    purpose: "Authorises an entrepreneur to legally carry out a trade or business activity within a municipal area.",
    instructions: [
      "Ensure the business address matches the property proof submitted.",
      "License must be renewed annually before the expiry date.",
    ],
    docs: ["PAN / Business Registration Proof", "Rent Agreement / Property Proof"],
    slaDays: 15,
  },
  "fire-noc": {
    id: "fire-noc",
    name: "Fire Safety No-Objection Certificate (Fire NOC)",
    deptId: "fire",
    purpose: "Certifies that the premises meet fire-safety norms before commencing manufacturing or large-scale commercial operations.",
    instructions: [
      "Fire-fighting equipment must be installed before the site inspection.",
      "Emergency exits shown in the building plan must be kept unobstructed at all times.",
    ],
    docs: ["Building Layout Plan", "Fire Safety Plan", "Site Ownership / Lease Proof", "Fire Equipment Installation Certificate"],
    slaDays: 21,
  },
  "pollution-consent": {
    id: "pollution-consent",
    name: "Consent to Establish (Pollution — Water & Air)",
    deptId: "pcb",
    purpose: "Required under the Water and Air Pollution Control Acts before establishing a manufacturing unit likely to generate effluents or emissions.",
    instructions: [
      "The effluent treatment plan must match the scale of production declared in the business profile.",
      "Consent to Operate must be applied for separately once production begins.",
    ],
    docs: ["Project Report (DPR)", "Effluent Treatment Plan", "Land Ownership Document", "Udyam / MSME Registration"],
    slaDays: 30,
  },
  "factory-license": {
    id: "factory-license",
    name: "Factory Registration & License",
    deptId: "labour",
    purpose: "Registers the premises as a 'factory' under the Factories Act, applicable to units employing 10 or more workers with power, or 20 or more without power.",
    instructions: [
      "Worker welfare facilities (drinking water, washrooms, first-aid) must be in place before inspection.",
      "License must be renewed every year along with the annual return.",
    ],
    docs: ["Factory Building Plan", "List of Machinery", "Employee Welfare Facility Plan", "Identity / Address Proof of Occupier"],
    slaDays: 20,
  },
  "food-license": {
    id: "food-license",
    name: "FSSAI Food Business License",
    deptId: "food",
    purpose: "Mandatory licence under the Food Safety and Standards Act for units engaged in the manufacture or processing of food products.",
    instructions: [
      "Water used in processing must be tested at an accredited laboratory.",
      "The licence number must be displayed on all product packaging.",
    ],
    docs: ["Food Safety Management Plan", "Water Testing Report", "List of Food Products", "Layout Plan of Processing Unit"],
    slaDays: 25,
  },
  "building-approval": {
    id: "building-approval",
    name: "Building Plan Approval",
    deptId: "planning",
    purpose: "Sanctions the construction plan of a new building against municipal zoning and safety by-laws before construction begins.",
    instructions: [
      "Construction must strictly follow the sanctioned plan; deviations require a fresh approval.",
      "A completion certificate must be obtained once construction finishes.",
    ],
    docs: ["Site Plan", "Building Design / Structural Drawing", "Land Title Document", "Architect Certificate"],
    slaDays: 30,
  },
  "shop-establishment": {
    id: "shop-establishment",
    name: "Shop & Establishment Registration",
    deptId: "labour",
    purpose: "Registers a commercial establishment and its working conditions under the Shops and Establishments Act.",
    instructions: [
      "Working hours displayed at the premises must match the registered details.",
    ],
    docs: ["PAN / Business Registration Proof", "Rent Agreement / Property Proof"],
    slaDays: 10,
  },
  "env-clearance": {
    id: "env-clearance",
    name: "Environmental Clearance (State Level)",
    deptId: "environment",
    purpose: "Required for large-scale projects above the notified investment threshold, assessing likely environmental impact before construction.",
    instructions: [
      "A public hearing must be conducted for the surrounding community before clearance is granted.",
    ],
    docs: ["Environmental Impact Assessment Report", "Public Hearing Record"],
    slaDays: 45,
  },
};

// Configurable rules engine — evaluated against the business profile.
// Each rule references an approval in APPROVAL_CATALOG and the conditions under which it applies.
const APPROVAL_RULES = [
  { ruleId: "R1", approvalId: "trade-license", label: "Applies to every registered business", test: () => true },
  { ruleId: "R2", approvalId: "fire-noc", label: "Manufacturing units, or Service/Trading units investing ₹1 crore or more",
    test: (p) => p.businessType === "Manufacturing" || p.investmentLakh >= 100 },
  { ruleId: "R3", approvalId: "pollution-consent", label: "Manufacturing units in Food Processing, Textile, Chemicals or Metal Processing",
    test: (p) => p.businessType === "Manufacturing" && ["Food Processing", "Textile", "Chemicals", "Metal Processing"].includes(p.industry) },
  { ruleId: "R4", approvalId: "factory-license", label: "Manufacturing units employing 10 or more workers",
    test: (p) => p.businessType === "Manufacturing" && p.employees >= 10 },
  { ruleId: "R5", approvalId: "food-license", label: "Units in the Food Processing sector",
    test: (p) => p.industry === "Food Processing" },
  { ruleId: "R6", approvalId: "building-approval", label: "New units undertaking fresh construction",
    test: (p) => p.businessStage === "New Unit" },
  { ruleId: "R7", approvalId: "shop-establishment", label: "Service or Trading units",
    test: (p) => p.businessType === "Service" || p.businessType === "Trading" },
  { ruleId: "R8", approvalId: "env-clearance", label: "Projects with investment of ₹10 crore or more",
    test: (p) => p.investmentLakh >= 1000 },
];

const REGULATORY_KB = [
  { q: "Why is Fire NOC required?", keywords: ["fire", "noc"], answer: "A Fire NOC confirms that a premises has adequate fire-detection, fire-fighting and evacuation arrangements before it is occupied for manufacturing or large commercial use. It is mandated under the state Fire Prevention and Life Safety rules for units above the notified built-up area or occupancy risk category.", source: "Madhya Pradesh Fire Prevention & Life Safety Rules, Schedule II" },
  { q: "Why is Pollution Consent needed?", keywords: ["pollution", "consent", "pcb", "effluent"], answer: "Consent to Establish is required under the Water (Prevention and Control of Pollution) Act and the Air Act before setting up a unit likely to discharge effluents or emissions, so that treatment arrangements are verified before construction begins.", source: "Water Act 1974 & Air Act 1981, MP Pollution Control Board guidelines" },
  { q: "Who needs a Factory License?", keywords: ["factory", "license", "labour"], answer: "Any premises using power and employing 10 or more workers, or not using power and employing 20 or more workers, in a manufacturing process must register as a factory under the Factories Act, 1948.", source: "Factories Act 1948, Section 2(m)" },
  { q: "What is an FSSAI license and who needs it?", keywords: ["food", "fssai", "license"], answer: "An FSSAI licence is mandatory for any business engaged in manufacturing, processing, storing or distributing food products, to ensure the food meets prescribed safety and hygiene standards.", source: "Food Safety and Standards Act, 2006" },
  { q: "When is Building Plan Approval required?", keywords: ["building", "plan", "approval", "construction"], answer: "Building Plan Approval is required before starting fresh construction, so that the layout conforms to municipal zoning, setback and safety by-laws.", source: "Madhya Pradesh Bhumi Vikas Rules" },
  { q: "What triggers an Environmental Clearance requirement?", keywords: ["environment", "clearance", "eia"], answer: "Projects above the investment or capacity threshold notified under the Environment Impact Assessment framework require a State-level clearance, including a public hearing, before construction begins.", source: "Environment Impact Assessment Notification, 2006" },
  { q: "How long does approval usually take?", keywords: ["sla", "time", "how long", "timeline"], answer: "Each approval has its own service-level target, shown on its details page — for example a Trade License targets 15 days, while an Environmental Clearance targets 45 days given the public hearing requirement.", source: "MP Public Service Guarantee Act, notified timelines" },
];

/* ============================================================
   HELPERS
   ============================================================ */
function todayISO() { return new Date().toISOString().slice(0, 10); }
function addDays(iso, days) {
  const d = new Date(iso);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}
function fmtDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}
function daysRemaining(iso) {
  const d1 = new Date(todayISO());
  const d2 = new Date(iso);
  return Math.round((d2 - d1) / (1000 * 60 * 60 * 24));
}
function slaInfo(deadline) {
  if (!deadline) return { label: "Not yet applicable", tone: "slate" };
  const rem = daysRemaining(deadline);
  if (rem < 0) return { label: `SLA breached by ${Math.abs(rem)} day${Math.abs(rem) === 1 ? "" : "s"}`, tone: "danger" };
  if (rem <= 5) return { label: `Due soon — ${rem} day${rem === 1 ? "" : "s"} remaining`, tone: "warning" };
  return { label: `${rem} days remaining`, tone: "info" };
}
function genAppId(deptId) {
  const n = Math.floor(1000 + Math.random() * 9000);
  return `MP-${deptId.toUpperCase()}-2026-${n}`;
}
function generateChecklist(profile) {
  if (!profile) return [];
  const applicable = [];
  APPROVAL_RULES.forEach((rule) => {
    if (rule.test(profile)) {
      const approval = APPROVAL_CATALOG[rule.approvalId];
      applicable.push({ ...approval, why: rule.label });
    }
  });
  return applicable;
}
function computeRisk(profile, docWarningCount) {
  let score = 0;
  if (profile.investmentLakh >= 500) score += 1;
  if (["Chemicals", "Metal Processing"].includes(profile.industry)) score += 2;
  if (docWarningCount > 0) score += 1;
  if (profile.employees >= 100) score += 1;
  if (score >= 3) return "High";
  if (score >= 1) return "Medium";
  return "Low";
}
function statusLabel(s) {
  return {
    draft: "Draft",
    documents_submitted: "Documents Submitted",
    submitted: "Submitted",
    under_review: "Under Review",
    query_raised: "Query Raised",
    inspection: "Inspection Scheduled",
    approved: "Approved",
    rejected: "Rejected",
    not_started: "Not Started",
  }[s] || s;
}
function statusTone(s) {
  return {
    draft: "slate", documents_submitted: "slate", submitted: "info", under_review: "info",
    query_raised: "warning", inspection: "purple", approved: "success", rejected: "danger", not_started: "slate",
  }[s] || "slate";
}

/* ============================================================
   TINY UI PRIMITIVES
   ============================================================ */
const toneColors = (tone) => {
  const map = {
    success: [C.success, C.successBg], warning: [C.warning, C.warningBg],
    danger: [C.danger, C.dangerBg], info: [C.info, C.infoBg],
    purple: [C.purple, C.purpleBg], slate: [C.slate, C.slateBg],
  };
  return map[tone] || map.slate;
};

function Badge({ tone = "slate", children, icon: Icon }) {
  const [fg, bg] = toneColors(tone);
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-sm font-medium border"
      style={{ color: fg, backgroundColor: bg, borderColor: fg + "33" }}
    >
      {Icon ? <Icon size={14} /> : null}
      {children}
    </span>
  );
}

function Card({ children, className = "", style = {} }) {
  return (
    <div
      className={`rounded-md border ${className}`}
      style={{ backgroundColor: C.surface, borderColor: C.border, ...style }}
    >
      {children}
    </div>
  );
}

function PrimaryButton({ children, onClick, icon: Icon, type = "button", disabled, size = "md" }) {
  const pad = size === "lg" ? "px-6 py-3 text-base" : "px-4 py-2.5 text-sm";
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center gap-2 ${pad} rounded-md font-semibold text-white transition-colors`}
      style={{ backgroundColor: disabled ? C.borderStrong : C.primary, cursor: disabled ? "not-allowed" : "pointer" }}
      onMouseEnter={(e) => { if (!disabled) e.currentTarget.style.backgroundColor = C.primaryDark; }}
      onMouseLeave={(e) => { if (!disabled) e.currentTarget.style.backgroundColor = C.primary; }}
    >
      {Icon ? <Icon size={18} /> : null}
      {children}
    </button>
  );
}

function SecondaryButton({ children, onClick, icon: Icon, tone = "default" }) {
  const danger = tone === "danger";
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md font-semibold text-sm border transition-colors"
      style={{
        color: danger ? C.danger : C.primary,
        borderColor: danger ? C.danger : C.primary,
        backgroundColor: C.surface,
      }}
    >
      {Icon ? <Icon size={18} /> : null}
      {children}
    </button>
  );
}

function PageHeader({ title, description, action }) {
  return (
    <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: C.text }}>{title}</h1>
        {description ? <p className="mt-1 text-sm max-w-2xl" style={{ color: C.textMuted }}>{description}</p> : null}
      </div>
      {action}
    </div>
  );
}

function StatCard({ label, value, icon: Icon, tone = "info" }) {
  const [fg, bg] = toneColors(tone);
  return (
    <Card className="p-4 flex items-center gap-4">
      <div className="w-11 h-11 rounded-md flex items-center justify-center flex-shrink-0" style={{ backgroundColor: bg }}>
        <Icon size={22} color={fg} />
      </div>
      <div>
        <div className="text-2xl font-bold" style={{ color: C.text }}>{value}</div>
        <div className="text-sm" style={{ color: C.textMuted }}>{label}</div>
      </div>
    </Card>
  );
}

function Modal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(20,28,38,0.55)" }}>
      <Card className="w-full max-w-lg p-6 max-h-[85vh] overflow-y-auto">
        <div className="flex items-start justify-between mb-4">
          <h2 className="text-lg font-bold" style={{ color: C.text }}>{title}</h2>
          <button onClick={onClose} aria-label="Close"><X size={20} color={C.textMuted} /></button>
        </div>
        {children}
      </Card>
    </div>
  );
}

function Field({ label, children, hint }) {
  return (
    <label className="block mb-4">
      <span className="block text-sm font-semibold mb-1.5" style={{ color: C.text }}>{label}</span>
      {children}
      {hint ? <span className="block text-xs mt-1" style={{ color: C.textMuted }}>{hint}</span> : null}
    </label>
  );
}

const inputStyle = { borderColor: C.border, color: C.text };
const inputCls = "w-full px-3 py-2.5 rounded-md border text-sm focus:outline-none focus:ring-2";

function Toast({ message, onClose }) {
  if (!message) return null;
  return (
    <div
      className="fixed bottom-6 right-6 z-50 px-5 py-3 rounded-md shadow-lg text-sm font-medium flex items-center gap-2"
      style={{ backgroundColor: C.primaryDark, color: "white" }}
    >
      <CheckCircle2 size={18} />
      {message}
      <button onClick={onClose} className="ml-2"><X size={16} /></button>
    </div>
  );
}

function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <Card className="p-10 text-center">
      <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: C.infoBg }}>
        <Icon size={26} color={C.info} />
      </div>
      <h3 className="text-lg font-bold mb-1" style={{ color: C.text }}>{title}</h3>
      <p className="text-sm mb-5 max-w-md mx-auto" style={{ color: C.textMuted }}>{description}</p>
      {action}
    </Card>
  );
}

/* ============================================================
   ROOT APP
   ============================================================ */
export default function App() {
  const [role, setRole] = useState(null); // 'entrepreneur' | 'officer' | 'admin'
  const [officerDept, setOfficerDept] = useState("fire");
  const [view, setView] = useState("dashboard");
  const [profile, setProfile] = useState(null);
  const [applications, setApplications] = useState([]); // list of application objects
  const [selectedAppId, setSelectedAppId] = useState(null);
  const [selectedApprovalId, setSelectedApprovalId] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [auditLog, setAuditLog] = useState([
    { id: 1, date: todayISO(), actor: "System", action: "Seed rules and departments loaded into configuration" },
  ]);
  const [toast, setToast] = useState("");
  const [showNotif, setShowNotif] = useState(false);

  function pushNotif(message) {
    setNotifications((n) => [{ id: Date.now(), message, date: todayISO(), read: false }, ...n]);
  }
  function pushAudit(action) {
    setAuditLog((a) => [{ id: Date.now(), date: todayISO(), actor: role === "officer" ? `Officer — ${DEPARTMENTS.find(d => d.id === officerDept)?.name}` : role === "admin" ? "Administrator" : "Entrepreneur", action }, ...a]);
  }
  function notifyToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  }

  const checklist = useMemo(() => generateChecklist(profile), [profile]);

  function getApplicationFor(approvalId) {
    return applications.find((a) => a.approvalId === approvalId);
  }

  function startApplication(approval) {
    if (getApplicationFor(approval.id)) {
      setSelectedApprovalId(approval.id);
      setView("application-form");
      return;
    }
    const newApp = {
      appId: null,
      approvalId: approval.id,
      approvalName: approval.name,
      deptId: approval.deptId,
      businessName: profile.businessName,
      status: "draft",
      documents: mkDocs(approval.docs),
      timeline: [{ date: todayISO(), event: "Application Drafted", actor: "Entrepreneur", note: "Checklist item selected and application started." }],
      queries: [],
      inspection: null,
      submissionDate: null,
      slaDeadline: null,
      riskLevel: null,
      slaDays: approval.slaDays,
    };
    setApplications((apps) => [...apps, newApp]);
    setSelectedApprovalId(approval.id);
    setView("application-form");
  }

  function updateApp(approvalId, updater) {
    setApplications((apps) => apps.map((a) => (a.approvalId === approvalId ? updater({ ...a }) : a)));
  }

  function uploadDoc(approvalId, docId, fileName) {
    updateApp(approvalId, (app) => {
      const docs = app.documents.map((d) => {
        if (d.docId !== docId) return d;
        const keywords = DOC_KEYWORDS[d.name] || [];
        const lower = fileName.toLowerCase();
        const matches = keywords.some((k) => lower.includes(k));
        return {
          ...d,
          fileName,
          status: "uploaded",
          warning: matches ? null : "This document may not match the required document type. Please verify before submission.",
        };
      });
      return { ...app, documents: docs };
    });
  }

  function submitApplication(approvalId) {
    const approval = APPROVAL_CATALOG[approvalId];
    updateApp(approvalId, (app) => {
      const warningCount = app.documents.filter((d) => d.warning).length;
      const appId = genAppId(approval.deptId);
      const deadline = addDays(todayISO(), app.slaDays);
      pushAudit(`Submitted application ${appId} for ${approval.name}`);
      pushNotif(`Application ${appId} for ${approval.name} has been submitted to ${DEPARTMENTS.find(d => d.id === approval.deptId).name}.`);
      return {
        ...app,
        appId,
        status: "submitted",
        submissionDate: todayISO(),
        slaDeadline: deadline,
        riskLevel: computeRisk(profile, warningCount),
        documents: app.documents.map((d) => ({ ...d, status: d.status === "uploaded" ? "under_verification" : d.status })),
        timeline: [
          ...app.timeline,
          { date: todayISO(), event: "Documents Submitted", actor: "Entrepreneur", note: "All mandatory documents uploaded." },
          { date: todayISO(), event: "Submitted", actor: "Entrepreneur", note: `Application ${appId} routed to ${DEPARTMENTS.find(d => d.id === approval.deptId).name}.` },
        ],
      };
    });
    notifyToast("Application submitted successfully.");
    setView("my-applications");
  }

  function officerAction(appId, action, payload = {}) {
    setApplications((apps) => apps.map((app) => {
      if (app.appId !== appId) return app;
      let a = { ...app };
      const dept = DEPARTMENTS.find((d) => d.id === app.deptId).name;
      if (action === "start-review") {
        a.status = "under_review";
        a.timeline = [...a.timeline, { date: todayISO(), event: "Under Review", actor: `Officer — ${dept}`, note: "Application picked up for review." }];
      }
      if (action === "approve") {
        a.status = "approved";
        a.documents = a.documents.map((d) => ({ ...d, status: "accepted" }));
        a.timeline = [...a.timeline, { date: todayISO(), event: "Approved", actor: `Officer — ${dept}`, note: payload.note || "Application approved." }];
        pushNotif(`Great news — your application ${appId} (${a.approvalName}) has been approved.`);
      }
      if (action === "reject") {
        a.status = "rejected";
        a.timeline = [...a.timeline, { date: todayISO(), event: "Rejected", actor: `Officer — ${dept}`, note: payload.note || "Application rejected." }];
        pushNotif(`Your application ${appId} (${a.approvalName}) was rejected. Reason: ${payload.note}`);
      }
      if (action === "raise-query") {
        a.status = "query_raised";
        a.queries = [...a.queries, { id: Date.now(), message: payload.message, raisedBy: `Officer — ${dept}`, date: todayISO(), status: "open", response: null }];
        a.timeline = [...a.timeline, { date: todayISO(), event: "Query Raised", actor: `Officer — ${dept}`, note: payload.message }];
        pushNotif(`A query has been raised on application ${appId}: "${payload.message}"`);
      }
      if (action === "request-document") {
        a.status = "query_raised";
        a.documents = a.documents.map((d) => d.docId === payload.docId ? { ...d, status: "missing", fileName: null, warning: null } : d);
        a.queries = [...a.queries, { id: Date.now(), message: payload.message, raisedBy: `Officer — ${dept}`, date: todayISO(), status: "open", response: null, docId: payload.docId }];
        a.timeline = [...a.timeline, { date: todayISO(), event: "Additional Document Requested", actor: `Officer — ${dept}`, note: payload.message }];
        pushNotif(`Additional document requested on application ${appId}: "${payload.message}"`);
      }
      if (action === "schedule-inspection") {
        a.status = "inspection";
        a.inspection = { inspector: payload.inspector, date: payload.date, time: payload.time, status: "scheduled", result: null, remarks: null, evidence: null };
        a.timeline = [...a.timeline, { date: todayISO(), event: "Inspection Scheduled", actor: `Officer — ${dept}`, note: `${payload.inspector} on ${fmtDate(payload.date)} at ${payload.time}.` }];
        pushNotif(`An inspection has been scheduled for application ${appId} on ${fmtDate(payload.date)}.`);
      }
      if (action === "record-inspection") {
        a.inspection = { ...a.inspection, status: "completed", result: payload.result, remarks: payload.remarks, evidence: payload.evidence };
        a.timeline = [...a.timeline, { date: todayISO(), event: "Inspection Completed", actor: `Officer — ${dept}`, note: `Result: ${payload.result}. ${payload.remarks || ""}` }];
        a.status = "under_review";
      }
      return a;
    }));
    pushAudit(`${action.replace(/-/g, " ")} on application ${appId}`);
  }

  function respondToQuery(appId, queryId, responseText, docId, fileName) {
    setApplications((apps) => apps.map((app) => {
      if (app.appId !== appId) return app;
      let a = { ...app };
      a.queries = a.queries.map((q) => q.id === queryId ? { ...q, response: responseText, respondedDate: todayISO(), status: "resolved" } : q);
      if (docId && fileName) {
        a.documents = a.documents.map((d) => d.docId === docId ? { ...d, fileName, status: "uploaded", warning: null } : d);
      }
      a.status = "under_review";
      a.timeline = [...a.timeline, { date: todayISO(), event: "Query Responded", actor: "Entrepreneur", note: responseText }];
      return a;
    }));
    pushNotif(`Your response to the query on application ${appId} has been submitted.`);
    pushAudit(`Entrepreneur responded to query on application ${appId}`);
  }

  function logout() {
    setRole(null);
    setView("dashboard");
    setSelectedAppId(null);
    setSelectedApprovalId(null);
  }

  if (!role) {
    return <LoginScreen onLogin={(r, dept) => { setRole(r); if (dept) setOfficerDept(dept); setView("dashboard"); }} />;
  }

  const navItems = {
    entrepreneur: [
      { id: "dashboard", label: "Dashboard", icon: Home },
      { id: "profile", label: "Business Profile", icon: Building2 },
      { id: "checklist", label: "Approval Checklist", icon: ListChecks },
      { id: "my-applications", label: "My Applications", icon: FileText },
      { id: "assistant", label: "Regulatory Assistant", icon: BookOpen },
    ],
    officer: [
      { id: "dashboard", label: "Application Queue", icon: ClipboardList },
    ],
    admin: [
      { id: "dashboard", label: "Overview", icon: Home },
      { id: "config", label: "Departments & Rules", icon: Settings },
      { id: "audit", label: "Audit Log", icon: ShieldCheck },
    ],
  }[role];

  return (
    <div className="min-h-screen w-full flex" style={{ backgroundColor: C.bg, fontFamily: "system-ui, -apple-system, 'Segoe UI', Arial, sans-serif" }}>
      <Sidebar role={role} officerDept={officerDept} navItems={navItems} view={view} setView={setView} onLogout={logout} />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar
          role={role} officerDept={officerDept} profile={profile}
          notifications={notifications} showNotif={showNotif} setShowNotif={setShowNotif}
          onMarkRead={() => setNotifications((n) => n.map((x) => ({ ...x, read: true })))}
        />
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          {role === "entrepreneur" && (
            <EntrepreneurRoutes
              view={view} setView={setView}
              profile={profile} setProfile={setProfile}
              checklist={checklist} applications={applications}
              getApplicationFor={getApplicationFor}
              selectedApprovalId={selectedApprovalId} setSelectedApprovalId={setSelectedApprovalId}
              selectedAppId={selectedAppId} setSelectedAppId={setSelectedAppId}
              startApplication={startApplication} uploadDoc={uploadDoc} submitApplication={submitApplication}
              respondToQuery={respondToQuery}
              notifyToast={notifyToast}
            />
          )}
          {role === "officer" && (
            <OfficerRoutes
              officerDept={officerDept}
              applications={applications.filter((a) => a.deptId === officerDept && a.appId)}
              selectedAppId={selectedAppId} setSelectedAppId={setSelectedAppId}
              officerAction={officerAction}
              notifyToast={notifyToast}
              profile={profile}
            />
          )}
          {role === "admin" && (
            <AdminRoutes view={view} applications={applications.filter((a) => a.appId)} auditLog={auditLog} />
          )}
        </main>
      </div>
      <Toast message={toast} onClose={() => setToast("")} />
    </div>
  );
}


function LoginScreen({ onLogin }) {
  const [step, setStep] = useState(null); // null | 'officer'
  const [dept, setDept] = useState("fire");
  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6" style={{ backgroundColor: C.bg, fontFamily: "system-ui, -apple-system, 'Segoe UI', Arial, sans-serif" }}>
      <div className="w-full max-w-3xl">
        <div className="flex items-center gap-3 mb-8 justify-center">
          <div className="w-12 h-12 rounded-md flex items-center justify-center" style={{ backgroundColor: C.primary }}>
            <Landmark color="white" size={26} />
          </div>
          <div>
            <div className="text-xl font-bold" style={{ color: C.text }}>Unified Industrial Approval &amp; Compliance Platform</div>
            <div className="text-sm" style={{ color: C.textMuted }}>Government of Maharashtra - Department of Industries</div>
          </div>
        </div>

        <Card className="p-8">
          {step !== "officer" ? (
            <>
              <h1 className="text-lg font-bold mb-1" style={{ color: C.text }}>Sign in to continue</h1>
              <p className="text-sm mb-6" style={{ color: C.textMuted }}>Select how you would like to access the platform.</p>
              <div className="grid sm:grid-cols-3 gap-4">
                <RoleCard icon={Users} title="Entrepreneur" description="Apply for approvals and track your business's compliance." onClick={() => onLogin("entrepreneur")} />
                <RoleCard icon={ClipboardList} title="Department Officer" description="Review and process applications for your department." onClick={() => setStep("officer")} />
                <RoleCard icon={Settings} title="Administrator" description="Configure departments, approval rules and view audit logs." onClick={() => onLogin("admin")} />
              </div>
            </>
          ) : (
            <>
              <h1 className="text-lg font-bold mb-1" style={{ color: C.text }}>Department Officer Sign-in</h1>
              <p className="text-sm mb-6" style={{ color: C.textMuted }}>Select your department to view your application queue.</p>
              <Field label="Department">
                <select className={inputCls} style={inputStyle} value={dept} onChange={(e) => setDept(e.target.value)}>
                  {DEPARTMENTS.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </Field>
              <div className="flex gap-3 mt-2">
                <SecondaryButton onClick={() => setStep(null)} icon={ChevronLeft}>Back</SecondaryButton>
                <PrimaryButton onClick={() => onLogin("officer", dept)}>Sign in</PrimaryButton>
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}

function RoleCard({ icon: Icon, title, description, onClick }) {
  return (
    <button onClick={onClick} className="text-left p-5 rounded-md border-2 transition-colors" style={{ borderColor: C.border }}
      onMouseEnter={(e) => e.currentTarget.style.borderColor = C.primary}
      onMouseLeave={(e) => e.currentTarget.style.borderColor = C.border}>
      <div className="w-11 h-11 rounded-md flex items-center justify-center mb-3" style={{ backgroundColor: C.infoBg }}>
        <Icon size={22} color={C.primary} />
      </div>
      <div className="font-bold mb-1" style={{ color: C.text }}>{title}</div>
      <div className="text-sm" style={{ color: C.textMuted }}>{description}</div>
    </button>
  );
}


function Sidebar({ role, officerDept, navItems, view, setView, onLogout }) {
  const roleLabel = { entrepreneur: "Entrepreneur", officer: "Department Officer", admin: "Administrator" }[role];
  return (
    <aside className="w-64 flex-shrink-0 border-r flex flex-col" style={{ backgroundColor: C.surface, borderColor: C.border }}>
      <div className="p-5 border-b flex items-center gap-2.5" style={{ borderColor: C.border }}>
        <div className="w-9 h-9 rounded-md flex items-center justify-center flex-shrink-0" style={{ backgroundColor: C.primary }}>
          <Landmark color="white" size={18} />
        </div>
        <div className="min-w-0">
          <div className="font-bold text-sm leading-tight" style={{ color: C.text }}>Industrial Approval Platform</div>
          <div className="text-xs" style={{ color: C.textMuted }}>Govt. of Maharashtra</div>
        </div>
      </div>
      <div className="px-5 py-4 border-b" style={{ borderColor: C.border }}>
        <div className="text-xs uppercase tracking-wide font-semibold" style={{ color: C.textMuted }}>Signed in as</div>
        <div className="font-semibold text-sm mt-0.5" style={{ color: C.text }}>{roleLabel}</div>
        {role === "officer" ? <div className="text-xs mt-0.5" style={{ color: C.textMuted }}>{DEPARTMENTS.find(d => d.id === officerDept).name}</div> : null}
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => {
          const active = view === item.id;
          return (
            <button key={item.id} onClick={() => setView(item.id)}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-md text-sm font-semibold text-left"
              style={{ backgroundColor: active ? C.infoBg : "transparent", color: active ? C.primary : C.text }}>
              <item.icon size={18} />
              {item.label}
            </button>
          );
        })}
      </nav>
      <div className="p-3 border-t" style={{ borderColor: C.border }}>
        <button onClick={onLogout} className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-md text-sm font-semibold" style={{ color: C.danger }}>
          <LogOut size={18} /> Sign out
        </button>
      </div>
    </aside>
  );
}

function TopBar({ role, officerDept, profile, notifications, showNotif, setShowNotif, onMarkRead }) {
  const unread = notifications.filter((n) => !n.read).length;
  return (
    <header className="h-16 flex-shrink-0 border-b flex items-center justify-between px-6" style={{ backgroundColor: C.surface, borderColor: C.border }}>
      <div className="text-sm" style={{ color: C.textMuted }}>
        {role === "entrepreneur" && profile ? <>Business: <span className="font-semibold" style={{ color: C.text }}>{profile.businessName}</span></> : null}
        {role === "entrepreneur" && !profile ? "Complete your business profile to get started" : null}
        {role === "officer" ? <>Queue: <span className="font-semibold" style={{ color: C.text }}>{DEPARTMENTS.find(d => d.id === officerDept).name}</span></> : null}
        {role === "admin" ? "System configuration and oversight" : null}
      </div>
      <div className="relative">
        <button onClick={() => { setShowNotif(!showNotif); if (!showNotif) onMarkRead(); }} className="relative p-2 rounded-md" style={{ backgroundColor: C.slateBg }}>
          <Bell size={18} color={C.text} />
          {unread > 0 ? <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-white text-[10px] flex items-center justify-center font-bold" style={{ backgroundColor: C.danger }}>{unread}</span> : null}
        </button>
        {showNotif && (
          <div className="absolute right-0 mt-2 w-80 rounded-md border shadow-lg z-40 max-h-96 overflow-y-auto" style={{ backgroundColor: C.surface, borderColor: C.border }}>
            <div className="px-4 py-3 border-b font-semibold text-sm" style={{ borderColor: C.border, color: C.text }}>Notifications</div>
            {notifications.length === 0 ? (
              <div className="p-4 text-sm" style={{ color: C.textMuted }}>No notifications yet.</div>
            ) : notifications.map((n) => (
              <div key={n.id} className="px-4 py-3 border-b text-sm" style={{ borderColor: C.border, color: C.text }}>
                <div>{n.message}</div>
                <div className="text-xs mt-1" style={{ color: C.textMuted }}>{fmtDate(n.date)}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </header>
  );
}

/* ============================================================
   ENTREPRENEUR ROUTES
   ============================================================ */
function EntrepreneurRoutes(props) {
  const { view, setView, profile, setProfile, checklist, applications, getApplicationFor,
    selectedApprovalId, setSelectedApprovalId, selectedAppId, setSelectedAppId,
    startApplication, uploadDoc, submitApplication, respondToQuery, notifyToast } = props;

  if (view === "dashboard") return <EntrepreneurDashboard profile={profile} checklist={checklist} applications={applications} setView={setView} />;
  if (view === "profile") return <BusinessProfileForm profile={profile} onSave={(p) => { setProfile(p); notifyToast("Business profile saved."); setView("checklist"); }} />;
  if (view === "checklist") return <ChecklistPage profile={profile} checklist={checklist} getApplicationFor={getApplicationFor} setView={setView} setSelectedApprovalId={setSelectedApprovalId} />;
  if (view === "approval-detail") return <ApprovalDetailPage approval={APPROVAL_CATALOG[selectedApprovalId]} onStart={(a) => startApplication(a)} onBack={() => setView("checklist")} />;
  if (view === "application-form") {
    const app = getApplicationFor(selectedApprovalId);
    return <ApplicationFormPage app={app} approval={APPROVAL_CATALOG[selectedApprovalId]} uploadDoc={uploadDoc} submitApplication={submitApplication} onBack={() => setView("checklist")} />;
  }
  if (view === "my-applications") return <MyApplicationsPage applications={applications.filter(a => a.appId)} setView={setView} setSelectedAppId={setSelectedAppId} />;
  if (view === "application-detail") {
    const app = applications.find((a) => a.appId === selectedAppId);
    return <ApplicationDetailPage app={app} respondToQuery={respondToQuery} onBack={() => setView("my-applications")} />;
  }
  if (view === "assistant") return <RegulatoryAssistantPage />;
  return null;
}

function EntrepreneurDashboard({ profile, checklist, applications, setView }) {
  if (!profile) {
    return (
      <>
        <PageHeader title="Welcome" description="Set up your business profile to receive a personalised approval checklist." />
        <EmptyState icon={Building2} title="No business profile yet"
          description="Tell us about your business and the platform will generate the exact list of approvals you need - no guesswork required."
          action={<PrimaryButton icon={Building2} onClick={() => setView("profile")}>Create Business Profile</PrimaryButton>} />
      </>
    );
  }
  const submitted = applications.filter((a) => a.appId);
  const approved = submitted.filter((a) => a.status === "approved").length;
  const underReview = submitted.filter((a) => ["submitted", "under_review", "inspection"].includes(a.status)).length;
  const needsAction = submitted.filter((a) => a.status === "query_raised").length;
  const upcomingInspections = submitted.filter((a) => a.inspection && a.inspection.status === "scheduled").length;
  const progress = checklist.length ? Math.round((approved / checklist.length) * 100) : 0;

  return (
    <>
      <PageHeader title={`Welcome, ${profile.businessName}`} description="Here is the current status of every approval applicable to your business, across all departments." />
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Applicable Approvals" value={checklist.length} icon={ListChecks} tone="info" />
        <StatCard label="Approved" value={approved} icon={CheckCircle2} tone="success" />
        <StatCard label="Under Review" value={underReview} icon={Clock} tone="info" />
        <StatCard label="Requiring Your Action" value={needsAction} icon={AlertTriangle} tone="warning" />
      </div>
      <div className="grid sm:grid-cols-2 gap-4 mb-6">
        <StatCard label="Upcoming Inspections" value={upcomingInspections} icon={Calendar} tone="purple" />
        <StatCard label="Upcoming Renewals" value={0} icon={FileText} tone="slate" />
      </div>
      <Card className="p-5 mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="font-bold" style={{ color: C.text }}>Overall Approval Progress</div>
          <div className="text-sm font-semibold" style={{ color: C.text }}>{progress}%</div>
        </div>
        <div className="w-full h-3 rounded-full" style={{ backgroundColor: C.slateBg }}>
          <div className="h-3 rounded-full" style={{ width: `${progress}%`, backgroundColor: C.success }} />
        </div>
      </Card>
      <Card className="p-5">
        <div className="font-bold mb-4" style={{ color: C.text }}>All Approvals — Progress Across Departments</div>
        {checklist.length === 0 ? <div className="text-sm" style={{ color: C.textMuted }}>No approvals generated yet.</div> : (
          <div className="space-y-3">
            {checklist.map((a) => {
              const app = applications.find((x) => x.approvalId === a.id);
              const status = app ? app.status : "not_started";
              return (
                <div key={a.id} className="flex items-center justify-between py-2.5 border-b last:border-0" style={{ borderColor: C.border }}>
                  <div>
                    <div className="font-semibold text-sm" style={{ color: C.text }}>{a.name}</div>
                    <div className="text-xs" style={{ color: C.textMuted }}>{DEPARTMENTS.find(d => d.id === a.deptId).name}</div>
                  </div>
                  <Badge tone={statusTone(status)}>{statusLabel(status)}</Badge>
                </div>
              );
            })}
          </div>
        )}
        <div className="mt-4">
          <SecondaryButton icon={ListChecks} onClick={() => setView("checklist")}>View Full Checklist</SecondaryButton>
        </div>
      </Card>
    </>
  );
}

function BusinessProfileForm({ profile, onSave }) {
  const [f, setF] = useState(profile || {
    businessName: "", businessType: "Manufacturing", industry: "Food Processing", state: "Madhya Pradesh",
    district: "Bhopal", investmentLakh: 500, employees: 100, businessStage: "New Unit", activity: "",
  });
  const industries = ["Food Processing", "Textile", "Chemicals", "Metal Processing", "IT Services", "General Trading", "Other Services"];
  const districts = ["Bhopal", "Indore", "Jabalpur", "Gwalior", "Ujjain"];
  function submit(e) {
    e.preventDefault();
    if (!f.businessName.trim()) return;
    onSave(f);
  }
  return (
    <>
      <PageHeader title="Business Profile" description="This information is used by the platform's approval rules engine to determine exactly which approvals apply to your business." />
      <Card className="p-6 max-w-3xl">
        <form onSubmit={submit}>
          <div className="grid sm:grid-cols-2 gap-x-6">
            <Field label="Business Name">
              <input className={inputCls} style={inputStyle} value={f.businessName} onChange={(e) => setF({ ...f, businessName: e.target.value })} placeholder="e.g. Narmada Foods Pvt. Ltd." required />
            </Field>
            <Field label="Business Type">
              <select className={inputCls} style={inputStyle} value={f.businessType} onChange={(e) => setF({ ...f, businessType: e.target.value })}>
                <option>Manufacturing</option><option>Service</option><option>Trading</option>
              </select>
            </Field>
            <Field label="Industry / Sector">
              <select className={inputCls} style={inputStyle} value={f.industry} onChange={(e) => setF({ ...f, industry: e.target.value })}>
                {industries.map((i) => <option key={i}>{i}</option>)}
              </select>
            </Field>
            <Field label="Business Stage">
              <select className={inputCls} style={inputStyle} value={f.businessStage} onChange={(e) => setF({ ...f, businessStage: e.target.value })}>
                <option>New Unit</option><option>Expansion</option><option>Modernization</option>
              </select>
            </Field>
            <Field label="State">
              <select className={inputCls} style={inputStyle} value={f.state} onChange={(e) => setF({ ...f, state: e.target.value })}>
                <option>Madhya Pradesh</option>
              </select>
            </Field>
            <Field label="District">
              <select className={inputCls} style={inputStyle} value={f.district} onChange={(e) => setF({ ...f, district: e.target.value })}>
                {districts.map((d) => <option key={d}>{d}</option>)}
              </select>
            </Field>
            <Field label="Investment / Project Size (₹ Lakh)" hint="₹100 Lakh = ₹1 Crore">
              <input type="number" min="1" className={inputCls} style={inputStyle} value={f.investmentLakh} onChange={(e) => setF({ ...f, investmentLakh: Number(e.target.value) })} />
            </Field>
            <Field label="Number of Employees">
              <input type="number" min="1" className={inputCls} style={inputStyle} value={f.employees} onChange={(e) => setF({ ...f, employees: Number(e.target.value) })} />
            </Field>
          </div>
          <Field label="Business / Activity Description" hint="Briefly describe what the business will manufacture, sell, or provide.">
            <textarea className={inputCls} style={inputStyle} rows={3} value={f.activity} onChange={(e) => setF({ ...f, activity: e.target.value })} placeholder="e.g. Processing and packaging of ready-to-eat snacks for regional distribution." />
          </Field>
          <PrimaryButton type="submit" icon={ListChecks} size="lg">Generate My Approval Checklist</PrimaryButton>
        </form>
      </Card>
    </>
  );
}

function ChecklistPage({ profile, checklist, getApplicationFor, setView, setSelectedApprovalId }) {
  if (!profile) {
    return <EmptyState icon={Building2} title="Business profile required" description="Please complete your business profile first so the platform can generate your personalised checklist." action={<PrimaryButton onClick={() => setView("profile")}>Create Business Profile</PrimaryButton>} />;
  }
  return (
    <>
      <PageHeader title="Your Personalised Approval Checklist"
        description={`Based on your business profile — ${profile.businessType} · ${profile.industry} · ₹${profile.investmentLakh} Lakh investment · ${profile.employees} employees · ${profile.businessStage} — the following approvals are applicable.`}
        action={<SecondaryButton icon={Building2} onClick={() => setView("profile")}>Edit Business Profile</SecondaryButton>} />
      <Card className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ backgroundColor: C.slateBg }}>
              {["Approval", "Department", "Why This Applies", "Documents Needed", "SLA Target", "Status", "Action"].map((h) => (
                <th key={h} className="text-left font-semibold px-4 py-3" style={{ color: C.text }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {checklist.map((a) => {
              const app = getApplicationFor(a.id);
              const status = app ? app.status : "not_started";
              return (
                <tr key={a.id} className="border-t" style={{ borderColor: C.border }}>
                  <td className="px-4 py-3 font-semibold" style={{ color: C.text }}>{a.name}</td>
                  <td className="px-4 py-3" style={{ color: C.textMuted }}>{DEPARTMENTS.find(d => d.id === a.deptId).name}</td>
                  <td className="px-4 py-3" style={{ color: C.textMuted }}>{a.why}</td>
                  <td className="px-4 py-3" style={{ color: C.textMuted }}>{a.docs.length} documents</td>
                  <td className="px-4 py-3" style={{ color: C.textMuted }}>{a.slaDays} days</td>
                  <td className="px-4 py-3"><Badge tone={statusTone(status)}>{statusLabel(status)}</Badge></td>
                  <td className="px-4 py-3">
                    <SecondaryButton onClick={() => { setSelectedApprovalId(a.id); setView("approval-detail"); }} icon={status === "not_started" ? Info : ChevronRight}>
                      {status === "not_started" ? "View Requirements" : "Continue"}
                    </SecondaryButton>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
      <p className="text-xs mt-3" style={{ color: C.textMuted }}>This checklist is generated automatically by the platform's configurable rules engine based on your business profile — it is not fixed in advance.</p>
    </>
  );
}

function ApprovalDetailPage({ approval, onStart, onBack }) {
  if (!approval) return null;
  const dept = DEPARTMENTS.find((d) => d.id === approval.deptId);
  return (
    <>
      <button onClick={onBack} className="inline-flex items-center gap-1 text-sm font-semibold mb-4" style={{ color: C.primary }}><ChevronLeft size={16} /> Back to Checklist</button>
      <PageHeader title={approval.name} description={`Responsible department: ${dept.name}`} />
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          <Card className="p-5">
            <div className="font-bold mb-2" style={{ color: C.text }}>Purpose</div>
            <p className="text-sm" style={{ color: C.textMuted }}>{approval.purpose}</p>
          </Card>
          <Card className="p-5">
            <div className="font-bold mb-2" style={{ color: C.text }}>Instructions</div>
            <ul className="text-sm space-y-1.5 list-disc pl-5" style={{ color: C.textMuted }}>
              {approval.instructions.map((i, idx) => <li key={idx}>{i}</li>)}
            </ul>
          </Card>
          <Card className="p-5">
            <div className="font-bold mb-2" style={{ color: C.text }}>Required Documents</div>
            <ul className="text-sm space-y-1.5" style={{ color: C.textMuted }}>
              {approval.docs.map((d) => <li key={d} className="flex items-center gap-2"><FileText size={14} /> {d}</li>)}
            </ul>
          </Card>
        </div>
        <div>
          <Card className="p-5">
            <div className="text-xs uppercase font-semibold mb-1" style={{ color: C.textMuted }}>Expected Processing Time</div>
            <div className="text-2xl font-bold mb-4" style={{ color: C.text }}>{approval.slaDays} days</div>
            <div className="text-xs uppercase font-semibold mb-1" style={{ color: C.textMuted }}>Contact</div>
            <div className="text-sm mb-4" style={{ color: C.textMuted }}>{dept.contact}</div>
            <PrimaryButton size="lg" icon={ChevronRight} onClick={() => onStart(approval)}>Start Application</PrimaryButton>
          </Card>
        </div>
      </div>
    </>
  );
}

function ApplicationFormPage({ app, approval, uploadDoc, submitApplication, onBack }) {
  if (!app) return null;
  const allMandatoryReady = app.documents.every((d) => d.status !== "missing");
  const dept = DEPARTMENTS.find((d) => d.id === approval.deptId);
  return (
    <>
      <button onClick={onBack} className="inline-flex items-center gap-1 text-sm font-semibold mb-4" style={{ color: C.primary }}><ChevronLeft size={16} /> Back to Checklist</button>
      <PageHeader title={`Application — ${approval.name}`} description={`Upload the documents required by ${dept.name} below. The platform checks each file before submission.`} />
      <Card className="overflow-x-auto mb-5">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ backgroundColor: C.slateBg }}>
              {["Document", "File", "Status", "Upload"].map((h) => <th key={h} className="text-left font-semibold px-4 py-3" style={{ color: C.text }}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {app.documents.map((d) => (
              <tr key={d.docId} className="border-t align-top" style={{ borderColor: C.border }}>
                <td className="px-4 py-3 font-semibold" style={{ color: C.text }}>{d.name} <span className="text-xs font-normal" style={{ color: C.textMuted }}>(mandatory)</span></td>
                <td className="px-4 py-3" style={{ color: C.textMuted }}>
                  {d.fileName || "No file selected"}
                  {d.warning ? (
                    <div className="mt-1.5 flex items-start gap-1.5 text-xs px-2 py-1.5 rounded" style={{ color: C.warning, backgroundColor: C.warningBg }}>
                      <FileWarning size={14} className="flex-shrink-0 mt-0.5" /> {d.warning}
                    </div>
                  ) : null}
                </td>
                <td className="px-4 py-3">
                  <Badge tone={d.status === "missing" ? "danger" : d.status === "accepted" ? "success" : "info"}>
                    {{ missing: "Missing", uploaded: "Uploaded", under_verification: "Under Verification", accepted: "Accepted" }[d.status]}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <label className="inline-flex items-center gap-2 px-3 py-2 rounded-md border text-xs font-semibold cursor-pointer" style={{ borderColor: C.primary, color: C.primary }}>
                    <Upload size={14} /> Choose File
                    <input type="file" className="hidden" onChange={(e) => { const f = e.target.files[0]; if (f) uploadDoc(app.approvalId, d.docId, f.name); }} disabled={app.status !== "draft"} />
                  </label>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
      {!allMandatoryReady && app.status === "draft" ? (
        <div className="flex items-center gap-2 text-sm mb-4 px-4 py-3 rounded-md" style={{ color: C.warning, backgroundColor: C.warningBg }}>
          <AlertTriangle size={16} /> All mandatory documents must be uploaded before you can submit this application.
        </div>
      ) : null}
      {app.status === "draft" ? (
        <PrimaryButton size="lg" icon={CheckCircle2} disabled={!allMandatoryReady} onClick={() => submitApplication(app.approvalId)}>Submit Application</PrimaryButton>
      ) : (
        <div className="flex items-center gap-2 text-sm px-4 py-3 rounded-md" style={{ color: C.info, backgroundColor: C.infoBg }}>
          <Info size={16} /> This application has already been submitted. Application ID: <strong>{app.appId}</strong>
        </div>
      )}
    </>
  );
}

function MyApplicationsPage({ applications, setView, setSelectedAppId }) {
  if (applications.length === 0) {
    return <EmptyState icon={FileText} title="No applications submitted yet" description="Once you submit an application from your checklist, it will appear here with its live status." />;
  }
  return (
    <>
      <PageHeader title="My Applications" description="Track every application you have submitted, across all departments, in one place." />
      <Card className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ backgroundColor: C.slateBg }}>
              {["Application ID", "Approval", "Department", "Submitted On", "Status", "SLA / Deadline", "Action"].map((h) => <th key={h} className="text-left font-semibold px-4 py-3" style={{ color: C.text }}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {applications.map((a) => {
              const sla = slaInfo(a.slaDeadline);
              return (
                <tr key={a.appId} className="border-t" style={{ borderColor: C.border }}>
                  <td className="px-4 py-3 font-mono text-xs font-semibold" style={{ color: C.text }}>{a.appId}</td>
                  <td className="px-4 py-3 font-semibold" style={{ color: C.text }}>{a.approvalName}</td>
                  <td className="px-4 py-3" style={{ color: C.textMuted }}>{DEPARTMENTS.find(d => d.id === a.deptId).name}</td>
                  <td className="px-4 py-3" style={{ color: C.textMuted }}>{fmtDate(a.submissionDate)}</td>
                  <td className="px-4 py-3"><Badge tone={statusTone(a.status)}>{statusLabel(a.status)}</Badge></td>
                  <td className="px-4 py-3">{["approved", "rejected"].includes(a.status) ? "—" : <Badge tone={sla.tone}>{sla.label}</Badge>}</td>
                  <td className="px-4 py-3">
                    <SecondaryButton icon={ChevronRight} onClick={() => { setSelectedAppId(a.appId); setView("application-detail"); }}>View Details</SecondaryButton>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </>
  );
}

function ApplicationDetailPage({ app, respondToQuery, onBack }) {
  const [responseText, setResponseText] = useState("");
  const [responseFile, setResponseFile] = useState(null);
  const [activeQueryId, setActiveQueryId] = useState(null);
  if (!app) return null;
  const openQuery = app.queries.find((q) => q.status === "open");
  return (
    <>
      <button onClick={onBack} className="inline-flex items-center gap-1 text-sm font-semibold mb-4" style={{ color: C.primary }}><ChevronLeft size={16} /> Back to My Applications</button>
      <PageHeader title={app.approvalName} description={`Application ID: ${app.appId} · ${DEPARTMENTS.find(d => d.id === app.deptId).name}`}
        action={<Badge tone={statusTone(app.status)}>{statusLabel(app.status)}</Badge>} />

      {openQuery ? (
        <Card className="p-5 mb-5" style={{ borderColor: C.warning }}>
          <div className="flex items-start gap-2 mb-3">
            <MessageSquare size={18} color={C.warning} className="flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-sm" style={{ color: C.text }}>Query from {openQuery.raisedBy}</div>
              <div className="text-sm mt-1" style={{ color: C.textMuted }}>{openQuery.message}</div>
              <div className="text-xs mt-1" style={{ color: C.textMuted }}>Raised on {fmtDate(openQuery.date)}</div>
            </div>
          </div>
          <Field label="Your Response">
            <textarea className={inputCls} style={inputStyle} rows={2} value={responseText} onChange={(e) => setResponseText(e.target.value)} placeholder="Describe what you are submitting in response to this query." />
          </Field>
          {openQuery.docId ? (
            <Field label={`Re-upload: ${app.documents.find(d => d.docId === openQuery.docId)?.name}`}>
              <label className="inline-flex items-center gap-2 px-3 py-2 rounded-md border text-xs font-semibold cursor-pointer" style={{ borderColor: C.primary, color: C.primary }}>
                <Upload size={14} /> {responseFile ? responseFile : "Choose File"}
                <input type="file" className="hidden" onChange={(e) => { const f = e.target.files[0]; if (f) setResponseFile(f.name); }} />
              </label>
            </Field>
          ) : null}
          <PrimaryButton disabled={!responseText.trim()} onClick={() => { respondToQuery(app.appId, openQuery.id, responseText, openQuery.docId, responseFile); setResponseText(""); setResponseFile(null); }}>Submit Response</PrimaryButton>
        </Card>
      ) : null}

      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          <Card className="p-5">
            <div className="font-bold mb-4" style={{ color: C.text }}>Application Timeline</div>
            <div className="space-y-4">
              {app.timeline.map((t, idx) => (
                <div key={idx} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: C.primary }} />
                    {idx < app.timeline.length - 1 ? <div className="w-px flex-1" style={{ backgroundColor: C.border }} /> : null}
                  </div>
                  <div className="pb-4">
                    <div className="font-semibold text-sm" style={{ color: C.text }}>{t.event}</div>
                    <div className="text-xs" style={{ color: C.textMuted }}>{fmtDate(t.date)} · {t.actor}</div>
                    {t.note ? <div className="text-sm mt-1" style={{ color: C.textMuted }}>{t.note}</div> : null}
                  </div>
                </div>
              ))}
            </div>
          </Card>
          <Card className="p-5">
            <div className="font-bold mb-3" style={{ color: C.text }}>Documents</div>
            <div className="space-y-2">
              {app.documents.map((d) => (
                <div key={d.docId} className="flex items-center justify-between text-sm py-1.5 border-b last:border-0" style={{ borderColor: C.border }}>
                  <span style={{ color: C.text }}>{d.name}</span>
                  <Badge tone={d.status === "missing" ? "danger" : d.status === "accepted" ? "success" : "info"}>
                    {{ missing: "Missing", uploaded: "Uploaded", under_verification: "Under Verification", accepted: "Accepted" }[d.status]}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>
          {app.queries.length > 0 ? (
            <Card className="p-5">
              <div className="font-bold mb-3" style={{ color: C.text }}>Query History</div>
              <div className="space-y-3">
                {app.queries.map((q) => (
                  <div key={q.id} className="text-sm p-3 rounded-md" style={{ backgroundColor: C.slateBg }}>
                    <div className="font-semibold" style={{ color: C.text }}>{q.raisedBy} · {fmtDate(q.date)}</div>
                    <div style={{ color: C.textMuted }}>{q.message}</div>
                    {q.response ? <div className="mt-2 pt-2 border-t" style={{ borderColor: C.border, color: C.text }}><strong>Your response:</strong> {q.response}</div> : <div className="mt-1 text-xs" style={{ color: C.warning }}>Awaiting your response</div>}
                  </div>
                ))}
              </div>
            </Card>
          ) : null}
        </div>
        <div className="space-y-5">
          <Card className="p-5">
            <div className="text-xs uppercase font-semibold mb-1" style={{ color: C.textMuted }}>SLA Status</div>
            <Badge tone={slaInfo(app.slaDeadline).tone}>{slaInfo(app.slaDeadline).label}</Badge>
            <div className="text-xs mt-2" style={{ color: C.textMuted }}>Deadline: {fmtDate(app.slaDeadline)}</div>
          </Card>
          {app.inspection ? (
            <Card className="p-5">
              <div className="text-xs uppercase font-semibold mb-2" style={{ color: C.textMuted }}>Inspection</div>
              <div className="text-sm" style={{ color: C.text }}>{app.inspection.inspector}</div>
              <div className="text-sm" style={{ color: C.textMuted }}>{fmtDate(app.inspection.date)} at {app.inspection.time}</div>
              <div className="mt-2"><Badge tone={app.inspection.status === "completed" ? "success" : "purple"}>{app.inspection.status === "completed" ? "Completed" : "Scheduled"}</Badge></div>
              {app.inspection.result ? <div className="text-sm mt-2" style={{ color: C.textMuted }}>Result: <strong style={{ color: C.text }}>{app.inspection.result}</strong>. {app.inspection.remarks}</div> : null}
            </Card>
          ) : null}
        </div>
      </div>
    </>
  );
}

function RegulatoryAssistantPage() {
  const [q, setQ] = useState("");
  const [thread, setThread] = useState([]);
  function ask(question) {
    if (!question.trim()) return;
    const lower = question.toLowerCase();
    let best = null, bestScore = 0;
    REGULATORY_KB.forEach((item) => {
      const score = item.keywords.filter((k) => lower.includes(k)).length;
      if (score > bestScore) { bestScore = score; best = item; }
    });
    const answer = best
      ? { text: best.answer, source: best.source }
      : { text: "This question isn't covered in the seeded regulatory knowledge base yet. Please contact the relevant department using the contact details on the approval's details page.", source: null };
    setThread((t) => [...t, { question, answer }]);
    setQ("");
  }
  return (
    <>
      <PageHeader title="Regulatory Assistant" description="Ask a question about why an approval is required. Answers are retrieved from a fixed set of official regulatory references, not generated freely." />
      <Card className="p-5 mb-5">
        <div className="flex flex-wrap gap-2 mb-4">
          {REGULATORY_KB.map((item) => (
            <button key={item.q} onClick={() => ask(item.q)} className="text-xs px-3 py-1.5 rounded-full border font-medium" style={{ borderColor: C.border, color: C.primary }}>{item.q}</button>
          ))}
        </div>
        <div className="flex gap-2">
          <input className={inputCls} style={inputStyle} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Type your question, e.g. Why is Fire NOC required?" onKeyDown={(e) => e.key === "Enter" && ask(q)} />
          <PrimaryButton icon={Search} onClick={() => ask(q)}>Ask</PrimaryButton>
        </div>
      </Card>
      <div className="space-y-4">
        {thread.map((t, idx) => (
          <Card key={idx} className="p-5">
            <div className="font-bold text-sm mb-2" style={{ color: C.text }}>{t.question}</div>
            <p className="text-sm mb-2" style={{ color: C.textMuted }}>{t.answer.text}</p>
            {t.answer.source ? (
              <div className="text-xs px-3 py-2 rounded inline-flex items-center gap-1.5" style={{ backgroundColor: C.infoBg, color: C.info }}>
                <BookOpen size={12} /> Source: {t.answer.source}
              </div>
            ) : null}
          </Card>
        ))}
        {thread.length === 0 ? <p className="text-sm" style={{ color: C.textMuted }}>Select a suggested question above, or type your own.</p> : null}
      </div>
    </>
  );
}

/* ============================================================
   OFFICER ROUTES
   ============================================================ */
function OfficerRoutes({ officerDept, applications, selectedAppId, setSelectedAppId, officerAction, notifyToast, profile }) {
  const [detailAppId, setDetailAppId] = useState(null);
  if (detailAppId) {
    const app = applications.find((a) => a.appId === detailAppId);
    return <OfficerReviewPage app={app} officerAction={officerAction} officerDept={officerDept} onBack={() => setDetailAppId(null)} notifyToast={notifyToast} profile={profile} />;
  }
  return <OfficerDashboard applications={applications} onOpen={(id) => setDetailAppId(id)} />;
}

function OfficerDashboard({ applications, onOpen }) {
  const [filter, setFilter] = useState("all");
  const counts = {
    all: applications.length,
    new: applications.filter((a) => a.status === "submitted").length,
    under_review: applications.filter((a) => a.status === "under_review").length,
    query_raised: applications.filter((a) => a.status === "query_raised").length,
    inspection: applications.filter((a) => a.status === "inspection").length,
    sla_due: applications.filter((a) => { const s = slaInfo(a.slaDeadline); return s.tone === "warning" || s.tone === "danger"; }).length,
    completed: applications.filter((a) => ["approved", "rejected"].includes(a.status)).length,
  };
  const filters = [
    { id: "all", label: "All" }, { id: "new", label: "New" }, { id: "under_review", label: "Under Review" },
    { id: "query_raised", label: "Query Raised" }, { id: "inspection", label: "Inspection Required" },
    { id: "sla_due", label: "SLA Due Soon" }, { id: "completed", label: "Completed" },
  ];
  const filtered = applications.filter((a) => {
    if (filter === "all") return true;
    if (filter === "new") return a.status === "submitted";
    if (filter === "sla_due") { const s = slaInfo(a.slaDeadline); return s.tone === "warning" || s.tone === "danger"; }
    if (filter === "completed") return ["approved", "rejected"].includes(a.status);
    return a.status === filter;
  });
  return (
    <>
      <PageHeader title="Application Queue" description="Applications assigned to your department, in one operational view." />
      <div className="grid sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        <StatCard label="New" value={counts.new} icon={FileText} tone="info" />
        <StatCard label="Under Review" value={counts.under_review} icon={Clock} tone="info" />
        <StatCard label="Query Raised" value={counts.query_raised} icon={MessageSquare} tone="warning" />
        <StatCard label="Inspections" value={counts.inspection} icon={Calendar} tone="purple" />
        <StatCard label="SLA Due Soon" value={counts.sla_due} icon={AlertTriangle} tone="danger" />
        <StatCard label="Completed" value={counts.completed} icon={CheckCircle2} tone="success" />
      </div>
      <div className="flex gap-2 flex-wrap mb-4">
        {filters.map((f) => (
          <button key={f.id} onClick={() => setFilter(f.id)} className="px-3.5 py-1.5 rounded-full text-sm font-semibold border"
            style={{ backgroundColor: filter === f.id ? C.primary : C.surface, color: filter === f.id ? "white" : C.text, borderColor: filter === f.id ? C.primary : C.border }}>
            {f.label} ({counts[f.id]})
          </button>
        ))}
      </div>
      <Card className="overflow-x-auto">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-sm" style={{ color: C.textMuted }}>No applications in this filter.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr style={{ backgroundColor: C.slateBg }}>
                {["Application ID", "Business", "Approval", "Submitted", "Status", "SLA", "Risk", "Action"].map((h) => <th key={h} className="text-left font-semibold px-4 py-3" style={{ color: C.text }}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {filtered.map((a) => {
                const sla = slaInfo(a.slaDeadline);
                return (
                  <tr key={a.appId} className="border-t" style={{ borderColor: C.border }}>
                    <td className="px-4 py-3 font-mono text-xs font-semibold" style={{ color: C.text }}>{a.appId}</td>
                    <td className="px-4 py-3" style={{ color: C.text }}>{a.businessName}</td>
                    <td className="px-4 py-3" style={{ color: C.textMuted }}>{a.approvalName}</td>
                    <td className="px-4 py-3" style={{ color: C.textMuted }}>{fmtDate(a.submissionDate)}</td>
                    <td className="px-4 py-3"><Badge tone={statusTone(a.status)}>{statusLabel(a.status)}</Badge></td>
                    <td className="px-4 py-3">{["approved", "rejected"].includes(a.status) ? "—" : <Badge tone={sla.tone}>{sla.label}</Badge>}</td>
                    <td className="px-4 py-3">{a.riskLevel ? <Badge tone={a.riskLevel === "High" ? "danger" : a.riskLevel === "Medium" ? "warning" : "success"}>{a.riskLevel}</Badge> : "—"}</td>
                    <td className="px-4 py-3"><SecondaryButton icon={ChevronRight} onClick={() => onOpen(a.appId)}>Review</SecondaryButton></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </Card>
    </>
  );
}

function OfficerReviewPage({ app, officerAction, officerDept, onBack, notifyToast, profile }) {
  const [modal, setModal] = useState(null); // 'query' | 'doc' | 'inspection' | 'reject' | 'inspect-result'
  const [queryText, setQueryText] = useState("");
  const [docId, setDocId] = useState(app?.documents[0]?.docId || "");
  const [rejectReason, setRejectReason] = useState("");
  const [inspector, setInspector] = useState(INSPECTORS[officerDept]?.[0] || "");
  const [inspDate, setInspDate] = useState(todayISO());
  const [inspTime, setInspTime] = useState("11:00 AM");
  const [inspResult, setInspResult] = useState("Satisfactory");
  const [inspRemarks, setInspRemarks] = useState("");

  if (!app) return null;
  const canDecide = !(app.status === "inspection" && app.inspection?.status !== "completed");

  function close() { setModal(null); setQueryText(""); setRejectReason(""); setInspRemarks(""); }

  return (
    <>
      <button onClick={onBack} className="inline-flex items-center gap-1 text-sm font-semibold mb-4" style={{ color: C.primary }}><ChevronLeft size={16} /> Back to Queue</button>
      <PageHeader title={`${app.approvalName} — ${app.appId}`} description={`Submitted by ${app.businessName} on ${fmtDate(app.submissionDate)}`}
        action={<Badge tone={statusTone(app.status)}>{statusLabel(app.status)}</Badge>} />

      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          {profile ? (
            <Card className="p-5">
              <div className="font-bold mb-3" style={{ color: C.text }}>Applicant &amp; Business Profile</div>
              <div className="grid sm:grid-cols-2 gap-3 text-sm">
                <div><span style={{ color: C.textMuted }}>Business Name:</span> <strong style={{ color: C.text }}>{profile.businessName}</strong></div>
                <div><span style={{ color: C.textMuted }}>Type / Industry:</span> <strong style={{ color: C.text }}>{profile.businessType} · {profile.industry}</strong></div>
                <div><span style={{ color: C.textMuted }}>Location:</span> <strong style={{ color: C.text }}>{profile.district}, {profile.state}</strong></div>
                <div><span style={{ color: C.textMuted }}>Investment:</span> <strong style={{ color: C.text }}>₹{profile.investmentLakh} Lakh</strong></div>
                <div><span style={{ color: C.textMuted }}>Employees:</span> <strong style={{ color: C.text }}>{profile.employees}</strong></div>
                <div><span style={{ color: C.textMuted }}>Stage:</span> <strong style={{ color: C.text }}>{profile.businessStage}</strong></div>
              </div>
            </Card>
          ) : null}
          <Card className="p-5">
            <div className="font-bold mb-3" style={{ color: C.text }}>Uploaded Documents &amp; Validation</div>
            <div className="space-y-2">
              {app.documents.map((d) => (
                <div key={d.docId} className="py-2 border-b last:border-0" style={{ borderColor: C.border }}>
                  <div className="flex items-center justify-between text-sm">
                    <span style={{ color: C.text }}>{d.name} <span style={{ color: C.textMuted }}>— {d.fileName || "not uploaded"}</span></span>
                    <Badge tone={d.status === "missing" ? "danger" : d.status === "accepted" ? "success" : "info"}>
                      {{ missing: "Missing", uploaded: "Uploaded", under_verification: "Under Verification", accepted: "Accepted" }[d.status]}
                    </Badge>
                  </div>
                  {d.warning ? <div className="mt-1 text-xs flex items-center gap-1.5" style={{ color: C.warning }}><FileWarning size={12} /> {d.warning}</div> : null}
                </div>
              ))}
            </div>
          </Card>
          <Card className="p-5">
            <div className="font-bold mb-4" style={{ color: C.text }}>Application Timeline</div>
            <div className="space-y-3">
              {app.timeline.map((t, idx) => (
                <div key={idx} className="text-sm">
                  <span className="font-semibold" style={{ color: C.text }}>{t.event}</span>
                  <span style={{ color: C.textMuted }}> — {fmtDate(t.date)} · {t.actor}{t.note ? `. ${t.note}` : ""}</span>
                </div>
              ))}
            </div>
          </Card>
          {app.queries.length > 0 ? (
            <Card className="p-5">
              <div className="font-bold mb-3" style={{ color: C.text }}>Previous Queries</div>
              <div className="space-y-2 text-sm">
                {app.queries.map((q) => (
                  <div key={q.id} className="p-3 rounded-md" style={{ backgroundColor: C.slateBg }}>
                    <div style={{ color: C.text }}>{q.message}</div>
                    <div className="text-xs mt-1" style={{ color: C.textMuted }}>{q.status === "resolved" ? `Resolved: ${q.response}` : "Awaiting entrepreneur response"}</div>
                  </div>
                ))}
              </div>
            </Card>
          ) : null}
          {app.inspection ? (
            <Card className="p-5">
              <div className="font-bold mb-2" style={{ color: C.text }}>Inspection</div>
              <div className="text-sm" style={{ color: C.text }}>{app.inspection.inspector} · {fmtDate(app.inspection.date)} at {app.inspection.time}</div>
              <div className="mt-2"><Badge tone={app.inspection.status === "completed" ? "success" : "purple"}>{app.inspection.status === "completed" ? "Completed" : "Scheduled"}</Badge></div>
              {app.inspection.status === "completed" ? (
                <div className="text-sm mt-2" style={{ color: C.textMuted }}>Result: <strong style={{ color: C.text }}>{app.inspection.result}</strong>. {app.inspection.remarks}</div>
              ) : (
                <div className="mt-3"><SecondaryButton icon={ClipboardCheck} onClick={() => setModal("inspect-result")}>Record Inspection Result</SecondaryButton></div>
              )}
            </Card>
          ) : null}
        </div>

        <div className="space-y-5">
          <Card className="p-5">
            <div className="text-xs uppercase font-semibold mb-2" style={{ color: C.textMuted }}>Risk Indicator (Decision Support Only)</div>
            <Badge tone={app.riskLevel === "High" ? "danger" : app.riskLevel === "Medium" ? "warning" : "success"} icon={Gauge}>{app.riskLevel || "Not assessed"}</Badge>
            <p className="text-xs mt-2" style={{ color: C.textMuted }}>This indicator is advisory only, based on investment size, sector and document flags. It does not approve or reject applications automatically.</p>
          </Card>
          <Card className="p-5">
            <div className="text-xs uppercase font-semibold mb-2" style={{ color: C.textMuted }}>SLA Status</div>
            <Badge tone={slaInfo(app.slaDeadline).tone}>{slaInfo(app.slaDeadline).label}</Badge>
          </Card>
          <Card className="p-5 space-y-2.5">
            <div className="text-xs uppercase font-semibold mb-1" style={{ color: C.textMuted }}>Officer Actions</div>
            <PrimaryButton icon={CheckCircle2} disabled={!canDecide} onClick={() => officerAction(app.appId, "approve")}>Approve</PrimaryButton>
            <SecondaryButton tone="danger" icon={X} onClick={() => setModal("reject")}>Reject</SecondaryButton>
            <SecondaryButton icon={MessageSquare} onClick={() => setModal("query")}>Raise Query</SecondaryButton>
            <SecondaryButton icon={FileWarning} onClick={() => setModal("doc")}>Request Additional Document</SecondaryButton>
            <SecondaryButton icon={Calendar} onClick={() => setModal("inspection")}>Schedule Inspection</SecondaryButton>
          </Card>
        </div>
      </div>

      {modal === "query" && (
        <Modal title="Raise a Query" onClose={close}>
          <Field label="Query Message">
            <textarea className={inputCls} style={inputStyle} rows={3} value={queryText} onChange={(e) => setQueryText(e.target.value)} placeholder="e.g. Please clarify the storage capacity mentioned in the project report." />
          </Field>
          <PrimaryButton disabled={!queryText.trim()} onClick={() => { officerAction(app.appId, "raise-query", { message: queryText }); notifyToast("Query raised."); close(); onBack(); }}>Send Query</PrimaryButton>
        </Modal>
      )}
      {modal === "doc" && (
        <Modal title="Request Additional Document" onClose={close}>
          <Field label="Document">
            <select className={inputCls} style={inputStyle} value={docId} onChange={(e) => setDocId(e.target.value)}>
              {app.documents.map((d) => <option key={d.docId} value={d.docId}>{d.name}</option>)}
            </select>
          </Field>
          <Field label="Message to Entrepreneur">
            <textarea className={inputCls} style={inputStyle} rows={3} value={queryText} onChange={(e) => setQueryText(e.target.value)} placeholder="e.g. Please upload the revised building plan showing emergency exits." />
          </Field>
          <PrimaryButton disabled={!queryText.trim()} onClick={() => { officerAction(app.appId, "request-document", { docId, message: queryText }); notifyToast("Document request sent."); close(); onBack(); }}>Send Request</PrimaryButton>
        </Modal>
      )}
      {modal === "reject" && (
        <Modal title="Reject Application" onClose={close}>
          <Field label="Reason for Rejection">
            <textarea className={inputCls} style={inputStyle} rows={3} value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} placeholder="Explain why this application does not meet requirements." />
          </Field>
          <SecondaryButton tone="danger" onClick={() => { officerAction(app.appId, "reject", { note: rejectReason }); notifyToast("Application rejected."); close(); onBack(); }}>Confirm Rejection</SecondaryButton>
        </Modal>
      )}
      {modal === "inspection" && (
        <Modal title="Schedule Inspection" onClose={close}>
          <Field label="Inspector">
            <select className={inputCls} style={inputStyle} value={inspector} onChange={(e) => setInspector(e.target.value)}>
              {(INSPECTORS[officerDept] || ["Assigned Inspector"]).map((i) => <option key={i}>{i}</option>)}
            </select>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Date"><input type="date" className={inputCls} style={inputStyle} value={inspDate} onChange={(e) => setInspDate(e.target.value)} /></Field>
            <Field label="Time"><input type="text" className={inputCls} style={inputStyle} value={inspTime} onChange={(e) => setInspTime(e.target.value)} /></Field>
          </div>
          <PrimaryButton onClick={() => { officerAction(app.appId, "schedule-inspection", { inspector, date: inspDate, time: inspTime }); notifyToast("Inspection scheduled."); close(); onBack(); }}>Schedule</PrimaryButton>
        </Modal>
      )}
      {modal === "inspect-result" && (
        <Modal title="Record Inspection Result" onClose={close}>
          <Field label="Result">
            <select className={inputCls} style={inputStyle} value={inspResult} onChange={(e) => setInspResult(e.target.value)}>
              <option>Satisfactory</option><option>Not Satisfactory</option>
            </select>
          </Field>
          <Field label="Remarks">
            <textarea className={inputCls} style={inputStyle} rows={3} value={inspRemarks} onChange={(e) => setInspRemarks(e.target.value)} placeholder="Observations from the site visit." />
          </Field>
          <Field label="Supporting Evidence" hint="Photo or document from the site visit">
            <label className="inline-flex items-center gap-2 px-3 py-2 rounded-md border text-xs font-semibold cursor-pointer" style={{ borderColor: C.primary, color: C.primary }}>
              <Upload size={14} /> Choose File
              <input type="file" className="hidden" onChange={() => {}} />
            </label>
          </Field>
          <PrimaryButton onClick={() => { officerAction(app.appId, "record-inspection", { result: inspResult, remarks: inspRemarks, evidence: "site-visit-evidence.jpg" }); notifyToast("Inspection result recorded."); close(); }}>Save Result</PrimaryButton>
        </Modal>
      )}
    </>
  );
}

/* ============================================================
   ADMIN ROUTES
   ============================================================ */
function AdminRoutes({ view, applications, auditLog }) {
  const [tab, setTab] = useState("view");
  if (view === "dashboard") return <AdminOverview applications={applications} />;
  if (view === "config") return <AdminConfig />;
  if (view === "audit") return <AdminAuditLog auditLog={auditLog} />;
  return null;
}

function AdminOverview({ applications }) {
  return (
    <>
      <PageHeader title="Administrator Overview" description="A system-wide snapshot of configuration and activity." />
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Departments" value={DEPARTMENTS.length} icon={Landmark} tone="info" />
        <StatCard label="Approval Types" value={Object.keys(APPROVAL_CATALOG).length} icon={ListChecks} tone="purple" />
        <StatCard label="Active Rules" value={APPROVAL_RULES.length} icon={Settings} tone="slate" />
        <StatCard label="Applications Submitted" value={applications.length} icon={FileText} tone="success" />
      </div>
      <Card className="p-5">
        <div className="font-bold mb-3" style={{ color: C.text }}>Recent Applications (All Departments)</div>
        {applications.length === 0 ? <div className="text-sm" style={{ color: C.textMuted }}>No applications submitted yet.</div> : (
          <table className="w-full text-sm">
            <thead><tr style={{ backgroundColor: C.slateBg }}>{["Application ID", "Business", "Approval", "Department", "Status"].map((h) => <th key={h} className="text-left font-semibold px-4 py-2.5" style={{ color: C.text }}>{h}</th>)}</tr></thead>
            <tbody>
              {applications.map((a) => (
                <tr key={a.appId} className="border-t" style={{ borderColor: C.border }}>
                  <td className="px-4 py-2.5 font-mono text-xs" style={{ color: C.text }}>{a.appId}</td>
                  <td className="px-4 py-2.5" style={{ color: C.text }}>{a.businessName}</td>
                  <td className="px-4 py-2.5" style={{ color: C.textMuted }}>{a.approvalName}</td>
                  <td className="px-4 py-2.5" style={{ color: C.textMuted }}>{DEPARTMENTS.find(d => d.id === a.deptId).name}</td>
                  <td className="px-4 py-2.5"><Badge tone={statusTone(a.status)}>{statusLabel(a.status)}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </>
  );
}

function AdminConfig() {
  const [tab, setTab] = useState("departments");
  const tabs = [{ id: "departments", label: "Departments" }, { id: "rules", label: "Approval Types & Rules" }];
  return (
    <>
      <PageHeader title="Departments &amp; Rules Configuration" description="Approval checklists shown to entrepreneurs are generated from these rules — not hard-coded in the interface." />
      <div className="flex gap-2 mb-4">
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} className="px-4 py-2 rounded-md text-sm font-semibold border"
            style={{ backgroundColor: tab === t.id ? C.primary : C.surface, color: tab === t.id ? "white" : C.text, borderColor: tab === t.id ? C.primary : C.border }}>
            {t.label}
          </button>
        ))}
      </div>
      {tab === "departments" ? (
        <Card className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr style={{ backgroundColor: C.slateBg }}>{["Department", "Contact"].map((h) => <th key={h} className="text-left font-semibold px-4 py-3" style={{ color: C.text }}>{h}</th>)}</tr></thead>
            <tbody>{DEPARTMENTS.map((d) => (
              <tr key={d.id} className="border-t" style={{ borderColor: C.border }}>
                <td className="px-4 py-3 font-semibold" style={{ color: C.text }}>{d.name}</td>
                <td className="px-4 py-3" style={{ color: C.textMuted }}>{d.contact}</td>
              </tr>
            ))}</tbody>
          </table>
        </Card>
      ) : (
        <Card className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr style={{ backgroundColor: C.slateBg }}>{["Approval Type", "Department", "Applies When", "Documents", "SLA"].map((h) => <th key={h} className="text-left font-semibold px-4 py-3" style={{ color: C.text }}>{h}</th>)}</tr></thead>
            <tbody>{APPROVAL_RULES.map((r) => {
              const a = APPROVAL_CATALOG[r.approvalId];
              return (
                <tr key={r.ruleId} className="border-t" style={{ borderColor: C.border }}>
                  <td className="px-4 py-3 font-semibold" style={{ color: C.text }}>{a.name}</td>
                  <td className="px-4 py-3" style={{ color: C.textMuted }}>{DEPARTMENTS.find(d => d.id === a.deptId).name}</td>
                  <td className="px-4 py-3" style={{ color: C.textMuted }}>{r.label}</td>
                  <td className="px-4 py-3" style={{ color: C.textMuted }}>{a.docs.length} documents</td>
                  <td className="px-4 py-3" style={{ color: C.textMuted }}>{a.slaDays} days</td>
                </tr>
              );
            })}</tbody>
          </table>
        </Card>
      )}
    </>
  );
}

function AdminAuditLog({ auditLog }) {
  return (
    <>
      <PageHeader title="Audit Log" description="A record of significant actions taken across the platform." />
      <Card className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr style={{ backgroundColor: C.slateBg }}>{["Date", "Actor", "Action"].map((h) => <th key={h} className="text-left font-semibold px-4 py-3" style={{ color: C.text }}>{h}</th>)}</tr></thead>
          <tbody>{auditLog.map((e) => (
            <tr key={e.id} className="border-t" style={{ borderColor: C.border }}>
              <td className="px-4 py-3" style={{ color: C.textMuted }}>{fmtDate(e.date)}</td>
              <td className="px-4 py-3 font-semibold" style={{ color: C.text }}>{e.actor}</td>
              <td className="px-4 py-3" style={{ color: C.textMuted }}>{e.action}</td>
            </tr>
          ))}</tbody>
        </table>
      </Card>
    </>
  );
}