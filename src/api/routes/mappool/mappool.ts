import { ParameterizedContext } from "koa";
import Router from "@koa/router";
import { PoolMap } from "../../../Models/mappool";
import { PoolMod } from "../../../Interfaces/mappool";

const mappoolRouter = new Router();

mappoolRouter.get("/", async (ctx: ParameterizedContext<any>, next) => {

    const mappool = await PoolMap.find();
    const promises = mappool.map(async beatmap => {
        return beatmap.getInfo();
    });

    const mapArray = await Promise.all(promises);
    
    // sort by pool
    let mappoolArray = {};
    mapArray.forEach(beatmap => {
        const stage = beatmap.stage;
        if (!mappoolArray[stage]) {
            mappoolArray[stage] = [];
        }

        mappoolArray[stage].push(beatmap);
    });

    // Sort the maps in mappoolArray
    for (const stage in mappoolArray) {
        mappoolArray[stage].sort((a, b) => {
            // Sort by mod
            const modOrder = [
                PoolMod.NM,
                PoolMod.HD,
                PoolMod.HR,
                PoolMod.DT,
                PoolMod.FM,
                PoolMod.EZ,
                PoolMod.FL,
                PoolMod.TB
            ];
            const modA = modOrder.indexOf(a.mod);
            const modB = modOrder.indexOf(b.mod);
            if (modA !== modB) {
                return modA - modB;
            }

            // Sort by slot
            return a.slot - b.slot;
        });
    }

    console.log(mappoolArray);
    ctx.body = mappoolArray;
});

export default mappoolRouter;