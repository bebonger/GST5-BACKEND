import { config } from "node-config-ts";
import { osuAPIV2 } from "./Interfaces/osuAPIV2";

// API v2
const osuV2Client = new osuAPIV2(config.osu.v2.clientId, config.osu.v2.clientSecret);

export { osuV2Client };