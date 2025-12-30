import React, { ReactElement } from "react";
import Card from "../Card/Card";
import { CompanySearch } from "../../company";
import { CartItem } from "../../Context/CartContext";

interface Props {
  searchResults: CompanySearch[];
  onPortfolioCreate: (symbol: string) => void;
  cartItems: CartItem[];
}

const CardList: React.FC<Props> = ({
  searchResults,
  onPortfolioCreate,
  cartItems,
}: Props): ReactElement => {
  if (searchResults.length === 0) {
    return (
      <p className="mb-3 mt-3 text-xl font-semibold text-center">No results</p>
    );
  }

  return (
    <>
      {searchResults.map((result) => (
        <Card
          id={result.symbol}
          key={result.symbol}
          searchResult={result}
          onPortfolioCreate={onPortfolioCreate}
          cartItems={cartItems}
        />
      ))}
    </>
  );
};

export default CardList;
