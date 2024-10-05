
import puppeteer from 'puppeteer';
import stringSimilarity from 'string-similarity';
// import chromium from 'chrome-aws-lambda';


const proxyUsername = process.env.PROXY_USERNAME;
const proxyPassword = process.env.PROXY_PASSWORD;
const proxyHost = 'us.smartproxy.com';
const proxyPort = 10000;

async function scrapeGoogleShopping(brand, title, maxRetries=2) {
  const query = encodeURIComponent(`${brand} ${title}`);
  const url = `https://www.google.com/search?tbm=shop&q=${query}`;

for (let attempt = 1; attempt <= maxRetries; attempt++) {
  const browser = await puppeteer.launch({
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      // '--disable-accelerated-2d-canvas',
      '--disable-gpu',
      `--proxy-server=http://${proxyHost}:${proxyPort}`,
    ],
    headless: true,
    timeout: 60000, // You can set this to false to see the browser in action (useful for debugging)
  });

  const page = await browser.newPage();

  await page.setExtraHTTPHeaders({
    referer: 'https://www.google.com', // Set your desired referrer
  });

  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');

  await page.authenticate({
    username: proxyUsername,
    password: proxyPassword,
  });

  // await page.deleteCookie(...(await page.cookies()));
  // const client = await page.target().createCDPSession();
  // await client.send('Network.clearBrowserCookies');
  // await client.send('Network.clearBrowserCache');

//   await page.setGeolocation({ latitude: 37.7749, longitude: -122.4194, accuracy: 100 });

  // await page.emulate({
  //   viewport: {
  //     width: 1280,
  //     height: 800,
  //   }
  // });

  // await page.setExtraHTTPHeaders({
  //   'Accept-Language': 'en-US,en;q=0.9',
  // });
  
  try {
  // Navigate to the URL
  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
  await delay(2000); // Wait for 2 seconds

  await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000});

  // await page.waitForTimeout(getRandomDelay(2000,6000)); // Wait for 3 seconds

  await page.waitForSelector('g-inner-card', 30000);

  // page.setDefaultTimeout(30000);

  await page.evaluate(() => window.scrollBy(0, window.innerHeight));


const products = await page.evaluate(() => {
    const results = [];
    const seenProducts = new Set();
  
    // Select all div elements that contain a <ul> and a '$' sign, and are not inside a g-scrolling-carousel
    const productContainers = Array.from(document.querySelectorAll('div'))
      .filter(div => {
        // Ignore divs inside g-scrolling-carousel
        if (div.closest('g-scrolling-carousel')) {
          return false;
        }
  
        // // Check if div contains a <ul>
        // const hasUL = div.querySelector('ul') !== null;
  
        // Check if div's text content contains a '$' sign
        const containsDollarSign = div.textContent.includes('$');
  
        // return hasUL && containsDollarSign;
        return containsDollarSign;
      });
  
    // Iterate over the filtered product containers
    for (const container of productContainers) {
      // Find the product cards within the container
      const productCards = container.querySelectorAll('g-inner-card');
  
      for (const card of productCards) {
        // Extract product information
        const productNameElement = card.querySelector('[style*="-webkit-line-clamp"]');
        const productName = productNameElement ? productNameElement.textContent.trim() : 'N/A';
  
        // Skip duplicate products
        if (seenProducts.has(productName)) {
          continue;
        }
        seenProducts.add(productName);
  
        // Get the price
        // const priceElement = card.querySelector('span[aria-label*="Current price"]');
        // // , .a8Pemb
        // const price = priceElement ? priceElement.textContent.trim() : 'N/A';

        let price = 'N/A'; // Default value

    // Get all text nodes within the card
    const walker = document.createTreeWalker(
    card,
    NodeFilter.SHOW_TEXT,
    {
        acceptNode: (node) => {
        if (node.textContent.includes('$')) {
            return NodeFilter.FILTER_ACCEPT;
        }
         return NodeFilter.FILTER_SKIP;
        },
    },
    false
    );

    let node;
    while ((node = walker.nextNode())) {
    price = node.textContent.trim();
    break; // Stop after finding the first match
    }
  
        // Get other details
        const imageUrl = card.querySelector('img')?.src || '';
        const sellerNameElement = card.querySelector('.WJMUdc.rw5ecc');
        const sellerName = sellerNameElement ? sellerNameElement.textContent.trim() : 'N/A';

        if (/amazon/i.test(sellerName)) {
            continue;
          }
        
          if (productName === 'N/A' || price === 'N/A' || sellerName === 'N/A') {
            continue;
          }


        // const productLink = card.querySelector('a')?.href || '#';
        const productLinkElement = card.querySelector('a[href]');
        const productLink = productLinkElement ? productLinkElement.href : '#';

        results.push({
          productName,
          price,
          imageUrl,
          sellerName,
          productLink,
        });
  
        // Limit to 3 products
        if (results.length >= 3) break;
      }
  
      // Stop if we have collected 3 products
      if (results.length >= 3) break;
    }
  
    return results;

  });

  // Compute similarity scores
    const productsWithSimilarity = products.map((product) => {
      const similarity = stringSimilarity.compareTwoStrings(
        title.toLowerCase(),
        product.productName.toLowerCase()
      );
      return { ...product, similarity };
    });

    // Sort products by similarity in descending order
    productsWithSimilarity.sort((a, b) => b.similarity - a.similarity);

    // const similarProducts = productsWithSimilarity.filter(
    //   (product) => product.similarity > 0.5
    // );

//     let isADeal = false;

// if (similarProducts.length > 0) {
//   // Extract prices from similar products
//   const googlePrices = similarProducts
//     .map((product) => {
//       const priceStr = product.price.replace(/[^0-9.]/g, '');
//       return parseFloat(priceStr);
//     })
//     .filter((price) => !isNaN(price));

//   const amazonPrice = item.Price;

//   // Check if Amazon price is less than all Google prices
//   if (googlePrices.length > 0) {
//     isADeal = googlePrices.every((price) => amazonPrice < price);
//   }
// }

// Check if products are found
if (productsWithSimilarity.length === 0) {
  console.warn(`No products found. Retry attempt ${attempt} for "${brand} ${title}".`);
  await browser.close();
  if (attempt === maxRetries) {
    console.error(`Max retries reached for "${brand} ${title}". Returning empty results.`);
    return [];
  }
  // Wait before retrying
  await new Promise((resolve) => setTimeout(resolve, 5000));
  continue;
}

console.log(`Scraped products for "${brand} ${title}":`, productsWithSimilarity);
await browser.close();
return productsWithSimilarity;
} catch (error) {
await browser.close();
console.error(`Error during scraping attempt ${attempt} for "${brand} ${title}":`, error);
if (attempt === maxRetries) {
  console.error(`Max retries reached for "${brand} ${title}". Returning empty results.`);
  return [];
}
// Wait before retrying
await new Promise((resolve) => setTimeout(resolve, 5000));
}
}
}


module.exports = scrapeGoogleShopping;