export default async function handler(req, res) {
  try {
    res.setHeader('Access-Control-Allow-Origin', 'https://chr1sg1thub.github.io');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    
    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }

    const apiKey = process.env.INTERVALS_API_KEY;
    if (!apiKey) throw new Error('Missing INTERVALS_API_KEY env var');

    const auth = Buffer.from(`API_KEY:${apiKey}`).toString('base64');

    // Build correct Intervals path: /api/intervals?foo → /api/v1/athlete/0/activities?foo
    const url = new URL('https://intervals.icu/api/v1/athlete/0/wellness/');
    
    // Copy query params
    new URLSearchParams(req.url.split('?')[1] || '').forEach((value, key) => {
      url.searchParams.append(key, value);
    });

 //   console.log('Fetching:', url.toString());

    const response = await fetch(url, {
      headers: {
        'Authorization': `Basic ${auth}`,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Intervals ${response.status}: ${errorText.slice(0, 200)}`);
    }

    const data = await response.json();
    res.status(200).json(data);
    
  } catch (error) {
    console.error('Handler error:', error.message);
    res.status(500).json({ error: error.message });
  }
}
