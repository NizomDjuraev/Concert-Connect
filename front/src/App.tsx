import NavBar from "./navBar";
import Login from "./login";
import EventSearch from "./eventSearch";
import ViewEvent from "./viewEvent";
import Dashboard from "./Dashboard";
import SavedEvents from "./savedEvents";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Artist from "./Artist";
import MapComponent from "./hotels";

function App() {
  return (
    <Router>
      <div className="App">
        <NavBar />
        <div className="Pages">
          <Routes>
            <Route path="/" element={<Login />}></Route>
            <Route path="/Dashboard" element={<Dashboard />}></Route>
            <Route path="/SavedEvents" element={<SavedEvents />}></Route>
            <Route path="/SearchEvents" element={<EventSearch />}></Route>
            <Route path="/ViewEvent" element={<ViewEvent />}></Route>
            <Route path="/Artist" element={<Artist />}></Route>
            <Route path="/ViewMap" element={<MapComponent/>}></Route>
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
