// import puppeteer from 'puppeteer';
// import stringSimilarity from 'string-similarity';
// // import chromium from 'chrome-aws-lambda';


// const proxyUsername = process.env.PROXY_USERNAME;
// const proxyPassword = process.env.PROXY_PASSWORD;
// const proxyHost = 'us.smartproxy.com';
// const proxyPort = 10000;

// async function scrapeGoogleShopping(brand, title, maxRetries=2) {
//   const query = encodeURIComponent(`${brand} ${title}`);
//   const url = `https://www.google.com/search?tbm=shop&q=${query}`;

// for (let attempt = 1; attempt <= maxRetries; attempt++) {
//   const browser = await puppeteer.launch({
//     args: [
//       '--no-sandbox',
//      '--disable-setuid-sandbox',
//     '--disable-dev-shm-usage',
//     '--disable-gpu',
//     '--disable-extensions',
//     '--disable-infobars',
//     '--disable-notifications',
//     '--disable-popup-blocking',
//       `--proxy-server=http://${proxyHost}:${proxyPort}`,
//     ],
//     headless: true,
//     // timeout: 60000, // You can set this to false to see the browser in action (useful for debugging)
//   });

//   const page = await browser.newPage();

//   await page.setExtraHTTPHeaders({
//     referer: 'https://www.google.com', // Set your desired referrer
//   });

//   await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');

//   await page.authenticate({
//     username: proxyUsername,
//     password: proxyPassword,
//   });

//   await page.setRequestInterception(true);
//             page.on('request', (request) => {
//                 if (request.resourceType() === 'image') {
//                     request.abort();
//                 } else {
//                     request.continue();
//                 }
//             });

//   // await page.deleteCookie(...(await page.cookies()));
//   // const client = await page.target().createCDPSession();
//   // await client.send('Network.clearBrowserCookies');
//   // await client.send('Network.clearBrowserCache');

// //   await page.setGeolocation({ latitude: 37.7749, longitude: -122.4194, accuracy: 100 });

//   // await page.emulate({
//   //   viewport: {
//   //     width: 1280,
//   //     height: 800,
//   //   }
//   // });

//   // await page.setExtraHTTPHeaders({
//   //   'Accept-Language': 'en-US,en;q=0.9',
//   // });
  
//   try {
//   // Navigate to the URL
//   // const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
//   // await delay(2000); // Wait for 2 seconds

//   // await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000});

//   await page.goto(url, { waitUntil: 'networkidle2' });

//   // await page.waitForTimeout(getRandomDelay(2000,6000)); // Wait for 3 seconds

//   await page.waitForSelector('g-inner-card', {timeout: 20000});

//   // page.setDefaultTimeout(30000);

//   await page.evaluate(async () => {
//     await new Promise((resolve) => {
//       let totalHeight = 0;
//       const distance = 100;
//       const timer = setInterval(() => {
//         window.scrollBy(0, distance);
//         totalHeight += distance;
  
//         if (totalHeight >= document.body.scrollHeight) {
//           clearInterval(timer);
//           resolve();
//         }
//       }, 100);
//     });
//   });


// const products = await page.evaluate(() => {
//     const results = [];
//     const seenProducts = new Set();
  
//     // Select all div elements that contain a <ul> and a '$' sign, and are not inside a g-scrolling-carousel
//     const productContainers = Array.from(document.querySelectorAll('div'))
//       .filter(div => {
//         // Ignore divs inside g-scrolling-carousel
//         if (div.closest('g-scrolling-carousel')) {
//           return false;
//         }
  
//         // // Check if div contains a <ul>
//         // const hasUL = div.querySelector('ul') !== null;
  
//         // Check if div's text content contains a '$' sign
//         const containsDollarSign = div.textContent.includes('$');
  
//         // return hasUL && containsDollarSign;
//         return containsDollarSign;
//       });
  
//     // Iterate over the filtered product containers
//     for (const container of productContainers) {
//       // Find the product cards within the container
//       const productCards = container.querySelectorAll('g-inner-card');
  
//       for (const card of productCards) {
//         // Extract product information
//         const productNameElement = card.querySelector('[style*="-webkit-line-clamp"]');
//         const productName = productNameElement ? productNameElement.textContent.trim() : 'N/A';
  
//         // Skip duplicate products
//         if (seenProducts.has(productName)) {
//           continue;
//         }
//         seenProducts.add(productName);
  
//         // Get the price
//         // const priceElement = card.querySelector('span[aria-label*="Current price"]');
//         // // , .a8Pemb
//         // const price = priceElement ? priceElement.textContent.trim() : 'N/A';

//         let price = 'N/A'; // Default value

