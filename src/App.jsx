import React, { useState, useMemo } from "react";
import axios from "axios";
import { Toaster, toast } from "react-hot-toast";
import StockChart from "./components/StockChart";

const formatVolume = (val) => {
  if (val > 10000000) return (val / 10000000).toFixed(2) + "Cr";
  if (val > 100000) return (val / 100000).toFixed(2) + "L";
  if (val > 1000) return (val / 1000).toFixed(2) + "K";
  return val;
};

const getMarketStatus = () => {
  const now = new Date();
  const day = now.getDay(); // 0 = Sunday, 6 = Saturday
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const totalMinutes = hours * 60 + minutes;

  const marketOpen = 9 * 60 + 15;   // 9:15 AM
  const marketClose = 15 * 60 + 15; // 3:15 PM

  let nextOpen = new Date(now);

  // Weekend handling
  if (day === 6) { 
    // Saturday → Monday
    nextOpen.setDate(now.getDate() + 2);
  } else if (day === 0) { 
    // Sunday → Monday
    nextOpen.setDate(now.getDate() + 1);
  } else if (day === 5 && totalMinutes >= marketClose) { 
    // Friday after close → Monday
    nextOpen.setDate(now.getDate() + 3);
  } else if (totalMinutes >= marketClose) {
    // Weekday after close → Tomorrow
    nextOpen.setDate(now.getDate() + 1);
  } else if (totalMinutes < marketOpen) {
    // Before open → Same day at 9:15
  } else {
    // Market is open right now
    return null;
  }

  // Set time to 9:15 AM
  nextOpen.setHours(9, 15, 0, 0);

  // Format date
  const options = { weekday: "long", day: "numeric", month: "short" };
  const formattedDate = nextOpen.toLocaleDateString("en-US", options);

  return `📴 Market is closed. It will open on ${formattedDate} at 9:15 AM`;
};


