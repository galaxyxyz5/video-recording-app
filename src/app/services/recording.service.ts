import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})

export class RecordingService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  uploadChunk(videoBlob: Blob, target: string, sessionId: string): Observable<any> {
    const formData = new FormData();
    formData.append('video', videoBlob, 'chunk.webm');
    return this.http.post(`${this.apiUrl}/recordings/${target}/chunk/${sessionId}`, formData);
  }

  finalizeRecording(target: string, sessionId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/recordings/${target}/finalize`, { sessionId });
  }
}