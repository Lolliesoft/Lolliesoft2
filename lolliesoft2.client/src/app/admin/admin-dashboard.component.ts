// src/app/admin/admin-dashboard.component.ts
@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
})
export class AdminDashboardComponent implements OnInit {
  users: { id: string; userName: string; roles: string[] }[] = [];

  constructor(private http: HttpClient) { }

  ngOnInit() {
    this.fetchUsers();
  }

  fetchUsers() {
    this.http.get<any[]>('/api/admin/users').subscribe(list => {
      this.users = list;
    });
  }

  toggleRole(userId: string, role: string, assigned: boolean) {
    const url = `/api/admin/users/${userId}/roles`;
    const method$ = assigned
      ? this.http.post(url, { role })
      : this.http.delete(url, { body: { role } });
    method$.subscribe(() => this.fetchUsers());
  }
}
