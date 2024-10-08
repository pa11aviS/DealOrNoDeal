
// import ProductAdvertisingAPIv1 from 'amazon-paapi/SDK/src/index';
// import scrapeGoogleShopping from '../../utils/googleShopping';
// import pLimit from 'p-limit'; // Import p-limit for concurrency control


// var defaultClient = ProductAdvertisingAPIv1.ApiClient.instance;

// defaultClient.accessKey = process.env.AWS_ACCESS_KEY_ID;
// defaultClient.secretKey = process.env.AWS_SECRET_ACCESS_KEY;

// defaultClient.host = 'webservices.amazon.com';
// defaultClient.region = 'us-east-1';

// var api = new ProductAdvertisingAPIv1.DefaultApi();

// export default async function handler(req, res) {

//   if (req.method === 'POST') {
//     const { keywords } = req.body;
    
//         // Create a new request object for each page
//         var searchItemsRequest = new ProductAdvertisingAPIv1.SearchItemsRequest();
//         searchItemsRequest['PartnerTag'] = process.env.AMAZON_PARTNER_TAG;
//         searchItemsRequest['PartnerType'] = 'Associates';
//         searchItemsRequest['Keywords'] = keywords;
//         searchItemsRequest['SortBy'] = 'Relevance';
//         searchItemsRequest['Condition'] = 'New';
//         searchItemsRequest['SearchIndex'] = 'All';
//         searchItemsRequest['ItemCount'] = 10;  // Max items per page
//         searchItemsRequest['Resources'] = [
//           'Images.Primary.Medium', 
//           'ItemInfo.Title', 
//           'Offers.Listings.Price', 
//           'ItemInfo.ExternalIds', 
//           'BrowseNodeInfo.BrowseNodes.SalesRank',
//           'ItemInfo.ByLineInfo'
//         ];

//         try {
//           // Create an array of promises for pages 1 to 3
//           const pagePromises = [1].map(page => {
//             const paginatedRequest = { ...searchItemsRequest, ItemPage: page };
//             return api.searchItems(paginatedRequest);
//           });

//           const results = await Promise.all(pagePromises)

//         // // Fetch items for the current page
//         // const data = await api.searchItems(searchItemsRequest);

//         let items = results.flatMap(data => 
//           data.SearchResult.Items.map(item => ({
//             ASIN: item.ASIN,
//             DetailPageURL: item.DetailPageURL,
//             Title: item.ItemInfo?.Title?.DisplayValue,
//             ImageURL: item.Images?.Primary?.Medium.URL,
//             Price: item.Offers.Listings[0]?.Price?.Amount || null,
//             Currency: item.Offers.Listings[0].Price?.Currency,
//             Savings: item.Offers?.Listings[0]?.Price?.Savings?.Percentage || 0,
//             UPC: item.ItemInfo.ExternalIds?.UPCs?.DisplayValues,
//             ISBN: item.ItemInfo.ExternalIds?.ISBNs?.DisplayValues,
//             EAN: item.ItemInfo.ExternalIds?.EANs?.DisplayValues,
//             Brand: item.ItemInfo?.ByLineInfo?.Brand?.DisplayValue,
//             SalesRank: item.BrowseNodeInfo?.BrowseNodes?.SalesRank
//           })));

//           items = items.filter(item => item.Price !== undefined && item.Price !== null);

//           items.sort((a,b) => b.Savings - a.Savings);

//       // Implement concurrency in Google scraper with p-limit
//       const limit = pLimit(5); // Adjust the concurrency limit as needed

//       const itemsWithGoogleDataPromises = items.map((item) =>
//         limit(async () => {
//           try {
//             const googleShoppingResults = await scrapeGoogleShopping(
//               item.Brand,
//               item.Title
//             );

//             return { ...item, googleShoppingResults};
//           } catch (error) {
//             return { ...item, googleShoppingResults: null }; // or [] if you prefer
//           }
//         })
//       );

//       // Wait for all Google scraper promises to resolve
//       let itemsWithGoogleData = await Promise.all(
//         itemsWithGoogleDataPromises
//       );

//       itemsWithGoogleData = itemsWithGoogleData.filter(
//         (item) => item.googleShoppingResults && item.googleShoppingResults.length > 0
//       );

//       res.status(200).json({ items: itemsWithGoogleData });

//       // Return all fetched items across multiple pages
//       res.status(200).json({ items });
//     } catch (error) {
//       res.status(500).json({ error: 'Failed to fetch data from Amazon API' });
//     }
//   } else {
//     res.setHeader('Allow', ['POST']);
//     res.status(405).end(`Method ${req.method} Not Allowed`);
//   }
// }

