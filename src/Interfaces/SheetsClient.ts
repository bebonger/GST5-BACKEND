import { FindOptionsWhere } from 'typeorm';
import { Team } from "../Models/team";
import { convertDateToTimestamp } from "../helper";
import { MatchInfo, SimpleMatchInfo } from "./bracket";

const fs = require('fs').promises;
const path = require('path');
const { authenticate } = require('@google-cloud/local-auth');
const { google } = require('googleapis');

export class SheetsAPI {

    private readonly SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly'];
    private readonly TOKEN_PATH = path.join(process.cwd(), 'config', 'token.json');
    private readonly CREDENTIALS_PATH = path.join(process.cwd(), 'config', 'credentials.json');

    private client: any = null;

    /**
     * Reads previously authorized credentials from the save file.
     *
     * @return {Promise<OAuth2Client|null>}
     */
    private async loadSavedCredentialsIfExist() {
        try {
            const content = await fs.readFile(this.TOKEN_PATH);
            const credentials = JSON.parse(content);
            return google.auth.fromJSON(credentials);
        } catch (err) {
            return null;
        }
    }

    /**
     * Serializes credentials to a file comptible with GoogleAUth.fromJSON.
     *
     * @param {OAuth2Client} client
     * @return {Promise<void>}
     */
    private async saveCredentials(client) {
        const content = await fs.readFile(this.CREDENTIALS_PATH);
        const keys = JSON.parse(content);
        const key = keys.installed || keys.web;
        const payload = JSON.stringify({
            type: 'authorized_user',
            client_id: key.client_id,
            client_secret: key.client_secret,
            refresh_token: client.credentials.refresh_token,
        });
        await fs.writeFile(this.TOKEN_PATH, payload);
    }

    /**
     * Load or request or authorization to call APIs.
     *
     */
    public async authorize() {
        let client = await this.loadSavedCredentialsIfExist();
        if (client) {
            return client;
        }
        client = await authenticate({
            scopes: this.SCOPES,
            keyfilePath: this.CREDENTIALS_PATH,
        });
        if (client.credentials) {
            await this.saveCredentials(client);
        }
        console.log(`Sheets: ${client}`);
    }
          
    public async getMatches() {
        let matches = {};
        let auth = await this.authorize();
        const sheets = google.sheets({version: 'v4', auth});
        const res = await sheets.spreadsheets.values.get({
          spreadsheetId: '1IEzDmmXnqQ3CT3I2fE1rG8hmaZCxQ4CTLimUtUTLglg',
          range: 'schedule!B3:S',
        });
        const rows = res.data.values;
        if (!rows || rows.length === 0) {
          console.log('No data found.');
          return;
        }

        const promises = rows.map(async row => {

            let match: SimpleMatchInfo = {
                matchID: row[1],
                stage: row[0],
                redTeam: row[5],
                blueTeam: row[10],
                schedule: {
                    date: convertDateToTimestamp(row[2], 2023),
                    time: row[3]
                },
                result: {
                    redTeamScore: row[7],
                    blueTeamScore: row[8],
                },
                matchType: row[17],
                mp_link: row[15] ? `https://osu.ppy.sh/mp/${row[15]}` : null,
                referee: row[11]
            };

            return match;
        });

        let matchArray = await Promise.all(promises);
        let filtered = matchArray.filter(function (el) {
            return el != null;
        });
        return filtered;
    }

}
