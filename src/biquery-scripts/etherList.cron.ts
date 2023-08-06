// import cron from 'node-cron';
// import axiosUtil from "../utils/axios.util";
// import DextoolsApi from "../utils/dextools.util";
// import loggersUtil from "../utils/loggers.util";
// import bqModel from './bq.model';
// import dexToolsModel from '../dextools-scripts/dextools.model';

// const axios = axiosUtil.dextoolsAxios;
// const logger = loggersUtil.dexToolsLogger;
// const dextoolsApi = new DextoolsApi(axios, logger);

// class DexToolsEtherListCron {
//     private cronExpression = '* * * * *'
//     cron = cron.schedule(this.cronExpression, async () => {
//         await this.fetchData();
//     }, { scheduled: false });

//     async upsertData(data: any) {

//     }

//     async fetchData() {
//         let dbOffset = 0;
//         let apiPairPage = 0;


//         while (true) {
//             const etherCoins = await bqModel.BQListModel.find({ dexToolSlug: 'ether' }, { "currency.address": 1 }, { skip: dbOffset, limit: 1000 }).lean();

//             if (etherCoins.length < 1) {
//                 break;
//             }

//             for (const coin of etherCoins) {

//                 if (!coin.currency?.address) {
//                     continue;
//                 }

//                 while (true) {
//                     const dexToolData = await dextoolsApi.fetchToken('ether', coin.currency.address, apiPairPage);
//                     if (apiPairPage === 0) {
//                         await dexToolsModel.DexToolTokenModel.updateOne({ chain: dexToolData.chain, address: dexToolData.address }, dexToolData);
//                     } else {
//                         await dexToolsModel.DexToolTokenModel.updateOne({ chain: dexToolData.chain, address: dexToolData.address })
//                     }
//                 }
//             }
//         }

//     }
// }