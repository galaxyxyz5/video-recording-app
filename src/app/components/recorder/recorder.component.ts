import { Component, OnInit, OnDestroy } from '@angular/core';
import { RecordingService } from '../../services/recording.service';
import { environment } from '../../../environments/environment';

@Component({
  standalone: true,
  selector: 'app-recorder',
  templateUrl: './recorder.component.html',
  styleUrls: ['./recorder.component.css'],
})
export class RecorderComponent implements OnInit, OnDestroy {
  isRecording = false;
  stream: MediaStream | null = null;
  mediaRecorder: MediaRecorder | null = null;
  recordingInterval: any;
  sessionId: string;

  constructor(private recordingService: RecordingService) {
    this.sessionId = new Date().getTime().toString();
  }

  ngOnInit(): void {}

  async startRecording(): Promise<void> {
    try {
      this.stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
      });
      
      this.mediaRecorder = new MediaRecorder(this.stream, {
        mimeType: environment.recordingSettings.mimeType,
        videoBitsPerSecond: environment.recordingSettings.videoBitsPerSecond
      });

      this.isRecording = true;
      this.recordInChunks();

    } catch (err) {
      console.error('Error starting recording:', err);
    }
  }

  private recordInChunks(): void {
    if (!this.mediaRecorder) return;

    this.recordingInterval = setInterval(() => {
      if (this.mediaRecorder?.state === 'recording') {
        this.mediaRecorder.stop();
      }

      this.mediaRecorder?.start();
      
      this.mediaRecorder!.ondataavailable = async (event) => {
        if (event.data.size > 0) {
          await this.uploadChunk(event.data);
        }
      };
    }, environment.recordingSettings.chunkDuration);
  }

  private async uploadChunk(chunk: Blob): Promise<void> {
    try {
      await this.recordingService.uploadChunk(chunk, this.sessionId).toPromise();
    } catch (error) {
      console.error('Error uploading chunk:', error);
    }
  }

  stopRecording(): void {
    if (this.mediaRecorder && this.stream) {
      clearInterval(this.recordingInterval);
      this.mediaRecorder.stop();
      this.stream.getTracks().forEach(track => track.stop());
      this.isRecording = false;

      this.recordingService.finalizeRecording(this.sessionId).subscribe(
        response => console.log('Recording finalized', response),
        error => console.error('Error finalizing recording', error)
      );
    }
  }

  ngOnDestroy(): void {
    this.stopRecording();
  }
}