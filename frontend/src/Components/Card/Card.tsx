import React, { ReactElement } from "react";
import { CompanySearch } from "../../company";
import { Link } from "react-router-dom";
import { CartItem } from "../../Context/CartContext";

interface Props {
  id: string;
  searchResult: CompanySearch;
  onPortfolioCreate: (symbol: string) => void;
  cartItems: CartItem[];
}

const Card: React.FC<Props> = ({
  id,
  searchResult,
  onPortfolioCreate,
  cartItems,
}: Props): ReactElement => {
  const inCart = cartItems.some((c) => c.symbol === searchResult.symbol);

  return (
    <div
      className="flex flex-col items-center justify-between w-full p-6 bg-slate-100 rounded-lg md:flex-row mb-4"
      key={id}
      id={id}
    >
      <div className="flex-1">
        <Link
          to={`/company/${searchResult.symbol}/company-profile`}
          className="font-bold text-black"
        >
          {searchResult.name} ({searchResult.symbol})
        </Link>
        <p className="text-gray-700">
          {searchResult.currency} — {searchResult.exchange}
        </p>
      </div>
      <button
        onClick={() => onPortfolioCreate(searchResult.symbol)}
        className={
          inCart
            ? "mt-4 md:mt-0 px-4 py-2 bg-gray-400 text-white rounded cursor-pointer"
            : "mt-4 md:mt-0 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded cursor-pointer"
        }
      >
        {inCart ? "Added" : "Add"}
      </button>
    </div>
  );
};

export default Card;
