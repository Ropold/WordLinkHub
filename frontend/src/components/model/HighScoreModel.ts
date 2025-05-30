export type HighScoreModel = {
    id: string;
    playerName: string;
    githubId: string;
    categoryEnum: string;
    wrongAnswerCount: number;
    scoreTime: number;
    date: string;
}