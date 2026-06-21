import { useState } from "react";
import DashboardPage from "./pages/DashboardPage";
import Header from "./components/Header";
import HomePage from "./pages/HomePage";
import AboutPage from "./pages/AboutPage";
import ComparePage from "./pages/ComparePage";

export default function App() {
  const [activePage, setActivePage] = useState("home");

  const renderPage = () => {
    switch (activePage) {
      case "home":
        return <HomePage onStart={() => setActivePage("dashboard")} />;
      case "dashboard":
        return <DashboardPage />;
      case "about":
        return <AboutPage />;
      case "compare":
        return <ComparePage />;
      default:
        return <HomePage onStart={() => setActivePage("dashboard")} />;
    }
  };

  return (
    <>
      <Header activePage={activePage} onNavigate={setActivePage} />
      {renderPage()}
    </>
  );
}
