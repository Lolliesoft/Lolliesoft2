import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { BlogService } from '../../services/blog.service';
import { BlogPost } from '../blog-post.model';

@Component({
  selector: 'app-blog-editor',
  templateUrl: './blog-editor.component.html',
  styleUrls: ['./blog-editor.component.css']
})
export class BlogEditorComponent implements OnInit {
  // Form group for title, content, isPrivate, and file
  blogForm!: FormGroup;

  // If editing, postId holds the numeric ID. Undefined means “create new.”
  postId?: number;
  isEdit = false;

  // Holds the selected image file (if any)
  imageFile?: File;

  // For UI feedback
  loading = false;
  errorMessage?: string;

  constructor(
    private fb: FormBuilder,
    private blogService: BlogService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    // 1) Build the reactive form
    this.blogForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(200)]],
      content: ['', [Validators.required]],
      isPrivate: [false],      // Example “private” flag
      image: [null]            // For file input (not a form control used on submit)
    });

    // 2) Check route for an “id” parameter to switch into edit mode
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.isEdit = true;
      this.postId = +idParam;
      this.loadPost(this.postId);
    }
  }

  /**
   * If editing, fetch the existing post and patch the form values.
   */
  loadPost(id: number): void {
    this.blogService.get(id).subscribe({
      next: (post: BlogPost) => {
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

  /**
   * Called when the user selects a file. We store it in `imageFile`.
   */
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.imageFile = input.files[0];
    }
  }

  /**
   * On form submit: either create a new post or update an existing one.
   */
  onSubmit(): void {
    if (this.blogForm.invalid) {
      return;
    }

    // Build the FormData payload
    const formData = new FormData();
    formData.append('Title', this.blogForm.get('title')!.value);
    formData.append('Content', this.blogForm.get('content')!.value);
    formData.append('IsPrivate', this.blogForm.get('isPrivate')!.value.toString());

    if (this.imageFile) {
      formData.append('Image', this.imageFile);
    }

    this.loading = true;

    // If isEdit && postId exists, call update; otherwise call create
    const request$: Observable<any> = this.isEdit && this.postId
      ? this.blogService.update(this.postId, formData)
      : this.blogService.create(formData);

    request$.subscribe({
      next: (result: BlogPost) => {
        // On success:
        // • If we created a new post, navigate to its detail page.
        // • If we updated, navigate back to that post’s detail.
        const targetId = this.isEdit && this.postId ? this.postId : (result.id);
        this.router.navigate(['/blog', targetId]);
      },
      error: (err: any) => {
        console.error('Save failed', err);
        this.errorMessage = 'Save failed. Please try again.';
        this.loading = false;
      }
    });
  }
}
