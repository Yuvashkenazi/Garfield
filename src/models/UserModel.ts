export interface UserModel {
    id: string;
    username: string;
    gameStarted: boolean;
    answer: string;
    attempts: number;
    dailyMiMaMuCount: number;
    dailyMiMaMuGuess: string;
    dailyMiMaMuGuessCount: number;
}
