import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WindowStateService {
  private apiUrl = 'https://localhost:7158/api/windowstates';

  constructor(private http: HttpClient) {}

  getWindowStates(crearSiNoExiste: boolean = false): Observable<any[]> {
    const url = crearSiNoExiste 
      ? `${this.apiUrl}?crearSiNoExiste=true` 
      : this.apiUrl;

    return this.http.get<any[]>(url);
  }
}
