/** Shared content types passed from the server (database) into client components */

export interface HeroSettings {
  name: string;
  tagline: string;
  about: string;
  avatarUrl: string;
  stats: string[];
}

export interface VideoItem {
  id: string;
  title: string;
  type: string;
  src: string;
}

export interface ContactData {
  id: string;
  type: string; // "instagram" | "email" | "whatsapp" | "link"
  label: string;
  href: string;
}
