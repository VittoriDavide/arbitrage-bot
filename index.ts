import { config } from 'dotenv'
import {BigNumber, ethers} from 'ethers'
const fs = require('fs');

// uni/sushiswap/pancake/bakery ABIs
import UniswapV2Pair from './abis/IUniswapV2Pair.json'
import FlashLoanerComplete from './abis/FlashLoanerComplete.json'
import UniswapV2Factory from './abis/IUniswapV2Factory.json'
import axios from "axios";
import moment from "moment";

config()
const {
  PRIVATE_KEY: privateKey,
  FLASH_LOANER: flashLoanerAddress,
  RPC_LINK: rpcLink,
    BITQUERY_KEY: bitquery
} = process.env;
console.log(flashLoanerAddress)
const provider = new ethers.providers.JsonRpcProvider(rpcLink)
const wallet = new ethers.Wallet(privateKey, provider);
let DEX_1 = "0x01bF7C66c6BD861915CdaaE475042d3c4BaE16A7"
let DEX_2 = "0xBCfCcbde45cE874adCB698cC183deBcF17952812"
let DO_NETWORK_TRANSACTIONS = true

let FACTORY_TO_DEX = [
  // {
  //   //Pancake
  //   factory1: "0xBCfCcbde45cE874adCB698cC183deBcF17952812",
  //   router1: "0x10ED43C718714eb63d5aA57B78B54704E256024E",
  //   //Bakery
  //   factory2: "0x01bF7C66c6BD861915CdaaE475042d3c4BaE16A7",
  //   router2: "0xCDe540d7eAFE93aC5fE6233Bee57E1270D3E330F"
  // },
  // {
  //   //Pancake
  //   factory1: "0xBCfCcbde45cE874adCB698cC183deBcF17952812",
  //   router1: "0x10ED43C718714eb63d5aA57B78B54704E256024E",
  //   //CoinSwap
  //   factory2: "0xC2D8d27F3196D9989aBf366230a47384010440c0",
  //   router2: "0x34DBe8E5faefaBF5018c16822e4d86F02d57Ec27",
  // },
  {
    //Pancake
    factory1: "0xBCfCcbde45cE874adCB698cC183deBcF17952812",
    router1: "0x10ED43C718714eb63d5aA57B78B54704E256024E",
    //BiSwap
    factory2: "0x858e3312ed3a876947ea49d572a7c42de08af7ee",
    router2: "0x3a6d8cA21D1CF76F653A67577FA0D27453350dD8",
  },
  // {
  //   //Pancake
  //   factory1: "0xBCfCcbde45cE874adCB698cC183deBcF17952812",
  //   router1: "0x10ED43C718714eb63d5aA57B78B54704E256024E",
  //
  //   //MDEX
  //   factory2: "0x3cd1c46068daea5ebb0d3f55f6915b10648062b8",
  //   router2: "0x7DAe51BD3E3376B8c7c4900E9107f12Be3AF1bA8",
  //
  // },


  // {
  //   //MDEX
  //   factory1: "0xBCfCcbde45cE874adCB698cC183deBcF17952812",
  //   router1: "0x3cd1c46068daea5ebb0d3f55f6915b10648062b8",
  //
  //   //BiSwap
  //   factory2: "0x858e3312ed3a876947ea49d572a7c42de08af7ee",
  //   router2: "0x3a6d8cA21D1CF76F653A67577FA0D27453350dD8",
  // },
  // {
  //   //MDEX
  //   factory1: "0xBCfCcbde45cE874adCB698cC183deBcF17952812",
  //   router1: "0x3cd1c46068daea5ebb0d3f55f6915b10648062b8",
  //   //Bakery
  //   factory2: "0x01bF7C66c6BD861915CdaaE475042d3c4BaE16A7",
  //   router2: "0xCDe540d7eAFE93aC5fE6233Bee57E1270D3E330F"
  // },
  // {
  //   //BiSwap
  //   factory1: "0x858e3312ed3a876947ea49d572a7c42de08af7ee",
  //   router1: "0x3a6d8cA21D1CF76F653A67577FA0D27453350dD8",
  //
  //   //Bakery
  //   factory2: "0x01bF7C66c6BD861915CdaaE475042d3c4BaE16A7",
  //   router2: "0xCDe540d7eAFE93aC5fE6233Bee57E1270D3E330F"
  // },
]



