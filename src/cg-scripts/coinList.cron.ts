import cron from 'node-cron';
import axiosUtil from '../utils/axios.util';
import loggersUtil from '../utils/loggers.util';
import CoingeckoApi from '../utils/coingecko.utils';
import cgModel from './cgModel';

const axios = axiosUtil.coingeckoAxios;
const logger = loggersUtil.cgLogger;
const cgApi = new CoingeckoApi(axios, logger);

class CGCoinListCron {
    private cronExpression = '*/2 * * * *' // every 2 minutes
    cron = cron.schedule(this.cronExpression, async () => {
        await this.fetchData();
    }, { scheduled: false });

    private async upsertData(data: any[]) {
        try {
            await cgModel.CGListModel.bulkWrite(
                data.map((coin: any) => ({
                    updateOne: {
                        filter: { id: coin.id },
                        update: { $set: coin },
                        upsert: true
                    }
                }))
            );
        } catch (error: any) {
            logger.error(error.message)
        }
    }

    private async fetchData() {
        let start = 0;

        while (true) {
            logger.info(`fetching cgCoinList from ${start}`);
            const data = await cgApi.coinsList(start);

            if (!data) {
                break;
            }

            this.upsertData(data);
            start += 1;
            break;
        }
    }
}

const cgCoinListCron = new CGCoinListCron();

export default cgCoinListCron;