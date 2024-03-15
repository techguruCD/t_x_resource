import cron from 'node-cron';
import axiosUtil from '../utils/axios.util';
import CoingeckoApi from '../utils/coingecko.utils';
import loggersUtil from '../utils/loggers.util';
import cgModel from './cgModel';

const axios = axiosUtil.coingeckoAxios;
const logger = loggersUtil.cgLogger;
const cgApi = new CoingeckoApi(axios, logger);

class CGExchangeTickersCron {
    private cronExpression = '0 1 * * *' // every midnight 1 o'clock
    cron = cron.schedule(this.cronExpression, async () => {
        await this.fetchData();
    }, { scheduled: false });

    private async upsertData(data: any[]) {
        try {
            await cgModel.CGExchangeTickerModel.bulkWrite(
                data.map((exchangeTicker: any) => ({
                    updateOne: {
                        filter: { base: exchangeTicker.base, target: exchangeTicker.target },
                        update: { $set: exchangeTicker },
                        upsert: true
                    }
                }))
            );

            logger.info('upserted CGExchangeTickers data')
        } catch (error: any) {
            logger.error(error.message)
        }
    }

    private async fetchDataByExchange(exchangeId: string) {
        for (let page = 1; ; page ++) {
            logger.info(`fetching CGExchangeTickers data page ${page} for ${exchangeId}`);
            const exchangeTickersData = await cgApi.exchangeTickers(exchangeId, page);
            if (!exchangeTickersData || !exchangeTickersData.length) {
                logger.info(`CGExchangeTickers data page(${page}) for ${exchangeId} no data fetched`);
                break;
            }
            logger.info(`CGExchangeTickers data page ${page} for ${exchangeId}: ${exchangeTickersData.length} exchangeTickers fetched`);
            await this.upsertData(exchangeTickersData);
            if (exchangeTickersData.length < 100) break;
        }
    }

    private async fetchData() {
        const exchangeIds = await cgModel.CGExchangeModel.aggregate([
            { $project: { _id: 0, id: 1 } }
        ]);
        logger.info(`fetching CGExchangeTickers start for ${exchangeIds.length} exchanges`);
        for (let i = 0; i < exchangeIds.length; i++) {
            await this.fetchDataByExchange(exchangeIds[i].id);
        }
    }
}

const cgExchangeTickersCron = new CGExchangeTickersCron();

export default cgExchangeTickersCron;