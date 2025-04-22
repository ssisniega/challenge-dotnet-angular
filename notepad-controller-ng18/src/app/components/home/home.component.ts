import { Component, OnInit } from '@angular/core';
import { WindowStateService } from '../../services/window-state.service';
import { SignalrService } from '../../services/signalr.service';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';
import { ToastrService, IndividualConfig } from 'ngx-toastr';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  ventanas: any[] = [];

  constructor(
            private windowStateService: WindowStateService, 
            private signalRService: SignalrService,
            private authService: AuthService,
            private toastr: ToastrService) {}

  ngOnInit(): void {
    this.signalRService.startConnection();
    this.cargarVentanas();

    this.signalRService.onCerrarVentana((ventanaId) => {
      console.log('📦 Evento CerrarVentana recibido:', ventanaId);
      this.ventanas = this.ventanas.filter(v => v.ventanaId !== ventanaId);

      if (this.ventanas.length === 0) {
        this.toastr.warning(
          'Cerró todos sus aplicativos remotos. Por favor, cierre sesión y vuelva a iniciar para crear nuevas instancias.',
          'Información'
        );
      }
    });
  }

  cargarVentanas() {
    const fromLogin = localStorage.getItem('fromLogin') === 'true';
    this.windowStateService.getWindowStates(fromLogin).subscribe({
      next: (ventanas) => {
        this.ventanas = ventanas;
        console.log('🪟 Ventanas cargadas:', ventanas);
        if (ventanas.length === 0) {
          this.toastr.warning(
            'Ya cerró sus aplicativos remotos. Cierre sesión y vuelva a iniciar sesión para tener nuevas conexiones.',
            'Atención',
            { timeOut: 5000 } 
          );
        }
      },
      error: (err) => {
        console.error('Error al cargar ventanas:', err);
      }
    });

    if (fromLogin) 
      localStorage.removeItem('fromLogin');  
  }

  logout() {
    this.authService.logout();
  }

  updateWindowPosition(ventanaId: string, x: number, y: number) {
    const ventana = this.ventanas.find(v => v.ventanaId === ventanaId);
    if (ventana) {
      ventana.x = x;
      ventana.y = y;
    }
  }
  
  updateWindowSize(ventanaId: string, width: number, height: number) {
    const ventana = this.ventanas.find(v => v.ventanaId === ventanaId);
    if (ventana) {
      ventana.width = width;
      ventana.height = height;
    }
  }
}
