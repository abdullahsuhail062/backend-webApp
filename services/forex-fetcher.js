import {axios} from 'axios';
import {cron} from  'node-cron';

async function fetchForexNews() {
  try {
    // Note: Some sites require a User-Agent header to allow scraping
    const response = await axios.get(process.env.FOREX_FACTORY_URL, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching news:", error.message);
    return []; // Return empty array so AI doesn't crash
  }
}

module.exports = { fetchForexNews };

const axios = require('axios');

const FINNHUB_KEY = 'd7plc8hr01qosaap1t70d7plc8hr01qosaap1t7g';

export const fetchNewData= async () => {
    try {
        const response = await axios.get('https://finnhub.io/api/v1/news?category=forex&token=d7plc8hr01qosaap1t70d7plc8hr01qosaap1t7g');
        return await response.json()
        const articles = response.data; // Returns an array of news objects

        articles.slice(0, 5).forEach(news => {
            console.log(`--- ${news.datetime} ---`);
            console.log(`Headline: ${news.headline}`);
            console.log(`Summary: ${news.summary}`);
            console.log(`Source: ${news.source}`);
            console.log(`URL: ${news.url}\n`);
        });
    } catch (error) {
        console.error('Error fetching Finnhub news:', error.message);
    }
}

  export default getForexNews();
