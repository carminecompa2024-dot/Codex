const fs = require('fs')
const http = require('http')
const path = require('path')
const { parse } = require('url')
const foods = require('./data/foods.json')

const port = process.env.PORT || 3000
const stylesPath = path.join(__dirname, 'public', 'styles.css')

const foodsByCity = foods.reduce((map, entry) => {
  map.set(entry.city.toLowerCase(), entry)
  return map
}, new Map())

const defaultFood = {
  food: 'Pizza Margherita',
  description: 'A classic Italian pizza with tomato, mozzarella, and basil.',
  image: 'https://upload.wikimedia.org/wikipedia/commons/4/4b/Pizza_Margherita_stu_spivack.jpg'
}

const sampleCities = ['Rome', 'Milan', 'Naples', 'Florence', 'Palermo']

const parseCities = (rawInput) => {
  if (!rawInput) {
    return []
  }

  return rawInput
    .split(/\n|,/)
    .map((entry) => entry.trim())
    .filter(Boolean)
}

const buildResults = (cities) => cities.map((city) => {
  const match = foodsByCity.get(city.toLowerCase())
  if (match) {
    return {
      city,
      food: match.food,
      description: match.description,
      image: match.image
    }
  }

  return {
    city,
    food: defaultFood.food,
    description: defaultFood.description,
    image: defaultFood.image
  }
})

const renderPage = (cityInput) => {
  const cities = parseCities(cityInput)
  const results = buildResults(cities.length ? cities : sampleCities)
  const listValue = cityInput || sampleCities.join('\n')

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Italian City Food Guide</title>
  <link rel="stylesheet" href="/public/styles.css">
</head>
<body>
  <main class="page">
    <header>
      <h1>Italian City Food Guide</h1>
      <p>Enter Italian cities to discover a typical dish for each one. Unknown cities still get a beloved Italian classic.</p>
    </header>

    <form class="city-form" method="get" action="/">
      <label for="cities">Cities (one per line or comma-separated)</label>
      <textarea id="cities" name="cities" rows="6">${listValue}</textarea>
      <button type="submit">Show foods</button>
    </form>

    <section class="results">
      ${results.map((result) => `
        <article class="card">
          <img src="${result.image}" alt="${result.food}">
          <div class="card-body">
            <h2>${result.city}</h2>
            <h3>${result.food}</h3>
            <p>${result.description}</p>
          </div>
        </article>
      `).join('')}
    </section>
  </main>
</body>
</html>`
}

const server = http.createServer((req, res) => {
  const { pathname, query } = parse(req.url, true)

  if (pathname === '/public/styles.css') {
    res.writeHead(200, { 'Content-Type': 'text/css' })
    res.end(fs.readFileSync(stylesPath))
    return
  }

  if (pathname === '/') {
    const html = renderPage(query.cities)
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
    res.end(html)
    return
  }

  res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' })
  res.end('Not found')
})

server.listen(port, () => {
  console.log(`Italian food guide running on http://localhost:${port}`)
})
