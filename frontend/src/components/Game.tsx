import type {QuestionModel} from "./model/QuestionModel.ts";
import {useEffect, useRef, useState} from "react";
import {formatEnumDisplayName} from "./utils/formatEnumDisplayName.ts";
import {distance} from "fastest-levenshtein";

type GameProps = {
    currentQuestions: QuestionModel[];
    setGameFinished: React.Dispatch<React.SetStateAction<boolean>>;
    setWrongAnswerCount: React.Dispatch<React.SetStateAction<number>>;
    currentQuestionIndex: number;
    setCurrentQuestionIndex: React.Dispatch<React.SetStateAction<number>>;
    setShowWinAnimation: React.Dispatch<React.SetStateAction<boolean>>;
    resetSignal:number;
    handleStartGame: () => void;
}

export default function Game(props: Readonly<GameProps>) {
    const [userInput, setUserInput] = useState("");
    const [showSolution, setShowSolution] = useState<boolean>(false);
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const MAX_DISTANCE = 2; // Toleranz für 1–2 Zeichenfehler

    const currentQuestion = props.currentQuestions[props.currentQuestionIndex];

    const handleSubmit = () => {
        if (showSolution) return;

        const trimmedInput = userInput.trim().toLowerCase();
        const correctAnswer = currentQuestion.solutionWord.toLowerCase();
        const isAnswerCorrect = distance(trimmedInput, correctAnswer) <= MAX_DISTANCE;

        setIsCorrect(isAnswerCorrect);
        setShowSolution(true);

        if (!isAnswerCorrect) {
            props.setWrongAnswerCount(prev => prev + 1);
        }

        const isLast = props.currentQuestionIndex === props.currentQuestions.length - 1;
        if (isLast) {
            setTimeout(() => {
                props.setShowWinAnimation(true);
                props.setGameFinished(true);
                setTimeout(() => props.setShowWinAnimation(false), 5000);
            }, 1000);
        }
    };

    const handleNext = () => {
        if (props.currentQuestionIndex + 1 >= props.currentQuestions.length) {
            props.setGameFinished(true);
        } else {
            props.setCurrentQuestionIndex(prev => prev + 1);
            setUserInput("");
            setIsCorrect(null);
            setShowSolution(false);
        }
    };

    useEffect(() => {
        setUserInput("");
        setIsCorrect(null);
        setShowSolution(false);
    }, [props.resetSignal, props.currentQuestionIndex]);

    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (showSolution && e.key === "Enter") {
                e.preventDefault();
                handleNext();
            }
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [showSolution]);

    useEffect(() => {
        if (!showSolution && inputRef.current) {
            inputRef.current.focus();
        }
    }, [showSolution]);


    return (
        <div className="border">

            <p><strong>Category:</strong> {formatEnumDisplayName(currentQuestion.categoryEnum)}</p>

            <p><strong>Clues:</strong></p>
            <div className="game-clue-words">
                {currentQuestion.clueWords.map((clue, idx) => (
                    <button key={idx} className="button-group-button clue-button">
                        {clue}
                    </button>
                ))}
            </div>

            {!showSolution && (
                <>
                    <p><strong>Your guess:</strong></p>
                    <form
                        className="solution-input margin-bottom-20"
                        onSubmit={(e) => {
                            e.preventDefault();
                            handleSubmit();
                        }}
                    >
                        <label>
                            <input
                                ref={inputRef}
                                className="input-solution"
                                type="text"
                                placeholder="Enter your solution..."
                                value={userInput}
                                onChange={(e) => setUserInput(e.target.value)}
                            />
                        </label>
                        <button type="submit" className="button-group-button clue-button" id="check-button">
                            Check
                        </button>
                    </form>
                </>
            )}


            {showSolution && (
                <div className="game-solution">
                    <p>
                        <strong>Correct answer: </strong>
                        {currentQuestion.solutionWord} {isCorrect ? "✅" : "❌"}
                    </p>
                    <p><strong>Explanation: </strong>{currentQuestion.answerExplanation}</p>

                    {props.currentQuestionIndex === props.currentQuestions.length - 1 ? (
                        <button
                            className="margin-bottom-20"
                            id="check-button"
                            onClick={props.handleStartGame}
                        >
                            Again
                        </button>
                    ) : (
                        <button
                            className="margin-bottom-20"
                            id="check-button"
                            onClick={handleNext}
                        >
                            Next
                        </button>
                    )}
                </div>
            )}
        </div>
    );


}