const getQueryPair = (pairAddress1, pairAddress2) => {
  return '{\n' +
      '  ethereum(network: bsc) {\n' +
      '    dexTrades(\n' +
      '      smartContractAddress: {in: ["' + pairAddress1 + '", "' + pairAddress2 + '"]}\n' +
      '      date:{is: "' + moment().format("YYYY-MM-DD") + '"}\n' +
      '    ) {\n' +
      '      poolToken: smartContract {\n' +
      '        address {\n' +
      '          address\n' +
      '        }\n' +
      '      }\n' +
      '      exchange {\n' +
      '        fullName\n' +
      '      }\n' +
      '      pair: baseCurrency {\n' +
      '        symbol\n' +
      '      }\n' +
      '      baseCurrency {\n' +
      '        symbol\n' +
      '        address\n' +
      '      }\n' +
      '      baseAmount\n' +
      '      quoteCurrency {\n' +
      '        symbol\n' +
      '        address\n' +
      '      }\n' +
      '      quoteAmount\n' +
      '      baseAmount\n' +
      '      gasPrice\n' +
      '      trades: count\n' +
      '      quotePrice\n' +
      '      side\n' +
      '      maximum_price: quotePrice(calculate: maximum)\n' +
      '      minimum_price: quotePrice(calculate: minimum)\n' +
      '      open_price: minimum(of: block, get: quote_price)\n' +
      '      close_price: maximum(of: block, get: quote_price)\n' +
      '      baseAmount\n' +
      '    }\n' +
      '  }\n' +
      '}'

}


const getQuery = (dex) => {
  return  '{\n' +
      '  ethereum(network: bsc) {\n' +
      '    arguments(\n' +
      '      smartContractAddress: {is: "' + dex + '"}\n' +
      '      smartContractEvent: {is: "PairCreated"}\n' +
      '      options: {asc: "block.height", limit: 200}\n' +
      '    ) {\n' +
      '      block {\n' +
      '        height\n' +
      '      }\n' +
      '      transaction {\n' +
      '        txFrom {\n' +
      '          address\n' +
      '        }\n' +
      '        hash\n' +
      '      }\n' +
      '          token0_address: any(argument: {is: "token0"} of: argument_value)\n' +
      '          token0_symbol: any(argument: {is: "token0"} of: argument_value as: token_symbol)\n' +
      '          token0_name: any(argument: {is: "token0"} of: argument_value as: token_name)\n' +
      '          \n' +
      '          token1_address: any(argument: {is: "token1"} of: argument_value)\n' +
      '          token1_symbol: any(argument: {is: "token1"} of: argument_value as: token_symbol)\n' +
      '          token1_name: any(argument: {is: "token1"} of: argument_value as: token_name)\n' +
      '        \n' +
      '          pair_address: any(argument: {is: "pair"} of: argument_value)\n' +
      '          pair_symbol: any(argument: {is: "pair"} of: argument_value as: token_symbol)\n' +
      '          pair_name: any(argument: {is: "pair"} of: argument_value as: token_name)\n' +
      '    }\n' +
      '  }\n' +
      '}\n' +
      '\n'
}

