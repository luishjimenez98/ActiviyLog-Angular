import { Component,OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { JoinProject } from '../../services/join-project';

@Component({
  selector: 'app-join-project',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './join-project.html',
})
export class JoinProjectComponent {
  private joinProjectService = inject(JoinProject);
  private router = inject(Router);


  // Navegación del Header
  navigate(route: string) {
    this.router.navigate([route]);
  }

  handleLogout() {
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }
}
