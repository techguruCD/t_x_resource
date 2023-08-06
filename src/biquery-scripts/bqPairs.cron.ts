import cron from 'node-cron';
import axiosUtil from "../utils/axios.util";
import BitqueryApi from "../utils/bitquery.util";
import loggersUtil from "../utils/loggers.util";
import bqModel from './bq.model';
import moment from 'moment';

const axios = axiosUtil.bitqueryAxios;
const logger = loggersUtil.bitqueryLogger;
const bitqueryApi = new BitqueryApi(axios, logger);

class BQPairsCron {
    private cronExpression = "*/2 * * * *";
    private networkQueryString: string;
    private network: string;

    private bitqueryDexToolsMap = new Map<string, string | null>([
        ["ethereum", "ether"],
        ["bsc", "bsc"],
        ["matic", "polygon"],
        ["avalanche", "avalanche"],
        ["cronos", "cronos"],
        ["ethclassic", "etc"],
        ["celo_mainnet", "celo"],
        ["conflux_hydra", "conflux"],
        ["velas", "velas"],
        ["klaytn", "klaytn"],
        ["algorand", "algorand"],
        ["eos", null],
        ["tron", null],
    ]);

    cron = cron.schedule(this.cronExpression, async () => {
        await this.fetchData();
    }, { scheduled: false });

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
                update: {
                    $set: {
                        network: this.network,
                        dexToolSlug: this.bitqueryDexToolsMap.get(this.network),
                        ...pair
                    }
                },
                upsert: true
            }
        }));

        const writeResult = await bqModel.BQPairModel.bulkWrite(pairs as any[]);
        logger.info(`Total ${list.length}, Inserted ${writeResult.insertedCount}, Upserted ${writeResult.upsertedCount}, Modified ${writeResult.modifiedCount}`);
    }

    async fetchData() {
        const from = moment.utc("2023-07-20").subtract(1, "days").format("YYYY-MM-DD");
        const till = moment.utc().format("YYYY-MM-DD");

        let offset = 0;
        
        while (true) {
            logger.info(`fetching ${this.network} pairs with offset ${offset}`);
            const data = await bitqueryApi.listPairs2(this.network, 1000, offset, from, till, this.networkQueryString);
            
            if (data.length < 1) {
                logger.info(`no more data for pairs on ${this.network}`);
                break;
            }

            this.upsertData(data);
            offset = offset + data.length;
        }
    }
}

const bqEthPairsCron = new BQPairsCron('ethereum');
const bqBscPairsCron = new BQPairsCron('bsc');
const bqMaticPairsCron = new BQPairsCron('matic');
const bqVelasPairsCron = new BQPairsCron('velas');
const bqKlaytnPairsCron = new BQPairsCron('klaytn');
const bqAvalanchePairsCron = new BQPairsCron('avalanche');
const bqFantomPairsCron = new BQPairsCron('fantom');
const bqMoonbeamPairsCron = new BQPairsCron('moonbeam');
const bqCronosPairsCron = new BQPairsCron('cronos');
const bqCeloMainnetPairsCron = new BQPairsCron('celo_mainnet');

const bqPairs2Cron = {
    bqEthPairsCron,
    bqBscPairsCron,
    bqMaticPairsCron,
    bqVelasPairsCron,
    bqKlaytnPairsCron,
    bqAvalanchePairsCron,
    bqFantomPairsCron,
    bqMoonbeamPairsCron,
    bqCronosPairsCron,
    bqCeloMainnetPairsCron
}

export default bqPairs2Cron;