//     // Get all text nodes within the card
//     const walker = document.createTreeWalker(
//     card,
//     NodeFilter.SHOW_TEXT,
//     {
//         acceptNode: (node) => {
//         if (node.textContent.includes('$')) {
//             return NodeFilter.FILTER_ACCEPT;
//         }
//          return NodeFilter.FILTER_SKIP;
//         },
//     },
//     false
//     );

//     let node;
//     while ((node = walker.nextNode())) {
//     price = node.textContent.trim();
//     break; // Stop after finding the first match
//     }
  
//         // Get other details
//         const imageUrl = card.querySelector('img')?.src || '';
//         const sellerNameElement = card.querySelector('.WJMUdc.rw5ecc');
//         const sellerName = sellerNameElement ? sellerNameElement.textContent.trim() : 'N/A';

//         if (/amazon/i.test(sellerName)) {
//             continue;
//           }
        
//           if (productName === 'N/A' || price === 'N/A' || sellerName === 'N/A') {
//             continue;
//           }


//         // const productLinkElement = card.querySelector('a[href]');
//         // const productLink = productLinkElement ? productLinkElement.href : '#';

//         results.push({
//           productName,
//           price,
//           imageUrl,
//           sellerName,
//           // productLink,
//         });
  
//         // Limit to 3 products
//         if (results.length >= 3) break;
//       }
  
//       // Stop if we have collected 3 products
//       if (results.length >= 3) break;
//     }
  
//     return results;
//   });

//   // Compute similarity scores
//     const productsWithSimilarity = products.map((product) => {
//       const similarity = stringSimilarity.compareTwoStrings(
//         title.toLowerCase(),
//         product.productName.toLowerCase()
//       );
//       return { ...product, similarity };
//     });

//     // Sort products by similarity in descending order
//     productsWithSimilarity.sort((a, b) => b.similarity - a.similarity);

//     // const similarProducts = productsWithSimilarity.filter(
//     //   (product) => product.similarity > 0.5
//     // );

// //     let isADeal = false;

// // if (similarProducts.length > 0) {
// //   // Extract prices from similar products
// //   const googlePrices = similarProducts
// //     .map((product) => {
// //       const priceStr = product.price.replace(/[^0-9.]/g, '');
// //       return parseFloat(priceStr);
// //     })
// //     .filter((price) => !isNaN(price));

// //   const amazonPrice = item.Price;

// //   // Check if Amazon price is less than all Google prices
// //   if (googlePrices.length > 0) {
// //     isADeal = googlePrices.every((price) => amazonPrice < price);
// //   }
// // }

// // Check if products are found
// if (productsWithSimilarity.length === 0) {
//   await browser.close();
//   if (attempt === maxRetries) {
//     return [];
//   }
//   // Wait before retrying
//   const backoff = 1000 * Math.pow(2, attempt);
//   await new Promise((resolve) => setTimeout(resolve, backoff));
//   continue;
// }

// await browser.close();
// return productsWithSimilarity;
// } catch {
// await browser.close();
// if (attempt === maxRetries) {
//   return [];
// }
// // Wait before retrying
// await new Promise((resolve) => setTimeout(resolve, 5000));
// }
// }
// }


// module.exports = scrapeGoogleShopping;

// // import puppeteer from 'puppeteer';
// // import stringSimilarity from 'string-similarity';

// // const proxyUsername = process.env.PROXY_USERNAME;
// // const proxyPassword = process.env.PROXY_PASSWORD;
// // const proxyHost = 'us.smartproxy.com';
// // const proxyPort = 10000;

// // let browser;

// // async function initializeBrowser() {
// //   if (!browser) {
// //     browser = await puppeteer.launch({
// //       headless: true,
// //       args: [
// //         '--no-sandbox',
// //         '--disable-setuid-sandbox',
// //         '--disable-dev-shm-usage',
// //         '--disable-gpu',
// //         `--proxy-server=http://${proxyHost}:${proxyPort}`,
// //       ],
// //       timeout: 60000,
// //     });
// //   }
// // }

// // async function closeBrowser() {
// //   if (browser) {
// //     await browser.close();
// //     browser = null;
// //   }
// // }

// // async function scrapeGoogleShopping(brand, title, maxRetries = 2) {
// //   await initializeBrowser();
// //   const query = encodeURIComponent(`${brand} ${title}`);
// //   const url = `https://www.google.com/search?tbm=shop&q=${query}`;

// //   for (let attempt = 1; attempt <= maxRetries; attempt++) {
// //     try {
// //       const page = await browser.newPage();

// //       await page.setExtraHTTPHeaders({
// //         referer: 'https://www.google.com',
// //       });

