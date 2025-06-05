import type { QuestionModel } from "./model/QuestionModel.ts";
import type { HighScoreModel } from "./model/HighScoreModel.ts";
import Preview from "./Preview.tsx";
import Game from "./Game.tsx";
import { useMemo, useState } from "react";
import { ALL_CATEGORIES, type CategoryEnum } from "./model/CategoryEnum.ts";
import { categoryEnumImages } from "./utils/CategoryEnumImages.ts";
import headerLogo from "../assets/logo-word-link.jpg";
import { formatEnumDisplayName } from "./utils/formatEnumDisplayName.ts";
import "./styles/Play.css";

type PlayProps = {
    user: string;
    allActiveQuestions: QuestionModel[];
    highScore: HighScoreModel[];
    getHighScore: () => void;
};

type CategoryWithRandom = CategoryEnum | "RANDOM";

export default function Play(props: Readonly<PlayProps>) {
    const [showPreviewMode, setShowPreviewMode] = useState(true);
    const [gameFinished, setGameFinished] = useState(true);
    const [intervalId, setIntervalId] = useState<number | null>(null);
    const [currentQuestions, setCurrentQuestions] = useState<QuestionModel[]>([]);
    const [categoryEnum, setCategoryEnum] = useState<CategoryWithRandom>("RANDOM");
    const [wrongAnswerCount, setWrongAnswerCount] = useState(0);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [resetSignal, setResetSignal] = useState(0);

    const [showWinAnimation, setShowWinAnimation] = useState(false);
    const [isNewHighScore, setIsNewHighScore] = useState(false);
    const [playerName, setPlayerName] = useState("");
    const [time, setTime] = useState(0);
    const [showNameInput, setShowNameInput] = useState(false);
    const [showPopup, setShowPopup] = useState(false);
    const [popupMessage, setPopupMessage] = useState("");

    const activeCategories = useMemo(
        () =>
            Array.from(
                new Set(props.allActiveQuestions.map((q) => q.categoryEnum))
            ).sort((a, b) => ALL_CATEGORIES.indexOf(a) - ALL_CATEGORIES.indexOf(b)),
        [props.allActiveQuestions]
    );

    function shuffle<T>(arr: T[]): T[] {
        const a = [...arr];
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    }

    function selectQuestions(category: CategoryWithRandom): QuestionModel[] {
        const filtered =
            category === "RANDOM"
                ? props.allActiveQuestions
                : props.allActiveQuestions.filter((q) => q.categoryEnum === category);
        return shuffle(filtered).slice(0, 10);
    }

    const getWinClass = () => {
        if (wrongAnswerCount === 0) return "win-animation win-animation-perfect";
        if (wrongAnswerCount <= 2) return "win-animation win-animation-good";
        if (wrongAnswerCount <= 5) return "win-animation win-animation-ok";
        return "win-animation win-animation-bad";
    };

    const currentQuestion = currentQuestions[currentQuestionIndex];

    function handleStartGame() {
        setCurrentQuestionIndex(0);
        setWrongAnswerCount(0);
        setIsNewHighScore(false);
        setShowNameInput(false);
        setShowWinAnimation(false);
        setTime(0);
        setResetSignal((prev) => prev + 1);

        const selected = selectQuestions(categoryEnum);
        setCurrentQuestions(selected);

        setShowPreviewMode(false);
        setGameFinished(false);
    }

    function handleResetCurrentQuiz() {
        setCurrentQuestionIndex(0);
        setWrongAnswerCount(0);
        setIsNewHighScore(false);
        setShowNameInput(false);
        setShowWinAnimation(false);
        setGameFinished(false);
        setShowPreviewMode(false);
        setResetSignal(prev => prev + 1);
    }

    function handleHardResetGame() {
        setShowPreviewMode(true);
        setGameFinished(true);
        setTime(0);
        setIsNewHighScore(false);
        setCurrentQuestions([]);
        setWrongAnswerCount(0);
        setCurrentQuestionIndex(0);
        setCategoryEnum("RANDOM");
    }

    return (
        <>
            <div className="space-between">
                <button
                    className="button-group-button"
                    id={gameFinished ? "start-button" : undefined}
                    onClick={handleStartGame}
                    disabled={!gameFinished}
                >
                    Start
                </button>
                <button
                    className="button-group-button"
                    disabled={gameFinished}
                    onClick={handleResetCurrentQuiz}
                >
                    Reset Current Quiz
                </button>
                <button className="button-group-button" onClick={handleHardResetGame}>
                    Reset Hard
                </button>
            </div>

            {!showPreviewMode && (
                <div className="space-between">
                    <p>Question Index {currentQuestionIndex + 1}/10</p>
                    <p>Mistakes {wrongAnswerCount}/10</p>
                    {/*<p>⏱️ Time: {time.toFixed(1)} sec</p>*/}
                    <div>
                        <img
                            src={
                                currentQuestion?.imageUrl ??
                                (categoryEnum !== "RANDOM"
                                    ? categoryEnumImages[categoryEnum as CategoryEnum]
                                    : headerLogo)
                            }
                            alt="Question visual"
                            className="play-question-image"
                        />
                    </div>
                </div>
            )}

            {showPreviewMode && (
                <>
                    <div>
                        <h4>Choose a Category:</h4>
                        <label className="search-bar" id="category-play">
                            <select
                                value={categoryEnum}
                                onChange={(e) =>
                                    setCategoryEnum(e.target.value as CategoryWithRandom)
                                }
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
                                        ? categoryEnumImages[categoryEnum as CategoryEnum]
                                        : headerLogo
                                }
                                alt={categoryEnum || "logo quiz hub"}
                                className="play-category-card-image"
                            />
                        </label>
                    </div>
                    <Preview />
                </>
            )}

            {!showPreviewMode &&
                currentQuestions &&
                currentQuestions.length > 0 && <Game />}
        </>
    );
}
