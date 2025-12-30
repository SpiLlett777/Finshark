import { createBrowserRouter } from "react-router";
import App from "../App.tsx";
import HomePage from "../Pages/HomePage/HomePage.tsx";
import SearchPage from "../Pages/SearchPage/SearchPage.tsx";
import CompanyPage from "../Pages/CompanyPage/CompanyPage.tsx";
import CompanyProfile from "../Components/CompanyProfile/CompanyProfile.tsx";
import IncomeStatement from "../Components/IncomeStatement/IncomeStatement.tsx";
import DesignGuide from "../Pages/DesignGuide/DesignGuide.tsx";
import BalanceSheet from "../Components/BalanceSheet/BalanceSheet.tsx";
import CashFlowStatement from "../Components/CashFlowStatement/CashFlowStatement.tsx";
import LoginPage from "../Pages/LoginPage/LoginPage.tsx";
import RegisterPage from "../Pages/RegisterPage/RegisterPage.tsx";
import ProtectedRoutes from "./ProtectedRoutes.tsx";
import ProfilePage from "../Pages/ProfilePage/ProfilePage.tsx";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { path: "", element: <HomePage /> },
      { path: "login", element: <LoginPage /> },
      { path: "register", element: <RegisterPage /> },
      {
        path: "search",
        element: (
          <ProtectedRoutes>
            <SearchPage />
          </ProtectedRoutes>
        ),
      },
      { path: "design-guide", element: <DesignGuide /> },
      {
        path: "company/:ticker",
        element: (
          <ProtectedRoutes>
            <CompanyPage />
          </ProtectedRoutes>
        ),
        children: [
          { path: "company-profile", element: <CompanyProfile /> },
          { path: "income-statement", element: <IncomeStatement /> },
          { path: "balance-sheet", element: <BalanceSheet /> },
          { path: "cashflow-statement", element: <CashFlowStatement /> },
        ],
      },
      {
        path: "profile",
        element: (
          <ProtectedRoutes>
            <ProfilePage />
          </ProtectedRoutes>
        ),
      },
    ],
  },
]);
