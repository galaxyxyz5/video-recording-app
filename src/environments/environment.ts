export const environment = {
    production: false,
    apiUrl: 'http://localhost:3000/api',
    recordingSettings: {
      chunkDuration: 5000, // 5 seconds in milliseconds
      mimeType: 'video/webm;codecs=vp8',
      videoBitsPerSecond: 2500000 // 2.5 Mbps
    }
};