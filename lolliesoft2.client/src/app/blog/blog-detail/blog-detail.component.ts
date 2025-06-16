// src/app/blog/blog-detail/blog-detail.component.ts

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BlogService } from '../../services/blog.service';
import { AuthService } from '../../services/auth.service';
import { BlogPost } from '../blog-post.model';

@Component({
  selector: 'app-blog-detail',
  templateUrl: './blog-detail.component.html',
  styleUrls: ['./blog-detail.component.css']
})
export class BlogDetailComponent implements OnInit {
  post?: BlogPost;
  currentUserId: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private blogService: BlogService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.currentUserId = this.authService.getCurrentUserId();

    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.blogService.get(id).subscribe({
      next: p => this.post = p,
      error: err => console.error('Failed to load post', err)
    });
  }
}
