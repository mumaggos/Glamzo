const http = require('http');

http.get('http://localhost:3000/', {
    headers: {
        'User-Agent': 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; Googlebot/2.1; +http://www.google.com/bot.html) Chrome/100.0.4896.127 Safari/537.36'
    }
}, (res) => {
    console.log(`Status Code: ${res.statusCode}`);
});
