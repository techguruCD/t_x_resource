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

    private async upsertData(coinId: string, data: any) {
        try {
            await cgModel.CGTickersModel.updateOne({ id: coinId }, { $set: data }, { upsert: true });
        } catch (error: any) {
            logger.error(error.message)
        }
    }

    async fetchData() {
        let dbOffset = 0;

        while (true) {
            const ids = await cgModel.CGListModel.aggregate([
                { $sort: { market_cap: -1 } },
                { $skip: dbOffset },
                { $limit: 1000 },
                { $group: { _id: null, ids: { $addToSet: "$id" } } },
            ]);

            if (ids.length < 1) {
                break;
            }

            if (ids[0].ids.length < 1) {
                break;
            }

            for (const id of ids) {
                let tickersPage = 1;
                while (true) {
                    const coinTickers = await cgApi.coinTickers(id, tickersPage);

                    if (!coinTickers) {
                        continue;
                    }

                    if (coinTickers.tickers.length < 0) {
                        continue;
                    }
                    this.upsertData(id, coinTickers);
                    tickersPage += 1;
                }
            }

            dbOffset += ids[0].ids.length;
        }
        return;
    }
}

const cgCoinTickersCron = new CGCoinTickersCron();

export default cgCoinTickersCron;