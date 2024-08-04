export interface UserModel {
    id: string;
    username: string;
    birthday: number;
    gameStarted: boolean;
    answer: string;
    attempts: number;
    dailyMiMaMuGuess: string;
    dailyMiMaMuGuessCount: number;
}
