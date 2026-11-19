import React, { useMemo, useRef, useState } from 'react';
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Code2,
  Download,
  Film,
  HelpCircle,
  Image as ImageIcon,
  Keyboard,
  Maximize2,
  Play,
  ShieldCheck,
  Terminal,
  X,
} from 'lucide-react';
import { Badge, Button, Card, Modal, SearchInput } from './ui';

const VIDEO_CHAPTERS = [
  { time: 0, label: '01 · Platform Overview', desc: 'Architecture, 3 roles & demo credentials' },
  { time: 8.4, label: '02 · 3D Expo Arena', desc: 'OrbitControls, presets, layers & hotkeys' },
  { time: 17.8, label: '03 · Booth Reservation', desc: '24-booth matrix, inspector & 409 lock' },
  { time: 27.2, label: '04 · Attendee Hub', desc: 'QR tickets, schedule bookmarks & notes' },
  { time: 36.6, label: '05 · Exhibitor Portal', desc: 'Profile, compliance apps & booth selection' },
  { time: 46.0, label: '06 · Organizer & Analytics', desc: 'Expo CRUD, approvals, CSV/JSON & metrics' },
  { time: 55.4, label: '07 · Sphere AI & Weather', desc: 'Gemini Voice/Text concierge & Open-Meteo' },
  { time: 63.8, label: '08 · Security, PWA & Sync', desc: 'OWASP, GDPR, offline PWA & sync keys' },
];

