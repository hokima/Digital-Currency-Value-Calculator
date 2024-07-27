import React, { useState, useEffect } from "react";
import axios from "axios";

const CryptoCalculator = () => {
  const [cryptoData, setCryptoData] = useState({});
  const [amounts, setAmounts] = useState([{ amount: "", crypto: "" }]);
  const [totalValue, setTotalValue] = useState({ USD: 0, ILS: 0 });
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [customCrypto, setCustomCrypto] = useState("");

  const cryptoIds = {
    BTC: "bitcoin",
    ETH: "ethereum",
    MATIC: "matic-network",
    FIT: "fitfi",
    DOT: "polkadot",
    ADA: "cardano",
    XRP: "ripple",
    DOGE: "dogecoin",
    LINK: "chainlink",
    UNI: "uniswap",
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
  }, [amounts, cryptoData]);

  const handleAmountChange = (index, value) => {
    const newAmounts = [...amounts];
    newAmounts[index].amount = value;
    setAmounts(newAmounts);
  };

  const handleCryptoChange = (index, value) => {
    const newAmounts = [...amounts];
    newAmounts[index].crypto = value;
    setAmounts(newAmounts);
  };

  const addNewCryptoInput = () => {
    setAmounts([...amounts, { amount: "", crypto: "" }]);
  };

  const addCustomCrypto = () => {
    if (customCrypto && !cryptoData[customCrypto]) {
      setCryptoData((prev) => ({
        ...prev,
        [customCrypto]: { price: 0, logo: "https://via.placeholder.com/32" },
      }));
      setCustomCrypto("");
    }
  };

  const addAllCryptos = () => {
    const allCryptos = Object.keys(cryptoIds).map((crypto) => ({
      amount: "",
      crypto,
    }));
    setAmounts(allCryptos);
  };

  const removeCryptoInput = (index) => {
    const newAmounts = amounts.filter((_, i) => i !== index);
    setAmounts(newAmounts);
  };

  const calculateTotal = () => {
    let totalUSD = 0;
    amounts.forEach(({ amount, crypto }) => {
      if (amount && crypto && cryptoData[crypto]) {
        totalUSD += parseFloat(amount) * cryptoData[crypto].price;
      }
    });
    setTotalValue({
      USD: totalUSD.toFixed(2),
      ILS: (totalUSD * 3.5).toFixed(2), // שער המרה משוער לשקל
    });
  };

  const saveToHistory = () => {
    const newEntry = {
      date: new Date().toLocaleString(),
      amounts: [...amounts],
      total: { ...totalValue },
    };
    setHistory([newEntry, ...history]);
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
          {amounts.map((item, index) => (
            <div key={index} className="flex items-center mb-4">
              <input
                type="number"
                value={item.amount}
                onChange={(e) => handleAmountChange(index, e.target.value)}
                placeholder="כמות"
                className="w-1/2 p-2 bg-gray-800 text-yellow-400 rounded text-center mr-2"
              />
              {/* החלף את ה-select הקיים עם זה */}
              <select
                className="w-1/2 p-2 bg-gray-800 text-yellow-400 rounded"
                onChange={(e) => handleCryptoChange(index, e.target.value)}
                value={item.crypto}
              >
                <option value="" disabled>
                  בחר מטבע
                </option>
                {Object.keys(cryptoData).map((crypto) => (
                  <option key={crypto} value={crypto}>
                    {crypto}
                  </option>
                ))}
              </select>
              <button
                onClick={() => removeCryptoInput(index)}
                className="ml-2 text-red-500"
              >
                X
              </button>
            </div>
          ))}
          {/* החלף את הקוד הקיים של הכפתורים עם זה */}
          <div className="flex justify-between mt-4">
            <button
              onClick={addNewCryptoInput}
              className="w-1/2 p-2 bg-yellow-400 text-black rounded hover:bg-yellow-500 
                transition-colors duration-300 mr-2"
            >
              הוסף מטבע
            </button>
            <button
              onClick={addAllCryptos}
              className="w-1/2 p-2 bg-yellow-400 text-black rounded hover:bg-yellow-500 
                transition-colors duration-300"
            >
              הוסף את כל המטבעות
            </button>
          </div>
        </div>
        <button
          onClick={saveToHistory}
          className="w-full p-2 bg-yellow-400 text-black rounded hover:bg-yellow-300 mb-4"
        >
          שמור להיסטוריה
        </button>

        <div className="bg-gray-900 p-4 rounded-lg shadow-lg">
          <h2 className="text-xl font-bold mb-2 text-center">היסטוריה:</h2>
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left">תאריך</th>
                <th className="text-left">מטבעות</th>
                <th className="text-right">סה"כ</th>
              </tr>
            </thead>
            <tbody>
              {history.map((entry, index) => (
                <tr key={index} className="border-b border-gray-700">
                  <td className="py-2">{entry.date}</td>
                  <td>
                    {entry.amounts.map((item, itemIndex) => (
                      <div key={itemIndex} className="flex items-center mb-1">
                        {cryptoData[item.crypto] && (
                          <img
                            src={cryptoData[item.crypto].logo}
                            alt={item.crypto}
                            className="w-4 h-4 mr-2"
                          />
                        )}
                        <span>
                          {item.crypto}: {item.amount}
                        </span>
                      </div>
                    ))}
                  </td>
                  <td className="text-right">
                    ${entry.total.USD} / ₪{entry.total.ILS}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CryptoCalculator;
