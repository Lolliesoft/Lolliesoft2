export interface BlogPost {
  id: number;
  title: string;
  slug: string;
  content: string;
  imagePath?: string;
  isPrivate: boolean;
  created: string;       // ISO date string
  updated?: string;      // ISO date string or undefined
}