const SCREENSHOT_GALLERY = [
  {
    id: 'hero-dark',
    src: '/docs/screenshots/01-hero-voyage-dark.jpg',
    title: 'Hero Scroll Tour (Obsidian Dark)',
    category: 'public',
    caption: 'Landing presentation layered cleanly over the persistent Three.js 3D Expo Sphere.',
  },
  {
    id: 'hero-light',
    src: '/docs/screenshots/02-hero-light-mode.jpg',
    title: 'Alabaster Light Mode Theme',
    category: 'public',
    caption: 'Synchronized TopNav, HUD controls, and daylight illumination across 3D geometry.',
  },
  {
    id: 'explore-3d',
    src: '/docs/screenshots/03-3d-floor-explore.jpg',
    title: 'Interactive 3D Expo Floor Explorer',
    category: 'public',
    caption: 'OrbitControls, camera presets (Overview, Stage, Plaza), status filters & layer toggles.',
  },
  {
    id: 'booth-inspector',
    src: '/docs/screenshots/04-booth-inspector-drawer.jpg',
    title: 'Booth Inspector Slide-Over Drawer',
    category: 'public',
    caption: 'Booth size/pricing, Fly Camera Here, Share 3D Card PNG, personal notes & live chat.',
  },
  {
    id: 'booth-matrix',
    src: '/docs/screenshots/05-booth-matrix-directory.jpg',
    title: 'Exhibitors & 24-Booth Floor Matrix',
    category: 'public',
    caption: 'Verified exhibitors showcase paired with the real-time Socket.io floor grid.',
  },
  {
    id: 'schedule-timetable',
    src: '/docs/screenshots/06-schedule-sessions.jpg',
    title: 'Keynotes & Technical Schedule',
    category: 'public',
    caption: 'Session capacity telemetry and one-click Bookmark Reminder scheduling.',
  },
  {
    id: 'expos-weather',
    src: '/docs/screenshots/19-explore-expos-weather.jpg',
    title: 'Live Expos & Open-Meteo Weather',
    category: 'public',
    caption: 'Sector-filterable expo directory with live venue conditions in °C / °F.',
  },
  {
    id: 'analytics-dashboard',
    src: '/docs/screenshots/07-analytics-dashboard.jpg',
    title: 'Live Expo Analytics Dashboard',
    category: 'portals',
    caption: 'KPIs, 30-day velocity SVG charts, date-range filters & CSV/JSON/Print reports.',
  },
  {
    id: 'global-search',
    src: '/docs/screenshots/08-global-search-modal.jpg',
    title: 'Global Search Modal (/)',
    category: 'public',
    caption: 'Instant filtering across booths, exhibitors, expos, and scheduled sessions.',
  },
  {
    id: 'attendee-tickets',
    src: '/docs/screenshots/11-attendee-portal-tickets.jpg',
    title: 'Attendee Hub · Digital QR Passes',
    category: 'portals',
    caption: 'Unique ES-2026 ticket passes with 7x7 scannable QR entry matrix and badge print.',
  },
  {
    id: 'exhibitor-booths',
    src: '/docs/screenshots/12-exhibitor-portal-booths.jpg',
    title: 'Exhibitor Portal · Atomic Booth Selection',
    category: 'portals',
    caption: 'Real-time 4-zone booth comparison and atomic server-locked reservation.',
  },
  {
    id: 'organizer-overview',
    src: '/docs/screenshots/13-organizer-overview.jpg',
    title: 'Organizer Command Center · Overview',
    category: 'portals',
    caption: 'Live occupancy, concurrent presence, quick actions, and audit activity log.',
  },
  {
    id: 'organizer-apps',
    src: '/docs/screenshots/14-organizer-applications.jpg',
    title: 'Organizer · Exhibitor Application Review',
    category: 'portals',
    caption: 'Approve, Request Info, or Reject exhibitor submissions with automated alerts.',
  },
  {
    id: 'organizer-monitoring',
    src: '/docs/screenshots/15-organizer-monitoring-gdpr.jpg',
    title: 'Server Telemetry, Backups & GDPR Card',
    category: 'security',
    caption: 'Live p95 latency, JSON/MongoDB storage status, backups, consent, export & erasure.',
  },
  {
    id: 'auth-roles',
    src: '/docs/screenshots/09-auth-role-selector.jpg',
    title: 'Role Selector & Instant Demo Accounts',
    category: 'security',
    caption: 'RBAC login & sign-up entry with one-click Organizer, Exhibitor & Attendee demos.',
  },
  {
    id: 'otp-reset',
    src: '/docs/screenshots/10-password-reset-otp.jpg',
    title: '3-Step Email OTP Password Reset',
    category: 'security',
    caption: 'HMAC-SHA256 6-digit OTP verification with 5-minute TTL and strength meter.',
  },
  {
    id: 'ai-concierge',
    src: '/docs/screenshots/16-ai-concierge-assistant.jpg',
    title: 'Sphere AI Concierge (Voice + Text)',
    category: 'security',
    caption: 'Role-aware Gemini concierge supporting voice transcription, TTS & booth jumps.',
  },
  {
    id: 'cloud-sync',
    src: '/docs/screenshots/17-cloud-sync-vault.jpg',
    title: 'Cross-Device Cloud Sync Vault',
    category: 'security',
    caption: 'Sync Key push/pull backup with SHA-256 verification and portable JSON files.',
  },
  {
    id: 'docs-video',
    src: '/docs/screenshots/18-docs-video-center.jpg',
    title: 'Documentation & Walkthrough Video Center',
    category: 'public',
    caption: 'Built-in 1080p HD walkthrough video player, chapter jumps, guides & FAQs.',
  },
];

