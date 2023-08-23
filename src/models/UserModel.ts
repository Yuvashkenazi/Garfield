export interface UserModel {
    id: string;
    username: string;
    isCoreMember: boolean;
    gameStarted: boolean;
    answer: string;
    attempts: number;
    dailyMiMaMuGuess: string;
    dailyMiMaMuGuessCount: number;
}
