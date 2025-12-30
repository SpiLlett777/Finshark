import { useEffect, useState } from "react";
import { CompanyComparableData } from "../../company";
import { getComparableData } from "../../api.tsx";
import CompFinderItem from "./CompFinderItem/CompFinderItem.tsx";

interface Props {
  ticker: string;
}

const CompFinder = ({ ticker }: Props) => {
  const [companyData, setCompanyData] = useState<CompanyComparableData>();

  useEffect(() => {
    const getComps = async () => {
      const value = await getComparableData(ticker);
      setCompanyData(value?.data[0]);
    };
    getComps().then();
  }, [ticker]);

  return (
    <div className="inline-flex rounded-md shadow-sm m-4">
      {companyData?.peersList?.map((ticker) => {
        return <CompFinderItem ticker={ticker} />;
      })}
    </div>
  );
};

export default CompFinder;
