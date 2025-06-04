import {useEffect, useState} from 'react'
import './App.css'
import Navbar from "./components/Navbar.tsx";
import Footer from "./components/Footer.tsx";
import {Route, Routes} from "react-router-dom";
import NotFound from "./components/NotFound.tsx";
import ProtectedRoute from "./components/ProtectedRoute.tsx";
import axios from "axios";
import Welcome from "./components/Welcome.tsx";
import Profile from "./components/Profile.tsx";
import type {UserDetails} from "./components/model/UserDetailsModel.ts";
import type {QuestionModel} from "./components/model/QuestionModel.ts";
import Play from "./components/Play.tsx";
import Details from "./components/Details.tsx";
import HighScore from "./components/HighScore.tsx";
import ListOfAllQuestions from "./components/ListOfAllQuestions.tsx";
import type {HighScoreModel} from "./components/model/HighScoreModel.ts";


export default function App() {
    const [user, setUser] = useState<string>("anonymousUser");
    const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
    const [favorites, setFavorites] = useState<string[]>([]);

    const [allActiveQuestions, setAllActiveQuestions] = useState<QuestionModel[]>([]);
    const [currentPage, setCurrentPage] = useState<number>(1);

    const [highScore, setHighScore] = useState<HighScoreModel[]>([]);

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

    function getUserDetails() {
        axios.get("/api/users/me/details")
            .then((response) => {
                setUserDetails(response.data as UserDetails);
            })
            .catch((error) => {
                console.error(error);
                setUserDetails(null);
            });
    }

    function toggleFavorite(questionId: string) {
        const isFavorite = favorites.includes(questionId);

        if (isFavorite) {
            axios.delete(`/api/users/favorites/${questionId}`)
                .then(() => {
                    setFavorites((prevFavorites) =>
                        prevFavorites.filter((id) => id !== questionId)
                    );
                })
                .catch((error) => console.error(error));
        } else {
            axios.post(`/api/users/favorites/${questionId}`)
                .then(() => {
                    setFavorites((prevFavorites) => [...prevFavorites, questionId]);
                })
                .catch((error) => console.error(error));
        }
    }

    function getAppUserFavorites(){
        axios.get<QuestionModel[]>(`/api/users/favorites`)
            .then((response) => {
                const favoriteIds = response.data.map((question) => question.id);
                setFavorites(favoriteIds);
            })
            .catch((error) => {
                console.error(error);
            });
    }

    useEffect(() => {
        getUser();
        getAllActiveQuestions();
    }, []);

    useEffect(() => {
        if(user !== "anonymousUser"){
            getUserDetails();
            getAppUserFavorites();
        }
    }, [user]);

    function getAllActiveQuestions(){
        axios
            .get("/api/word-link-hub/active")
            .then((response) => {
                setAllActiveQuestions(response.data);
            })
            .catch((error) => {
                console.error("Error fetching active animals: ", error);
            });
    }

    function getHighScore() {
        axios
            .get("/api/high-score")
            .then((response) => {
                setHighScore(response.data);
            })
            .catch((error) => {
                console.error("Error fetching high score: ", error);
            });
    }

    function handleNewQuestionSubmit(newQuestion: QuestionModel) {
        setAllActiveQuestions((prevQuestions) => [...prevQuestions, newQuestion]);
    }

  return (
      <>
          <Navbar getUser={getUser} getUserDetails={getUserDetails} user={user}/>
          <Routes>
              <Route path="*" element={<NotFound />} />
              <Route path="/" element={<Welcome />} />
              <Route path="/play" element={<Play />} />
              <Route path="/list-of-all-questions" element={<ListOfAllQuestions user={user} favorites={favorites} toggleFavorite={toggleFavorite} currentPage={currentPage} setCurrentPage={setCurrentPage} allActiveQuestions={allActiveQuestions} getAllActiveQuestions={getAllActiveQuestions}/>}/>
              <Route path="/question/:id" element={<Details user={user} favorites={favorites} toggleFavorite={toggleFavorite}/>}/>
              <Route path="/high-score" element={<HighScore highScore={highScore} getHighScore={getHighScore} />}/>

              <Route element={<ProtectedRoute user={user} />}>
                  <Route path="/profile/*" element={<Profile user={user} userDetails={userDetails} handleNewQuestionSubmit={handleNewQuestionSubmit} favorites={favorites} toggleFavorite={toggleFavorite}/>} />
              </Route>
          </Routes>
          <Footer />
      </>

  )
}

