import { NextResponse } from 'next/server';

export async function GET() {
  const html = `
<!DOCTYPE html>
<html>
<head>
    <title>Test Institutions Fetch</title>
    <meta charset="UTF-8">
</head>
<body>
    <h1>Test Institutions Fetch</h1>
    <div id="result">Loading...</div>

    <script>
        fetch('http://localhost:3000/api/content/institutions')
            .then(response => response.json())
            .then(data => {
                document.getElementById('result').innerHTML = '<pre>' + JSON.stringify(data, null, 2) + '</pre>';
            })
            .catch(error => {
                document.getElementById('result').innerHTML = '<p>Error: ' + error + '</p>';
            });
    </script>
</body>
</html>
  `;
  
  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
    },
  });
}