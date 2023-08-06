import cron from 'node-cron';
import axiosUtil from "../utils/axios.util";
import CoinmarketcapApi from "../utils/coinmarketcap.util";
import loggersUtil from "../utils/loggers.util";
import cmcModel from './cmc.model';

const axios = axiosUtil.coinmarketcapAxios;
const logger = loggersUtil.cmcLogger;
const cmcApi = new CoinmarketcapApi(axios, logger);

class CMCCoinListCron {
    private cronExpression = '*/2 * * * *' // every 2 minutes
    cron = cron.schedule(this.cronExpression, async () => {
        await this.fetchData();
    }, { scheduled: false });

    private async upsertData(platforms: any[], list: any[]) {
        try {
            await cmcModel.CMCPlatformModel.bulkWrite(
                platforms.map((platform: any) => ({
                    updateOne: {
                        filter: { id: platform.id },
                        update: { $set: platform },
                        upsert: true
                    }
                }))
            )

            await cmcModel.CMCListModel.bulkWrite(
                list.map((item: any) => ({
                    updateOne: {
                        filter: { id: item.id },
                        update: { $set: item },
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
            logger.info(`fetching listingsLatest from ${start}...`);
            const data = await cmcApi.listingsLatest(start);

            if (!data) {
                break;
            }

            const cmcPlatforms = new Map();
            const cmcList = new Map();

            data.forEach((record: any) => {
                if (record.platform) {
                    cmcPlatforms.set(record.platform.id, record.platform);
                    record.platform = {
                        id: record.platform.id,
                        token_address: record.platform.token_address
                    };
                }
                cmcList.set(record.id, record);
            });

            logger.info(`sending ${cmcPlatforms.size} platforms & ${cmcList.size} listingsLatest for upsert in db...`);
            this.upsertData(Array.from(cmcPlatforms.values()), Array.from(cmcList.values()));
            logger.info(`sent ${cmcPlatforms.size} platforms & ${cmcList.size} listingsLatest for upsert in db...`);
            start = start + data.length;
        }
    }
}

const cmcCoinListCron = new CMCCoinListCron();

export default cmcCoinListCron;