// //       await page.setUserAgent(
// //         'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ' +
// //           'AppleWebKit/537.36 (KHTML, like Gecko) ' +
// //           'Chrome/91.0.4472.124 Safari/537.36'
// //       );

// //       await page.authenticate({
// //         username: proxyUsername,
// //         password: proxyPassword,
// //       });

// //       await page.setRequestInterception(true);
// //       page.on('request', (request) => {
// //         if (request.resourceType() === 'image') {
// //           request.abort();
// //         } else {
// //           request.continue();
// //         }
// //       });

// //       await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

// //       await page.waitForSelector('g-inner-card', { timeout: 30000 });

// //       // Incremental Scrolling
// //       await page.evaluate(async () => {
// //         await new Promise((resolve) => {
// //           let totalHeight = 0;
// //           const distance = 100;
// //           const timer = setInterval(() => {
// //             window.scrollBy(0, distance);
// //             totalHeight += distance;

// //             if (totalHeight >= document.body.scrollHeight) {
// //               clearInterval(timer);
// //               resolve();
// //             }
// //           }, 100);
// //         });
// //       });

// //       const products = await page.evaluate(() => {
// //         const results = [];
// //         const seenProducts = new Set();

// //         const productCards = Array.from(document.querySelectorAll('g-inner-card'));

// //         for (const card of productCards) {
// //           const productNameElement = card.querySelector('[style*="-webkit-line-clamp"]');
// //           const productName = productNameElement ? productNameElement.textContent.trim() : 'N/A';

// //           if (seenProducts.has(productName)) continue;
// //           seenProducts.add(productName);

// //           let price = 'N/A';
// //           const walker = document.createTreeWalker(
// //             card,
// //             NodeFilter.SHOW_TEXT,
// //             {
// //               acceptNode: (node) => {
// //                 if (node.textContent.includes('$')) {
// //                   return NodeFilter.FILTER_ACCEPT;
// //                 }
// //                 return NodeFilter.FILTER_SKIP;
// //               },
// //             },
// //             false
// //           );

// //           let node;
// //           while ((node = walker.nextNode())) {
// //             price = node.textContent.trim();
// //             break;
// //           }

// //           const imageUrl = card.querySelector('img')?.src || '';
// //           const sellerNameElement = card.querySelector('.WJMUdc.rw5ecc');
// //           const sellerName = sellerNameElement ? sellerNameElement.textContent.trim() : 'N/A';

// //           if (/amazon/i.test(sellerName)) continue;
// //           if (productName === 'N/A' || price === 'N/A' || sellerName === 'N/A') continue;

// //           const productLinkElement = card.querySelector('a[href]');
// //           const productLink = productLinkElement ? productLinkElement.href : '#';

// //           results.push({
// //             productName,
// //             price,
// //             imageUrl,
// //             sellerName,
// //             productLink,
// //           });

// //           if (results.length >= 3) break;
// //         }

// //         return results;
// //       });

// //       if (products.length === 0) {
// //         throw new Error('No products found');
// //       }

// //       // Compute similarity scores
// //       const productsWithSimilarity = products.map((product) => {
// //         const similarity = stringSimilarity.compareTwoStrings(
// //           title.toLowerCase(),
// //           product.productName.toLowerCase()
// //         );
// //         return { ...product, similarity };
// //       });

// //       // Sort products by similarity in descending order
// //       productsWithSimilarity.sort((a, b) => b.similarity - a.similarity);

// //       await page.close();
// //       return productsWithSimilarity;
// //     } catch (error) {
// //       console.error(`Error scraping Google Shopping for ${title}:`, error.message);
// //       if (attempt === maxRetries) {
// //         return [];
// //       }
// //       // Exponential backoff
// //       const backoff = 1000 * Math.pow(2, attempt);
// //       await new Promise((resolve) => setTimeout(resolve, backoff));
// //     }
// //   }

// //   return [];
// // }

// // async function closeAllBrowsers() {
// //   await closeBrowser();
// // }

// // export default scrapeGoogleShopping;

// src/utils/googleShopping.js
import puppeteer from 'puppeteer';
import stringSimilarity from 'string-similarity';

// Proxy Configuration
const proxyUsername = process.env.PROXY_USERNAME;
const proxyPassword = process.env.PROXY_PASSWORD;
const proxyHost = 'dc.smartproxy.com';
// const proxyPort = 10001;
const proxyList = [];
for(let i=1; i < 100; i++){
    proxyList.push(10000 + 1);
}

/**
 * Shuffle an array using Fisher-Yates algorithm
 * @param {Array} array - The array to shuffle
 * @returns {Array} - Shuffled array
 */
