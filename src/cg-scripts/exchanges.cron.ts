import cron from 'node-cron';
import axiosUtil from '../utils/axios.util';
import CoingeckoApi from '../utils/coingecko.utils';
import loggersUtil from '../utils/loggers.util';
import cgModel from './cgModel';

const axios = axiosUtil.coingeckoAxios;
const logger = loggersUtil.cgLogger;
const cgApi = new CoingeckoApi(axios, logger);

class CGExchangesCron {
    private cronExpression = '0 0 * * *' // every day midnight
    cron = cron.schedule(this.cronExpression, async () => {
        await this.fetchData();
    }, { scheduled: false });

    private async upsertData(data: any[]) {
        try {
            await cgModel.CGExchangeModel.bulkWrite(
                data.map((exchange: any) => ({
                    updateOne: {
                        filter: { id: exchange.id },
                        update: { $set: exchange },
                        upsert: true
                    }
                }))
            );

            logger.info('upserted CGExchanges data')
        } catch (error: any) {
            logger.error(error.message)
        }
    }

    private async fetchData() {
        for (let page = 1; ; page ++) {
            logger.info(`fetching CGExchanges data page: ${page}`);
            const exchangesData = await cgApi.exchanges(page);
            if (!exchangesData || !exchangesData.length) {
                logger.info(`CGExchanges data page(${page}) no data fetched`);
                break;
            }
            logger.info(`CGExchanges data page(${page}) ${exchangesData.length} exchanges fetched`);
            await this.upsertData(exchangesData);
            if (exchangesData.length < 250) break;
        }
    }
}

const cgExchangesCron = new CGExchangesCron();

export default cgExchangesCron;