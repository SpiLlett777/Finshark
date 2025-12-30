import { ChangeEvent, SyntheticEvent, useEffect, useState } from "react";
import Search from "../../Components/Search/Search";
import ListPortfolio from "../../Components/Portfolio/ListPortfolio/ListPortfolio";
import CardList from "../../Components/CardList/CardList";
import { CompanySearch } from "../../company";
import { searchCompanies } from "../../api";
import {
  portfolioDeleteAPI,
  portfolioGetAPI,
} from "../../Services/PortfolioService";
import { toast } from "react-toastify";
import { useCart } from "../../Context/CartContext";
import { stockGetAPI } from "../../Services/StockService.tsx";

export type PortfolioViewModel = {
  stockId: number;
  symbol: string;
  companyName: string;
  quantity: number;
};

const SearchPage = () => {
  const [search, setSearch] = useState<string>("");
  const [portfolioValues, setPortfolioValues] = useState<PortfolioViewModel[]>(
    [],
  );
  const [searchResult, setSearchResult] = useState<CompanySearch[]>([]);
  const [serverError, setServerError] = useState<string>("");

  const { cart, addToCart, removeFromCart } = useCart();

  useEffect(() => {
    getPortfolio().then();
  }, []);

  const getPortfolio = async () => {
    try {
      const response = await portfolioGetAPI();
      if (!response?.data?.items) return;

      const enriched: PortfolioViewModel[] = await Promise.all(
        response.data.items.map(async (item) => {
          const stockRes = await stockGetAPI(item.stockId);
          const stock = stockRes?.data;

          if (!stock) {
            throw new Error("Stock is not found!");
          }

          return {
            stockId: item.stockId,
            symbol: stock.symbol,
            companyName: stock.companyName,
            quantity: item.quantity,
          };
        }),
      );

      setPortfolioValues(enriched);
    } catch {
      toast.warning("Could not get portfolio values!");
    }
  };

  const onPortfolioDelete = (e: any) => {
    e.preventDefault();
    const symbol = e.target.value;
    portfolioDeleteAPI(symbol).then((respond) => {
      if (respond?.status === 200) {
        toast.success("Stock deleted from portfolio!");
        getPortfolio().then();
      }
    });
  };

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const onSearchSubmit = async (e: SyntheticEvent) => {
    e.preventDefault();
    const result = await searchCompanies(search!);

    if (typeof result === "string") {
      setServerError(result);
    } else if (Array.isArray(result.data)) {
      setSearchResult(result.data);
    }
  };

  const toggleCart = (symbol: string) => {
    const inCart = cart.some((i) => i.symbol === symbol);
    if (!inCart) {
      addToCart(symbol);
      toast.success(`“${symbol}” added to cart`);
    } else {
      removeFromCart(symbol);
      toast.info(`“${symbol}” removed from cart`);
    }
  };

  return (
    <>
      <Search
        onSearchSubmit={onSearchSubmit}
        search={search}
        handleSearchChange={handleSearchChange}
      />

      <ListPortfolio
        portfolioValues={portfolioValues!}
        onPortfolioDelete={onPortfolioDelete}
      />

      <CardList
        searchResults={searchResult}
        onPortfolioCreate={toggleCart}
        cartItems={cart}
      />

      {serverError && <div>Unable to connect to API</div>}
    </>
  );
};

export default SearchPage;
