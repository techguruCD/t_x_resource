import cron from 'node-cron';
import axiosUtil from '../utils/axios.util';
import loggersUtil from '../utils/loggers.util';
import AegisApi from '../utils/aegis.util';
import aegisModel from './aegis.model';
import bqModel from '../biquery-scripts/bq.model';
import cgModel from '../cg-scripts/cgModel';

const axios = axiosUtil.aegisAxios;
const logger = loggersUtil.aegisLogger;
const aegisApi = new AegisApi(axios, logger);

enum ChainlistIds {
  Ethereum = 1,
  BSC = 56,
  Polygon = 137,
  Fantom = 250,
}

const ChainlistMap = new Map<number, Record<string, string>>([
  [ChainlistIds.Ethereum, { bq: 'ethereum', cg: 'ethereum' }],
  [ChainlistIds.BSC, { bq: 'bsc', cg: 'binance-smart-chain' }],
  [ChainlistIds.Polygon, { bq: 'matic', cg: 'polygon-pos' }],
  [ChainlistIds.Fantom, { bq: 'fantom', cg: 'fantom' }],
]);

class AegisTokenQuickCheck {
  private cronExpression = '*/2 * * * *' // every 2 minutes
  private chainid: number;

  constructor(_chainid: number) {
    this.chainid = _chainid;
  }

  cron = cron.schedule(this.cronExpression, async () => {
    await this.syncData();
  }, { scheduled: false });

  private async upsertData(quickCheckData: any) {
    await aegisModel.AegisTokenQuickCheckModel.updateOne(
      { contract_address: quickCheckData.contract_address },
      { $set: { ...quickCheckData } },
      { upsert: true });
  }

  private async getChainAddresses() {
    const chainNetwork = ChainlistMap.get(this.chainid);

    if (!chainNetwork) {
      return [];
    }

    const bqNetwork = chainNetwork['bq'];
    const cgNetwork = chainNetwork['cg'];

    const [bq, cg] = await Promise.all([
      bqModel.BQPairModel.aggregate([
        { $match: { network: bqNetwork } },
        {
          $group: {
            _id: null,
            buyCurrencyAddresses: { $addToSet: "$buyCurrency.address" },
            sellCurrencyAddresses: { $addToSet: "$sellCurrency.address" },
          },
        },
        { $project: { addresses: { $setUnion: [ "$buyCurrencyAddresses", "$sellCurrencyAddresses" ] } } },
      ]),
      cgModel.CGCoinInfoModel.aggregate([
        { $match: { [`platforms.${cgNetwork}`]: { $exists: true } } },
        {
          $group: {
            _id: null,
            addresses: { $addToSet: `$platforms.${cgNetwork}` },
          },
        },
      ])
    ]);

    const addressSet = new Set([...bq[0].addresses, ...cg[0].addresses]);
    return Array.from(addressSet);
  }

  async syncData() {
    //  check if chainid is active
    const isChainActive = await aegisModel.AegisChainlistModel.exists({ chainId: this.chainid, status: 1 });
    
    if (!isChainActive) {
      logger.info(`Chain with chainId ${this.chainid} is not active`);
      return;
    }

    const addresses = await this.getChainAddresses();

    if (addresses.length < 0) {
      return;
    }
    
    for (const address of addresses) {
      try {
        const quickCheckData = await aegisApi.getTokenQuickCheckData(this.chainid, address);
        if (quickCheckData) {
          this.upsertData(quickCheckData);
          logger.info(`Upserting tokenQuickCheck data for address ${address} for chainid ${this.chainid}`);
        }
      } catch (error) {
        console.log(`>>>>`, error, this.chainid, address)
      }
    }
  }
}

const Ethereum = new AegisTokenQuickCheck(ChainlistIds.Ethereum);
const BSC = new AegisTokenQuickCheck(ChainlistIds.BSC);
const Polygon = new AegisTokenQuickCheck(ChainlistIds.Polygon);
const Fantom = new AegisTokenQuickCheck(ChainlistIds.Fantom);

const aegisTokenQuickCheckCrons = {
  Ethereum,
  BSC,
  Polygon,
  Fantom,
};

export default aegisTokenQuickCheckCrons;