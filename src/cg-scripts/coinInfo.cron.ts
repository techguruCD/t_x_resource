import cron from 'node-cron';
import axiosUtil from '../utils/axios.util';
import loggersUtil from '../utils/loggers.util';
import CoingeckoApi from '../utils/coingecko.utils';
import cgModel from './cgModel';

const axios = axiosUtil.coingeckoAxios;
const logger = loggersUtil.cgLogger;
const cgApi = new CoingeckoApi(axios, logger);

class CGCoinInfoCron {
    private cronExpression = '0 0 * * *' // every day midnight
    cron = cron.schedule(this.cronExpression, async () => {
        await this.fetchData();
    }, { scheduled: false });

    private async upsertData(coinId: string, data: any) {
        try {
            const filteredData = {
                id: data.id,
                symbol: data.symbol,
                name: data.name,
                asset_platform_id: data.asset_platform_id,
                platforms: data.platforms,
                detail_platforms: data.detail_platforms,
                categories: data.categories,
                public_notice: data.public_notice,
                description: data.description.en,
                links: data.links,
                current_price: data.market_data.current_price.usd,
                roi: data.market_data.roi,
                ath: data.market_data.ath.usd,
                ath_change_percentage: data.market_data.ath_change_percentage.usd,
                ath_date: data.market_data.ath_date.usd,
                atl: data.market_data.atl.usd,
                atl_change_percentage: data.market_data.atl_change_percentage.usd,
                atl_date: data.market_data.atl_date.usd,
                market_cap: data.market_data.market_cap.usd,
                fully_diluted_valuation: data.market_data.fully_diluted_valuation.usd,
                total_volume: data.market_data.total_volume.usd,
                high_24h: data.market_data.high_24h.usd,
                low_24h: data.market_data.low_24h.usd,
                price_change_24h: data.market_data.price_change_24h,
                price_change_percentage_24h: data.market_data.price_change_percentage_24h,
                market_cap_change_24h: data.market_data.market_cap_change_24h,
                market_cap_change_percentage_24h: data.market_data.market_cap_change_percentage_24h,
                circulating_supply: data.market_data.circulating_supply,
                total_supply: data.market_data.total_supply,
                max_supply: data.market_data.max_supply,
                price_change_percentage_1h_in_currency: data.market_data.price_change_percentage_1h_in_currency.usd,
                image: data.image.large,
                market_cap_rank: data.market_cap_rank,
                coingecko_rank: data.coingecko_rank,
                coingecko_score: data.coingecko_score,
                developer_score: data.developer_score,
                community_score: data.community_score,
                liquidity_score: data.liquidity_score,
                public_interest_score: data.public_interest_score,
                last_updated: data.last_updated
            }
            await cgModel.CGCoinInfoModel.updateOne({ id: coinId }, { $set: filteredData }, { upsert: true });
        } catch (error: any) {
            logger.error(error.message)
        }
    }

    async process(id: string) {
        try {
            const coinInfo = await cgApi.coinInfo(id, 1000);
            if (!coinInfo) {
                logger.error(`no info. coinid ${id}`);
            }

            logger.info(`upserting coinid ${id}`);
            this.upsertData(id, coinInfo);
        } catch (error: any) {
            logger.error(error.message)
        }
    }

    async processGroup(group: any[]) {
        try {
            let promiseArray = group.map(id => this.process(id));
            await Promise.all(promiseArray);
        } catch (error: any) {
            logger.error(error.message)
        }
    }

    private async fetchData() {
        const ids = await cgModel.CGIdsModel.aggregate([
            { $group: { _id: null, ids: { $push: "$id" } } },
        ]);

        if (ids.length < 1) {
            logger.info(`No more data in CGIdsModel for coinInfo`);
            return;
        }

        if (ids[0].ids.length < 1) {
            logger.info(`No more data in CGIdsModel for coinInfo`);
            return;
        }

        const array = ids[0].ids;
        const arrayLength = array.length;
        const groupSize = 10;

        for (let i = 0; i < arrayLength; i += groupSize) {
            const group = array.slice(i, i + groupSize);
            await this.processGroup(group);
        }

        // const array = ids[0].ids;
        // const arrayLength = array.length;
        // const groupSize = Math.ceil(arrayLength / 5);
        // const groupedArrays = [];

        // for (let i = 0; i < arrayLength; i += groupSize) {
        //     const group = array.slice(i, i + groupSize);
        //     groupedArrays.push(this.processGroup(group));
        // }

        // await Promise.all(groupedArrays);
    }
}

const cgCoinInfoCron = new CGCoinInfoCron();

export default cgCoinInfoCron;