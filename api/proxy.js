export default async function handler(req, res) {
  const streamUrl = 'http://167.71.103.22:8000/stream.mp3';

  const response = await fetch(streamUrl);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'audio/mpeg');
  response.body.pipe(res);
}
