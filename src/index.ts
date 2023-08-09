import dotenv from 'dotenv';
dotenv.config();

import loggersUtil from './utils/loggers.util';
import mongoose from 'mongoose';
import cgCoinInfoCron from './cg-scripts/coinInfo.cron';
// import cgCoinTickersCron from './cg-scripts/coinTickers.cron';
import bqPairsCron from './biquery-scripts/bqPairs.cron';
import cgCoinListCron from './cg-scripts/coinList.cron';


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


        bqPairsCron.bqEthPairs.syncData(),
        bqPairsCron.bqBscPairs.syncData(),
        bqPairsCron.bqMaticPairs.syncData(),
        bqPairsCron.bqVelasPairs.syncData();
        bqPairsCron.bqKlaytnPairs.syncData();
        bqPairsCron.bqAvalanchePairs.syncData();
        bqPairsCron.bqFantomPairs.syncData();
        bqPairsCron.bqMoonbeamPairs.syncData();
        bqPairsCron.bqCronosPairs.syncData();
        bqPairsCron.bqCeloMainnetPairs.syncData();

        cgCoinListCron.cron.start();
        cgCoinInfoCron.cron.start();
        // await cgCoinTickersCron.fetchData();

    } catch (error: any) {
        loggersUtil.mainLogger.error(error.message ? `${error.message}` : `could not initiate service`);
        process.exit(1);
    }
})()