import dotenv from 'dotenv';
dotenv.config();

// NOTE: Pro apis may have different urls

const config = {
    coinmarketcapUrl: "https://pro-api.coinmarketcap.com",
    coinmarketcapHeaders: {
        "X-CMC_PRO_API_KEY": process.env['CMC_API_KEY']
    },

    coingeckoUrl: "https://pro-api.coingecko.com/api/v3",
    coingeckoHeaders: {
        "x-cg-pro-api-key": process.env['CG_API_KEY']
    },

    coinpaprikaUrl: "https://api.coinpaprika.com/v1",
    coinpaprikaHeaders: {
        "Authorization": process.env['CP_API_KEY']
    },

    cryptowatchUrl: "https://api.cryptowat.ch",
    cryptowatchHeaders: {
        "X-CW-API-Key": process.env['CW_API_KEY']
    },

    bitqueryUrl: "https://graphql.bitquery.io",
    bitqueryHeader: {
        'X-API-KEY': process.env['BQ_API_KEY']
    },

    dexToolsUrl: "https://api.dextools.io/v1",
    dexToolsLogoBaseUrl: "https://www.dextools.io/resources/tokens/logos/",
    dexToolsHeaders: {
        'X-API-KEY': process.env['DEX_TOOLS_API_KEY']
    }
}

export default config;