const USER_TUTORIALS = [
  {
    id: 'floor-3d',
    badge: '3D Floor & Inspector',
    tone: 'gold',
    title: 'Exploring the 3D Expo Hall & Reserving a Booth',
    steps: [
      'Click "3D Floor" in the top navigation bar (or press "Find Open Booth" in the bottom HUD).',
      'Left-drag to orbit, right-drag to pan, scroll or press + / - to zoom, and press 0 to reset to Overview.',
      'Use status pills (Available, Reserved, Occupied, Pending) or toggle Grid & Crowd layers in the HUD.',
      'Click any 3D booth to open the Booth Inspector Drawer: fly camera, bookmark, add private notes, capture a 3D Share Card PNG, chat live, or reserve the booth atomically.',
    ],
    screenshots: [
      {
        src: '/docs/screenshots/03-3d-floor-explore.jpg',
        title: '3D Floor Explorer & Camera HUD',
      },
      {
        src: '/docs/screenshots/04-booth-inspector-drawer.jpg',
        title: 'Booth Inspector Drawer',
      },
    ],
  },
  {
    id: 'attendee',
    badge: 'Attendee Hub',
    tone: 'teal',
    title: 'Registering for Expos, Digital QR Passes & Schedule Reminders',
    steps: [
      'Click Login -> Demo Attendee (attendee@eventsphere.io / Attendee2026!) or Sign Up as an Attendee.',
      'Open "Explore Events" and click "Register & Issue Pass" to generate a unique ES-2026-XXXX ticket.',
      'Go to "Digital Tickets" to view your scannable 7x7 QR entry matrix and print your pass.',
      'Open "Schedule" to register for seats or bookmark sessions for automatic 15-minute reminders.',
    ],
    screenshots: [
      {
        src: '/docs/screenshots/11-attendee-portal-tickets.jpg',
        title: 'Attendee Digital QR Passes',
      },
      {
        src: '/docs/screenshots/06-schedule-sessions.jpg',
        title: 'Keynotes & Session Bookmarks',
      },
    ],
  },
  {
    id: 'exhibitor',
    badge: 'Exhibitor Portal',
    tone: 'coral',
    title: 'Applying for an Expo & Locking a Floor Booth',
    steps: [
      'Sign in as an Exhibitor (e.g. exhibitor@lumina-robotics.io / Exhibitor2026!).',
      'Customize your Company Profile, Brand Accent Swatch, Featured Products, and On-Site Staff Roster.',
      'Submit an application in "Applications" with your product demo summary and compliance PDFs.',
      'Once approved by an Organizer, open "Booth Selection" to atomically lock a 3x3m ($2,800), 6x3m Corner ($4,200), or 6x6m Island ($6,800) booth.',
    ],
    screenshots: [
      {
        src: '/docs/screenshots/12-exhibitor-portal-booths.jpg',
        title: 'Exhibitor Atomic Booth Selection',
      },
      {
        src: '/docs/screenshots/05-booth-matrix-directory.jpg',
        title: 'Live 24-Booth Floor Matrix',
      },
    ],
  },
  {
    id: 'organizer',
    badge: 'Organizer Command Center',
    tone: 'gold',
    title: 'Managing Expos, Approving Exhibitors & Broadcasting Schedules',
    steps: [
      'Sign in as Organizer (organizer@eventsphere.io / ExpoAdmin2026!) or register with ORGANIZER_SETUP_CODE.',
      'Review pending submissions under "Exhibitor Applications" with Approve, Request Info, or Reject.',
      'Publish or reschedule keynotes under "Schedule Management" to push real-time alerts to all screens.',
      'Open "Analytics & Reports" to inspect 30-day trends and export CSV/JSON/Print reports, or check live latency & backups in Settings.',
    ],
    screenshots: [
      {
        src: '/docs/screenshots/13-organizer-overview.jpg',
        title: 'Organizer Command Center Overview',
      },
      {
        src: '/docs/screenshots/14-organizer-applications.jpg',
        title: 'Exhibitor Application Approval Queue',
      },
      {
        src: '/docs/screenshots/07-analytics-dashboard.jpg',
        title: 'Live Expo Analytics & Reports',
      },
    ],
  },
  {
    id: 'ai-sync',
    badge: 'AI Concierge, Weather & Sync',
    tone: 'teal',
    title: 'Using Sphere AI (Text + Voice), Weather Telemetry & Cloud Sync Vault',
    steps: [
      'Click "Sphere AI" in the bottom-right corner and switch between Concierge, Exhibitor, or Operations personas.',
      'Type a question or hold the Microphone button in Voice Mode to speak; click any returned [BOOTH:XX] pill to fly straight to that booth in 3D.',
      'Check live Open-Meteo venue forecasts in °C or °F right inside the Upcoming & Live Exhibitions section.',
      'Open "Cloud Sync Vault" from the user menu to push your bookmarked booths, field notes, and preferences under a Sync Key (ES-XXXX-XXXX) or export JSON.',
    ],
    screenshots: [
      {
        src: '/docs/screenshots/16-ai-concierge-assistant.jpg',
        title: 'Sphere AI Voice + Text Concierge',
      },
      {
        src: '/docs/screenshots/17-cloud-sync-vault.jpg',
        title: 'Cross-Device Cloud Sync Vault',
      },
      {
        src: '/docs/screenshots/19-explore-expos-weather.jpg',
        title: 'Open-Meteo Venue Weather Telemetry',
      },
    ],
  },
];

