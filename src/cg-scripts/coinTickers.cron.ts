import cron from 'node-cron';
import axiosUtil from '../utils/axios.util';
import loggersUtil from '../utils/loggers.util';
import CoingeckoApi from '../utils/coingecko.utils';
import cgModel from './cgModel';

const axios = axiosUtil.coingeckoAxios;
const logger = loggersUtil.cgLogger;
const cgApi = new CoingeckoApi(axios, logger);

class CGCoinTickersCron {
    private cronExpression = '0 */12 * * *' // every 12 hours
    cron = cron.schedule(this.cronExpression, async () => {
        await this.fetchData();
    }, { scheduled: false });

    async fetchData() {
        let dbOffset = 0;

        while (true) {
            logger.info(`CGListModel offset ${dbOffset}`);
            const ids = await cgModel.CGIdsModel.aggregate([
                { $sort: { id: 1 } },
                { $group: { _id: null, ids: { $push: "$id" } } },
            ]);

            if (ids.length < 1) {
                break;
            }

            if (ids[0].ids.length < 1) {
                break;
            }

            for (const id of ids[0].ids) {
                let tickersPage = 1;
                
                logger.info(`tickersPage ${tickersPage}, id: ${id}`);
                while (true) {
                    const coinTickers = await cgApi.coinTickers(id, tickersPage);

                    if (!coinTickers) {
                        break;
                    }

                    if (coinTickers.tickers.length < 1) {
                        break;
                    }

                    if (tickersPage === 1) {
                        await cgModel.CGTickersModel.updateOne({ id }, { $set: { id, name: coinTickers.name, tickers: coinTickers.tickers } }, { upsert: true });
                    } else {
                        await cgModel.CGTickersModel.updateOne({ id }, { $push: { tickers: coinTickers.tickers }} );
                    }

                    tickersPage += 1;
                }
            }

            dbOffset += ids[0].ids.length;
        }
    }
}

const cgCoinTickersCron = new CGCoinTickersCron();

export default cgCoinTickersCron;