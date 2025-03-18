export const environment = {
    production: true,
    apiUrl: 'https://f695e417-0d4c-4a21-8e53-40aada196baf.us-east-1.cloud.genez.io/api',
    recordingSettings: {
      chunkDuration: 5000, // 5 seconds in milliseconds
      mimeType: 'video/webm;codecs=vp8',
      videoBitsPerSecond: 2500000 // 2.5 Mbps
    }
};
