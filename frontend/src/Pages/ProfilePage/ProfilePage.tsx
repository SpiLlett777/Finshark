import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../Context/useAuth";
import { useCart } from "../../Context/CartContext";
import {
  portfolioGetAPI,
  portfolioAddAPI,
  portfolioUpdateAPI,
  portfolioDeleteAPI,
  portfolioTransferAPI,
  PortfolioItemBackendDto,
} from "../../Services/PortfolioService";
import { toast } from "react-toastify";
import Spinner from "../../Components/Spinner/Spinner";
import { Link } from "react-router-dom";
import {
  StockDto,
  stockFindBySymbolAPI,
  stockGetAPI,
} from "../../Services/StockService.tsx";
import { getUserIdByUsernameAPI } from "../../Services/AuthService.tsx";

export type PortfolioItem = {
  stockId: number;
  symbol: string;
  companyName: string;
  quantity: number;
  purchase: number;
  lastDiv: number;
  industry: string;
  marketCap: number;
};

const FMP_API_KEY = import.meta.env.VITE_API_KEY || "";

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const { cart, addToCart, removeFromCart, clearCart } = useCart();

  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [loadingPort, setLoadingPort] = useState<boolean>(false);
  const [balance, setBalance] = useState<number>(10000);
  const [priceMap, setPriceMap] = useState<Record<string, number>>({});

  const [cardNumber, setCardNumber] = useState<string>("");
  const [expiry, setExpiry] = useState<string>("");
  const [cvv, setCvv] = useState<string>("");

  const [isPayModalOpen, setIsPayModalOpen] = useState<boolean>(false);

  const [isSellModalOpen, setIsSellModalOpen] = useState<boolean>(false);
  const [sellStockId, setSellStockId] = useState<number>(0);
  const [sellMaxQty, setSellMaxQty] = useState<number>(0);
  const [sellQty, setSellQty] = useState<number>(0);

  const [isTransferModalOpen, setIsTransferModalOpen] =
    useState<boolean>(false);
  const [transferStockId, setTransferStockId] = useState<number | null>(null);
  const [transferQty, setTransferQty] = useState<number>(0);
  const [transferUser, setTransferUser] = useState<string>("");

  const [cartEditingSymbol, setCartEditingSymbol] = useState<string | null>(
    null,
  );
  const [cartNewQuantity, setCartNewQuantity] = useState<number>(0);

  useEffect(() => {
    loadPortfolio().then();
  }, []);

  useEffect(() => {
    portfolio.forEach((p) => {
      const sym = p.symbol.toUpperCase();
      if (!(sym in priceMap)) {
        fetchLivePrice(sym).then();
      }
    });
  }, [portfolio]);

  useEffect(() => {
    cart.forEach((item) => {
      const sym = item.symbol.toUpperCase();
      if (!(sym in priceMap) && !portHasSymbol(sym)) {
        fetchLivePrice(sym).then();
      }
    });
  }, [cart, portfolio]);

  const loadPortfolio = async () => {
    setLoadingPort(true);

    try {
      const portfolioRes = await portfolioGetAPI();
      const data = portfolioRes?.data;

      if (!data?.items) {
        setPortfolio([]);
        return;
      }

      const items = data.items;

      const enrichedPortfolio: PortfolioItem[] = await Promise.all(
        items.map(async (p: PortfolioItemBackendDto) => {
          const stockRes = await stockGetAPI(p.stockId);
          const stock: StockDto | undefined = stockRes?.data;

          if (!stock) {
            throw new Error(`Stock ${p.stockId} is not found!`);
          }

          return {
            stockId: p.stockId,
            symbol: stock.symbol,
            companyName: stock.companyName,
            quantity: p.quantity,
            purchase: stock.purchase,
            lastDiv: stock.lastDiv,
            industry: stock.industry,
            marketCap: stock.marketCap,
          };
        }),
      );

      setPortfolio(enrichedPortfolio);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load portfolio");
    } finally {
      setLoadingPort(false);
    }
  };

  const portHasSymbol = (symbol: string) => {
    return portfolio.some(
      (p) => p.symbol.toLowerCase() === symbol.toLowerCase(),
    );
  };

  const fetchLivePrice = async (symbol: string) => {
    if (!FMP_API_KEY) return;
    try {
      const resp = await axios.get<{ price: number }[]>(
        `https://financialmodelingprep.com/stable/quote?symbol=${symbol}&apikey=${FMP_API_KEY}`,
      );
      if (Array.isArray(resp.data) && resp.data.length > 0) {
        const livePrice = resp.data[0].price;
        setPriceMap((prev) => ({ ...prev, [symbol]: livePrice }));
      } else {
        setPriceMap((prev) => ({ ...prev, [symbol]: 0 }));
      }
    } catch (e) {
      console.warn("FMP price fetch failed for", symbol, e);
      setPriceMap((prev) => ({ ...prev, [symbol]: 0 }));
    }
  };

  const cartTotals = () => {
    const totalQty = cart.reduce((sum, i) => sum + i.quantity, 0);
    const totalCost = cart.reduce((sum, i) => {
      const entry = portfolio.find((p) => p.symbol === i.symbol);
      const unitPrice = entry
        ? entry.purchase
        : priceMap[i.symbol.toUpperCase()] || 0;
      return sum + unitPrice * i.quantity;
    }, 0);
    return { totalQty, totalCost };
  };
  const { totalQty: cartQty, totalCost: cartCost } = cartTotals();

  const portfolioTotals = () => {
    const totalQty = portfolio.reduce((sum, i) => sum + i.quantity, 0);
    const totalCost = portfolio.reduce((sum, i) => {
      const livePrice = priceMap[i.symbol.toUpperCase()] ?? i.purchase;
      return sum + livePrice * i.quantity;
    }, 0);
    return { totalQty, totalCost };
  };
  const { totalQty: portQty, totalCost: portCost } = portfolioTotals();

  const handlePayAll = () => {
    if (cartCost > balance) {
      toast.error("Insufficient balance to complete purchase");
      return;
    }
    setIsPayModalOpen(true);
  };

  const confirmPayment = async () => {
    if (!cardNumber || cardNumber.replace(/\s/g, "").length !== 16) {
      toast.error("Please enter a valid card number");
      return;
    }

    if (!expiry || !/^\d{2}\/\d{2}$/.test(expiry)) {
      toast.error("Please enter a valid expiry date (MM/YY)");
      return;
    }

    if (!cvv || cvv.length !== 3) {
      toast.error("Please enter a valid CVV");
      return;
    }

    const { totalCost } = cartTotals();
    if (totalCost > balance) {
      toast.error("Insufficient balance to complete purchase");
      return;
    }
    setBalance((prev) => prev - totalCost);

    for (const item of cart) {
      const symbol = item.symbol.toUpperCase();
      const qtyToAdd = item.quantity;
      const existingEntry = portfolio.find(
        (p) => p.symbol.toLowerCase() === symbol.toLowerCase(),
      );

      if (existingEntry) {
        const newQuantity = existingEntry.quantity + qtyToAdd;
        try {
          await portfolioUpdateAPI(existingEntry.stockId, newQuantity);
        } catch (err) {
          console.error("Error updating quantity for", symbol, err);
          toast.error(`Failed to update quantity for ${symbol}`);
        }
      } else {
        try {
          const findRes = await stockFindBySymbolAPI(symbol);
          const foundArr = findRes?.data;
          const stock =
            Array.isArray(foundArr) && foundArr.length > 0
              ? foundArr[0]
              : undefined;

          if (!stock) {
            toast.error(`Stock ${symbol} is not found in stock service!`);
            continue;
          }
          console.log(stock);
          await portfolioAddAPI(stock.id);
          await portfolioUpdateAPI(stock.id, qtyToAdd);
        } catch (err) {
          console.error("Error adding/updating new symbol", symbol, err);
          toast.error(`Failed to add ${symbol} to portfolio`);
        }
      }
    }

    clearCart();
    setIsPayModalOpen(false);
    toast.success("Purchase successful! Items moved to portfolio");
    await loadPortfolio();
  };

  const openSellModal = (stockId: number, availableQty: number) => {
    setSellStockId(stockId);
    setSellMaxQty(availableQty);
    setSellQty(availableQty);
    setIsSellModalOpen(true);
  };

  const confirmSell = async () => {
    if (!sellStockId) {
      toast.error("No stock was selected!");
      return;
    }
    if (sellQty < 1 || sellQty > sellMaxQty) {
      toast.warning("Please enter a valid quantity to sell!");
      return;
    }
    const entry = portfolio.find((p) => p.stockId === sellStockId);
    const unitPrice = entry ? entry.purchase : 0;
    const proceeds = unitPrice * sellQty;
    const remaining = sellMaxQty - sellQty;

    try {
      if (remaining > 0) {
        await portfolioUpdateAPI(sellStockId, remaining);
      } else {
        await portfolioDeleteAPI(sellStockId);
      }
      setBalance((prev) => prev + proceeds);
      toast.success(`Sold ${sellQty} shares for $${proceeds.toFixed(2)}!`);
      setIsSellModalOpen(false);
      await loadPortfolio();
    } catch {
      toast.error("Failed to process sell!");
    }
  };

  const handleOpenTransfer = (stockId: number, maxQuantity: number) => {
    setTransferStockId(stockId);
    setTransferQty(maxQuantity);
    setIsTransferModalOpen(true);
  };

  const confirmTransfer = async () => {
    if (!transferStockId) {
      toast.error("No stock was selected!");
      return;
    }
    if (transferQty <= 0 || !transferUser.trim()) {
      toast.warning("Please fill all fields!");
      return;
    }
    if (transferQty > getPortfolioQuantityByStockId(transferStockId)) {
      toast.warning("Cannot transfer more than you own!");
      return;
    }
    try {
      const res = await getUserIdByUsernameAPI(transferUser.trim());
      if (!res) {
        toast.error("Recipient is not found!");
        return;
      }
      const toUserId = res.data.userId;
      await portfolioTransferAPI(transferStockId, transferQty, toUserId);
      setIsTransferModalOpen(false);
      toast.success("Transfer is completed!");
      await loadPortfolio();
    } catch {
      toast.error("Transfer is failed!");
    }
  };

  const handleCartQuantitySave = (symbol: string) => {
    if (cartNewQuantity < 1) {
      removeFromCart(symbol);
      setCartEditingSymbol(null);
      return;
    }
    if (cartNewQuantity > 9999) {
      toast.warning("Quantity too large");
      return;
    }
    const updatedCart = cart.map((i) =>
      i.symbol === symbol ? { ...i, quantity: cartNewQuantity } : i,
    );
    clearCart();
    updatedCart.forEach((i) => {
      addToCart(i.symbol, i.quantity);
    });
    setCartEditingSymbol(null);
    toast.success("Cart updated");
  };

  // const getPortfolioQuantity = (symbol: string) => {
  //   const entry = portfolio.find((p) => p.symbol === symbol);
  //   return entry ? entry.quantity : 0;
  // };

  const getPortfolioQuantityByStockId = (stockId: number) => {
    const entry = portfolio.find((p) => p.stockId === stockId);
    return entry ? entry.quantity : 0;
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-3xl font-bold mb-4">Profile</h2>
      <div className="mb-6">
        <p>
          <span className="font-semibold">Username:</span> {user?.userName}
        </p>
        <p>
          <span className="font-semibold">Email:</span> {user?.email}
        </p>
        <p>
          <span className="font-semibold">Balance:</span> ${balance.toFixed(2)}
        </p>
      </div>

      <div className="mb-12">
        <h3 className="text-2xl font-semibold mb-4">Cart</h3>
        {cart.length === 0 ? (
          <p className="italic text-gray-500">Your cart is empty.</p>
        ) : (
          <div>
            <table className="w-full table-auto border-collapse mb-4">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-3 py-2">Symbol</th>
                  <th className="px-3 py-2">Quantity</th>
                  <th className="px-3 py-2">Price</th>
                  <th className="px-3 py-2">Subtotal</th>
                  <th className="px-3 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {cart.map((item) => {
                  const entry = portfolio.find((p) => p.symbol === item.symbol);
                  const unitPrice = entry
                    ? entry.purchase
                    : priceMap[item.symbol.toUpperCase()] || 0;
                  const subtotal = unitPrice * item.quantity;

                  return (
                    <tr key={item.symbol} className="border-t">
                      <td className="px-3 py-2">
                        <Link
                          to={`/company/${item.symbol}/company-profile`}
                          className="text-blue-600 hover:underline"
                        >
                          {item.symbol}
                        </Link>
                      </td>
                      <td className="px-3 py-2">
                        {cartEditingSymbol === item.symbol ? (
                          <input
                            type="number"
                            className="w-20 px-2 py-1 border rounded"
                            value={cartNewQuantity}
                            onChange={(e) =>
                              setCartNewQuantity(Number(e.target.value))
                            }
                            min={1}
                            max={9999}
                          />
                        ) : (
                          item.quantity
                        )}
                      </td>
                      <td className="px-3 py-2">${unitPrice.toFixed(2)}</td>
                      <td className="px-3 py-2">${subtotal.toFixed(2)}</td>
                      <td className="px-3 py-2">
                        <div className="flex justify-center space-x-2">
                          {cartEditingSymbol === item.symbol ? (
                            <>
                              <button
                                onClick={() =>
                                  handleCartQuantitySave(item.symbol)
                                }
                                className="px-2 py-1 bg-green-500 text-white rounded text-sm"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => setCartEditingSymbol(null)}
                                className="px-2 py-1 bg-gray-300 text-black rounded text-sm"
                              >
                                Cancel
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => {
                                  setCartEditingSymbol(item.symbol);
                                  setCartNewQuantity(item.quantity);
                                }}
                                className="px-2 py-1 bg-blue-500 text-white rounded text-sm"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => removeFromCart(item.symbol)}
                                className="px-2 py-1 bg-red-500 text-white rounded text-sm"
                              >
                                Remove
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}

                <tr className="border-t bg-gray-50">
                  <td className="px-3 py-2 font-semibold">Total:</td>
                  <td className="px-3 py-2 font-semibold">{cartQty}</td>
                  <td className="px-3 py-2"></td>
                  <td className="px-3 py-2 font-semibold">
                    ${cartCost.toFixed(2)}
                  </td>
                  <td className="px-3 py-2"></td>
                </tr>
              </tbody>
            </table>
            <button
              onClick={handlePayAll}
              className="px-4 py-2 bg-green-600 text-white font-medium rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-300"
            >
              Pay All
            </button>
          </div>
        )}
      </div>

      <div className="mb-12">
        <h3 className="text-2xl font-semibold mb-4">Portfolio</h3>
        {loadingPort ? (
          <Spinner />
        ) : portfolio.length === 0 ? (
          <p className="italic text-gray-500">Your portfolio is empty.</p>
        ) : (
          <table className="w-full table-auto border-collapse mb-4">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-3 py-2">Symbol</th>
                <th className="px-3 py-2">Company</th>
                <th className="px-3 py-2">Quantity</th>
                <th className="px-3 py-2">Current Price</th>
                <th className="px-3 py-2">Value</th>
                <th className="px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {portfolio.map((item) => {
                const livePrice =
                  priceMap[item.symbol.toUpperCase()] ?? item.purchase;
                return (
                  <tr key={item.symbol} className="border-t">
                    <td className="px-3 py-2">
                      <Link
                        to={`/company/${item.symbol}/company-profile`}
                        className="text-blue-600 hover:underline"
                      >
                        {item.symbol}
                      </Link>
                    </td>
                    <td className="px-3 py-2">{item.companyName}</td>
                    <td className="px-3 py-2">{item.quantity}</td>
                    <td className="px-3 py-2">${livePrice.toFixed(2)}</td>
                    <td className="px-3 py-2">
                      ${(livePrice * item.quantity).toFixed(2)}
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex justify-center space-x-2">
                        <button
                          onClick={() =>
                            openSellModal(item.stockId, item.quantity)
                          }
                          className="px-2 py-1 bg-red-500 text-white rounded text-sm"
                        >
                          Sell
                        </button>
                        <button
                          onClick={() =>
                            handleOpenTransfer(item.stockId, item.quantity)
                          }
                          className="px-2 py-1 bg-purple-500 text-white rounded text-sm"
                        >
                          Transfer
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              <tr className="border-t bg-gray-50">
                <td className="px-3 py-2 font-semibold">Total:</td>
                <td className="px-3 py-2"></td>
                <td className="px-3 py-2 font-semibold">{portQty}</td>
                <td className="px-3 py-2"></td>
                <td className="px-3 py-2 font-semibold">
                  ${portCost.toFixed(2)}
                </td>
                <td className="px-3 py-2"></td>
              </tr>
            </tbody>
          </table>
        )}
      </div>

      {isPayModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg shadow-lg w-96 p-6 relative">
            <h4 className="text-xl font-semibold mb-4">Payment Details</h4>
            <p className="mb-2 text-gray-700">
              Total Amount:{" "}
              <span className="font-bold">${cartCost.toFixed(2)}</span>
            </p>

            <input
              type="text"
              placeholder="1234 5678 9012 3456"
              inputMode="numeric"
              maxLength={19}
              value={cardNumber}
              onChange={(e) => {
                const raw = e.target.value.replace(/\D/g, "").slice(0, 16);
                const withSpaces = raw.match(/.{1,4}/g)?.join(" ") || "";
                setCardNumber(withSpaces);
              }}
              className="w-full px-3 py-2 border rounded mb-3"
            />

            <input
              type="text"
              placeholder="MM/YY"
              maxLength={5}
              value={expiry}
              onChange={(e) => {
                let raw = e.target.value.replace(/\D/g, "").slice(0, 4);
                if (raw.length >= 3) {
                  raw = raw.slice(0, 2) + "/" + raw.slice(2);
                }
                setExpiry(raw);
              }}
              className="w-full px-3 py-2 border rounded mb-3"
            />

            <input
              type="password"
              placeholder="CVV"
              inputMode="numeric"
              maxLength={3}
              value={cvv}
              onChange={(e) => {
                setCvv(e.target.value.replace(/\D/g, "").slice(0, 3));
              }}
              className="w-full px-3 py-2 border rounded mb-4"
            />

            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setIsPayModalOpen(false)}
                className="px-4 py-2 bg-gray-300 text-black rounded"
              >
                Cancel
              </button>
              <button
                onClick={confirmPayment}
                className={`px-4 py-2 text-white rounded ${
                  !cardNumber || !expiry || !cvv
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700"
                }`}
              >
                Pay & Add to Portfolio
              </button>
            </div>
          </div>
        </div>
      )}

      {isSellModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg shadow-lg w-96 p-6 relative">
            <h4 className="text-xl font-semibold mb-4">Sell Shares</h4>
            <p className="mb-2 text-gray-700">
              Available: <span className="font-semibold">{sellMaxQty}</span>
            </p>
            <input
              type="number"
              min={1}
              max={sellMaxQty}
              value={sellQty}
              onChange={(e) => setSellQty(Number(e.target.value))}
              className="w-full px-3 py-2 border rounded mb-4"
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setIsSellModalOpen(false)}
                className="px-4 py-2 bg-gray-300 text-black rounded"
              >
                Cancel
              </button>
              <button
                onClick={confirmSell}
                className="px-4 py-2 bg-red-600 text-white rounded"
              >
                Sell
              </button>
            </div>
          </div>
        </div>
      )}

      {isTransferModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg shadow-lg w-96 p-6 relative">
            <h4 className="text-xl font-semibold mb-4">Transfer Shares</h4>
            <input
              type="number"
              min={1}
              max={
                transferStockId
                  ? getPortfolioQuantityByStockId(transferStockId)
                  : 1
              }
              value={transferQty}
              onChange={(e) => setTransferQty(Number(e.target.value))}
              placeholder="Quantity"
              className="w-full px-3 py-2 border rounded mb-3"
            />
            <input
              type="text"
              value={transferUser}
              onChange={(e) => setTransferUser(e.target.value)}
              placeholder="Recipient Username"
              className="w-full px-3 py-2 border rounded mb-4"
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setIsTransferModalOpen(false)}
                className="px-4 py-2 bg-gray-300 text-black rounded"
              >
                Cancel
              </button>
              <button
                onClick={confirmTransfer}
                className="px-4 py-2 bg-purple-600 text-white rounded"
              >
                Transfer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
