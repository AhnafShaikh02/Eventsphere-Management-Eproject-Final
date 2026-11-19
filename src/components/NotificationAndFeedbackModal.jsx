import React, { useState } from 'react';
import { Bell, BookOpen, CheckCheck, ChevronDown, ChevronRight, MessageSquarePlus, Shield, Ticket, Users } from 'lucide-react';
import { Badge, Button, Input, Modal, Select, Tabs, Textarea } from './ui';

export const NotificationAndFeedbackModal = ({
  isOpen,
  notifications,
  currentUser,
  onClose,
  onMarkAllRead,
  onSubmitFeedback,
}) => {
  const [tab, setTab] = useState('alerts');
  const [category, setCategory] = useState('Suggestion');
  const [message, setMessage] = useState('');
  const [userName, setUserName] = useState(currentUser?.name || '');
  const [busy, setBusy] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  React.useEffect(() => {
    if (currentUser?.name) setUserName(currentUser.name);
  }, [currentUser?.name]);

  const faqSections = [
    {
      id: 'getting-started',
      icon: <Ticket className="h-3.5 w-3.5 text-[#2DD4BF]" />,
      title: 'Getting Started',
      items: [
        {
          q: 'How do I create an account?',
          a: 'Click "Sign Up" in the top navigation bar. Choose your role — Attendee, Exhibitor, or Organizer — fill in your name, email, and a strong password, then submit. You\'ll be logged in immediately.',
        },
        {
          q: 'What are the three user roles?',
          a: 'Attendee: Browse expos, register for events, bookmark sessions, and chat with exhibitors. Exhibitor: Submit applications, manage booth details, and message organizers. Organizer (Admin): Full control — create/edit expos, approve exhibitors, manage schedules, and view analytics.',
        },
        {
          q: 'I forgot my password. How do I reset it?',
          a: 'Click "Login" → "Forgot Password". Enter your registered email address. A 6-digit OTP code will be sent to your real inbox within seconds. Enter the code, then set your new password. The code expires in 5 minutes.',
        },
        {
          q: 'Is my data secure?',
          a: 'Yes. Passwords are hashed with bcrypt (never stored in plain text). All sessions use signed JWT tokens. Personal data is encrypted with AES-256-GCM. HTTPS enforces encryption in transit. Your account also has GDPR controls — see the Privacy section in your portal settings.',
        },
      ],
    },
    {
      id: 'navigation',
      icon: <BookOpen className="h-3.5 w-3.5 text-[#8A621C] dark:text-[#E8C987]" />,
      title: 'Navigation & 3D Floor',
      items: [
        {
          q: 'How do I use the 3D Floor?',
          a: 'Click "3D Floor" in the top nav. Use your mouse to orbit (left-click + drag), zoom (scroll wheel), and pan (right-click + drag). On mobile, use touch gestures. Click any booth cube to open its inspector panel.',
        },
        {
          q: 'What do the booth colours mean?',
          a: 'Green = Available (open to reserve). Amber/Yellow = Pending (application under review). Blue = Reserved (held by an exhibitor). Red/Orange = Occupied (confirmed and active). Use the status filter buttons to highlight specific types.',
        },
        {
          q: 'How do I search for a booth or exhibitor?',
          a: 'Press the "/" key anywhere on the page (or click the search icon) to open the global search. Type a company name, product, session title, or booth number. Click a result to jump directly to that booth on the floor.',
        },
        {
          q: 'What are keyboard shortcuts?',
          a: '"/" — Open global search. "Escape" — Close any open drawer, modal, or search panel. All interactive elements are also accessible via Tab key for keyboard-only navigation.',
        },
      ],
    },
    {
      id: 'attendee',
      icon: <Ticket className="h-3.5 w-3.5 text-[#2DD4BF]" />,
      title: 'Attendee Guide',
      items: [
        {
          q: 'How do I register for an expo?',
          a: 'Go to the "Explore Expos" section on the home page. Find the expo and click "Register". If you\'re not logged in, you\'ll be prompted to sign in first. A unique QR ticket code will be generated for you instantly.',
        },
        {
          q: 'How do I bookmark a session?',
          a: 'In the Schedule section or your Attendee Portal, click the bookmark icon on any session. You\'ll receive a live notification reminder. Your bookmarks are saved in your Attendee Portal → Bookmarks tab.',
        },
        {
          q: 'How do I contact an exhibitor?',
          a: 'Click any booth on the 3D floor to open the booth inspector. Click "Send Message" to send a direct message to the exhibitor. You can also view their contact email and website from the inspector panel.',
        },
        {
          q: 'Where are my expo tickets?',
          a: 'Go to your Attendee Portal (top nav → Portal button when logged in) → "My Registrations" tab. Each registration shows your ticket code and a QR pattern you can screenshot and show at the venue.',
        },
      ],
    },
    {
      id: 'exhibitor',
      icon: <Users className="h-3.5 w-3.5 text-[#F97362]" />,
      title: 'Exhibitor Guide',
      items: [
        {
          q: 'How do I apply to exhibit at an expo?',
          a: 'Log in as an Exhibitor and go to your Exhibitor Portal → "Apply for Expo" tab. Fill in your company details, products/services, and any required documents. Submit the application. The organizer will review and approve or reject it — you\'ll receive an email notification.',
        },
        {
          q: 'How do I reserve a booth?',
          a: 'Once your application is approved, switch to the 3D Floor view. Click an available (green) booth and click "Reserve Booth" in the inspector panel. The booth is instantly allocated to you in real time.',
        },
        {
          q: 'How do I update my company profile?',
          a: 'Go to Exhibitor Portal → "My Profile" tab. Update your company name, tagline, description, contact email, phone, website, logo colour, products list, and staff list. Click Save to publish changes.',
        },
        {
          q: 'How do I message the organizer?',
          a: 'Go to Exhibitor Portal → "Messages" tab. Type your message and select "Organizer Desk" as the recipient channel. Your message appears in the organizer\'s message inbox immediately.',
        },
      ],
    },
    {
      id: 'organizer',
      icon: <Shield className="h-3.5 w-3.5 text-[#8A621C] dark:text-[#D4AF63]" />,
      title: 'Organizer Guide',
      items: [
        {
          q: 'How do I create a new expo?',
          a: 'Go to Organizer Portal → "Expos" tab → click "New Expo". Fill in the title, dates, location, theme, category, capacity, and description. Click Create. The expo is immediately live for attendees to view.',
        },
        {
          q: 'How do I approve or reject an exhibitor application?',
          a: 'Go to Organizer Portal → "Applications" tab. Each application shows the company name, category, products summary, and submitted documents. Click "Approve" or "Reject". An email notification is automatically sent to the exhibitor via Brevo.',
        },
        {
          q: 'How do I manage sessions and speakers?',
          a: 'Go to Organizer Portal → "Schedule" tab. Click "Add Session" to create a new session with a time slot, speaker, topic, and location. You can also edit or delete existing sessions — changes are broadcast in real time to all users.',
        },
        {
          q: 'Where can I see analytics?',
          a: 'Click "Analytics" in the top nav (or Organizer Portal → Analytics button). You\'ll see booth traffic counts, attendee registrations per expo, session popularity, and live concurrent user count. The Settings tab also shows server performance metrics (uptime, latency, error rate).',
        },
      ],
    },
    {
      id: 'privacy',
      icon: <Shield className="h-3.5 w-3.5 text-[#2DD4BF]" />,
      title: 'Privacy & Security FAQ',
      items: [
        {
          q: 'How do I export my personal data (GDPR)?',
          a: 'Go to your Portal → Settings tab → "GDPR Privacy & Data Controls" section. Click "Export My Data". A JSON file with all your personal data will be downloaded to your device immediately.',
        },
        {
          q: 'How do I delete my account?',
          a: 'Go to your Portal → Settings tab → "GDPR Privacy & Data Controls" → click "Erase My Account". A confirmation dialog will appear. Once confirmed, all your data is permanently deleted and you are signed out.',
        },
        {
          q: 'Can I control what data is collected about me?',
          a: 'Yes. In the Privacy & Data Controls section of your portal settings, you can toggle off "Analytics Telemetry" and "Marketing Emails" at any time. Changes take effect immediately.',
        },
        {
          q: 'Is the system GDPR compliant?',
          a: 'Yes. EventSphere implements GDPR rights: Right to Access (data export), Right to Erasure (account deletion), Right to Restrict Processing (consent toggles), and informed consent at registration. Data is encrypted at rest with AES-256-GCM.',
        },
      ],
    },
  ];

  const handleSendFeedback = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    setBusy(true);
    const ok = await onSubmitFeedback({
      userName: userName.trim() || 'Expo Visitor',
      category,
      message: message.trim(),
    });
    setBusy(false);
    if (ok) {
      setMessage('');
      setTab('alerts');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="lg"
      icon={<Bell className="h-4 w-4 text-[#F97362]" />}
      title="Live Alerts, Support & Guide"
    >
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Tabs
            activeId={tab}
            onChange={(id) => setTab(id)}
            items={[
              { id: 'alerts', label: 'Notifications', count: notifications.length },
              {
                id: 'feedback',
                label: 'Feedback',
                icon: <MessageSquarePlus className="h-3.5 w-3.5" />,
              },
              {
                id: 'guide',
                label: 'User Guide & FAQ',
                icon: <BookOpen className="h-3.5 w-3.5" />,
              },
            ]}
          />

          {tab === 'alerts' && currentUser && (
            <Button
              variant="text"
              leftIcon={<CheckCheck className="h-3.5 w-3.5" />}
              onClick={onMarkAllRead}
            >
              Mark Read
            </Button>
          )}
        </div>

        {tab === 'alerts' ? (
          <div className="max-h-80 space-y-2.5 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="text-xs text-[#525463] dark:text-[#9497A6]">No active alerts.</p>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className="rounded-xl border border-[#272732]/16 bg-[#EAEBF1] p-3 dark:border-[#2D2D3A]/34 dark:bg-[#121217]"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold">{n.title}</span>
                    <Badge tone={n.kind === 'schedule' ? 'teal' : 'emerald'}>{n.kind}</Badge>
                  </div>
                  <p className="mt-1 text-xs text-[#525463] dark:text-[#9497A6]">{n.message}</p>
                </div>
              ))
            )}
          </div>
        ) : tab === 'feedback' ? (
          <form onSubmit={handleSendFeedback} className="space-y-3.5">
            <div className="grid gap-3 sm:grid-cols-2">
              <Input
                label="Your Name"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Expo Visitor"
              />
              <Select
                label="Topic"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                options={[
                  { value: 'Suggestion', label: 'Suggestion' },
                  { value: 'Technical Issue', label: 'Technical Issue' },
                  { value: 'Booth Inquiry', label: 'Booth Inquiry' },
                  { value: 'Accessibility', label: 'Accessibility' },
                  { value: 'Security Concern', label: 'Security Concern' },
                ]}
              />
            </div>
            <Textarea
              label="Message for Organizer Team"
              rows={3}
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Describe any hall issue, accessibility need, or exhibitor question..."
            />
            <Button type="submit" variant="primary" fullWidth loading={busy}>
              Submit to Organizer Support Queue
            </Button>
          </form>
        ) : (
          /* ── Full User Guide & FAQ ── */
          <div className="max-h-[420px] space-y-2 overflow-y-auto pr-1">
            <p className="text-[11px] text-[#525463] dark:text-[#9497A6] mb-3">
              Click any section to expand answers. Can't find what you need?{' '}
              <button
                type="button"
                className="underline text-[#8A621C] dark:text-[#E8C987]"
                onClick={() => setTab('feedback')}
              >
                Send us feedback
              </button>
              .
            </p>

            {faqSections.map((section) => (
              <div
                key={section.id}
                className="rounded-xl border border-[#272732]/16 bg-[#EAEBF1] dark:border-[#2D2D3A]/34 dark:bg-[#121217] overflow-hidden"
              >
                {/* Section header */}
                <button
                  type="button"
                  className="flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left"
                  onClick={() => setOpenFaq(openFaq === section.id ? null : section.id)}
                >
                  <span className="flex items-center gap-2 font-display text-xs font-bold text-[#8A621C] dark:text-[#E8C987]">
                    {section.icon}
                    {section.title}
                  </span>
                  {openFaq === section.id ? (
                    <ChevronDown className="h-3.5 w-3.5 shrink-0 text-[#525463] dark:text-[#9497A6]" />
                  ) : (
                    <ChevronRight className="h-3.5 w-3.5 shrink-0 text-[#525463] dark:text-[#9497A6]" />
                  )}
                </button>

                {/* FAQ items */}
                {openFaq === section.id && (
                  <div className="border-t border-[#272732]/12 dark:border-[#2D2D3A]/28 divide-y divide-[#272732]/10 dark:divide-[#2D2D3A]/24">
                    {section.items.map((item, i) => (
                      <div key={i} className="px-3 py-2.5 space-y-1">
                        <p className="text-[11px] font-semibold text-[#0B0B0E] dark:text-[#F2F3F7]">
                          {item.q}
                        </p>
                        <p className="text-[11px] leading-relaxed text-[#525463] dark:text-[#9497A6]">
                          {item.a}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Keyboard shortcuts quick-ref */}
            <div className="rounded-xl border border-[#272732]/16 bg-[#EAEBF1] p-3 dark:border-[#2D2D3A]/34 dark:bg-[#121217]">
              <p className="text-[11px] font-bold text-[#8A621C] dark:text-[#E8C987] mb-1.5">
                ⌨️ Keyboard Shortcuts
              </p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px] text-[#525463] dark:text-[#9497A6]">
                {[
                  ['/', 'Open global search'],
                  ['Esc', 'Close any drawer / modal'],
                  ['Tab', 'Navigate all UI elements'],
                  ['Enter', 'Confirm / submit focused item'],
                ].map(([key, desc]) => (
                  <div key={key} className="flex items-center gap-1.5">
                    <kbd className="rounded border border-[#272732]/25 px-1.5 py-0.5 font-mono text-[10px] dark:border-[#2D2D3A]/40">
                      {key}
                    </kbd>
                    <span>{desc}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
