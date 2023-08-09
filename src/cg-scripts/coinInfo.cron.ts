import cron from 'node-cron';
import axiosUtil from '../utils/axios.util';
import loggersUtil from '../utils/loggers.util';
import CoingeckoApi from '../utils/coingecko.utils';
import cgModel from './cgModel';

const axios = axiosUtil.coingeckoAxios;
const logger = loggersUtil.cgLogger;
const cgApi = new CoingeckoApi(axios, logger);

class CGCoinInfoCron {
    private cronExpression = '0 * * * *' // every 1 hour
    cron = cron.schedule(this.cronExpression, async () => {
        await this.fetchData();
    }, { scheduled: false });

    private async upsertData(coinId: string, data: any) {
        try {
            await cgModel.CGCoinInfoModel.updateOne({ id: coinId }, { $set: data }, { upsert: true });
        } catch (error: any) {
            console.log(error);
            logger.error(error.message)
        }
    }

    private async fetchData() {
        const ids = await cgModel.CGListModel.aggregate([
            { $sort: { market_cap: 1 } },
            { $group: { _id: null, ids: { $push: "$id" } } },
        ]);

        if (ids.length < 1) {
            logger.info(`No more data in CGListModel for coinInfo`);
            return;
        }

        if (ids[0].ids.length < 1) {
            logger.info(`No more data in CGListModel for coinInfo`);
            return;
        }

        for (const id of ids[0].ids) {
            const coinInfo = await cgApi.coinInfo(id);

            
            if (!coinInfo) {
                continue;
            }
            
            this.upsertData(id, coinInfo);
        }
    }
}

const cgCoinInfoCron = new CGCoinInfoCron();

export default cgCoinInfoCron;