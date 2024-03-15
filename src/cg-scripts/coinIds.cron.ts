import cron from 'node-cron';
import axiosUtil from '../utils/axios.util';
import CoingeckoApi from '../utils/coingecko.utils';
import loggersUtil from '../utils/loggers.util';
import cgModel from './cgModel';

const axios = axiosUtil.coingeckoAxios;
const logger = loggersUtil.cgLogger;
const cgApi = new CoingeckoApi(axios, logger);

class CGCoinsIdsCron {
    private cronExpression = '0 0 * * *' // every day midnight
    cron = cron.schedule(this.cronExpression, async () => {
        await this.fetchData();
    }, { scheduled: false });

    private async upsertData(data: any[]) {
        try {
            await cgModel.CGIdsModel.bulkWrite(
                data.map((coin: any) => ({
                    updateOne: {
                        filter: { id: coin.id },
                        update: { $set: coin },
                        upsert: true
                    }
                }))
            );

            logger.info('upserted CGIds data')
        } catch (error: any) {
            logger.error(error.message)
        }
    }

    private async fetchData() {
        logger.info(`fetching CGCoinIds data`);
        const coinIdsData = await cgApi.coinIds();

        if (!coinIdsData) {
            return undefined
        }

        this.upsertData(coinIdsData);
    }
}

const cgCoinIdsCron = new CGCoinsIdsCron();

export default cgCoinIdsCron;