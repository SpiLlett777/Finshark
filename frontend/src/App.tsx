import "./App.css";
import Navbar from "./Components/Navbar/Navbar.tsx";
import { Outlet } from "react-router";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { UserProvider } from "./Context/useAuth.tsx";
import { CartProvider } from "./Context/CartContext.tsx";

function App() {
  return (
    <>
      <UserProvider>
        <CartProvider>
          <Navbar />
          <Outlet />
          <ToastContainer />
        </CartProvider>
      </UserProvider>
    </>
  );
}

export default App;
