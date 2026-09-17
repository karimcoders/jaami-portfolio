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

export interface AdminData {
  settings: AdminSettings;
  videos: AdminVideo[];
  contacts: AdminContact[];
}

export const CONTACT_TYPE_OPTIONS = [
  { value: "instagram", label: "Instagram" },
  { value: "email", label: "Email" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "link", label: "Other link" },
] as const;
