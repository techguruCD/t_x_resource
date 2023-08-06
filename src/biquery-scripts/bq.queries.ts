function fetchTokens(network: string, limit: number, offset: number, from: string, till: string, networkQueryString = "ethereum") {
    let count = 'count'
    let amount = 'amount'
    let amount_usd = 'amount(in: USD)'

    if (networkQueryString === 'algorand') {
        count = 'count(transferType: {in: [send, close]})'
        amount = 'amount(transferType: {notIn: [create, genesis]})'
        amount_usd = 'amount(in: USD, transferType: {notIn: [create, genesis]})'
    }



    const query = `{
        ${networkQueryString}(network: ${network}) {
            transfers(
            options: {desc: "count", limit: ${limit}, offset: ${offset}}
            amount: {gt: 0}
            date: {since: "${from}", till: "${till}"}
            ) {
            currency {
                address,
                decimals
                name
                symbol
                tokenId
                tokenType
            }
            ${count}
            senders: count(uniq: senders)
            receivers: count(uniq: receivers)
            days: count(uniq: dates)
            from_date: minimum(of: date)
            till_date: maximum(of: date)
            ${amount}
            amount_usd: ${amount_usd}
            }
        }
    }`;

    return query;
}

function fetchPairs(network: string, baseCurrencies: string[], limit: number, offset: number, from: string, till: string, networkQueryString = 'ethereum') {
  const baseCurrenciesString = JSON.stringify(baseCurrencies);
  
    const query = `{
  ${networkQueryString}(network: ${network}) {
    dexTrades(
      baseCurrency: {in: ${baseCurrenciesString}}
      options: {desc: "count", limit: ${limit}, offset: ${offset}, limitBy: {each: "smartContract.address.address", limit: 1}}
      date: {since: "${from}", till: "${till}"}
    ) {
      date {
        date
      }
      exchange {
        address {
          address
        }
        fullName
        fullNameWithId
        name
      }
      baseCurrency {
        address
      }
      quoteCurrency {
        address
        decimals
        name
        symbol
        tokenId
        tokenType
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
        contractType
        protocolType
      }
      count
    }
  }
}
    `;

    return query;
}

function fetchPairs2(network: string, limit: number, offset: number, from: string, till: string, networkQueryString = 'ethereum') {
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
    fetchTokens,
    fetchPairs,
    fetchPairs2
};

export default bqQueries;