const updateFlashLoan = async (factory, router) => {
  console.log(factory, router)

  let flashLoan = new ethers.Contract(
      ethers.utils.getAddress(flashLoanerAddress),
      FlashLoanerComplete,
      wallet
  );
  // await flashLoan.changeFactory(ethers.utils.getAddress(factory),
  //     {
  //       gasPrice:  ethers.utils.parseUnits('5', 'gwei'),
  //       gasLimit: 1000000
  //     });
  await flashLoan.changeRouter(ethers.utils.getAddress(router),
      {
        gasPrice:  ethers.utils.parseUnits('5', 'gwei'),
        gasLimit: 500000,
        nonce: 103
      })
}
// let baseNonce = provider.getTransacrionCount(wallet.getAddress());
// let nonceOffset = 0;
// function getNonce() {
//   return baseNonce.then((nonce) => (nonce + (nonceOffset++)));
// }
const getTokens = async (DEX_1, DEX_2): Promise<{ token0: string, token1: string, name0: string, name1: string }[]> => {
  let query = getQuery(DEX_1)
  let query2 = getQuery(DEX_2)

  let response = await axios.post('https://graphql.bitquery.io/', {query}, {headers: {"X-API-KEY": bitquery}})
  let response2 = await axios.post('https://graphql.bitquery.io/', {query: query2}, {headers: {"X-API-KEY": bitquery}})
  let obj1 = response.data["data"]["ethereum"]["arguments"]
  let obj2 = response2.data["data"]["ethereum"]["arguments"]
  let objC = []
  for(let o of obj1) {
    for(let b of obj2) {
      if ((o["token0_address"] === b["token0_address"] && o["token1_address"] === b["token1_address"]) ||
          (o["token1_address"] === b["token0_address"] && o["token0_address"] === b["token1_address"])
      ){
        objC.push({token0: b["token0_address"], token1: b["token1_address"], name0: b["token0_name"], name1: b["token1_name"]});
      }
    }
  }
  console.log("[DEBUG] First Call Success to Bit query ")
  return objC

}





