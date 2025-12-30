import { CompanyKeyMetrics } from "../../company";
import { useOutletContext } from "react-router-dom";
import { useEffect, useState } from "react";
import { getKeyMetrics } from "../../api.tsx";
import RatioList from "../RatioList/RatioList.tsx";
import Spinner from "../Spinner/Spinner.tsx";
import {
  formatLargeNonMonetaryNumber,
  formatRatio,
} from "../../Helpers/NumberFormatting.tsx";
import StockComment from "../StockComment/StockComment.tsx";

const tableConfig = [
  {
    label: "Market Cap",
    render: (company: CompanyKeyMetrics) =>
      formatLargeNonMonetaryNumber(company.marketCap),
    subTitle: "Total value of all a company's shares of stock",
  },
  {
    label: "Current Ratio",
    render: (company: CompanyKeyMetrics) =>
      formatRatio(company.currentRatioTTM),
    subTitle:
      "Measures the company's ability to pay short-term debt obligations",
  },
  {
    label: "Return On Equity",
    render: (company: CompanyKeyMetrics) =>
      formatRatio(company.returnOnEquityTTM),
    subTitle: "Net income divided by shareholder equity",
  },
  {
    label: "Return On Assets",
    render: (company: CompanyKeyMetrics) =>
      formatRatio(company.returnOnAssetsTTM),
    subTitle: "How efficiently a company uses its assets",
  },
  {
    label: "Free Cash Flow Yield",
    render: (company: CompanyKeyMetrics) =>
      formatRatio(company.freeCashFlowYieldTTM),
    subTitle: "Free cash flow relative to market capitalization",
  },
  {
    label: "Tangible Asset Value",
    render: (company: CompanyKeyMetrics) =>
      formatLargeNonMonetaryNumber(company.tangibleAssetValueTTM),
    subTitle: "Total tangible assets minus liabilities",
  },
  {
    label: "Capex to Revenue",
    render: (company: CompanyKeyMetrics) =>
      formatRatio(company.capexToRevenueTTM),
    subTitle: "Capital expenditures as a percentage of revenue",
  },
  {
    label: "Graham Number",
    render: (company: CompanyKeyMetrics) =>
      formatRatio(company.grahamNumberTTM),
    subTitle: "Upper bound price for a defensive investor",
  },
];

const CompanyProfile = () => {
  const ticker = useOutletContext<string>();
  const [companyData, setCompanyData] = useState<CompanyKeyMetrics>();
  useEffect(() => {
    const getCompanyKeyMetrics = async () => {
      const value = await getKeyMetrics(ticker);
      setCompanyData(value?.data[0]);
    };
    getCompanyKeyMetrics().then();
  }, [ticker]);
  return (
    <>
      {companyData ? (
        <>
          <RatioList data={companyData} config={tableConfig} />
          <StockComment stockSymbol={ticker} />
        </>
      ) : (
        <Spinner />
      )}
    </>
  );
};

export default CompanyProfile;
