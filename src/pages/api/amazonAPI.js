
const ProductAdvertisingAPIv1 = require('amazon-paapi/SDK/src/index');
import scrapeGoogleShopping from '../../utils/googleShopping';
import pLimit from 'p-limit'; // Import p-limit for concurrency control


var defaultClient = ProductAdvertisingAPIv1.ApiClient.instance;

defaultClient.accessKey = process.env.AWS_ACCESS_KEY_ID;
defaultClient.secretKey = process.env.AWS_SECRET_ACCESS_KEY;

defaultClient.host = 'webservices.amazon.com';
defaultClient.region = 'us-east-1';

var api = new ProductAdvertisingAPIv1.DefaultApi();

export default async function handler(req, res) {

  if (req.method === 'POST') {
    const { keywords } = req.body;
    
        // Create a new request object for each page
        var searchItemsRequest = new ProductAdvertisingAPIv1.SearchItemsRequest();
        searchItemsRequest['PartnerTag'] = process.env.AMAZON_PARTNER_TAG;
        searchItemsRequest['PartnerType'] = 'Associates';
        searchItemsRequest['Keywords'] = keywords;
        searchItemsRequest['SortBy'] = 'Relevance';
        searchItemsRequest['Condition'] = 'New';
        searchItemsRequest['SearchIndex'] = 'All';
        searchItemsRequest['ItemCount'] = 10;  // Max items per page
        searchItemsRequest['Resources'] = [
          'Images.Primary.Medium', 
          'ItemInfo.Title', 
          'Offers.Listings.Price', 
          'ItemInfo.ExternalIds', 
          'BrowseNodeInfo.BrowseNodes.SalesRank',
          'ItemInfo.ByLineInfo'
        ];

        try {
          // Create an array of promises for pages 1 to 3
          const pagePromises = [1].map(page => {
            const paginatedRequest = { ...searchItemsRequest, ItemPage: page };
            return api.searchItems(paginatedRequest);
          });

          const results = await Promise.all(pagePromises)

        // // Fetch items for the current page
        // const data = await api.searchItems(searchItemsRequest);

        let items = results.flatMap(data => 
          data.SearchResult.Items.map(item => ({
            ASIN: item.ASIN,
            DetailPageURL: item.DetailPageURL,
            Title: item.ItemInfo?.Title?.DisplayValue,
            ImageURL: item.Images?.Primary?.Medium.URL,
            Price: item.Offers.Listings[0]?.Price?.Amount || null,
            Currency: item.Offers.Listings[0].Price?.Currency,
            Savings: item.Offers?.Listings[0]?.Price?.Savings?.Percentage || 0,
            UPC: item.ItemInfo.ExternalIds?.UPCs?.DisplayValues,
            ISBN: item.ItemInfo.ExternalIds?.ISBNs?.DisplayValues,
            EAN: item.ItemInfo.ExternalIds?.EANs?.DisplayValues,
            Brand: item.ItemInfo?.ByLineInfo?.Brand?.DisplayValue,
            SalesRank: item.BrowseNodeInfo?.BrowseNodes?.SalesRank
          })));

          items = items.filter(item => item.Price !== undefined && item.Price !== null);

          items.sort((a,b) => b.Savings - a.Savings);

      // const itemsWithGoogleData = await Promise.all(
      //   items.map(async (item) => {
      //     try {
      //       const googleShoppingResults = await scrapeGoogleShopping(item.Brand, item.Title);
      //       return { ...item, googleShoppingResults };
      //     } catch (error) {
      //       console.error(`Error scraping Google Shopping for ${item.Title}:`, error);
      //       return { ...item, googleShoppingResults: null }; // or [] if you prefer
      //     }
      //   })
      // );

      // Implement concurrency in Google scraper with p-limit
      const limit = pLimit(10); // Adjust the concurrency limit as needed

      const itemsWithGoogleDataPromises = items.map((item) =>
        limit(async () => {
          try {
            const googleShoppingResults = await scrapeGoogleShopping(
              item.Brand,
              item.Title
            );


            return { ...item, googleShoppingResults};
          } catch (error) {
            console.error(
              `Error scraping Google Shopping for ${item.Title}:`,
              error
            );
            return { ...item, googleShoppingResults: null }; // or [] if you prefer
          }
        })
      );

      // Wait for all Google scraper promises to resolve
      let itemsWithGoogleData = await Promise.all(
        itemsWithGoogleDataPromises
      );

      itemsWithGoogleData = itemsWithGoogleData.filter(
        (item) => item.googleShoppingResults && item.googleShoppingResults.length > 0
      );

      res.status(200).json({ items: itemsWithGoogleData });

      // Return all fetched items across multiple pages
      // res.status(200).json({ items });
    } catch (error) {
      console.error('Error calling PA-API 5.0:', error);
      res.status(500).json({ error: 'Failed to fetch data from Amazon API' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

