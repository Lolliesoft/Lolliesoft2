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
  blogForm!: FormGroup;
  isEdit = false;
  postId = 0;
  loading = false;
  errorMessage = '';

  editorInit = {
    menubar: false,
    plugins: ['link', 'lists', 'image', 'fullscreen'],
    toolbar: 'undo redo | bold italic | bullist numlist | link image | fullscreen',
    height: 300
  };

  constructor(
    private fb: FormBuilder,
    private blogService: BlogService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    this.isEdit = !!idParam;
    this.postId = idParam ? +idParam : 0;

    this.blogForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(200)]],
      content: ['', Validators.required],
      isPrivate: [false],
      image: [null]
    });

    if (this.isEdit) {
      this.blogService.getById(this.postId).subscribe(
        (post: BlogPost) => {
          this.blogForm.patchValue({
            title: post.title,
            content: post.content,
            isPrivate: post.isPrivate
          });
        },
        (err: any) => console.error('Failed to load post for editing', err)
      );
    }
  }

  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0] ?? null;
    this.blogForm.get('image')!.setValue(file);
  }

  onSubmit(): void {
    if (this.blogForm.invalid) {
      return;
    }
    this.loading = true;
    this.errorMessage = '';

    const formData = new FormData();
    formData.append('title', this.blogForm.get('title')!.value);
    formData.append('content', this.blogForm.get('content')!.value);
    formData.append('isPrivate', this.blogForm.get('isPrivate')!.value);
    const img = this.blogForm.get('image')!.value;
    if (img) {
      formData.append('image', img);
    }

    // Force all branches into a single Observable<any>
    const request$: Observable<any> = this.isEdit
      ? this.blogService.update(this.postId, formData)
      : this.blogService.create(formData);

    request$.subscribe(
      (res: any) => {
        // create returns the new BlogPost, update returns void
        const newId = this.isEdit
          ? this.postId
          : (res as BlogPost).id;
        this.router.navigate(['/blog', newId]);
      },
      (err: any) => {
        console.error('Save failed', err);
        this.errorMessage = 'Save failed. Please try again.';
        this.loading = false;
      }
    );
  }
}
