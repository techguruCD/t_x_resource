import cron from 'node-cron';
import axiosUtil from '../utils/axios.util';
import loggersUtil from '../utils/loggers.util';
import AegisApi from '../utils/aegis.util';
import aegisModel from './aegis.model';

const axios = axiosUtil.aegisAxios;
const logger = loggersUtil.aegisLogger;
const aegisApi = new AegisApi(axios, logger);

class AegisChainlist {
  private cronExpression = '*/2 * * * *' // every 2 minutes
  cron = cron.schedule(this.cronExpression, async () => {
    await this.syncData();
  }, { scheduled: false });

  private async upsertData(list: any[]) {
    return aegisModel.AegisChainlistModel.bulkWrite(list.map((item: any) => ({
      updateOne: {
        filter: { chainId: item.chainId },
        update: { $set: { ...item } },
        upsert: true
      }
    })));
  }

  async syncData() {
    const chainlistData = await aegisApi.getSupportedChains();

    if (chainlistData.length > 0) {
      await this.upsertData(chainlistData);
    }
  }
}

const aegisChainlistCron = new AegisChainlist();

export default aegisChainlistCron;