const FAQ_ITEMS = [
  {
    q: 'Can two exhibitors book the same booth simultaneously?',
    a: 'No. Reservations execute atomically on the server. If a booth is no longer available, the API returns HTTP 409 Conflict and broadcasts the latest floor state via Socket.io within 2 seconds.',
  },
  {
    q: 'Why does an exhibitor see an approval error when reserving a booth?',
    a: 'Exhibitors who have submitted an application must wait until an Organizer sets its status to "approved" before locking booths on the floor.',
  },
  {
    q: 'How does the 3-Step Email OTP Password Reset work?',
    a: 'Enter your email on /forgot-password to receive a 6-digit HMAC-hashed OTP valid for 5 minutes (with a 60s resend cooldown and max 5 attempts). Verifying issues a 10-minute resetSessionToken to set a new strong password.',
  },
  {
    q: 'Does EventSphere work offline inside convention halls?',
    a: 'Yes. vite-plugin-pwa precaches the application shell and assets, while localStorage caches your floor snapshot, digital tickets, bookmarks, and notes with an OfflineIndicator banner.',
  },
  {
    q: 'How is personal data protected & GDPR compliant?',
    a: 'Passwords use bcryptjs (10 rounds). Phone numbers are encrypted at rest with AES-256-GCM. Users can toggle analytics/marketing consent, download a GDPR Article 20 JSON archive, or permanently erase their account.',
  },
  {
    q: 'What keyboard shortcuts are available?',
    a: 'Press "/" anywhere to open Global Search, "Escape" to close modals/inspector, "+" or "-" to zoom in 3D Floor mode, "0" to reset the camera to Overview, and "H" to collapse/expand the 3D HUD.',
  },
  {
    q: 'Can I share a direct link to a specific 3D booth?',
    a: 'Yes. Open any booth in the Booth Inspector Drawer and click "Share 3D Card" to copy a deep link (?booth=booth-A2) and download a live WebGL PNG snapshot.',
  },
  {
    q: 'Where are the full Markdown documentation files & screenshots stored?',
    a: 'Complete documentation with embedded screenshots lives in docs/USER_GUIDE.md and docs/DEVELOPER_GUIDE.md, high-res UI captures live in public/docs/screenshots/, and the 1080p walkthrough video is at public/assets/eventsphere-walkthrough.mp4.',
  },
];

