// src/app/blog/blog-list/blog-list.component.ts

import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
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
  public filteredPosts: BlogPost[] = [];
  public paginatedPosts: BlogPost[] = [];
  public randomPosts: BlogPost[] = [];
  public currentUserId: string | null = null;
  public searchQuery = '';

  public currentPage = 1;
  public pageSize = 5;
  public totalPages = 1;

  private authSub!: Subscription;
  private routeSub!: Subscription;

  constructor(
    private blogService: BlogService,
    public authService: AuthService,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    // 1) Subscribe to ?q= header searches
    this.routeSub = this.route.queryParams.subscribe(params => {
      this.searchQuery = (params['q'] || '').trim().toLowerCase();
      this.applyFilterAndPagination();
    });

    // 2) Track auth changes
    this.currentUserId = this.authService.getCurrentUserId();
    this.authSub = this.authService.currentUserId$
      .subscribe(id => this.currentUserId = id);

    // 3) Load posts
    this.blogService.getAll().subscribe({
      next: data => {
        this.blogList = data.map(post => ({
          ...post,
          imageUrl: post.imagePath?.startsWith('/uploads/')
            ? post.imagePath
            : `/uploads/${post.imagePath}`
        }));
        this.randomPosts = this.pickRandomFive(this.blogList);
        this.applyFilterAndPagination();
      },
      error: err => console.error('Failed to load posts', err)
    });
  }

  ngOnDestroy(): void {
    this.authSub.unsubscribe();
    this.routeSub.unsubscribe();
  }

  /** Pick 5 random posts for the sidebar */
  private pickRandomFive(posts: BlogPost[]): BlogPost[] {
    const arr = [...posts];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr.slice(0, 5);
  }

  /** Delete a post, then re-filter and paginate */
  public onDelete(post: BlogPost): void {
    if (!this.currentUserId || !confirm(`Delete "${post.title}"?`)) return;
    this.blogService.delete(post.id).subscribe({
      next: () => {
        this.blogList = this.blogList.filter(p => p.id !== post.id);
        this.randomPosts = this.pickRandomFive(this.blogList);
        this.applyFilterAndPagination();
      },
      error: err => console.error('Delete failed', err)
    });
  }

  /** Handle page button clicks */
  public goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.updatePaginatedPosts();
    const el = document.querySelector('.blog-list');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  /** Called by both header and sidebar search inputs */
  public searchPosts(): void {
    // simply re-apply the same filter + pagination logic
    this.applyFilterAndPagination();
  }

  /** Filter blogList by searchQuery then set up pagination */
  private applyFilterAndPagination(): void {
    const q = this.searchQuery.toLowerCase();
    this.filteredPosts = q
      ? this.blogList.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.content.toLowerCase().includes(q)
      )
      : [...this.blogList];

    this.totalPages = Math.max(1, Math.ceil(this.filteredPosts.length / this.pageSize));
    this.currentPage = 1;
    this.updatePaginatedPosts();
  }

  /** Populate paginatedPosts from filteredPosts */
  private updatePaginatedPosts(): void {
    const start = (this.currentPage - 1) * this.pageSize;
    this.paginatedPosts = this.filteredPosts.slice(start, start + this.pageSize);
  }
}
