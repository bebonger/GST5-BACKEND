import { config } from 'node-config-ts';
import { ImgurClient } from 'imgur';

// or your client ID
const imgurClient = new ImgurClient({ 
    clientId: config.imgur.clientId,
    clientSecret: config.imgur.clientSecret,
});

export default imgurClient;