function App() {
  const [symbol, setSymbol] = useState("");
  const [stockData, setStockData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(true);

  const marketStatus = useMemo(() => getMarketStatus(), []);

  const handleSearch = async () => {
    if (!symbol) return;
    setLoading(true);
    setError("");
    try {
      const response = await axios.get(`https://stock-backend-sage.vercel.app/api/stocks/${symbol}`);
      setStockData(response.data);

      if (response.data.suggestion === "BUY") {
        toast.success("📈 Good time to BUY!");
      } else if (response.data.suggestion === "SELL") {
        toast.error("📉 Consider SELLING!");
      }
    } catch (err) {
      setError("Stock not found or API error");
      toast.error("Stock not found or API error");
      setStockData(null);
    } finally {
      setLoading(false);
    }
  };

  const trending = ["RELIANCE.NS", "TCS.NS", "INFY.NS", "HDFCBANK.NS", "LT.NS"];

  return (
    <div
      className={`min-h-screen flex flex-col transition-colors duration-300 font-sans ${darkMode
        ? "bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] text-white"
        : "bg-gradient-to-br from-[#f0f0f0] via-[#e6e6e6] to-[#f0f0f0] text-gray-900"
        }`}
    >
      <Toaster position="top-right" />

      <header
        className={`fixed top-0 z-50 w-full px-6 py-4 shadow-md border-b flex justify-between items-center ${darkMode
          ? "bg-white/10 backdrop-blur-lg border-white/10"
          : "bg-white text-gray-900 border-gray-300"
          }`}
      >
         <h1 className="text-4xl font-bold">Stocky</h1>

        <div className="flex items-center gap-2" >
          <img
            src="/logo.png"
            alt="Logo"
            className="w-88 h-16 object-contain drop-shadow-xl animate-fade-in "
          />
      
        </div>

   
        <div className="flex items-center gap-4">
          <button onClick={() => setDarkMode(!darkMode)} className="text-lg transition">
            {darkMode ? "🌞" : "🌙"}
          </button>
          <a href="https://github.com/harshitmourya" target="_blank" rel="noopener noreferrer" className="text-sm hover:underline">
            GitHub ↗
          </a>
        </div>
      </header>

      <main className="relative flex-grow flex flex-col items-center justify-center px-4 pt-28 pb-10 overflow-hidden">
        {/* Watermark */}
        <div className="absolute top-1/2 left-1/2 text-[14vw] font-bold tracking-wider text-white/5 dark:text-white/10 select-none pointer-events-none z-0 uppercase animate-fade-in-centered">
          StockPulse
        </div>


        {/* Foreground */}
        <div className="relative z-10 w-full flex flex-col items-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-8 text-center drop-shadow-xl animate-fade-in">
             Info About Stocks
          </h1>

          {marketStatus && (
            <div className="mb-4 px-4 py-2 rounded-md text-center text-sm font-medium bg-yellow-500 text-black animate-slide-up shadow">
              {marketStatus}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 mb-6 w-full max-w-xl animate-slide-up">
            <input
              type="text"
              placeholder="Enter Stock Symbol (e.g. BEL.NS)"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              className={`flex-1 px-4 py-2 rounded-md border focus:ring-2 ${darkMode
                ? "border-gray-600 focus:ring-blue-400 bg-gray-800 text-white placeholder-gray-400"
                : "border-gray-400 focus:ring-blue-500 bg-white text-black placeholder-gray-600"
                }`}
            />
            <button
              onClick={handleSearch}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition disabled:opacity-50"
            >
              {loading ? (
                <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mx-auto"></div>
              ) : (
                "Search"
              )}
            </button>
          </div>

          <div className="mb-10">
            <h3 className="text-md font-semibold text-center mb-2">🔥 Trending Stocks</h3>
            <div className="flex gap-3 justify-center flex-wrap">
              {trending.map((stock, i) => (
                <button
                  key={i}
                  onClick={() => setSymbol(stock)}
                  className={`px-3 py-1 rounded-md text-sm ${darkMode ? "bg-white/10 hover:bg-white/20 text-white" : "bg-gray-200 hover:bg-gray-300 text-black"
                    }`}
                >
                  {stock}
                </button>
              ))}
            </div>
          </div>

          {error && <p className="text-red-500 mb-4 animate-pulse">{error}</p>}

          {stockData && (
            <div
              className={`w-full max-w-md mx-auto p-6 rounded-xl shadow-xl border backdrop-blur-lg animate-fade-in ${darkMode ? "bg-gray-900/70 border-white/10 text-white" : "bg-white text-gray-800 border-gray-300"
                }`}
            >
              <h2 className="text-2xl font-semibold mb-2">{stockData.symbol}</h2>
              <ul className="space-y-1 text-sm">
                <li><strong>Current Price:</strong> ₹{stockData.ltp}</li>
                <li><strong>50 Day Avg:</strong> ₹{stockData.avg50}</li>
                <li><strong>200 Day Avg:</strong> ₹{stockData.avg200}</li>
                <li><strong>RSI:</strong> {stockData.pseudoRSI}</li>
                <li><strong>Change %:</strong> {stockData.changePercent.toFixed(2)}%</li>
                <li><strong>Volume:</strong> {formatVolume(stockData.volume)}</li>
                <li><strong>Entry:</strong> {formatVolume(stockData.entry)}</li>
                <li><strong>Target:</strong> {formatVolume(stockData.target)}</li>
                <li><strong>StopLoss:</strong> {formatVolume(stockData.stopLoss)}</li>

              </ul>

              <div className="mt-4">
                <span
                  className={`px-4 py-1 text-sm font-semibold rounded ${stockData.suggestion === "SELL"
                    ? "bg-red-600 text-white animate-bounce"
                    : stockData.suggestion === "BUY"
                      ? "bg-green-600 text-white animate-pulse"
                      : "bg-yellow-500 text-white"
                    }`}
                >
                  {stockData.suggestion}
                </span>
                <p className="text-xs mt-2 italic">{stockData.reason}</p>
                <p className="text-xs mt-4 text-gray-400 text-center">
                  Last updated: {new Date().toLocaleString()}
                </p>
              </div>

              <div className="mt-6">
                <StockChart stockData={stockData} />
              </div>

              {stockData.news && stockData.news.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-2">📢 Latest News</h3>
                  <ul className="space-y-2 text-sm">
                    {stockData.news.map((item, index) => (
                      <li key={index} className="border-l-4 pl-2 border-blue-400">
                        <a href={item.link} target="_blank" rel="noopener noreferrer" className="hover:underline">
                          {item.title}
                        </a>
                        <p className="text-xs text-gray-400">{new Date(item.pubDate).toLocaleString()}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <footer
        className={`text-center text-sm py-4 w-full animate-slide-up ${darkMode ? "bg-black/30 text-gray-400" : "bg-gray-200 text-gray-700"
          }`}
      >
        © {new Date().getFullYear()} <span className="font-bold">StockPulse</span> by Harshit 
      </footer>
    </div>
  );
}

export default App;
