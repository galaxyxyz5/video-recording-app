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
  isScreenRecording = false;
  screenStream: MediaStream | null = null;
  screenRecorder: MediaRecorder | null = null;
  screenRecordingInterval: any;

  isCameraRecording = false;
  cameraStream: MediaStream | null = null;
  cameraRecorder: MediaRecorder | null = null;
  cameraRecordingInterval: any;

  sessionId: string;

  constructor(private recordingService: RecordingService) {
    this.sessionId = new Date().getTime().toString();
  }

  ngOnInit(): void {}

  async startScreenRecording(): Promise<void> {
    try {
      this.screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
      });
      
      this.screenRecorder = new MediaRecorder(this.screenStream, {
        mimeType: environment.recordingSettings.mimeType,
        videoBitsPerSecond: environment.recordingSettings.videoBitsPerSecond
      });

      this.isScreenRecording = true;
      this.recordScreenInChunks();

    } catch (err) {
      console.error('Error starting recording:', err);
    }
  }

  async startCameraRecording(): Promise<void> {
    try {
      this.cameraStream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });
      
      this.cameraRecorder = new MediaRecorder(this.cameraStream, {
        mimeType: environment.recordingSettings.mimeType,
        videoBitsPerSecond: environment.recordingSettings.videoBitsPerSecond
      });

      this.isCameraRecording = true;
      this.recordCameraInChunks();

    } catch (error) {
      console.error('Error starting camera recording:', error);
    }
  }

  private recordScreenInChunks(): void {
    if (!this.screenRecorder) return;

    this.screenRecordingInterval = setInterval(() => {
      if (this.screenRecorder?.state === 'recording') {
        this.screenRecorder.stop();
      }

      this.screenRecorder?.start();
      
      this.screenRecorder!.ondataavailable = async (event) => {
        if (event.data.size > 0) {
          await this.uploadChunk(event.data, 'screen');
        }
      };
    }, environment.recordingSettings.chunkDuration);
  }

  private recordCameraInChunks(): void {
    if (!this.cameraRecorder) return;

    this.cameraRecordingInterval = setInterval(() => {
      if (this.cameraRecorder?.state === 'recording') {
        this.cameraRecorder.stop();
      }

      this.cameraRecorder?.start();
      
      this.cameraRecorder!.ondataavailable = async (event) => {
        if (event.data.size > 0) {
          await this.uploadChunk(event.data, 'camera');
        }
      };
    }, environment.recordingSettings.chunkDuration);
  }

  private async uploadChunk(chunk: Blob, target: string): Promise<void> {
    try {
      await this.recordingService.uploadChunk(chunk, target, this.sessionId).toPromise();
    } catch (error) {
      console.error('Error uploading chunk:', error);
    }
  }

  stopScreenRecording(): void {
    if (this.screenRecorder && this.screenStream) {
      clearInterval(this.screenRecordingInterval);
      this.screenRecorder.stop();
      this.screenStream.getTracks().forEach(track => track.stop());
      this.isScreenRecording = false;

      this.recordingService.finalizeRecording('screen', this.sessionId).subscribe(
        response => console.log('Screen Recording finalized', response),
        error => console.error('Error finalizing screen recording', error)
      );
    }
  }

  stopCameraRecording(): void {
    if (this.cameraRecorder && this.cameraStream) {
      this.cameraRecorder.stop();
      this.cameraStream.getTracks().forEach(track => track.stop());
      this.isCameraRecording = false;

      this.recordingService.finalizeRecording('camera', this.sessionId).subscribe(
        response => console.log('Camera recording finalized', response),
        error => console.error('Error finalizing camera recording', error)
      );
    }
  }

  ngOnDestroy(): void {
    this.stopScreenRecording();
    this.stopCameraRecording();
  }
}