const startBot = async () => {
  for(let arbitragePair of FACTORY_TO_DEX) {
    // if (DO_NETWORK_TRANSACTIONS) {
    //   await updateFlashLoan(arbitragePair.factory1, arbitragePair.router2)
    // }

    const bakerySwapFactory = new ethers.Contract(
        ethers.utils.getAddress(arbitragePair.factory1),
        UniswapV2Factory.abi, wallet
    );
    const pancakeSwapFactory = new ethers.Contract(
        ethers.utils.getAddress(arbitragePair.factory2),
        UniswapV2Factory.abi, wallet
    );
    let pairs = await getTokens(arbitragePair.factory1, arbitragePair.factory2);

    for (let pair of pairs) {

      const token1Address = pair.token0 //tokens can be changed to other desired ones
      const token2Address =  pair.token1
      const token1Name = pair.name0 //tokens can be changed to other desired ones
      const token2Name =  pair.name1

      let bakeryEthDai, pancakeEthDai;
      console.log("[DEBUG] Analizing " + token1Name + "/"  + token2Name + "...")

      const loadPrices = async (pair1Address, pair2Address) => {
        try{
          let response = await axios.post('https://graphql.bitquery.io/', {query: getQueryPair(pair1Address, pair2Address)},
              {headers: {"X-API-KEY": bitquery}})
          let trades = response.data["data"]["ethereum"]["dexTrades"].filter((e) => e["side"] === "BUY")
          let sellTrades = response.data["data"]["ethereum"]["dexTrades"].filter((e) => e["side"] === "SELL")

          if (trades.length > 0) {
            let pool1 = trades.filter((e) => e["poolToken"]["address"]["address"].toUpperCase() === pair1Address.toUpperCase())
            let pool2 = trades.filter((e) => e["poolToken"]["address"]["address"].toUpperCase() === pair2Address.toUpperCase())

            let poolSell1 = sellTrades.filter((e) => e["poolToken"]["address"]["address"].toUpperCase() === pair1Address.toUpperCase())
            let poolSell2 = sellTrades.filter((e) => e["poolToken"]["address"]["address"].toUpperCase() === pair2Address.toUpperCase())

            let tradePrice1 = pool1[0]["close_price"]
            let tradePrice2 = pool2[0]["close_price"]
            let sellPrice1 = poolSell1[0]["close_price"]
            let sellPrice2 = poolSell2[0]["close_price"]
            let reservesAPool1 = poolSell1[0]["baseAmount"]
            let reservesBPool1 = poolSell2[0]["quoteAmount"]
            let reservesAPool2 = poolSell1[0]["baseAmount"]
            let reservesBPool2 = poolSell2[0]["quoteAmount"]
            let gasPrice1 = pool2[0]["gasPrice"]
            let gasPrice2 = pool2[0]["gasPrice"]
            console.log("[DEBUG] Gas Price: ")

            console.log(gasPrice1)
            console.log(gasPrice2)

            console.log("[DEBUG] Pair Addresses: ")
            console.log(pair1Address)
            console.log(pair2Address)

            console.log("[DEBUG] Token Addresses: ")
            console.log(token1Name + ": " + token1Address)
            console.log(token2Name + ": " + token2Address)

            console.log("[BITQUERY API] Trading Price 1: " + tradePrice1)
            console.log("[BITQUERY API] Trading Price 2: " + tradePrice2)

            const spread = Math.abs((tradePrice1 / tradePrice2 - 1) * 100) - 0.6
            console.log("[BITQUERY API] spread: ", spread)


            let aToB = ((reservesAPool1 * tradePrice2) / reservesBPool1) < sellPrice2
            let invariant = reservesAPool1*reservesBPool1

            let leftSide = Math.sqrt((invariant*1000  * (aToB ? tradePrice1 : tradePrice2)) /((aToB ? tradePrice2 : tradePrice1) * 997))
            let rightSide = (aToB ? reservesAPool1 *1000 : reservesBPool1 * 1000) / 997;
            if(leftSide > rightSide) {
              let amountIn = leftSide - rightSide;
              let shouldTrade = spread > (amountIn / Number(
                  aToB ? reservesAPool1 : reservesBPool1
              ))
              if (shouldTrade) {
                console.log("[DEBUG] Success amount in to trade " + amountIn)
                if ( DO_NETWORK_TRANSACTIONS) {
                  await pancakeEthDai.swap(
                      aToB ? Math.ceil(amountIn) : 0,
                      aToB ? 0 : Math.ceil(amountIn),
                      ethers.utils.getAddress(flashLoanerAddress),
                      ethers.utils.toUtf8Bytes('1'),
                      {
                        gasPrice:  ethers.utils.parseUnits('5', 'gwei'),
                        gasLimit: 1000000
                      }
                  );
                }

                console.log("[DEBUG] Traded " + amountIn)
              }else{
                console.log("[DEBUG] Not a good pair now...")

              }
            }else{
              console.log("[DEBUG] Not a good pair now...")
            }
            console.log(aToB)

            // const shouldStartEth =
            // const shouldTrade = spread > (
            //     (shouldStartEth ? token0Trade : token1Trade)
            //     / Number(
            //         ethers.utils.formatEther(pancakeReserves[shouldStartEth ? 1 : 0])
            //     )
            // )


          }
        }catch (e) {
          console.error(e)
        }
      }

      const loadPairs = async () => {
        try {
          let pair1Address = await bakerySwapFactory.getPair(token2Address, token1Address)
          let pair2Address = await pancakeSwapFactory.getPair(token2Address, token1Address)
          bakeryEthDai = new ethers.Contract(
              pair1Address,
              UniswapV2Pair.abi, wallet
          );
          pancakeEthDai = new ethers.Contract(
              pair2Address,
              UniswapV2Pair.abi, wallet
          );

          console.log("[DEBUG] Pairs and Contracts Loaded")
          await loadPrices(pair1Address, pair2Address)

        }catch (e) {
          console.error(e)
        }


      }
      await loadPairs();

      // aToB = FullMath.mulDiv(reserveA, truePriceTokenB, reserveB) < truePriceTokenA;
      //
      // uint256 invariant = reserveA.mul(reserveB);
      //
      // uint256 leftSide = Babylonian.sqrt(
      //     FullMath.mulDiv(
      //         invariant.mul(1000),
      //         aToB ? truePriceTokenA : truePriceTokenB,
      //         (aToB ? truePriceTokenB : truePriceTokenA).mul(997)
      //     )
      // );
      // uint256 rightSide = (aToB ? reserveA.mul(1000) : reserveB.mul(1000)) / 997;
      //
      // if (leftSide < rightSide) return (false, 0);
      //
      // // compute the amount that must be sent to move the price to the profit-maximizing price
      // amountIn = leftSide.sub(rightSide);


      // provider.on('block', async (blockNumber) => {
      //   try {
      //     const bakeryReserves = await bakeryEthDai.getReserves();
      //     const pancakeReserves = await pancakeEthDai.getReserves();
      //
      //     const reserve0Bakery = Number(ethers.utils.formatUnits(bakeryReserves[0], 18))
      //     const reserve1Bakery = Number(ethers.utils.formatUnits(bakeryReserves[1], 18))
      //
      //     const reserve0Pancake = Number(ethers.utils.formatUnits(pancakeReserves[0], 18))
      //     const reserve1Pancake = Number(ethers.utils.formatUnits(pancakeReserves[1], 18))
      //
      //     const pricePancakeSwap = reserve0Pancake / reserve1Pancake
      //     const priceBakerySwap = reserve0Bakery / reserve1Bakery
      //
      //     const shouldStartEth = pricePancakeSwap < priceBakerySwap
      //     const spread = Math.abs((priceBakerySwap / pricePancakeSwap - 1) * 100) - 0.6
      //
      //     const token0Trade = reserve0Pancake/10
      //     const token1Trade = reserve1Pancake/10
      //
      //     const shouldTrade = spread > (
      //         (shouldStartEth ? token0Trade : token1Trade)
      //         / Number(
      //             ethers.utils.formatEther(pancakeReserves[shouldStartEth ? 1 : 0])
      //         )
      //     )
      //
      //     console.log(`PAIR ${token1Name}/${token2Name}`);
      //     console.log(`PAIR ADDRESSES ${token1Address}/${token2Address}`);
      //     console.log(`PANCAKESWAP PRICE ${pricePancakeSwap}`);
      //     console.log(`BAKERYSWAP PRICE ${priceBakerySwap}`);
      //     console.log(`PROFITABLE? ${shouldTrade}`);
      //     console.log(`CURRENT SPREAD: ${(priceBakerySwap / pricePancakeSwap - 1) * 100}%`);
      //     console.log(`ABSOLUTE SPREAD: ${spread}`);
      //     console.log("Trading First " + shouldStartEth);
      //
      //     if (!shouldTrade) continue
      //     // should be pancakeETHDai
      //     console.log(Math.ceil(token1Trade))
      //     console.log(Math.ceil(token0Trade))

      // const gasLimit = await pancakeEthDai.swap(
      //     !shouldStartEth ? Math.ceil(token1Trade) : 0,
      //     shouldStartEth ?  Math.ceil(token0Trade) : 0,
      //     flashLoanerAddress,
      //     ethers.utils.toUtf8Bytes('1'),
      //     {
      //       gasPrice:  ethers.utils.parseUnits('100', 'gwei'),
      //       gasLimit: 1000000
      //     }
      // );

      // const gasPrice = await wallet.getGasPrice()
      //
      // const gasCost = Number(ethers.utils.formatEther(gasPrice.mul(gasLimit)))

      // const shouldSendTx = shouldStartEth
      //     ? (gasCost / token0Trade) < spread
      //     : (gasCost / (token1Trade / pricePancakeSwap)) < spread

      // don't trade if gasCost is higher than the spread
      // if (!shouldSendTx) return;
      //
      // const options = {
      //   gasPrice,
      //   gasLimit,
      // };
      // const tx = await bakeryEthDai.swap(
      //     !shouldStartEth ? token1Trade : 0,
      //     shouldStartEth ? token0Trade : 0,
      //     flashLoanerAddress,
      //     ethers.utils.toUtf8Bytes('1'), options,
      // )
      //
      // console.log('ARBITRAGE EXECUTED! PENDING TX TO BE MINED');
      // console.log(tx);
      //
      // await tx.wait();
      //   console.log('SUCCESS! TX MINED');
      // } catch (err) {
      //   console.log("error", err);
      // }
      // })
    }
  }
}

console.log('Bot started!');

startBot()



