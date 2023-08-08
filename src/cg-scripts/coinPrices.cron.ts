import cron from 'node-cron';
import axiosUtil from '../utils/axios.util';
import loggersUtil from '../utils/loggers.util';
import CoingeckoApi from '../utils/coingecko.utils';
import cgModel from './cgModel';

const axios = axiosUtil.coingeckoAxios;
const logger = loggersUtil.cgLogger;
const cgApi = new CoingeckoApi(axios, logger);

class CGCoinPricesCron {
    private cronExpression = '0 */12 * * *' // every 12 hours
    cron = cron.schedule(this.cronExpression, async () => {
        await this.fetchData();
    }, { scheduled: false });

    private async upsertData(data: any) {
        try {
            // await cgModel.CGPricesModel.updateOne({ id: coinId }, { $set: data }, { upsert: true });
        } catch (error: any) {
            logger.error(error.message)
        }
    }

    async fetchData() {
        let dbOffset = 0;

        while (true) {
            const ids = await cgModel.CGListModel.aggregate([
                { $skip: dbOffset },
                { $limit: 250 },
                { $group: { _id: null, ids: { $addToSet: "$id" } } },
            ]);

            if (ids.length < 1) {
                break;
            }

            if (ids[0].ids.length < 1) {
                break;
            }

            // TODO: Add type for coinPrices returned data
            const coinPricesData = await cgApi.coinPrices(ids);

            if (!coinPricesData) {
                continue;
            }

            this.upsertData(coinPricesData);

            dbOffset += ids[0].ids.length;
        }

        return;
    }
}

const cgCoinPricesCron = new CGCoinPricesCron();

export default cgCoinPricesCron;