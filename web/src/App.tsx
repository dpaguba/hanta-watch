import { useState } from "react";
import { Link, NavLink, Route, Routes, useLocation } from "react-router-dom";

import { useReveal } from "./lib/motion";

import AboutPage from "./pages/AboutPage";
import CountryPage from "./pages/CountryPage";
import DataPage from "./pages/DataPage";
import HomePage from "./pages/HomePage";
import NewsPage from "./pages/NewsPage";
import OutbreakPage from "./pages/OutbreakPage";

function NotFound() {
  return (
    <article className="about">
      <p className="t-caps muted">404</p>
      <h1 className="t-display-lg about__title">This page does not exist</h1>
      <p className="about__lede">
        The address you followed is not one of ours. The overview, the news feed
        and the data are all reachable from the navigation above.
      </p>
      <p style={{ marginTop: "var(--s-lg)" }}>
        <Link className="btn btn--primary" to="/">
          Back to the overview
        </Link>
      </p>
    </article>
  );
}

export default function App() {
  const [navOpen, setNavOpen] = useState(false);
  const location = useLocation();

  useReveal(location.pathname);

  return (
    <div className="app">
      <header className="app__nav">
        <a href={import.meta.env.BASE_URL} className="app__brand" aria-label="Hanta-Watch home">
          <span className="app__brand-mark" aria-hidden />
          {"Hanta-Watch"}
        </a>
        <nav className={`app__nav-links ${navOpen ? "open" : ""}`}>
          <NavLink to="/" end onClick={() => setNavOpen(false)}>
            {"Overview"}
          </NavLink>
          <NavLink to="/news" onClick={() => setNavOpen(false)}>{"News"}</NavLink>
          <NavLink to="/data" onClick={() => setNavOpen(false)}>{"Data"}</NavLink>
          <NavLink to="/about" onClick={() => setNavOpen(false)}>{"About"}</NavLink>
        </nav>
        <div className="app__nav-right">
          <button
            type="button"
            className="nav-toggle"
            aria-label={navOpen ? "Close menu" : "Open menu"}
            aria-expanded={navOpen}
            onClick={() => setNavOpen((v) => !v)}
          >
            <span className="nav-toggle__bar" aria-hidden />
          </button>
        </div>
      </header>

      <main className="app__main page-in" key={location.pathname}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/outbreaks/:id" element={<OutbreakPage />} />
          <Route path="/countries/:iso3" element={<CountryPage />} />
          <Route path="/news" element={<NewsPage />} />
          <Route path="/data" element={<DataPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

    </div>
  );
}
