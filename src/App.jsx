import React, { useState, useEffect } from "react";
import axios from "axios";
import './App.css';

const CryptoCalculator = () => {
  const [cryptoData, setCryptoData] = useState({});
  const [amounts, setAmounts] = useState({});
  const [selectedCryptos, setSelectedCryptos] = useState([]);
  const [totalValue, setTotalValue] = useState({ USD: 0, ILS: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const cryptoIds = {
    BTC: "bitcoin",
    ETH: "ethereum",
    MATIC: "matic-network",
    FIT: "fitfi",
    DOT: "polkadot",
  };

  useEffect(() => {
    const fetchCryptoData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await axios.get(
          `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${Object.values(cryptoIds).join(",")}&order=market_cap_desc&per_page=100&page=1&sparkline=false`,
          {
            headers: {
              "Access-Control-Allow-Origin": "*",
            },
          },
        );
        const newCryptoData = {};
        response.data.forEach((coin) => {
          const symbol = Object.keys(cryptoIds).find(
            (key) => cryptoIds[key] === coin.id,
          );
          newCryptoData[symbol] = {
            price: coin.current_price,
            logo: coin.image,
          };
        });
        setCryptoData(newCryptoData);
        setIsLoading(false);
      } catch (error) {
        console.error("שגיאה בטעינת נתוני המטבעות:", error);
        setError("לא הצלחנו לטעון את נתוני המטבעות. אנא נסה שוב מאוחר יותר.");
        setIsLoading(false);
      }
    };

    fetchCryptoData();
  }, []);

  useEffect(() => {
    calculateTotal();
  }, [amounts, selectedCryptos, cryptoData]);

  const handleAmountChange = (crypto, value) => {
    setAmounts((prev) => ({ ...prev, [crypto]: value }));
    if (value && !selectedCryptos.includes(crypto)) {
      setSelectedCryptos((prev) => [...prev, crypto]);
    } else if (!value && selectedCryptos.includes(crypto)) {
      setSelectedCryptos((prev) => prev.filter((c) => c !== crypto));
    }
  };

  const calculateTotal = () => {
    let totalUSD = 0;
    selectedCryptos.forEach((crypto) => {
      if (amounts[crypto] && cryptoData[crypto]) {
        totalUSD += parseFloat(amounts[crypto]) * cryptoData[crypto].price;
      }
    });
    setTotalValue({
      USD: totalUSD.toFixed(2),
      ILS: (totalUSD * 3.5).toFixed(2), // שער המרה משוער לשקל
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen text-yellow-400">
        טוען נתונים...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-yellow-400 p-4">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold mb-6 text-center">
          מחשבון מטבעות דיגיטליים
        </h1>

        <div className="sticky top-0 bg-gray-900 p-4 rounded-lg shadow-lg mb-4">
          <h2 className="text-xl font-bold mb-2 text-center">סך הכל:</h2>
          <p className="text-center">
            ${totalValue.USD} / ₪{totalValue.ILS}
          </p>
        </div>

        <div className="bg-gray-900 p-8 rounded-lg shadow-lg mb-4">
          <div className="grid grid-cols-2 gap-4">
            {Object.keys(cryptoIds).map((crypto) => (
              <div key={crypto} className="flex flex-col items-center mb-4">
                <div className="flex items-center mb-2">
                  {cryptoData[crypto] && (
                    <img
                      src={cryptoData[crypto].logo}
                      alt={`${crypto} logo`}
                      className="w-4 h-4 mr-2"
                    />
                  )}
                  <span className="text-center">{crypto}</span>
                </div>
                <input
                  type="number"
                  value={amounts[crypto] || ""}
                  onChange={(e) => handleAmountChange(crypto, e.target.value)}
                  placeholder={`כמות ${crypto}`}
                  className="w-full p-2 bg-gray-800 text-yellow-400 rounded text-center"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-900 p-4 rounded-lg shadow-lg">
          <h2 className="text-xl font-bold mb-2 text-center">מטבעות שנבחרו:</h2>
          <div className="flex justify-center flex-wrap">
            {selectedCryptos.map((crypto) => (
              <img
                key={crypto}
                src={cryptoData[crypto].logo}
                alt={`${crypto} logo`}
                className="w-4 h-4 m-1"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CryptoCalculator;
