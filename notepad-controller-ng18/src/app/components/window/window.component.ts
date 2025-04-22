import { Component, ElementRef, EventEmitter, Output, Renderer2, Input, AfterViewInit, ViewChild } from '@angular/core';
import { CdkDragEnd } from '@angular/cdk/drag-drop';
import { SignalrService } from '../../services/signalr.service';
import { CdkDrag } from '@angular/cdk/drag-drop';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-window',
  templateUrl: './window.component.html',
  styleUrls: ['./window.component.scss']
})
export class WindowComponent implements AfterViewInit {
  @Output() closed = new EventEmitter<void>();
  @Input() ventanaId: string = '';
  @Input() initialX: number = 0;
  @Input() initialY: number = 0;
  @Input() initialWidth: number = 300;
  @Input() initialHeight: number = 200;
  @Input() allWindows: any[] = [];
  @ViewChild(CdkDrag, { static: false }) drag!: CdkDrag;
  @Input() updatePositionFn!: (ventanaId: string, x: number, y: number) => void;
  @Input() updateSizeFn!: (ventanaId: string, width: number, height: number) => void;
 

  private resizing = false;
  visible: boolean = true;
  public currentX: number = 0;
  public currentY: number = 0;
  private prevX: number = 0;
  private prevY: number = 0;
  
  constructor(private signalRService: SignalrService, private el: ElementRef, 
              private renderer: Renderer2,
              private notifier: NotificationService
  ) {}

  ngOnInit(): void {
    this.currentX = this.initialX;
    this.currentY = this.initialY;
  }

  ngAfterViewInit(): void {
    const container = this.el.nativeElement.querySelector('.window-container') as HTMLElement;
    if (container) {
      this.renderer.setStyle(container, 'width', `${this.initialWidth}px`);
      this.renderer.setStyle(container, 'height', `${this.initialHeight}px`);
    }
  }

  onClose() {
    const ventanaId = this.ventanaId;
    this.signalRService.cerrarVentana(ventanaId);  
    this.notifier.info('Ventana cerrada.');
    this.closed.emit();
  }

  onDragStarted(): void {
    this.prevX = this.currentX;
    this.prevY = this.currentY;
  }

  onDragEnded(event: CdkDragEnd) {
    const position = event.source.getFreeDragPosition();
    let x = Math.round(position.x);
    let y = Math.round(position.y);
  
    x = Math.max(0, x);
    y = Math.max(0, y);
  
    const container = this.el.nativeElement.querySelector('.window-container') as HTMLElement;
    const width = container.offsetWidth;
    const height = container.offsetHeight;
  
    if (this.isOverlapping(x, y, width, height)) {
      console.log('❌ Movimiento cancelado por superposición.');
  
      // Volver a la posición anterior
      this.currentX = this.prevX;
      this.currentY = this.prevY;
  
      if (this.drag) {
        this.drag._dragRef.setFreeDragPosition({ x: this.prevX, y: this.prevY });
      }

      return;
    }
  
    console.log(`🛸 Ventana movida a: X=${x}, Y=${y}`);
  
    const ventanaId = this.ventanaId;
    this.signalRService.enviarPosicion(ventanaId, x, y);
    this.updatePositionFn(this.ventanaId, x, y);

    // Actualizamos las posiciones
    this.prevX = x;
    this.prevY = y;
    this.currentX = x;
    this.currentY = y;
  }

  onResizeStart(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();

    this.resizing = true;

    const startX = event.clientX;
    const startY = event.clientY;

    const container = this.el.nativeElement.querySelector('.window-container') as HTMLElement;
    const initialWidth = container.offsetWidth;
    const initialHeight = container.offsetHeight;

    const moveHandler = (moveEvent: MouseEvent) => {
      if (!this.resizing) return;

      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;

      // Solo cambia el tamaño, no la posición
      const newWidth = initialWidth + deltaX;
      const newHeight = initialHeight + deltaY;

      this.renderer.setStyle(container, 'width', `${newWidth}px`);
      this.renderer.setStyle(container, 'height', `${newHeight}px`);
    };

    const upHandler = () => {
      if (this.resizing) {
        this.resizing = false;

        const finalWidth = Math.round(container.offsetWidth);
        const finalHeight = Math.round(container.offsetHeight);

        console.log(`📐 Ventana redimensionada a: Width=${finalWidth}, Height=${finalHeight}`);

        const ventanaId = this.ventanaId;
        this.signalRService.enviarTamaño(ventanaId, finalWidth, finalHeight);
        this.updateSizeFn(this.ventanaId, finalWidth, finalHeight);
      }

      document.removeEventListener('mousemove', moveHandler);
      document.removeEventListener('mouseup', upHandler);
    };

    document.addEventListener('mousemove', moveHandler);
    document.addEventListener('mouseup', upHandler);
  }

  private isOverlapping(x: number, y: number, width: number, height: number): boolean {
    for (const other of this.allWindows) {
      if (other.ventanaId === this.ventanaId) continue; // No compararse consigo mismo

      const otherLeft = other.x;
      const otherTop = other.y;
      const otherRight = other.x + other.width;
      const otherBottom = other.y + other.height;

      const thisLeft = x;
      const thisTop = y;
      const thisRight = x + width;
      const thisBottom = y + height;

      const overlap = !(thisRight <= otherLeft || 
                        thisLeft >= otherRight || 
                        thisBottom <= otherTop || 
                        thisTop >= otherBottom);

      if (overlap) {
        return true;
      }
    }
    return false;
  }
}
