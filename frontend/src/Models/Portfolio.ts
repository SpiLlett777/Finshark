export type PortfolioGet = {
  stockId: number;
  symbol: string;
  companyName: string;
  quantity: number;
  purchase: number;
  lastDiv: number;
  industry: string;
  marketCap: number;
  comments: string[];
};

export type PortfolioPost = {
  symbol: string;
};
