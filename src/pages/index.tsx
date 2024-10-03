

import { useState, useEffect } from 'react';

const HomePage = () => {
  const [keyword, setKeyword] = useState('');
  const [items, setItems] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [ranfunction, setRanfunction] = useState(false);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  const loadingMessages = [
    "Getting the best deals from Amazon...",
    "Scouring the web for similar products...",
    "Pulling data on the best comparisons...",
    "Crunching the numbers...",
    "Hang tight! We're almost there...",
    "Just a few moments more...",
    "Deals coming right up!",
  ];

  useEffect(() => {
    if (loading) {
      const interval = setInterval(() => {
        setCurrentMessageIndex((prevIndex) => 
          prevIndex < loadingMessages.length - 1 ? prevIndex + 1 : prevIndex // Stay on the last message
      )
    }, 10000); // Change message every 10 seconds

      return () => clearInterval(interval); // Cleanup on unmount or when loading ends
    }
  }, [loading]);

  const fetchItems = async () => {
    setLoading(true);
    setError(null);
    setItems([]);
    setRanfunction(false);
    setCurrentMessageIndex(0); // Reset to the first loading message

    try {
      const response = await fetch('/api/amazonAPI', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ keywords: keyword }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      console.log('API Response:', data); // Log the response data for debugging
      setItems(data.items); // Set the items state to the returned data

    } catch (error: any) {
      setError(error.message);
      console.error('Error fetching items:', error);
    } finally {
      setLoading(false);
      setRanfunction(true); // Indicate that the function has completed
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      fetchItems(); // Call fetchItems when Enter is pressed
    }
  };

  return (
    <div className="w-full">
      <div className="flex flex-col justify-center items-center text-center">
      <div className="min-h-[50px] w-full"></div>
      <div className="text-8xl font-ArchivoExtraBold mt-5 text-blue-600">Is it a deal?</div>
      <div className="text-xl font-ArchivoRegular font-light my-5">Check how Amazon bargains stack up against other sellers before you buy</div>

      {/* Input for the keyword */}
      <div className="flex flex-row mb-5 font-ArchivoRegular">
      <input
        type="text"
        placeholder="Enter search term"
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        onKeyDown={handleKeyPress}
        className="border-2 border-gray-300 rounded-md text-center text-md h-10 mr-3"
      />
      <button 
        onClick={fetchItems}
        className="bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-900 text-white rounded-md text-md h-10 px-4 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500">
        {loading ? 'Searching' : 'Search'}
      </button>
      </div>
      </div>

      {error && <p>Error: {error.message}</p>}
      {loading ? (
        // Show loading indicator while fetching
        <div className="flex justify-center items-center h-full font-ArchivoRegular text-xl mt-10">
        <p className="font-">{loadingMessages[currentMessageIndex]}</p>
        </div>
      ) : items.length > 0 ? (
        <div>
          {items.map((item) => (
            <li key={item.ASIN} className=" flex my-2 flex-wrap justify-center">
              <div className="relative flex flex-col shadow-lg hover:shadow-xl w-full mx-2 md:mx-0 md:w-1/4 rounded-md">
              <div className="absolute top-2 left-2 rounded-md p-2 bg-gradient-to-r from-blue-300 to-blue-200 text-base font-ArchivoVariable">Amazon offer</div>
              <div className="m-5">
              <img src={item.ImageURL} alt={item.Title} className="w-auto h-[20vh] mt-10" />
              <div className="font-semibold">{item.Title}</div>
                <p>
                  <div className="inline-block rounded-sm bg-red-50 p-1"><span className="font-semibold"><span className="text-3xl font-bold">${Math.floor(item.Price)}</span>
                  <span className="align-super text-sm">{(item.Price % 1).toFixed(2).split('.')[1]} ({item.Currency})</span></span></div>
                  {item.Savings > 0 && (
                    <>
                      {/* Show savings percentage */}
                      <div className="inline-block bg-red-600 p-1 rounded-sm ml-1 text-white"> <span className="text-xl font-bold">-{item.Savings}%</span> <span className="text-3xl"></span></div>
                    </>
                  )}
                </p>
                <p>Brand: {item.Brand}</p>
                <a href={item.DetailPageURL} target="_blank" rel="noopener noreferrer">
                  View Product
                </a>
                </div>
              </div>

              {/* Conditionally render Google Shopping results */}
              <div className="relative w-full md:w-2/3 ml-5 mt-5 md:mt-0">
              <div className="absolute top-2 left-2 rounded-md p-2 bg-gradient-to-r from-blue-300 to-blue-200 text-base font-ArchivoVariable">Similar products around the web</div>
              {item.googleShoppingResults && item.googleShoppingResults.length > 0 ? (
                <div className="flex md:flex-wrap md:overflow-visible overflow-x-scroll h-full md:w-full">
                  {/* <h3>Google Shopping Results:</h3> */}
                    {item.googleShoppingResults.map((result, idx) => (
                      <ul key={idx} className="flex shadow-lg hover:shadow-xl mr-5 rounded-md w-3/4 md:w-1/4">
                        <div className="m-5">
                        <img src={result.imageUrl} alt={result.productName} className="md:w-auto h-auto md:h-[20vh] mt-10"/>
                        <div className="font-semibold">{result.productName}</div>
                        <div className="inline-block rounded-sm bg-red-50 p-1"><span className="text-3xl font-bold">{result.price.split('.')[0]}</span><span className="align-super text-sm">{result.price.split('.')[1]}</span></div>
                        <p>Seller: {result.sellerName}</p>
                        <a
                          href={`https://www.google.com/search?tbm=shop&q=${item.Title}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          View on Google
                        </a>
                        </div>
                        
                      </ul>
                    ))}
                </div>
                
              ) : (
                <p>No Google Shopping results found.</p>
              )}
              </div>
            </li>
          ))}
        </div>
        
      ) : ranfunction ? (
        <p>No items found.</p>
      ) : null}
    </div>
  );
};

export default HomePage;

