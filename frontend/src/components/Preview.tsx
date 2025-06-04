import {DefaultQuestion} from "./model/QuestionModel.ts";
import "./styles/Preview.css"
import {formatEnumDisplayName} from "./utils/formatEnumDisplayName.ts";

export default function Preview(){

    const question = DefaultQuestion;

    return (
        <div className="border">
            <h2>Preview:</h2>
            <p><strong>Category: </strong> {formatEnumDisplayName(question.categoryEnum)}</p>
            <p><strong>Clues:</strong></p>
            <div className="game-clue-words">
                {question.clueWords.map((clue, idx) => (
                    <button key={idx} className="button-group-button clue-button">
                        {clue}
                    </button>
                ))}
            </div>
            <p><strong>Solution Word: </strong></p>

            <div className="solution-input">
                <label>

                    <input
                        className="input-solution"
                        type="text"
                        value={question.solutionWord}
                    />
                </label>
                <button className="button-group-button clue-button" id="check-button">Check</button>
            </div>


            <div className="game-solution">
                <p> <strong>Lösung: </strong>{question.solutionWord} ✅</p>
                <p><strong>Erklärung: </strong>{question.answerExplanation}</p>
            </div>
        </div>
    );
}