export const DocsAndVideoModal = ({ isOpen, initialTab = 'video', onClose }) => {
  const [tab, setTab] = useState(initialTab);
  const [faqQuery, setFaqQuery] = useState('');
  const [galleryFilter, setGalleryFilter] = useState('all');
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const videoRef = useRef(null);

  React.useEffect(() => {
    if (isOpen) {
      setTab(initialTab);
      setLightboxIndex(null);
    }
  }, [isOpen, initialTab]);

  const filteredFaqs = useMemo(() => {
    const q = faqQuery.trim().toLowerCase();
    if (!q) return FAQ_ITEMS;
    return FAQ_ITEMS.filter(
      (item) => item.q.toLowerCase().includes(q) || item.a.toLowerCase().includes(q),
    );
  }, [faqQuery]);

  const filteredGallery = useMemo(() => {
    if (galleryFilter === 'all') return SCREENSHOT_GALLERY;
    return SCREENSHOT_GALLERY.filter((item) => item.category === galleryFilter);
  }, [galleryFilter]);

  const activeLightbox =
    lightboxIndex !== null && SCREENSHOT_GALLERY[lightboxIndex]
      ? SCREENSHOT_GALLERY[lightboxIndex]
      : null;

  const openLightboxBySrc = (src) => {
    const idx = SCREENSHOT_GALLERY.findIndex((item) => item.src === src);
    if (idx >= 0) setLightboxIndex(idx);
  };

  const jumpToTimestamp = (sec) => {
    const vid = videoRef.current;
    if (!vid) return;
    vid.currentTime = sec;
    void vid.play().catch(() => {});
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="4xl"
      icon={<BookOpen className="h-5 w-5" />}
      title="EventSphere Documentation, Screenshots & Walkthrough Video"
    >
      <div className="space-y-5">
        {/* Tab Switcher */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--es-divider)] pb-3">
          <div className="flex flex-wrap gap-1.5">
            {[
              { id: 'video', label: 'Walkthrough Video', icon: <Film className="h-3.5 w-3.5" /> },
              { id: 'user', label: 'User Guide', icon: <BookOpen className="h-3.5 w-3.5" /> },
              {
                id: 'screenshots',
                label: `Screenshots (${SCREENSHOT_GALLERY.length})`,
                icon: <ImageIcon className="h-3.5 w-3.5" />,
              },
              { id: 'faq', label: 'FAQs', icon: <HelpCircle className="h-3.5 w-3.5" /> },
              { id: 'dev', label: 'Developer Docs', icon: <Code2 className="h-3.5 w-3.5" /> },
            ].map((item) => (
              <Button
                key={item.id}
                size="sm"
                variant={tab === item.id ? 'primary' : 'outline'}
                leftIcon={item.icon}
                onClick={() => setTab(item.id)}
              >
                {item.label}
              </Button>
            ))}
          </div>

          <a
            href="/assets/eventsphere-walkthrough.mp4"
            download="eventsphere-walkthrough.mp4"
            className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--es-border)] px-3 py-1.5 text-xs font-semibold text-[#8A621C] transition-colors hover:border-[#D4AF63] dark:text-[#E8C987]"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Download MP4</span>
          </a>
        </div>

        {/* Lightbox Overlay for Enlarged Screenshots */}
        {activeLightbox && (
          <div
            role="dialog"
            aria-label={activeLightbox.title}
            className="rounded-2xl border border-[#D4AF63]/60 bg-[#0B0B0E] p-3 text-[#F2F3F7] shadow-2xl"
          >
            <div className="mb-2 flex items-center justify-between gap-3">
              <div>
                <div className="font-display text-sm font-bold text-[#E8C987]">
                  {activeLightbox.title}
                </div>
                <div className="text-xs text-[#9497A6]">{activeLightbox.caption}</div>
              </div>
              <div className="flex items-center gap-1.5">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    setLightboxIndex((prev) =>
                      prev > 0 ? prev - 1 : SCREENSHOT_GALLERY.length - 1,
                    )
                  }
                  aria-label="Previous screenshot"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="font-mono text-[11px] text-[#9497A6]">
                  {lightboxIndex + 1}/{SCREENSHOT_GALLERY.length}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    setLightboxIndex((prev) =>
                      prev < SCREENSHOT_GALLERY.length - 1 ? prev + 1 : 0,
                    )
                  }
                  aria-label="Next screenshot"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setLightboxIndex(null)}
                  aria-label="Close preview"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <img
              src={activeLightbox.src}
              alt={activeLightbox.title}
              referrerPolicy="no-referrer"
              className="aspect-video w-full rounded-xl border border-[var(--es-border)] object-contain bg-[#0B0B0E]"
            />
          </div>
        )}

        {/* TAB 1: WALKTHROUGH VIDEO */}
        {tab === 'video' && (
          <div className="space-y-4">
            <div className="overflow-hidden rounded-xl border border-[var(--es-border-strong)] bg-[#0B0B0E] shadow-xl">
              <video
                ref={videoRef}
                controls
                preload="metadata"
                playsInline
                className="aspect-video w-full bg-[#0B0B0E]"
                src="/assets/eventsphere-walkthrough.mp4"
              >
                Your browser does not support HTML5 video playback.
              </video>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#8A621C] dark:text-[#E8C987]">
                  Video Chapters (Click to Jump)
                </span>
                <span className="font-mono text-[11px] text-[#525463] dark:text-[#9497A6]">
                  1080p HD · 8 Chapters · Full Feature Tour
                </span>
              </div>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                {VIDEO_CHAPTERS.map((ch) => (
                  <button
                    key={ch.label}
                    type="button"
                    onClick={() => jumpToTimestamp(ch.time)}
                    className="group rounded-xl border border-[var(--es-border)] bg-[#EAEBF1] p-2.5 text-left transition-all hover:border-[#D4AF63] dark:bg-[#0E0E13]"
                  >
                    <div className="flex items-center justify-between gap-1 font-mono text-[11px] font-bold text-[#8A621C] dark:text-[#E8C987]">
                      <span>{ch.label}</span>
                      <Play className="h-3 w-3 opacity-70 group-hover:opacity-100" />
                    </div>
                    <div className="mt-1 text-[11px] text-[#525463] dark:text-[#9497A6]">
                      {ch.desc}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: USER GUIDE & TUTORIALS */}
        {tab === 'user' && (
          <div className="space-y-4">
            <Card padding="md" className="bg-[#EAEBF1] dark:bg-[#0E0E13]">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 font-display text-sm font-bold">
                  <Keyboard className="h-4 w-4 text-[#8A621C] dark:text-[#E8C987]" />
                  <span>Keyboard Shortcuts &amp; Demo Accounts</span>
                </div>
                <span className="font-mono text-[11px] text-[#525463] dark:text-[#9497A6]">
                  Full guide: docs/USER_GUIDE.md
                </span>
              </div>
              <div className="mt-3 grid gap-2 text-xs sm:grid-cols-3">
                <div className="rounded-lg border border-[var(--es-border)] bg-[#FFFFFF] p-2.5 dark:bg-[#121217]">
                  <div className="font-mono font-bold text-[#8A621C] dark:text-[#E8C987]">Organizer</div>
                  <div className="mt-0.5 font-mono text-[11px]">organizer@eventsphere.io</div>
                  <div className="font-mono text-[11px] text-[#525463] dark:text-[#9497A6]">ExpoAdmin2026!</div>
                </div>
                <div className="rounded-lg border border-[var(--es-border)] bg-[#FFFFFF] p-2.5 dark:bg-[#121217]">
                  <div className="font-mono font-bold text-[#F97362]">Exhibitor</div>
                  <div className="mt-0.5 font-mono text-[11px]">exhibitor@lumina-robotics.io</div>
                  <div className="font-mono text-[11px] text-[#525463] dark:text-[#9497A6]">Exhibitor2026!</div>
                </div>
                <div className="rounded-lg border border-[var(--es-border)] bg-[#FFFFFF] p-2.5 dark:bg-[#121217]">
                  <div className="font-mono font-bold text-[#2DD4BF]">Attendee</div>
                  <div className="mt-0.5 font-mono text-[11px]">attendee@eventsphere.io</div>
                  <div className="font-mono text-[11px] text-[#525463] dark:text-[#9497A6]">Attendee2026!</div>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2 font-mono text-[11px]">
                <span className="rounded border border-[var(--es-border)] px-2 py-1">/ Global Search</span>
                <span className="rounded border border-[var(--es-border)] px-2 py-1">+ / - Zoom 3D</span>
                <span className="rounded border border-[var(--es-border)] px-2 py-1">0 Reset Overview</span>
                <span className="rounded border border-[var(--es-border)] px-2 py-1">H Hide/Show HUD</span>
                <span className="rounded border border-[var(--es-border)] px-2 py-1">Esc Close Drawer</span>
              </div>
            </Card>

            <div className="grid gap-3">
              {USER_TUTORIALS.map((tut) => (
                <Card key={tut.id} padding="md" className="bg-[#EAEBF1] dark:bg-[#0E0E13]">
                  <div className="flex items-center gap-2">
                    <Badge tone={tut.tone}>{tut.badge}</Badge>
                    <h3 className="font-display text-sm font-bold">{tut.title}</h3>
                  </div>
                  <ol className="mt-2.5 list-decimal space-y-1.5 pl-4 text-xs leading-relaxed text-[#3E404D] dark:text-[#B8BAC8]">
                    {tut.steps.map((step, i) => (
                      <li key={i}>{step}</li>
                    ))}
                  </ol>
                  {tut.screenshots && (
                    <div className="mt-3 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                      {tut.screenshots.map((shot) => (
                        <button
                          key={shot.src}
                          type="button"
                          onClick={() => openLightboxBySrc(shot.src)}
                          className="group overflow-hidden rounded-xl border border-[var(--es-border)] bg-[#0B0B0E] text-left transition-all hover:border-[#D4AF63]"
                        >
                          <div className="relative">
                            <img
                              src={shot.src}
                              alt={shot.title}
                              loading="lazy"
                              referrerPolicy="no-referrer"
                              className="aspect-video w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                            />
                            <span className="absolute right-2 bottom-2 flex h-6 w-6 items-center justify-center rounded-md bg-[#0B0B0E]/80 text-[#E8C987] opacity-80 group-hover:opacity-100">
                              <Maximize2 className="h-3 w-3" />
                            </span>
                          </div>
                          <div className="px-2.5 py-1.5 font-mono text-[11px] font-semibold text-[#E8C987]">
                            {shot.title}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: COMPLETE VISUAL SCREENSHOT GALLERY */}
        {tab === 'screenshots' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap gap-1.5">
                {[
                  { id: 'all', label: 'All Screens (19)' },
                  { id: 'public', label: 'Public & 3D Floor' },
                  { id: 'portals', label: 'Portals & Analytics' },
                  { id: 'security', label: 'Auth, AI & Security' },
                ].map((cat) => (
                  <Button
                    key={cat.id}
                    size="sm"
                    variant={galleryFilter === cat.id ? 'primary' : 'outline'}
                    onClick={() => setGalleryFilter(cat.id)}
                  >
                    {cat.label}
                  </Button>
                ))}
              </div>
              <span className="font-mono text-[11px] text-[#525463] dark:text-[#9497A6]">
                Click any screenshot to inspect full-size
              </span>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {filteredGallery.map((shot) => (
                <button
                  key={shot.id}
                  type="button"
                  onClick={() => openLightboxBySrc(shot.src)}
                  className="group overflow-hidden rounded-xl border border-[var(--es-border)] bg-[#EAEBF1] text-left transition-all hover:border-[#D4AF63] dark:bg-[#0E0E13]"
                >
                  <div className="relative bg-[#0B0B0E]">
                    <img
                      src={shot.src}
                      alt={shot.title}
                      loading="lazy"
                      referrerPolicy="no-referrer"
                      className="aspect-video w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                    />
                    <span className="absolute right-2 bottom-2 flex h-7 w-7 items-center justify-center rounded-lg bg-[#0B0B0E]/80 text-[#E8C987] opacity-80 group-hover:opacity-100">
                      <Maximize2 className="h-3.5 w-3.5" />
                    </span>
                  </div>
                  <div className="p-2.5">
                    <div className="font-display text-xs font-bold">{shot.title}</div>
                    <p className="mt-1 text-[11px] leading-snug text-[#525463] dark:text-[#9497A6]">
                      {shot.caption}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: FAQS */}
        {tab === 'faq' && (
          <div className="space-y-4">
            <SearchInput
              value={faqQuery}
              onChange={(e) => setFaqQuery(e.target.value)}
              placeholder="Search FAQs (booth booking, offline, OTP, GDPR, shortcuts)..."
            />
            <div className="space-y-2.5">
              {filteredFaqs.map((item) => (
                <details
                  key={item.q}
                  open={Boolean(faqQuery.trim())}
                  className="rounded-xl border border-[var(--es-border)] bg-[#EAEBF1] px-4 py-3 dark:bg-[#0E0E13]"
                >
                  <summary className="cursor-pointer font-display text-sm font-bold">
                    {item.q}
                  </summary>
                  <p className="mt-2 text-xs leading-relaxed text-[#3E404D] dark:text-[#9497A6]">
                    {item.a}
                  </p>
                </details>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: DEVELOPER DOCS */}
        {tab === 'dev' && (
          <div className="space-y-4 text-xs">
            <Card padding="md" className="bg-[#EAEBF1] dark:bg-[#0E0E13]">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 font-display text-sm font-bold">
                  <Terminal className="h-4 w-4 text-[#8A621C] dark:text-[#E8C987]" />
                  <span>Architecture &amp; Stack</span>
                </div>
                <span className="font-mono text-[11px] text-[#525463] dark:text-[#9497A6]">
                  Full guide: docs/DEVELOPER_GUIDE.md
                </span>
              </div>
              <p className="mt-2 leading-relaxed text-[#3E404D] dark:text-[#B8BAC8]">
                Single-process Node.js server (<code>server.js</code>) binding HTTP + Socket.io on
                port <strong>3000</strong>. Serves Vite middleware in development and static{' '}
                <code>dist/</code> in production. Persistence uses MongoDB Atlas (15{' '}
                <code>es_*</code> collections) with automatic atomic local JSON fallback (
                <code>.data/eventsphere-db.json</code>) and 7-day rotating snapshot backups.
              </p>
            </Card>

            <div className="grid gap-3 sm:grid-cols-2">
              <Card padding="md" className="bg-[#EAEBF1] dark:bg-[#0E0E13]">
                <div className="flex items-center gap-2 font-display text-sm font-bold">
                  <ShieldCheck className="h-4 w-4 text-[#2DD4BF]" />
                  <span>Core API &amp; Socket.io Protocol</span>
                </div>
                <ul className="mt-2 space-y-1 font-mono text-[11px] text-[#3E404D] dark:text-[#B8BAC8]">
                  <li>POST /api/auth/register | login | forgot-password</li>
                  <li>POST /api/auth/verify-reset-otp | reset-password</li>
                  <li>GET/PUT/DELETE /api/auth/privacy/* &amp; account</li>
                  <li>POST/PUT/DELETE /api/expos | booths | sessions</li>
                  <li>POST /api/booths/:id/reserve (409 atomic lock)</li>
                  <li>PUT /api/applications/:id &amp; /request-info</li>
                  <li>GET/PUT /api/sync/:syncKey (SHA-256 vault)</li>
                  <li>POST /api/assistant/chat | transcribe | tts</li>
                  <li>WS: state:sync, booth:updated, chat:message, schedule:updated</li>
                </ul>
              </Card>

              <Card padding="md" className="bg-[#EAEBF1] dark:bg-[#0E0E13]">
                <div className="flex items-center gap-2 font-display text-sm font-bold">
                  <Code2 className="h-4 w-4 text-[#F97362]" />
                  <span>Scripts, Security &amp; 3D Modules</span>
                </div>
                <ul className="mt-2 space-y-1 font-mono text-[11px] text-[#3E404D] dark:text-[#B8BAC8]">
                  <li>npm run dev — Express + Vite + Socket.io (3000)</li>
                  <li>npm run build — Vite production + Workbox PWA</li>
                  <li>npm run lint — esbuild syntax validation (50+ files)</li>
                  <li>npm test — node --test tests/*.test.mjs</li>
                  <li>server/security.js — AES-256-GCM &amp; HMAC OTPs</li>
                  <li>server/mongoStore.js — bulkWrite Mongo sync</li>
                  <li>src/three/ExpoHallCanvas.jsx — WebGL + Bloom</li>
                  <li>src/services/api.js — Axios domain clients</li>
                </ul>
              </Card>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {[
                {
                  src: '/docs/screenshots/15-organizer-monitoring-gdpr.jpg',
                  title: 'Monitoring Telemetry & GDPR API',
                },
                {
                  src: '/docs/screenshots/10-password-reset-otp.jpg',
                  title: 'HMAC-SHA256 OTP Reset Flow',
                },
                {
                  src: '/docs/screenshots/16-ai-concierge-assistant.jpg',
                  title: 'Server-Side @google/genai Integration',
                },
              ].map((shot) => (
                <button
                  key={shot.src}
                  type="button"
                  onClick={() => openLightboxBySrc(shot.src)}
                  className="group overflow-hidden rounded-xl border border-[var(--es-border)] bg-[#0B0B0E] text-left transition-all hover:border-[#D4AF63]"
                >
                  <img
                    src={shot.src}
                    alt={shot.title}
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    className="aspect-video w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                  />
                  <div className="px-2.5 py-1.5 font-mono text-[11px] font-semibold text-[#E8C987]">
                    {shot.title}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
