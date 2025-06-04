import type {QuestionModel} from "./model/QuestionModel.ts";
import type {HighScoreModel} from "./model/HighScoreModel.ts";
import Preview from "./Preview.tsx";

type PlayProps = {
    user: string;
    allActiveQuestions: QuestionModel[];
    highScore: HighScoreModel[];
    getHighScore: () => void;
}

export default function Play(props: Readonly<PlayProps>) {


    return(
        <>
            <h2>Play</h2>
            <p>10 Rounds</p>
            <p>{props.user}</p>
            <Preview/>
        </>
    )
}