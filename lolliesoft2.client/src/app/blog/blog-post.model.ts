// src/app/blog/blog-post.model.ts

export interface BlogPost {
  id: number;
  title: string;
  slug: string;
  content: string;
  imagePath?: string;
  isPrivate: boolean;
  created: string;       // ISO date string
  updated?: string;      // ISO date string or undefined
  /** Who wrote this post */
  authorId: string;
  imageUrl?: string; // ✅ Add this line (optional with `?`)
}
