import moment from 'moment';
import cron from 'node-cron';
import axiosUtil from "../utils/axios.util";
import BitqueryApi from "../utils/bitquery.util";
import loggersUtil from "../utils/loggers.util";
import bqModel from './bq.model';

const axios = axiosUtil.bitqueryAxios;
const logger = loggersUtil.bitqueryLogger;
const bitqueryApi = new BitqueryApi(axios, logger);

class BQPairs {
    private cronExpression = '*/2 * * * *' // every 2 minutes
    cron = cron.schedule(this.cronExpression, async () => {
        await this.syncData();
    }, { scheduled: false });

    private networkQueryString: string;
    private network: string;

    constructor(network: string, networkQueryString = 'ethereum') {
        this.network = network;
        this.networkQueryString = networkQueryString
    }

    private async upsertData(list: any[]) {
        const pairs = list.map((pair: any) => {
            if (pair.usdPrice1 === "0.0" && pair.usdPrice3 === "0.0") {
                pair['buyCurrencyPrice'] = pair.usdPrice2;
                pair['sellCurrencyPrice'] = pair.usdPrice4;
            } else if (pair.usdPrice2 === "0.0" && pair.usdPrice4 === "0.0") {
                pair["buyCurrencyPrice"] = pair.usdPrice3
                pair['sellCurrencyPrice'] = pair.usdPrice1;
            } else if (pair.usdPrice1 !== "0.0" && pair.usdPrice2 !== "0.0" && pair.usdPrice3 !== "0.0" && pair.usdPrice4 !== "0.0") {
                pair["buyCurrencyPrice"] = pair.usdPrice3
                pair['sellCurrencyPrice'] = pair.usdPrice4;
            } else {
                pair["buyCurrencyPrice"] = "0.0"
                pair['sellCurrencyPrice'] = "0.0";
            }

            return {
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
            }
        });

        const writeResult = await bqModel.BQPairModel.bulkWrite(pairs as any[]);
        logger.info(`Network ${this.network}, Total ${list.length}, Inserted ${writeResult.insertedCount}, Upserted ${writeResult.upsertedCount}, Modified ${writeResult.modifiedCount}`);
    }

    private async syncData() {
        // Get the current date and time
        const currentDate = moment();

        const fromDate = currentDate.clone().subtract(1, 'days');

        const from = fromDate.utc().format("YYYY-MM-DDTHH:mm:ss.000[Z]");
        const till = currentDate.utc().format("YYYY-MM-DDTHH:mm:ss.000[Z]");

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
    }
}

const bqEthPairs = new BQPairs('ethereum').cron;
const bqBscPairs = new BQPairs('bsc').cron;
const bqMaticPairs = new BQPairs('matic').cron;
const bqVelasPairs = new BQPairs('velas').cron;
const bqKlaytnPairs = new BQPairs('klaytn').cron;
const bqAvalanchePairs = new BQPairs('avalanche').cron;
const bqFantomPairs = new BQPairs('fantom').cron;
const bqMoonbeamPairs = new BQPairs('moonbeam').cron;
const bqCronosPairs = new BQPairs('cronos').cron;
const bqCeloMainnetPairs = new BQPairs('celo_mainnet').cron;

const bqPairs = {
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

export default bqPairs;