import Table from "../../Components/Table/Table.tsx";
import RatioList from "../../Components/RatioList/RatioList.tsx";
import { testIncomeStatementData } from "../../Components/Table/testData.tsx";

const tableConfig = [
  {
    label: "Market Cap",
    render: (company: any) => company.marketCapTTM,
    subTitle: "Total value of all a company's shares of stock",
  },
];

const DesignGuide = () => {
  return (
    <>
      <h1>FinShark Design Page</h1>
      <h2>
        This is FinShark's design page. This is where we will house various
        design aspects of the app
      </h2>
      <RatioList data={testIncomeStatementData} config={tableConfig} />
      <Table data={testIncomeStatementData} config={tableConfig} />
    </>
  );
};

export default DesignGuide;
