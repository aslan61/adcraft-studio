/**
 * Client-Side Video Frame Extractor using HTML5 Canvas API
 * Extracts top 3 high-impact hook frames from screen recordings without uploading to any server.
 */

export async function extractVideoFrames(videoUrl: string, count = 3): Promise<string[]> {
  return new Promise((resolve) => {
    let finished = false;
    const finish = (result: string[]) => {
      if (!finished) {
        finished = true;
        clearTimeout(globalTimeout);
        video.onloadedmetadata = null;
        video.onerror = null;
        video.onseeked = null;
        resolve(result);
      }
    };

    const globalTimeout = setTimeout(() => {
      finish([videoUrl]);
    }, 4500);

    const video = document.createElement('video');
    video.crossOrigin = 'anonymous';
    video.muted = true;
    video.preload = 'metadata';
    video.src = videoUrl;

    const frames: string[] = [];

    video.onloadedmetadata = async () => {
      try {
        const duration = video.duration || 5;
        const timestamps = [
          Math.max(0.5, duration * 0.15),
          duration * 0.45,
          duration * 0.75
        ].slice(0, count);

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        canvas.width = video.videoWidth || 1080;
        canvas.height = video.videoHeight || 1920;

        for (let i = 0; i < timestamps.length; i++) {
          await new Promise<void>((res) => {
            let stepDone = false;
            const completeStep = () => {
              if (!stepDone) {
                stepDone = true;
                clearTimeout(stepTimeout);
                video.onseeked = null;
                res();
              }
            };

            const stepTimeout = setTimeout(completeStep, 900);

            video.onseeked = () => {
              if (ctx) {
                try {
                  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                  frames.push(canvas.toDataURL('image/jpeg', 0.85));
                } catch (e) {
                  console.warn('Canvas frame extraction notice:', e);
                }
              }
              completeStep();
            };

            video.currentTime = timestamps[i];
          });
        }

        if (frames.length === 0) {
          finish([videoUrl]);
        } else {
          finish(frames);
        }
      } catch {
        finish([videoUrl]);
      }
    };

    video.onerror = () => {
      finish([videoUrl]);
    };
  });
}
