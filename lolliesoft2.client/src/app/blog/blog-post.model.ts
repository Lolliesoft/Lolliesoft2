export interface BlogPost {
  id: number;
  title: string;
  content: string;
  imagePath?: string;
  isPrivate: boolean;
  created: string;       // ISO date string
  updated?: string;      // ISO date string or undefined
}
