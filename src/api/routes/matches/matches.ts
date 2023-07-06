import { ParameterizedContext } from "koa";
import Router from "@koa/router";
import { Match } from "../../../Models/bracket";

const matchRouter = new Router();

matchRouter.get("/", async (ctx: ParameterizedContext<any>, next) => {   
    const matches = await Match.find({
        relations: ['redTeam', 'blueTeam', 'redTeam.player1', 'redTeam.player2',  'blueTeam.player1', 'blueTeam.player2']
    });
    const promises = matches.map(async match => {
        return match.getInfo();
    });

    const matchArray = await Promise.all(promises);

    let matchesByStage = {};
    matchArray.forEach(match => {
        const stage = match.stage;
        if (!matchesByStage[stage]) {
            matchesByStage[stage] = [];
        }

        matchesByStage[stage].push(match);
    });

    // Sort matches in each stage by ID
    for (const stage in matchesByStage) {
        matchesByStage[stage].sort((match1, match2) => {
            const id1 = match1.matchID;
            const id2 = match2.matchID;
            const prefix1 = id1.charAt(0);
            const prefix2 = id2.charAt(0);
    
            if (prefix1 === prefix2) {
                return parseInt(id1.slice(1)) - parseInt(id2.slice(1));
            } else {
                return prefix1.localeCompare(prefix2);
            }
        });
    }

    console.log(matchesByStage);
    ctx.body = matchesByStage;
});

export default matchRouter;