import moment from 'moment';
import axiosUtil from "../utils/axios.util";
import BitqueryApi from "../utils/bitquery.util";
import delayExecution from '../utils/executionDelay.utils';
import loggersUtil from "../utils/loggers.util";
import bqModel from './bq.model';

const axios = axiosUtil.bitqueryAxios;
const logger = loggersUtil.bitqueryLogger;
const bitqueryApi = new BitqueryApi(axios, logger);

class BQPairs {
    private networkQueryString: string;
    private network: string;

    constructor(network: string, networkQueryString = 'ethereum') {
        this.network = network;
        this.networkQueryString = networkQueryString
    }

    private async upsertData(list: any[]) {
        const pairs = list.map((pair: any) => ({
            updateOne: {
                filter: {
                    network: this.network,
                    'smartContract.address.address': pair.smartContract.address.address,
                    "buyCurrency.address": pair.buyCurrency.address,
                    "sellCurrency.address": pair.sellCurrency.address
                },
                update: { $set: { network: this.network, ...pair } },
                upsert: true
            }
        }));

        const writeResult = await bqModel.BQPairModel.bulkWrite(pairs as any[]);
        logger.info(`Network ${this.network}, Total ${list.length}, Inserted ${writeResult.insertedCount}, Upserted ${writeResult.upsertedCount}, Modified ${writeResult.modifiedCount}`);
    }

    async syncData() {
        const from = moment.utc().subtract(1, "days").format("YYYY-MM-DD");
        const till = moment.utc().format("YYYY-MM-DD");

        let offset = 0;
        
        while (true) {
            logger.info(`fetching ${this.network} pairs with offset ${offset}`);
            const data = await bitqueryApi.listPairs(this.network, 10000, offset, from, till, this.networkQueryString);
            
            if (data.length < 1) {
                logger.info(`no more data for pairs on ${this.network}`);
                break;
            }

            this.upsertData(data);
            offset = offset + data.length;
        }
        
        logger.info(`bqPairs for network ${this.network} cooling down for 1 minute`);
        await delayExecution(60000)
        this.syncData();
    }
}

const bqEthPairs = new BQPairs('ethereum');
const bqBscPairs = new BQPairs('bsc');
const bqMaticPairs = new BQPairs('matic');
const bqVelasPairs = new BQPairs('velas');
const bqKlaytnPairs = new BQPairs('klaytn');
const bqAvalanchePairs = new BQPairs('avalanche');
const bqFantomPairs = new BQPairs('fantom');
const bqMoonbeamPairs = new BQPairs('moonbeam');
const bqCronosPairs = new BQPairs('cronos');
const bqCeloMainnetPairs = new BQPairs('celo_mainnet');

const bqPairsCron = {
    bqEthPairs,
    bqBscPairs,
    bqMaticPairs,
    bqVelasPairs,
    bqKlaytnPairs,
    bqAvalanchePairs,
    bqFantomPairs,
    bqMoonbeamPairs,
    bqCronosPairs,
    bqCeloMainnetPairs
}

export default bqPairsCron;