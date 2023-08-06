import cron from 'node-cron';
import axiosUtil from "../utils/axios.util";
import CoinmarketcapApi from "../utils/coinmarketcap.util";
import loggersUtil from "../utils/loggers.util";
import cmcModel from './cmc.model';
import delayExecution from '../utils/executionDelay.utils';

const axios = axiosUtil.coinmarketcapAxios;
const logger = loggersUtil.cmcLogger;
const cmcApi = new CoinmarketcapApi(axios, logger);

class CMCMetadataCron {
    private cronExpression = '0 * * * *' // 1 hour
    cron = cron.schedule(this.cronExpression, async () => {
        await this.fetchData();
    }, { scheduled: false });

    private async upsertData(metadataList: any) {
        try {
            const metadata = Object.keys(metadataList).map((key) => {
                return {
                    updateOne: {
                        filter: { id: metadataList[key]['id'] },
                        update: { $set: metadataList[key] },
                        upsert: true
                    }
                }
            });

            await cmcModel.CMCMetadataModel.bulkWrite(metadata);
        } catch (error: any) {
            logger.error(error.message);
        }
    }

    private async fetchData() {
        let pageNumber = 1;

        while (true) {
            logger.info(`fetching metadataList from ${pageNumber}...`);

            const idsArray = await cmcModel.CMCListModel.aggregate([
                { $sort: { cmc_rank: 1 } },
                { $group: { _id: null, ids: { $push: "$id" } } },
                { $project: { _id: 0, ids: { $slice: ["$ids", (pageNumber - 1) * 300, 300] } } },
            ]);

            if (idsArray[0].ids.length < 1) {
                logger.info('No more data in cmc metadata api');
                break;
            }

            const ids = idsArray[0].ids.toString();

            await delayExecution(5000);

            const metadataList = await cmcApi.metadata(ids, undefined, undefined, undefined, true)

            this.upsertData(metadataList);

            pageNumber += 1;
        }
    }
}

const cmcMetadataCron = new CMCMetadataCron();

export default cmcMetadataCron;