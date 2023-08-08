import cron from 'node-cron';
import axiosUtil from '../utils/axios.util';
import loggersUtil from '../utils/loggers.util';
import CoingeckoApi from '../utils/coingecko.utils';
import cgModel from './cgModel';

const axios = axiosUtil.coingeckoAxios;
const logger = loggersUtil.cgLogger;
const cgApi = new CoingeckoApi(axios, logger);

class CGCoinPricesCron {
    private cronExpression = '* 1 * * * *' // every 12 hours
    cron = cron.schedule(this.cronExpression, async () => {
        await this.fetchData();
    }, { scheduled: false });

    private async upsertData(data: any) {
        try {
            const bulkWriteOperations: any[] = []

            data.forEach((coinData: any) => {
                const condition = { id: coinData.id }
                const coinDataUpdateOperation = {
                    $set: {
                        current_price: coinData.usd,
                        market_cap: coinData.usd_market_cap,
                        last_updated: coinData.last_updated_at
                    }
                }

                bulkWriteOperations.push({
                    updateMany: {
                        filter: condition,
                        update: coinDataUpdateOperation
                    }
                    })
            })

            await cgModel.CGListModel.bulkWrite(bulkWriteOperations)
                .then(result => { console.log(`${result.modifiedCount} documents updated`) })
                .catch(error = > { `Error updating documents: ${error}`})
    } catch(error: any) {
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
        const coinIds = ids[0].ids
        const coinPricesData = await cgApi.coinPrices(coinIds);
        console.log(coinPricesData)
        if (!coinPricesData) {
            continue;
        }

        // this.upsertData(coinPricesData);
        // console.log(ids)
        dbOffset += coinIds.length;
    }

    return;
}
}

const cgCoinPricesCron = new CGCoinPricesCron();

export default cgCoinPricesCron;