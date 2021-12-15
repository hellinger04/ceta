var flag_show_quiz_times = true;

async function get_video(CETA_Card) {
  console.log(`get_video(${CETA_Card})`);
  const VideoFile = VideoFiles.find(VideoFile => (VideoFile[0]==CETA_Card));
  console.log('VideoFile',VideoFile);
  const file = VideoFile[1];
  const blob = {
    type: 'video/mp4'
  }
  video_entry = {
    name: CETA_Card,
    blob: blob,
    file: file
  };
  console.log('get_video(${CETA_Card}) > video_entry',video_entry);
  return video_entry;
}
