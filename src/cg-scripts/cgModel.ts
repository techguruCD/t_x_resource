import { Schema, model } from 'mongoose';

const coinInfoSchema = new Schema({
    id: {
        type: String,
        index: true
    },
    symbol: String,
    name: String,
    asset_platform_id: String,
    platforms: Schema.Types.Mixed,
    detail_platforms: Schema.Types.Mixed,
    categories: [String],
    public_notice: String,
    description: Schema.Types.Mixed,
    links: Schema.Types.Mixed,
    current_price: Number,
    roi: new Schema({
        currency: String,
        percentrage: Number
    }),
    ath: Number,
    ath_change_percentage: Number,
    ath_date: String,
    atl: Number,
    atl_change_percentage: Number,
    atl_date: String,
    market_cap: Number,
    fully_diluted_valuation: Number,
    total_volume: Number,
    high_24h: Number,
    low_24h: Number,
    price_change_24h: Number,
    price_change_percentage_24h: Number,
    market_cap_change_24h: Number,
    market_cap_change_percentage_24h: Number,
    circulating_supply: Number,
    total_supply: Number,
    max_supply: Number,
    price_change_percentage_1h_in_currency: Number,
    image: String,
    market_cap_rank: Number,
    coingecko_rank: Number,
    coingecko_score: Number,
    developer_score: Number,
    community_score: Number,
    liquidity_score: Number,
    public_interest_score: Number,
    last_updated: String
});

const coinIds = new Schema({
    id: {
        type: String,
        index: true
    }
})

const tickersSchema = new Schema({
    id: {
        type: String,
        ref: 'CGList'
    },
    name: String,
    tickers: [Schema.Types.Mixed]
});

const exchangesSchema = new Schema({
    id: {
        type: String,
        index: true
    },
    name: String,
    year_established: Number,
    country: String,
    description: String,
    url: String,
    image: String,
    has_trading_incentive: Boolean,
    trust_score: Number,
    trust_score_rank: Number,
    trade_volume_24h_btc: Number,
    trade_volume_24h_btc_normalized: Number
});

const exchangeTickersSchema = new Schema({
    base: String,
    target: String,
    market: new Schema({
        name: String,
        identifier: String,
        has_trading_incentive: Boolean,
        logo: String
    }),
    last: Number,
    volume: Number,
    cost_to_move_up_usd: Number,
    cost_to_move_down_usd: Number,
    converted_last: new Schema({
        btc: Number,
        eth: Number,
        usd: Number
    }),
    converted_volume: new Schema({
        btc: Number,
        eth: Number,
        usd: Number
    }),
    trust_score: String,
    bid_ask_spread_percentage: Number,
    timestamp: String,
    last_traded_at: String,
    last_fetch_at: String,
    is_anomaly: Boolean,
    is_stale: Boolean,
    trade_url: String,
    token_info_url: String,
    coin_id: String,
    target_coin_id: String
});

const CGCoinInfoModel = model('CGInfo', coinInfoSchema, 'CGInfo');
const CGTickersModel = model('CGTickers', tickersSchema, 'CGTickers');
const CGIdsModel = model('CGIds', coinIds, 'CGIds');

const CGExchangeModel = model('CGExchanges', exchangesSchema, 'CGExchanges');
const CGExchangeTickerModel = model('CGExchangeTickers', exchangeTickersSchema, 'CGExchangeTickers');

const cgModel = {
    CGCoinInfoModel,
    CGTickersModel,
    CGIdsModel,
    CGExchangeModel,
    CGExchangeTickerModel
};

export default cgModel;
