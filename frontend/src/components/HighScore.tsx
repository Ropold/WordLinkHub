import type {HighScoreModel} from "./model/HighScoreModel.ts";
import "./styles/HighScore.css"
import axios from "axios";
import {useEffect, useState} from "react";
import {formatEnumDisplayName} from "./utils/formatEnumDisplayName.ts";

type HighScoreProps = {
    highScore: HighScoreModel[];
    getHighScore: () => void;
}

const formatDate = (date: string) => {
    const options: Intl.DateTimeFormatOptions = {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    };
    return new Date(date).toLocaleDateString("de-DE", options);
};

export default function HighScore(props: Readonly<HighScoreProps>) {

    const [githubUsernames, setGithubUsernames] = useState<Map<string, string>>(new Map());

    function fetchGithubUsernames(highScores: HighScoreModel[]) {
        const uniqueIds = new Set(
            highScores
                .filter(score => score.githubId !== "anonymousUser")
                .map(score => score.githubId)
        );

        const newUsernames = new Map(githubUsernames);

        uniqueIds.forEach(async (id) => {
            if (!newUsernames.has(id)) {
                axios.get(`https://api.github.com/user/${id}`)
                    .then((response) => {
                        newUsernames.set(id, response.data.login);
                        setGithubUsernames(new Map(newUsernames));
                    })
                    .catch((error) => {
                        console.error(`Error fetching GitHub user ${id}:`, error);
                    });
            }
        });
    }

    useEffect(() => {
            fetchGithubUsernames(props.highScore);
    }, [props.highScore]);


    useEffect(() => {
        props.getHighScore();
    }, []);

    return (
        <div className="high-score-table margin-top-20">
            <h3 className="high-score-table-h3">High-Score</h3>
            <table className="margin-top-20">
                <thead>
                <tr>
                    <th>Rank</th>
                    <th>Player-Name</th>
                    <th>Date</th>
                    <th>Category</th>
                    <th>Wrong Answers</th>
                    <th>Authentication</th>
                    <th>Time</th>
                </tr>
                </thead>
                <tbody>
                {props.highScore.map((highScore, index) => (
                    <tr key={highScore.id}>
                        <td>{index + 1}</td>
                        <td>{highScore.playerName}</td>
                        <td>{formatDate(highScore.date)}</td>
                        <td>{formatEnumDisplayName(highScore.categoryEnum)}</td>
                        <td>{highScore.wrongAnswerCount}</td>
                        <td>
                            {highScore.githubId === "anonymousUser"
                                ? "Anonymous"
                                : `Github-User (${githubUsernames.get(highScore.githubId) || "Loading..."})`}
                        </td>
                        <td>{highScore.scoreTime}</td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}
