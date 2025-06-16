// src/app/blog/blog-list/blog-list.component.ts

import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { BlogService } from '../../services/blog.service';
import { AuthService } from '../../services/auth.service';
import { BlogPost } from '../blog-post.model';

@Component({
  selector: 'app-blog-list',
  templateUrl: './blog-list.component.html',
  styleUrls: ['./blog-list.component.css']
})
export class BlogListComponent implements OnInit, OnDestroy {
  public blogList: BlogPost[] = [];
  public randomPosts: BlogPost[] = [];
  public currentUserId: string | null = null;

  private authSub!: Subscription;

  constructor(
    private blogService: BlogService,
    public authService: AuthService
  ) { }

  ngOnInit(): void {
    this.currentUserId = this.authService.getCurrentUserId();

    this.authSub = this.authService.currentUserId$
      .subscribe(id => this.currentUserId = id);

    this.blogService.getAll().subscribe({
      next: data => {
        const enrichedPosts = data.map(post => ({
          ...post,
          imageUrl: post.imagePath?.startsWith('/uploads/')
            ? post.imagePath
            : `/uploads/${post.imagePath}`
        }));

        this.blogList = enrichedPosts;
        this.randomPosts = this.pickRandomFive(enrichedPosts);
      },
      error: err => console.error('Failed to load posts', err)
    });
  }

  ngOnDestroy(): void {
    this.authSub.unsubscribe();
  }

  private pickRandomFive(posts: BlogPost[]): BlogPost[] {
    const arr = posts.slice();
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr.slice(0, 5);
  }

  public onDelete(post: BlogPost): void {
    if (!this.currentUserId) return;
    if (!confirm(`Delete "${post.title}"?`)) return;

    this.blogService.delete(post.id).subscribe({
      next: () => {
        this.blogList = this.blogList.filter(p => p.id !== post.id);
        this.randomPosts = this.pickRandomFive(this.blogList);
      },
      error: err => console.error('Delete failed', err)
    });
  }
}
