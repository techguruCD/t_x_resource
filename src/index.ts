import dotenv from 'dotenv';
dotenv.config();

import loggersUtil from './utils/loggers.util';
import mongoose from 'mongoose';
import cgCoinInfoCron from './cg-scripts/coinInfo.cron';
import cgCoinTickersCron from './cg-scripts/coinTickers.cron';
// import cmcCoinListCron from './cmc-scripts/coinList.cron';
// import cmcMetadataCron from './cmc-scripts/metadata.cron';
// import bqCoinsCron from './biquery-scripts/bqCoins.cron';
// import bqPairsCron from './biquery-scripts/bqPairs.cron';
// import cgCoinListCron from './cg-scripts/coinList.cron';


if (!process.env['DB_URI']) {
    loggersUtil.mainLogger.error('DB_URI is not found or is invalid in env');
    process.exit(1);
}

if (!process.env['CMC_API_KEY']) {
    loggersUtil.mainLogger.error('CMC_API_KEY is not found or is invalid in env')
    process.exit(1);
}

if (!process.env['CW_API_KEY']) {
    loggersUtil.mainLogger.error('CW_API_KEY is not found or is invalid in env')
    process.exit(1);
}

(async () => {
    try {
        loggersUtil.mainLogger.info('connecting to database...');

        mongoose.set('strictQuery', true);
        const db = await mongoose.connect(`${process.env['DB_URI']}`);

        loggersUtil.mainLogger.info(`connected to ${db.connection.db.databaseName}`);

        // cmcCoinListCron.cron.start();
        // cmcMetadataCron.cron.start();
        // bqCoinsCron.bqEthCoinsCron.start();
        // bqCoinsCron.bqMaticCoinsCron.start();
        // bqCoinsCron.bqBscCoinsCron.start();
        // bqCoinsCron.bqVelasCoinsCron.start();
        // bqCoinsCron.bqKlaytnCoinsCron.start();
        // bqCoinsCron.bqAvalancheCoinsCron.start();
        // bqCoinsCron.bqFantomCoinsCron.start();
        // bqCoinsCron.bqMoonbeamCoinsCron.start();
        // bqCoinsCron.bqCronosCoinsCron.start();
        // bqCoinsCron.bqEthClassicCoinsCron.start();
        // bqCoinsCron.bqCeloCoinsCron.start();
        // bqCoinsCron.bqConfluxCoinsCron.start();
        // bqCoinsCron.bqEosCoinsCron.start();
        // bqCoinsCron.bqTronCoinsCron.start();
        // bqCoinsCron.bqAlgorandCoinsCron.start();


        // bqPairsCron.bqEthPairsCron.fetchData()//.cron.start(),
        // bqPairsCron.bqBscPairsCron.fetchData()//.cron.start(),
        // bqPairsCron.bqMaticPairsCron.fetchData()//.cron.start(),
        // bqPairsCron.bqVelasPairsCron.fetchData()//.cron.start();
        // bqPairsCron.bqKlaytnPairsCron.fetchData()//.cron.start();
        // bqPairsCron.bqAvalanchePairsCron.fetchData()//.cron.start();
        // bqPairsCron.bqFantomPairsCron.fetchData()//.cron.start();
        // bqPairsCron.bqMoonbeamPairsCron.fetchData()//.cron.start();
        // bqPairsCron.bqCronosPairsCron.fetchData()//.cron.start();
        // bqPairsCron.bqCeloMainnetPairsCron.fetchData()//.cron.start();

        // await cgCoinListCron.cron.start();
        await cgCoinInfoCron.fetchData();
        await cgCoinTickersCron.fetchData();

    } catch (error: any) {
        loggersUtil.mainLogger.error(error.message ? `${error.message}` : `could not initiate service`);
        process.exit(1);
    }
})()