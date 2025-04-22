import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { NotificationService } from './notification.service';

@Injectable({
  providedIn: 'root'
})
export class SignalrService {
  private hubConnection: signalR.HubConnection | undefined;

  constructor(private notifier: NotificationService) { }

  public startConnection(): void {
    const token = localStorage.getItem('token');

    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl('https://localhost:7158/hubs/control', {
        accessTokenFactory: () => token || ''
      })
      .withAutomaticReconnect({
        nextRetryDelayInMilliseconds: (retryContext) => {
          console.warn(`⏳ Intento de reconexión #${retryContext.previousRetryCount + 1}...`);
          return 2000; // 2 seg
        }
      })
      .build();

    this.hubConnection
      .start()
      .then(() => {
        console.log('✅ Conexión SignalR establecida');
        this.notifier.info('Conexión establecida con el servidor.');
      })
      .catch(err => console.error('❌ Error en la conexión SignalR: ', err));

    //identifico una desconexión
    this.hubConnection.onclose(error => {
      console.error('🔌 Conexión SignalR cerrada inesperadamente:', error);
    });

    //reconexión exitosa
    this.hubConnection.onreconnected(connectionId => {
      console.log('🔄 Reconectado exitosamente. ID conexión:', connectionId);
    });

    //intento de reconexión reconectarse pero aún no pudo
    this.hubConnection.onreconnecting(error => {
      console.warn('♻️ Intentando reconectar SignalR...', error);
    });
  }

  public onActualizarPosicion(callback: (ventanaId: string, x: number, y: number) => void): void {
    if (this.hubConnection) {
      this.hubConnection.on('ActualizarPosicion', callback);
    }
  }

  public onActualizarTamaño(callback: (ventanaId: string, width: number, height: number) => void): void {
    if (this.hubConnection) {
      this.hubConnection.on('ActualizarTamaño', callback);
    }
  }

  public cerrarVentana(ventanaId: string): void {
    if (this.hubConnection) {
      this.hubConnection.invoke('Cerrar', ventanaId)
        .catch(err => console.error('❌ Error al cerrar ventana:', err));
    }
}

  public enviarPosicion(ventanaId: string, x: number, y: number): void {
    if (this.hubConnection) {
      this.hubConnection.invoke('EnviarPosicion', ventanaId, x, y)
        .catch(err => console.error('Error al enviar posición:', err));
    }
  }

  public enviarTamaño(ventanaId: string, width: number, height: number): void {
    if (this.hubConnection) {
      this.hubConnection.invoke('Redimensionar', ventanaId, width, height)
        .catch(err => console.error('Error al enviar tamaño:', err));
    }
  }

  public onCerrarVentana(callback: (ventanaId: string) => void): void {
    if (this.hubConnection) {
      this.hubConnection.on('CerrarVentana', callback);
    }
  }
}
