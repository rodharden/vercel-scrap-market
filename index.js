const puppeteer = require("puppeteer");
const express = require('express')
const scrap = require('./scrape')
const path = require('path')
const PORT = process.env.PORT || 5000
const app = express()

express()
  .use(express.static(path.join(__dirname, 'public')))
  .get('/', async (req, res) => {

    try {
      const maxItens = 100
      const market = req.query.market
      const searchTerm = req.query.search
      if (market === undefined) res.send({ "error": "no market(s) found" })
      else if (searchTerm === undefined) res.send({ "error": "no searchTerm(s) found" })
      else {
        const result = await scrap.runStealth(market, searchTerm, maxItens)
        res.send(result)
      }
    }
    catch (e) {
      // catch errors and send error status
      console.log(e);
      res.sendStatus(500);
    }
  })
  .listen(PORT, () => console.log(`Listening on ${PORT}`))