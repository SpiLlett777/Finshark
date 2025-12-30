import { useEffect, useState } from "react";
import { CompanyTenK } from "../../company";
import { getTenK } from "../../api.tsx";
import Spinner from "../Spinner/Spinner.tsx";
import TenKFinderItem from "./TenKFinderItem/TenKFinderItem.tsx";
import { v4 as uuvid4 } from "uuid";

interface Props {
  ticker: string;
}

const TenKFinder = ({ ticker }: Props) => {
  const [companyData, setCompanyData] = useState<CompanyTenK[]>();

  useEffect(() => {
    const getTenKData = async () => {
      const value = await getTenK(ticker);
      setCompanyData(value?.data);
    };
    getTenKData();
  }, [ticker]);

  return (
    <div className="inline-flex rounded-md shadow-sm m-4">
      {companyData ? (
        companyData?.slice(0, 5).map((tenK) => {
          return <TenKFinderItem key={uuvid4()} tenK={tenK} />;
        })
      ) : (
        <Spinner />
      )}
    </div>
  );
};

export default TenKFinder;
