import axiosUtil from '../utils/axios.util';
import CoingeckoApi from '../utils/coingecko.utils';
import delayExecution from '../utils/executionDelay.utils';
import loggersUtil from '../utils/loggers.util';
import cgModel from './cgModel';

const axios = axiosUtil.coingeckoAxios;
const logger = loggersUtil.cgLogger;
const cgApi = new CoingeckoApi(axios, logger);

class CGCoinPrices {
    
    private async upsertData(data: any) {
        try {
            const coinIds = Object.keys(data)
            const bulkWriteOperations: any[] = []

            coinIds.forEach((coinId) => {
                const coinData = data[coinId]

                bulkWriteOperations.push({
                    updateOne: {
                        filter: { id: coinId },
                        update: {
                            $set: {
                                current_price: coinData.usd,
                                market_cap: coinData.usd_market_cap,
                                last_updated: coinData.last_updated_at
                            }
                        }
                    }
                });
            });

            if (bulkWriteOperations.length > 0) {
                await cgModel.CGCoinInfoModel.bulkWrite(bulkWriteOperations);
                logger.info(`Updated coinPrices data for ${coinIds.length} coins`);
            } else {
                logger.info(`No coinPrices data to update`);
            }
        } catch (error: any) {
            logger.error(error.message)
        }
    }

    async syncData() {
        try {
            let dbOffset = 0;

            while (true) {
                logger.info(`fetching coinPrices pairs with offset ${dbOffset}`);
                const ids = await cgModel.CGIdsModel.aggregate([
                    { $sort: { id: 1 } },
                    { $skip: dbOffset },
                    { $limit: 500 },
                    { $group: { _id: null, ids: { $push: "$id" } } },
                ]);

                if (ids.length < 1) {
                    logger.info(`no more data for coinPrices`);
                    break;
                }

                if (ids[0].ids.length < 1) {
                    logger.info(`no more data for coinPrices`);
                    break;
                }

                const coinsData = ids[0].ids
                const coinPricesData = await cgApi.coinPrices(coinsData);

                if (!coinPricesData) {
                    continue;
                }

                this.upsertData(coinPricesData);
                dbOffset += coinsData.length;
            }

            logger.info(`pairsPrices cooling down for 20 seconds`);
            await delayExecution(20000);
            this.syncData();
        } catch (error: any) {
            logger.error(error.message)
        }
    }
}

const cgCoinPrices = new CGCoinPrices()

export default cgCoinPrices;