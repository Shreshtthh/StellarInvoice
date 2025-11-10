import { Button, Icon, Layout } from "@stellar/design-system";
import "./App.module.css";
import ConnectAccount from "./components/ConnectAccount.tsx";
import { Routes, Route, Outlet, NavLink } from "react-router-dom";
import Home from "./pages/Home";
import IssuerDashboard from "./pages/IssuerDashboard";
import Marketplace from "./pages/Marketplace";
import InvestorPortfolio from "./pages/InvestorPortfolio";
import Debugger from "./pages/Debugger.tsx";

const AppLayout: React.FC = () => (
  <main>
    <Layout.Header
      projectId="StellarInvoice"
      projectTitle="StellarInvoice"
      contentRight={
        <>
          <nav style={{ display: "flex", gap: "8px" }}>
            <NavLink to="/" style={{ textDecoration: "none" }}>
              {({ isActive }) => (
                <Button
                  variant="tertiary"
                  size="md"
                  disabled={isActive}
                >
                  Home
                </Button>
              )}
            </NavLink>
            
            <NavLink to="/issuer" style={{ textDecoration: "none" }}>
              {({ isActive }) => (
                <Button
                  variant="tertiary"
                  size="md"
                  disabled={isActive}
                >
                  Create
                </Button>
              )}
            </NavLink>

            <NavLink to="/marketplace" style={{ textDecoration: "none" }}>
              {({ isActive }) => (
                <Button
                  variant="tertiary"
                  size="md"
                  disabled={isActive}
                >
                  Marketplace
                </Button>
              )}
            </NavLink>

            <NavLink to="/portfolio" style={{ textDecoration: "none" }}>
              {({ isActive }) => (
                <Button
                  variant="tertiary"
                  size="md"
                  disabled={isActive}
                >
                  Portfolio
                </Button>
              )}
            </NavLink>

            <NavLink to="/debug" style={{ textDecoration: "none" }}>
              {({ isActive }) => (
                <Button
                  variant="tertiary"
                  size="md"
                  disabled={isActive}
                >
                  <Icon.Code02 size="md" />
                  Debugger
                </Button>
              )}
            </NavLink>
          </nav>
          <ConnectAccount />
        </>
      }
    />
    <Outlet />
    <Layout.Footer>
      <span>
        © {new Date().getFullYear()} StellarInvoice. Built with Scaffold Stellar.
      </span>
    </Layout.Footer>
  </main>
);

function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/issuer" element={<IssuerDashboard />} />
        <Route path="/marketplace" element={<Marketplace />} />
        <Route path="/portfolio" element={<InvestorPortfolio />} />
        <Route path="/debug" element={<Debugger />} />
        <Route path="/debug/:contractName" element={<Debugger />} />
      </Route>
    </Routes>
  );
}

export default App;
