import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import { Routes, Route, Outlet } from "react-router-dom";
import { Link } from "react-router-dom";
import Navbar from "./layouts/Navbar";

function TestApp() {
  return (
    <div className="App">
      <h1>Hello</h1>
      <Routes>
        <Route path="/" element={<LayoutComponent />}>
          <Route index element={<DefaultContent />} />
          <Route path="/test" element={<TestComponent />} />
          {/* <Route path='dashboard' element={<Dashboard />} />
                <Route path='*' element={<NoMatch />} /> */}
        </Route>
      </Routes>
    </div>
  );
}
function LayoutComponent() {
  const [serverMessage, setServerMessage] = useState("");
  function onFetchCookie() {
    fetch("/api/v1/hi")
      .then(async (res) => {
        setServerMessage(await res.text());
      })
      .catch((err) => {
        setServerMessage(`Error: ${err}`);
      });
  }

  function onSubmitCookie() {
    fetch("/api/v1/submit", { method: "post" })
      .then(async (res) => {
        setServerMessage(await res.text());
      })
      .catch((err) => {
        setServerMessage(`Error: ${err}`);
      });
  }

  return (
    <div>
      <Navbar />
      <div>{serverMessage || "No message"}</div>
      <button onClick={onFetchCookie}>Fetch Cookie</button>
      <button onClick={onSubmitCookie}>Submit Cookie</button>
      <Outlet />
    </div>
  );
}
function TestComponent() {
  return (
    <h1>
      Test{" "}
      <Link to="/" title="yay">
        Go Home
      </Link>
    </h1>
  );
}

function DefaultContent() {
  const [count, setCount] = useState(0);

  return (
    <>
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  );
}

export default TestApp;
