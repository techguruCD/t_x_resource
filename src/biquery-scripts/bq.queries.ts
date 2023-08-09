function fetchPairs(network: string, limit: number, offset: number, from: string, till: string, networkQueryString = 'ethereum') {
  const query = `{
  ${networkQueryString}(network: ${network}) {
    dexTrades(
      options: {desc: "tradeAmount", limit: ${limit}, offset: ${offset}}
      date: {since: "${from}", till: "${till}"}
    ) {
      exchange {
        address {
          address
        }
        fullName
        fullNameWithId
        name
      }
      smartContract {
        address {
          address
        }
        currency {
          decimals
          name
          symbol
          tokenType
        }
        protocolType
        contractType
      }
      buyAmount
      buy_amount_usd: buyAmount(in: USD)
      buyCurrency {
        address
        decimals
        name
        symbol
        tokenId
        tokenType
      }
      sellAmount
      sell_amount_usd: sellAmount(in: USD)
      sellCurrency {
        address
        decimals
        name
        symbol
        tokenId
        tokenType	
      }
      buyCurrencyPrice: expression(get: "buy_amount_usd / buyAmount")
      sellCurrencyPrice: expression(get: "sell_amount_usd / sellAmount")
      count
      tradeAmount(in: USD)
      daysTraded: count(uniq: dates)
      started: minimum(of: date)
    }
  }
}
  `;

  return query;
}

const bqQueries = {
    fetchPairs
};

export default bqQueries;