import { Component } from '@angular/core';
import { RecorderComponent } from './components/recorder/recorder.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RecorderComponent],
  template: '<app-recorder></app-recorder>'
})

export class AppComponent {
  title = 'Video Recorder';
}