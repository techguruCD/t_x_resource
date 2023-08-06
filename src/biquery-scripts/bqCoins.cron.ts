import cron from 'node-cron';
import bqModel from './bq.model';
import axiosUtil from '../utils/axios.util';
import loggersUtil from '../utils/loggers.util';
import BitqueryApi from '../utils/bitquery.util';
import moment from 'moment';

const axios = axiosUtil.bitqueryAxios;
const logger = loggersUtil.bitqueryLogger;
const bitqueryApi = new BitqueryApi(axios, logger);

class BQCoinsCron {
    private cronExpression = "0 */12 * * *"; // every 12 hours
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
        const filter = (transfer: any) => {
            if (this.network === 'algorand') {
                return { network: this.network, "currency.tokenId": transfer.currency.tokenId }
            }

            return { network: this.network, "currency.address": transfer.currency.address }
        }

        const updateable = []

        for (const transfer of list) {
            if (transfer.currency.address === "-" && transfer.currency.tokenId === "") {
                continue;
            }
            updateable.push({
                updateOne: {
                    filter: filter(transfer),
                    update: { $set: { network: this.network, dexToolSlug: this.bitqueryDexToolsMap.get(this.network), ...transfer } },
                    upsert: true
                }
            })
        }

        await bqModel.BQListModel.bulkWrite(updateable);
        logger.info(`Upserted ${list.length} ${this.network} tokens`);
    }

    private async fetchData() {
        let offset = 0;
        const from = moment.utc("2023-07-20").subtract(1, "days").format("YYYY-MM-DD");
        const till = moment.utc().format("YYYY-MM-DD");

        while (true) {
            logger.info(`fetching ${this.network} coins with offset ${offset}`);
            const data = await bitqueryApi.listCoins(this.network, 1000, offset, from, till, this.networkQueryString);

            if (data.length < 1) {
                logger.info(`no more data for coins on ${this.network}`);
                break;
            }

            this.upsertData(data);
            offset = offset + data.length;
        }
    }
}

const bqEthCoinsCron = new BQCoinsCron('ethereum').cron;
const bqMaticCoinsCron = new BQCoinsCron('matic').cron;
const bqBscCoinsCron = new BQCoinsCron('bsc').cron;
const bqVelasCoinsCron = new BQCoinsCron('velas').cron;
const bqKlaytnCoinsCron = new BQCoinsCron('klaytn').cron;
const bqAvalancheCoinsCron = new BQCoinsCron('avalanche').cron;
const bqFantomCoinsCron = new BQCoinsCron('fantom').cron;
const bqMoonbeamCoinsCron = new BQCoinsCron('moonbeam').cron;
const bqCronosCoinsCron = new BQCoinsCron('cronos').cron;
const bqEthClassicCoinsCron = new BQCoinsCron('ethclassic').cron;
const bqCeloCoinsCron = new BQCoinsCron('celo_mainnet').cron;
const bqConfluxCoinsCron = new BQCoinsCron('conflux_hydra', 'conflux').cron;
const bqEosCoinsCron = new BQCoinsCron('eos', 'eos').cron;
const bqTronCoinsCron = new BQCoinsCron('tron', 'tron').cron;
const bqAlgorandCoinsCron = new BQCoinsCron('algorand', 'algorand').cron;

const bqCoinsCron = {
    bqEthCoinsCron,
    bqMaticCoinsCron,
    bqBscCoinsCron,
    bqVelasCoinsCron,
    bqKlaytnCoinsCron,
    bqAvalancheCoinsCron,
    bqFantomCoinsCron,
    bqMoonbeamCoinsCron,
    bqCronosCoinsCron,
    bqEthClassicCoinsCron,
    bqCeloCoinsCron,
    bqConfluxCoinsCron,
    bqEosCoinsCron,
    bqTronCoinsCron,
    bqAlgorandCoinsCron,
}

export default bqCoinsCron