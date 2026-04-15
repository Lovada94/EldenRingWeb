import {Component, inject, OnInit} from '@angular/core';
import {AuthService} from '../../../services/authService';

@Component({
  selector: 'app-profile',
  imports: [],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile implements OnInit {

  private readonly authService: AuthService = inject(AuthService);

  user: any = null;

  ngOnInit(): void {
    this.authService.getProfile().subscribe({
      next: (data: any) => {
        this.user = data.user;
      },
      error: (err: any) => {
        console.error(err);
      }
    })
  }

}
