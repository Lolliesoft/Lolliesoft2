import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';                    // ← import
import { BlogService } from '../blog.service';
import { BlogPost } from '../blog-post.model';

@Component({
  selector: 'app-blog-editor',
  templateUrl: './blog-editor.component.html',
  styleUrls: ['./blog-editor.component.css']
})
export class BlogEditorComponent implements OnInit {
  blogForm!: FormGroup;
  postId?: number;
  isEdit = false;
  imageFile?: File;
  loading = false;
  errorMessage?: string;

  constructor(
    private fb: FormBuilder,
    private blogService: BlogService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.blogForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(200)]],
      content: ['', [Validators.required]],
      isPrivate: [false],
      image: [null]
    });

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.isEdit = true;
      this.postId = +idParam;
      this.loadPost(this.postId);
    }
  }

  loadPost(id: number): void {
    this.blogService.get(id).subscribe({
      next: post => {
        this.blogForm.patchValue({
          title: post.title,
          content: post.content,
          isPrivate: post.isPrivate
        });
      },
      error: (err: any) => {
        console.error('Failed to load post', err);
        this.errorMessage = 'Failed to load post.';
      }
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length) {
      this.imageFile = input.files[0];
    }
  }

  onSubmit(): void {
    if (this.blogForm.invalid) return;

    const formData = new FormData();
    formData.append('Title', this.blogForm.get('title')!.value);
    formData.append('Content', this.blogForm.get('content')!.value);
    formData.append('IsPrivate', this.blogForm.get('isPrivate')!.value.toString());
    if (this.imageFile) {
      formData.append('Image', this.imageFile);
    }

    this.loading = true;
    const request$: Observable<any> = this.isEdit && this.postId
      ? this.blogService.update(this.postId, formData)
      : this.blogService.create(formData);

    request$.subscribe({
      next: () => this.router.navigate(['/blog']),
      error: (err: any) => {
        console.error('Save failed', err);
        this.errorMessage = 'Save failed. Please try again.';
        this.loading = false;
      }
    });
  }
}
