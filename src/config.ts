import dotenv from 'dotenv';
dotenv.config();

// NOTE: Pro apis may have different urls

const config = {
    coingeckoUrl: "https://pro-api.coingecko.com/api/v3",
    coingeckoHeaders: {
        "x-cg-pro-api-key": process.env['CG_API_KEY']
    },

    cryptowatchUrl: "https://api.cryptowat.ch",
    cryptowatchHeaders: {
        "X-CW-API-Key": process.env['CW_API_KEY']
    },

    bitqueryUrl: "https://graphql.bitquery.io",
    bitqueryHeader: {
        'X-API-KEY': process.env['BQ_API_KEY']
    },

    aegisUrl: "https://api.aegisweb3.com",
    aegisHeader: {}
}

export default config;