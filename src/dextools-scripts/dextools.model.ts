import { Schema, model } from "mongoose";

const dexToolTokenSchema = new Schema({
    id: new Schema({
        chain: String,
        token: String
    }),
    symbol: {
        type: String,
        index: true
    },
    name: {
        type: String,
        index: true
    },
    creationBlock: Number,
    metrics: new Schema({
        fdv: Number,
        tmcap: Number,
        holders: Number,
        txCount: Number,
        circulatingSupply: Number,
        maxSupply: Number,
        totalSupply: Number
    }),
    price: Number,
    decimals: Number,
    audit: new Schema({
        codeVerified: Boolean,
        date: String,
        lockTransactions: Boolean,
        mint: Boolean,
        proxy: Boolean,
        status: String,
        unlimitedFees: Boolean,
        version: Number,
        is_contract_renounced: Boolean,
        provider: String,
    }),
    info: new Schema({
        dextools: Boolean,
        ventures: Boolean,
        description: String,
        email: String,
        extraInfo: String,
        nftCollection: String,
    }),
    totalSupply: Number,
    links: {
        type: Map,
        of: String
    },
    logo: String,
    reprPair: new Schema({
        id: new Schema({
            chain: String,
            exchange: String,
            pair: String,
            token: String,
            tokenRef: String
        }),
        metrics: new Schema({
            liquidity: Number
        }),
        price: Number
    }),
    pairs: [
        new Schema({
            address: String,
            exchange: String,
            dextScore: String,
            price: String,
            tokenRef: new Schema({
                address: String,
                name: String,
                symbol: String
            })
        })
    ],
    locks: [
        new Schema({
            _id: String,
            unlockDate: String,
            amount: Number,
            providerId: String,
            api: String,
            lockId: String,
            percent: Number,
            type: String
        })
    ],
    chain: String,
    address: String,
}, { timestamps: { createdAt: true, updatedAt: true } });

const DexToolTokenModel = model('DexToolToken', dexToolTokenSchema, 'DexToolToken');

const dexToolsModel = {
    DexToolTokenModel
}

export default dexToolsModel;
