import { Readable } from 'node:stream'; // <--- THIS LINE IS NEW/CRITICAL

export default async function handler(req, res) {
  const { stream } = req.query;
  const streamUrl = decodeURIComponent(stream);

  if (!streamUrl.startsWith('http://167.71.103.22:8000/')) {
    return res.status(403).send('Forbidden');
  }

  try {
    const response = await fetch(streamUrl);

    // Check if the fetch was successful
    if (!response.ok) {
      return res.status(response.status).send(`Failed to fetch stream: ${response.statusText}`);
    }

    // Convert the WHATWG ReadableStream to a Node.js Readable stream
    const nodeStream = Readable.fromWeb(response.body); // <--- THIS LINE IS NEW/CRITICAL

    res.setHeader('Access-Control-Allow-Origin', '*'); // Allows any domain to access
    res.setHeader('Content-Type', 'audio/mpeg'); // Tells browser it's an MP3

    // Now pipe the Node.js stream to the response
    nodeStream.pipe(res);

    // Handle potential errors on the stream during piping
    nodeStream.on('error', (err) => {
      console.error('Stream error during piping:', err);
      // Only send error if headers haven't been sent, otherwise client might be playing
      if (!res.headersSent) {
        res.status(500).send('Stream proxy error during transfer');
      }
    });

  } catch (error) {
    console.error('Error in stream handler (fetch or initial setup):', error);
    res.status(500).send('Internal Server Error: Could not connect to stream source.');
  }
}
