import type {QuestionModel} from "./model/QuestionModel.ts";
import type {HighScoreModel} from "./model/HighScoreModel.ts";
import Preview from "./Preview.tsx";
import Game from "./Game.tsx";
import {useState} from "react";
import {ALL_CATEGORIES, type CategoryEnum} from "./model/CategoryEnum.ts";
import {categoryEnumImages} from "./utils/CategoryEnumImages.ts";
import headerLogo from "../assets/logo-word-link.jpg"
import {formatEnumDisplayName} from "./utils/formatEnumDisplayName.ts";
import "./styles/Play.css"

type PlayProps = {
    user: string;
    allActiveQuestions: QuestionModel[];
    highScore: HighScoreModel[];
    getHighScore: () => void;
}

type CategoryWithRandom = CategoryEnum | "RANDOM";

export default function Play(props: Readonly<PlayProps>) {

    const [showPreviewMode, setShowPreviewMode] = useState<boolean>(true);
    const [gameFinished, setGameFinished] = useState<boolean>(true);
    const [intervalId, setIntervalId] = useState<number | null>(null);
    const [currentQuestions, setCurrentQuestions] = useState<QuestionModel[]>([])
    const [categoryEnum, setCategoryEnum] = useState<CategoryWithRandom>("RANDOM");
    const [wrongAnswerCount, setWrongAnswerCount] = useState<number>(0);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
    const [resetSignal, setResetSignal] = useState<number>(0);

    const activeCategories = Array.from(
        new Set(props.allActiveQuestions.map((q) => q.categoryEnum))
    ).sort((a, b) => ALL_CATEGORIES.indexOf(a) - ALL_CATEGORIES.indexOf(b));

    const [showWinAnimation, setShowWinAnimation] = useState<boolean>(false);
    const [isNewHighScore, setIsNewHighScore] = useState<boolean>(false);
    const [playerName, setPlayerName] = useState<string>("");
    const [time, setTime] = useState<number>(0);
    const [showNameInput, setShowNameInput] = useState<boolean>(false);
    const [showPopup, setShowPopup] = useState<boolean>(false);
    const [popupMessage, setPopupMessage] = useState("");

    function selectQuestions(category: CategoryWithRandom) {
        let questions: QuestionModel[]

        if(category === "RANDOM") {
            questions = props.allActiveQuestions;
        } else {
            questions = props.allActiveQuestions.filter(q => q.categoryEnum === category);
        }

        const shuffled = questions.sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, 10);

        setCurrentQuestions(selected);
        setCategoryEnum(category);
    }

    const getWinClass = () => {
        if (wrongAnswerCount === 0) return "win-animation win-animation-perfect";
        if (wrongAnswerCount <= 2) return "win-animation win-animation-good";
        if (wrongAnswerCount <= 5) return "win-animation win-animation-ok";
        return "win-animation win-animation-bad";
    };

    const currentQuestion = currentQuestions[currentQuestionIndex];

    function handleStartGame() {
    }

    function handleResetCurrentQuiz() {
    }

    function handleHardResetGame() {
    }

    return(
        <>
            <div className="space-between">
                <button className="button-group-button" id={gameFinished ? "start-button" : undefined} onClick={handleStartGame} disabled={!gameFinished}>Start</button>
                <button className="button-group-button" disabled={gameFinished} onClick={handleResetCurrentQuiz}>Reset Current Quiz</button>
                <button className="button-group-button" onClick={handleHardResetGame}>Reset Hard</button>
            </div>

            {!showPreviewMode &&
                <div className="space-between">
                    <p>Question Index {currentQuestionIndex + 1}/10</p>
                    <p>Mistakes {wrongAnswerCount}/10</p>
                    {/*<p>⏱️ Time: {time.toFixed(1)} sec</p>*/}
                    <div>
                        <img
                            src={
                                currentQuestion.imageUrl ?? categoryEnumImages[currentQuestion.categoryEnum]
                            }
                            alt="Question visual"
                            className="play-question-image"
                        />
                    </div>
                </div>
            }


            {showPreviewMode &&
                <>
                    <div>
                        <h4>Choose a Category:</h4>
                        <label className="search-bar" id="category-play">
                            <select
                                value={categoryEnum}
                                onChange={(e) => setCategoryEnum(e.target.value as CategoryWithRandom)}
                            >
                                <option value="RANDOM">🎲 Random Category</option>
                                {activeCategories.map((category) => (
                                    <option key={category} value={category}>
                                        {formatEnumDisplayName(category)}
                                    </option>
                                ))}
                            </select>
                            <img
                                src={
                                    categoryEnum !== "RANDOM"
                                        ? categoryEnumImages[categoryEnum]
                                        : headerLogo
                                }
                                alt={categoryEnum || "logo quiz hub"}
                                className="play-category-card-image"
                            />
                        </label>
                    </div>
                    <Preview/>
                </>}

            {!showPreviewMode && currentQuestions && currentQuestions.length > 0 && (
                <Game/>
            )}
        </>
    )
}