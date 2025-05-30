import {useEffect, useState} from 'react'
import './App.css'
import Navbar from "./components/Navbar.tsx";
import Footer from "./components/Footer.tsx";
import {Route, Routes} from "react-router-dom";
import NotFound from "./components/NotFound.tsx";
import ProtectedRoute from "./components/ProtectedRoute.tsx";
import axios from "axios";

function Welcome() {
    return null;
}

function Profile() {
    return null;
}

export default function App() {
    const [user, setUser] = useState<string>("anonymousUser");



    function getUser() {
        axios.get("/api/users/me")
            .then((response) => {
                setUser(response.data.toString());
            })
            .catch((error) => {
                console.error(error);
                setUser("anonymousUser");
            });
    }

    useEffect(() => {
        getUser();
    }, []);

  return (
      <>
          <Navbar />
          <Routes>
              <Route path="*" element={<NotFound />} />
              <Route path="/" element={<Welcome />} />

              <Route element={<ProtectedRoute user={user} />}>
                  <Route path="/profile/*" element={<Profile />} />
              </Route>
          </Routes>
          <Footer />
      </>

  )
}