// src/pages/api/amazonAPI.js
import ProductAdvertisingAPIv1 from 'amazon-paapi/SDK/src/index';
import scrapeGoogleShopping, { closeBrowser } from '../../utils/googleShopping';
import pLimit from 'p-limit'; // Import p-limit for concurrency control

// Initialize Amazon PA-API client
const defaultClient = ProductAdvertisingAPIv1.ApiClient.instance;

defaultClient.accessKey = process.env.AWS_ACCESS_KEY_ID;
defaultClient.secretKey = process.env.AWS_SECRET_ACCESS_KEY;

defaultClient.host = 'webservices.amazon.com';
defaultClient.region = 'us-east-1';

const api = new ProductAdvertisingAPIv1.DefaultApi();

// Initialize pLimit with desired concurrency
const limit = pLimit(5); // Adjust the concurrency limit as needed

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { keywords } = req.body;

// Create a new request object for each page
const searchItemsRequest = new ProductAdvertisingAPIv1.SearchItemsRequest();
searchItemsRequest['PartnerTag'] = process.env.AMAZON_PARTNER_TAG;
searchItemsRequest['PartnerType'] = 'Associates';
searchItemsRequest['Keywords'] = keywords;
searchItemsRequest['SortBy'] = 'Relevance';
searchItemsRequest['Condition'] = 'New';
searchItemsRequest['SearchIndex'] = 'All';
searchItemsRequest['ItemCount'] = 10; // Max items per page
searchItemsRequest['Resources'] = [
  'Images.Primary.Medium',
  'ItemInfo.Title',
  'Offers.Listings.Price',
  'ItemInfo.ExternalIds',
  'BrowseNodeInfo.BrowseNodes.SalesRank',
  'ItemInfo.ByLineInfo',
    ];

    try {
      // Create an array of promises for pages 1 to 3 (if needed)
      const pagePromises = [1].map((page) => {
        const paginatedRequest = { ...searchItemsRequest, ItemPage: page };
        return api.searchItems(paginatedRequest);
      });

      const results = await Promise.all(pagePromises);

      let items = results.flatMap((data) =>
        data.SearchResult.Items.map((item) => ({
          ASIN: item.ASIN,
          DetailPageURL: item.DetailPageURL,
          Title: item.ItemInfo?.Title?.DisplayValue,
          ImageURL: item.Images?.Primary?.Medium.URL,
          Price: item.Offers?.Listings[0]?.Price?.Amount || null,
          Currency: item.Offers?.Listings[0]?.Price?.Currency,
          Savings: item.Offers?.Listings[0]?.Price?.Savings?.Percentage || 0,
          UPC: item.ItemInfo?.ExternalIds?.UPCs?.DisplayValues?.[0] || 'N/A',
          ISBN: item.ItemInfo?.ExternalIds?.ISBNs?.DisplayValues?.[0] || 'N/A',
          EAN: item.ItemInfo?.ExternalIds?.EANs?.DisplayValues?.[0] || 'N/A',
          Brand: item.ItemInfo?.ByLineInfo?.Brand?.DisplayValue || 'N/A',
          SalesRank: item.BrowseNodeInfo?.BrowseNodes?.[0]?.SalesRank || 'N/A',
        }))
      );

      // Filter out items without price
      items = items.filter((item) => item.Price !== undefined && item.Price !== null);

      // Sort items by Savings in descending order
      items.sort((a, b) => b.Savings - a.Savings);

      // Implement concurrency in Google scraper with p-limit
      const itemsWithGoogleDataPromises = items.map((item) =>
        limit(async () => {
          try {
            const googleShoppingResults = await scrapeGoogleShopping(item.Brand, item.Title);
            return { ...item, googleShoppingResults };
          } catch (error) {
            console.error(`Error scraping Google Shopping for "${item.Title}":`, error);
            return { ...item, googleShoppingResults: [] }; // Return empty array if scraping fails
          }
        })
      );

      // Wait for all Google scraper promises to resolve
      const itemsWithGoogleData = await Promise.all(itemsWithGoogleDataPromises);

      // Optionally, filter out items without Google Shopping results
      const filteredItems = itemsWithGoogleData.filter(
        (item) => item.googleShoppingResults && item.googleShoppingResults.length > 0
      );

      res.status(200).json({ items: filteredItems });
    } catch (error) {
      console.error('Error calling PA-API 5.0:', error);
      res.status(500).json({ error: 'Failed to fetch data from Amazon API' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

// Optional: Handle graceful shutdown to close the browser
// This is more relevant if you're running a custom server
if (process.env.NODE_ENV !== 'production') {
  process.on('SIGINT', async () => {
    console.log('Received SIGINT. Closing Puppeteer browser.');
    await closeBrowser();
    process.exit();
  });

  process.on('SIGTERM', async () => {
    console.log('Received SIGTERM. Closing Puppeteer browser.');
    await closeBrowser();
    process.exit();
  });
}
