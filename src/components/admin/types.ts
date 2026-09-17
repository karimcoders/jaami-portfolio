export interface AdminSettings {
  id: string;
  name: string;
  tagline: string;
  about: string;
  avatarUrl: string;
  whatsappUrl: string;
  stats: string[];
  shortSubtitle: string;
  longSubtitle: string;
  contactIntro: string;
  // branding
  logoUrl: string;
  faviconUrl: string;
  // theme
  colorOlive: string;
  colorOliveDark: string;
  colorSage: string;
  colorMist: string;
  colorInk: string;
  colorCream: string;
  fontPreset: string;
  // sections
  showMarquee: boolean;
  showStats: boolean;
  showShort: boolean;
  showLong: boolean;
  showContact: boolean;
  // seo / footer
  seoTitle: string;
  seoDescription: string;
  footerText: string;
}

export interface AdminVideo {
  id: string;
  title: string;
  type: string;
  src: string;
  visible: boolean;
  sort: number;
}

export interface AdminContact {
  id: string;
  type: string;
  label: string;
  href: string;
  visible: boolean;
  sort: number;
}

export type AdminBlock =
  | { type: "heading"; text: string; size: "sm" | "md" | "lg" }
  | { type: "text"; text: string }
  | { type: "image"; src: string; caption: string }
  | { type: "video"; src: string }
  | { type: "quote"; text: string; author: string }
  | { type: "button"; label: string; href: string }
  | { type: "divider" };

export interface AdminPageItem {
  id: string;
  slug: string;
  title: string;
  blocks: AdminBlock[];
  showInNav: boolean;
  visible: boolean;
  sort: number;
}

export interface AdminData {
  settings: AdminSettings;
  videos: AdminVideo[];
  contacts: AdminContact[];
  pages: AdminPageItem[];
}

export const CONTACT_TYPE_OPTIONS = [
  { value: "instagram", label: "Instagram" },
  { value: "email", label: "Email" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "link", label: "Other link" },
] as const;
