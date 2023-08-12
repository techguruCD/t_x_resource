import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import bqPairs from './biquery-scripts/bqPairs.cron';
import cgCoinIdsCron from './cg-scripts/coinIds.cron';
import cgCoinInfoCron from './cg-scripts/coinInfo.cron';
import cgCoinPrices from './cg-scripts/coinPrices.cron';
import loggersUtil from './utils/loggers.util';


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


        bqPairs.bqEthPairs.start();
        bqPairs.bqBscPairs.start();
        bqPairs.bqMaticPairs.start();
        bqPairs.bqVelasPairs.start();
        bqPairs.bqKlaytnPairs.start();
        bqPairs.bqAvalanchePairs.start();
        bqPairs.bqFantomPairs.start();
        bqPairs.bqMoonbeamPairs.start();
        bqPairs.bqCronosPairs.start();
        bqPairs.bqCeloMainnetPairs.start();

        cgCoinPrices.syncData();
        cgCoinIdsCron.cron.start();
        cgCoinInfoCron.cron.start();

    } catch (error: any) {
        loggersUtil.mainLogger.error(error.message ? `${error.message}` : `could not initiate service`);
        process.exit(1);
    }
})();
