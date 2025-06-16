// src/app/blog/blog-editor/blog-editor.component.ts

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BlogService } from '../../services/blog.service';
import { BlogPost } from '../blog-post.model';

@Component({
  selector: 'app-blog-editor',
  templateUrl: './blog-editor.component.html',
  styleUrls: ['./blog-editor.component.css']
})
export class BlogEditorComponent implements OnInit {
  public blogForm!: FormGroup;

  public editorInit: any = {
    license_key: 'gpl',
    base_url: '/assets/tinymce',
    suffix: '.min',
    height: 300,
    plugins: [
      'advlist', 'autolink', 'lists', 'link', 'image',
      'charmap', 'preview', 'anchor', 'searchreplace',
      'visualblocks', 'code', 'fullscreen',
      'insertdatetime', 'media', 'table', 'paste',
      'help', 'wordcount'
    ],
    toolbar: [
      'undo redo',
      'formatselect',
      'bold italic backcolor',
      'alignleft aligncenter alignright alignjustify',
      'bullist numlist outdent indent',
      'removeformat',
      'image',
      'help'
    ].join(' | '),
    images_upload_handler: (blobInfo: any, progress: (pct: number) => void) => {
      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onprogress = evt => {
          if (evt.lengthComputable) {
            progress(Math.round((evt.loaded / evt.total) * 100));
          }
        };
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject('Failed to read file');
        reader.readAsDataURL(blobInfo.blob());
      });
    }
  };

  postId?: number;
  isEdit = false;
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
      content: ['', Validators.required],
      isPrivate: [false],
      image: [null]
    });

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.isEdit = true;
      this.postId = +idParam;
      this.blogService.get(this.postId).subscribe({
        next: post => {
          this.blogForm.patchValue({
            title: post.title,
            content: post.content,
            isPrivate: post.isPrivate
          });
        },
        error: err => {
          console.error('Failed to load post', err);
          this.errorMessage = 'Failed to load post.';
        }
      });
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.blogForm.patchValue({ image: input.files[0] });
    }
  }

  onSubmit(): void {
    if (this.blogForm.invalid) {
      return;
    }

    const formData = new FormData();
    formData.append('Title', this.blogForm.value.title);
    formData.append('Content', this.blogForm.value.content);
    formData.append('IsPrivate', this.blogForm.value.isPrivate.toString());
    if (this.blogForm.value.image) {
      formData.append('Image', this.blogForm.value.image);
    }

    this.loading = true;

    if (this.isEdit && this.postId) {
      // —— UPDATE (void) —— 
      this.blogService.update(this.postId, formData).subscribe({
        next: () => {
          this.loading = false;
          this.router.navigate(['/blog', this.postId]);
        },
        error: (err) => {
          console.error('Update failed', err);
          this.errorMessage = 'Update failed. Please try again.';
          this.loading = false;
        }
      });
    } else {
      // —— CREATE (BlogPost) ——
      this.blogService.create(formData).subscribe({
        next: (newPost: BlogPost) => {
          this.loading = false;
          this.router.navigate(['/blog', newPost.id]);
        },
        error: (err) => {
          console.error('Create failed', err);
          this.errorMessage = 'Create failed. Please try again.';
          this.loading = false;
        }
      });
    }
  }
}
