// src/app/admin/admin-dashboard/admin-dashboard.component.ts
import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

interface UserRole {
  id: string;
  userName: string;
  email: string;
  roles: string[];
}

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  users: UserRole[] = [];

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    // Fetch all users + roles
    this.http.get<UserRole[]>('/api/admin/users')
      .subscribe(data => this.users = data);
  }

  onToggleRole(user: UserRole, role: string, evt: Event): void {
    const checked = (evt.target as HTMLInputElement).checked;
    if (checked) {
      this.http.post(`/api/admin/users/${user.id}/roles`, { role })
        .subscribe(() => user.roles.push(role));
    } else {
      this.http.delete(`/api/admin/users/${user.id}/roles?role=${role}`)
        .subscribe(() => user.roles = user.roles.filter(r => r !== role));
    }
  }
}
