import type {UserDetails} from "./model/UserDetailsModel.ts";
import type {QuestionModel} from "./model/QuestionModel.ts";
import {useEffect, useState} from "react";
import axios from "axios";
import MyQuestions from "./MyQuestions.tsx";
import Favorites from "./Favorites.tsx";
import AddQuestionCard from "./AddQuestionCard.tsx";
import "./styles/Profile.css"

type ProfileProps = {
    user: string;
    userDetails: UserDetails | null;
    handleNewQuestionSubmit: (newQuestion: QuestionModel) => void;
    favorites: string[];
    toggleFavorite: (questionId: string) => void;
}

export default function Profile(props:Readonly<ProfileProps>){

    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [userQuestions, setUserQuestions] = useState<QuestionModel[]>([]);

    const [activeTab, setActiveTab] = useState<"profile" | "add-question" | "my-questions" | "favorites" >(() => {
        const savedTab = localStorage.getItem("activeTab");
        return (savedTab as "profile" | "add-question" | "my-questions" | "favorites" ) || "profile";
    });

    function getUserQuestions() {
        axios
            .get(`/api/users/me/my-questions/${props.user}`)
            .then((response) => {
                setUserQuestions(response.data);
            })
            .catch((error) => {
                console.error("Error fetching user questions: ", error);
            });
    }
    useEffect(() => {
        localStorage.setItem("activeTab", activeTab);
    }, [activeTab]);

    useEffect(() => {
        getUserQuestions();
    }, []);

    return (
        <div className="profile-container">
            {/* Button-Navigation */}
            <div className="space-between" id="buttons-profile-container">
                <button className={activeTab === "profile" ? "active-profile-button" : "button-group-button"} onClick={() => setActiveTab("profile")}>Profil of Github</button>
                <button className={activeTab === "add-question" ? "active-profile-button" : "button-group-button"} onClick={() => setActiveTab("add-question")}>Add new Question</button>
                <button className={activeTab === "my-questions" ? "active-profile-button" : "button-group-button"} onClick={() => { setActiveTab("my-questions"); setIsEditing(false); getUserQuestions(); }}>My Questions</button>
                <button className={activeTab === "favorites" ? "active-profile-button" : "button-group-button"} onClick={() => setActiveTab("favorites")}>Favorites</button>
            </div>

            {/* Anzeige je nach aktivem Tab */}
            <div>
                {activeTab === "profile" && (
                    <>
                        <h2>GitHub Profile</h2>
                        {props.userDetails ? (
                            <div>
                                <p>Username: {props.userDetails.login}</p>
                                <p>Name: {props.userDetails.name || "No name provided"}</p>
                                <p>Location: {props.userDetails.location ?? "No location provided"}</p>
                                {props.userDetails.bio && <p>Bio: {props.userDetails.bio}</p>}
                                <p>Followers: {props.userDetails.followers}</p>
                                <p>Following: {props.userDetails.following}</p>
                                <p>Public Repositories: {props.userDetails.public_repos}</p>
                                <p>
                                    GitHub Profile:{" "}
                                    <a href={props.userDetails.html_url} target="_blank" rel="noopener noreferrer">
                                        Visit Profile
                                    </a>
                                </p>
                                <img className="profile-container-img" src={props.userDetails.avatar_url} alt={`${props.userDetails.login}'s avatar`} />
                                <p>Account Created: {new Date(props.userDetails.created_at).toLocaleDateString()}</p>
                                <p>Last Updated: {new Date(props.userDetails.updated_at).toLocaleDateString()}</p>
                            </div>
                        ) : (
                            <p>Loading...</p>
                        )}
                    </>
                )}
                {activeTab === "add-question" && <AddQuestionCard user={props.user} handleNewQuestionSubmit={props.handleNewQuestionSubmit}/>}
                {activeTab === "my-questions" && <MyQuestions user={props.user} favorites={props.favorites} toggleFavorite={props.toggleFavorite} isEditing={isEditing} setIsEditing={setIsEditing} userQuestions={userQuestions} getUserQuestions={getUserQuestions} setUserQuestions={setUserQuestions}/>}
                {activeTab === "favorites" && <Favorites user={props.user} favorites={props.favorites} toggleFavorite={props.toggleFavorite}/>}
            </div>
        </div>
    );
}