function shuffleArray(array) {
    const arr = array.slice(); // Create a copy
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }


/**
 * Scrape Google Shopping for a given brand and title.
 * @param {string} brand - The brand name.
 * @param {string} title - The product title.
 * @param {number} maxRetries - Maximum number of retries.
 * @returns {Array} - Array of scraped products with similarity scores.
 */
async function scrapeGoogleShopping(brand, title, maxRetries = 1) {

  const query = encodeURIComponent(`${brand} ${title}`);
  const url = `https://www.google.com/search?tbm=shop&q=${query}`;

  const shuffledProxies = shuffleArray(proxyList);


  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    let browser = null;
    const proxyPort = shuffledProxies[attempt - 1] || shuffledProxies[0]; // Fallback to first proxy if attempts exceed proxy list
    try {
  
            browser = await puppeteer.launch({
                headless: true,
                args: [
                  '--no-sandbox',
                  '--disable-setuid-sandbox',
                  '--disable-dev-shm-usage',
                  '--disable-gpu',
                  '--disable-extensions',
                  '--disable-infobars',
                  '--disable-notifications',
                  '--disable-popup-blocking',
                  `--proxy-server=http://${proxyHost}:${proxyPort}`,
                ],
        })
      const page = await browser.newPage();

      // Set HTTP headers
      await page.setExtraHTTPHeaders({
        referer: 'https://www.google.com',
      });

      // Set User-Agent
      const userAgents = [
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Safari/605.1.15',
        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36',
        // Add more user agents as needed
      ];
      const randomUserAgent = userAgents[Math.floor(Math.random() * userAgents.length)];
      await page.setUserAgent(randomUserAgent);


      // Authenticate with proxy
      await page.authenticate({
        username: proxyUsername,
        password: proxyPassword,
      });

      // Intercept requests to block unnecessary resources
      await page.setRequestInterception(true);
      page.on('request', (request) => {
        const blockedResourceTypes = ['image', 'stylesheet', 'font'];
        if (blockedResourceTypes.includes(request.resourceType())) {
          request.abort();
        } else {
          request.continue();
        }
      });

      // Navigate to the URL
      await page.goto(url, { waitUntil: 'networkidle2' });

      // Wait for the product cards to load
      await page.waitForSelector('g-inner-card', { timeout: 30000 });

      // Incremental scrolling to load dynamic content
      await page.evaluate(async () => {
        await new Promise((resolve) => {
          let totalHeight = 0;
          const distance = 50;
          const timer = setInterval(() => {
            window.scrollBy(0, distance);
            totalHeight += distance;

            if (totalHeight >= document.body.scrollHeight) {
              clearInterval(timer);
              resolve();
            }
          }, 100);
        });
      });

      // Extract product data
      const products = await page.evaluate(() => {
        const results = [];
        const seenProducts = new Set();

        const productCards = Array.from(document.querySelectorAll('g-inner-card'));

        for (const card of productCards) {
          const productNameElement = card.querySelector('[style*="-webkit-line-clamp"]');
          const productName = productNameElement ? productNameElement.textContent.trim() : 'N/A';

          if (seenProducts.has(productName)) continue;
          seenProducts.add(productName);

          let price = 'N/A';
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
            break;
          }

          const imageUrl = card.querySelector('img')?.src || '';
          const sellerNameElement = card.querySelector('.WJMUdc.rw5ecc');
          const sellerName = sellerNameElement ? sellerNameElement.textContent.trim() : 'N/A';

          if (/amazon/i.test(sellerName)) continue;
          if (productName === 'N/A' || price === 'N/A' || sellerName === 'N/A') continue;

          const productLinkElement = card.querySelector('a[href]');
          const productLink = productLinkElement ? productLinkElement.href : '#';

          results.push({
            productName,
            price,
            imageUrl,
            sellerName,
            productLink,
          });

          if (results.length >= 3) break;
        }

        return results;
      });

      if (products.length === 0) {
        throw new Error('No products found');
      }

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

      await page.close(); // Close the page to free resources
      await browser.close();
      browser = null;
      return productsWithSimilarity;
    } catch (error) {
      console.error(`Attempt ${attempt} - Error scraping Google Shopping for "${title}":`, error.message);
      if (attempt === maxRetries) {
        console.error(`Max retries reached for "${title}". Returning empty results.`);
        return [];
      }
      // // Exponential backoff before retrying
      // const backoff = 1000 * Math.pow(2, attempt);
      // await new Promise((resolve) => setTimeout(resolve, backoff));
    }
  }

  return [];
}

export default scrapeGoogleShopping;