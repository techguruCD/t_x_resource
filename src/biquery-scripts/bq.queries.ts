function fetchPairs(network: string, limit: number, offset: number, from: string, till: string, networkQueryString = 'ethereum') {
  const query = `{
  ${networkQueryString}(network: ${network}) {
    dexTrades(
      options: {desc: ["block.height", "tradeIndex"], limit: ${limit}, offset: ${offset}, limitBy: {each: "buyCurrency.address, sellCurrency.address", limit: 1}}
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
      buyAmountUSD: buyAmount(in: USD)
      buyCurrency {
        address
        decimals
        name
        symbol
        tokenId
        tokenType
      }
      sellAmount
      sellAmountUSD: sellAmount(in: USD)
      sellCurrency {
        address
        decimals
        name
        symbol
        tokenId
        tokenType	
      }
      usdPrice1: expression(get: "buyAmountUSD / sellAmount")
      usdPrice2: expression(get: "sellAmountUSD / buyAmount")
      usdPrice3: expression(get: "buyAmountUSD / buyAmount")
      usdPrice4: expression(get: "sellAmountUSD / sellAmount")
      count
      tradeAmount(in: USD)
      daysTraded: count(uniq: dates)
      started: minimum(of: date)
      block {
        height
        timestamp {
          iso8601
        }
      }
      tradeIndex
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