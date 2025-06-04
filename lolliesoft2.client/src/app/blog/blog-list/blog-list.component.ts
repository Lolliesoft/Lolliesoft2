import { Component, OnInit } from '@angular/core';
import { BlogService } from '../../services/blog.service';
import { BlogPost } from '../blog-post.model';

@Component({
  selector: 'app-blog-list',
  templateUrl: './blog-list.component.html',
  styleUrls: ['./blog-list.component.css']
})
export class BlogListComponent implements OnInit {
  // 1) All posts from the API
  public blogList: BlogPost[] = [];

  // 2) The five random posts to show in the widget
  public randomPosts: BlogPost[] = [];

  constructor(private blogService: BlogService) { }

  ngOnInit(): void {
    // 1) Load all posts
    this.blogService.getAll().subscribe({
      next: data => {
        this.blogList = data;
        this.randomPosts = this.pickRandomFive(this.blogList);
      },
      error: err => console.error('Failed to load posts', err)
    });
  }

  /**
   * Shuffle the array (Fisher–Yates) and return the first five.
   */
  private pickRandomFive(posts: BlogPost[]): BlogPost[] {
    const arr = posts.slice();
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr.slice(0, 5);
  }

  /**
   * Delete a post by its numeric ID. The back end will enforce authorization.
   */
  public onDelete(post: BlogPost): void {
    if (!confirm(`Are you sure you want to delete "${post.title}"?`)) {
      return;
    }

    this.blogService.delete(post.id).subscribe({
      next: () => {
        // Remove from the list and recalc randomPosts
        this.blogList = this.blogList.filter(p => p.id !== post.id);
        this.randomPosts = this.pickRandomFive(this.blogList);
      },
      error: err => {
        console.error('Delete failed', err);
        // (Optional) display an error message here
      }
    });
  }
}
