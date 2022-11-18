import { Mumbai, FantomTestnet, BSCTestnet } from "@usedapp/core"

export const DAPP_CONFIG = {
  readOnlyChainId: FantomTestnet.chainId,
  readOnlyUrls: {
    [Mumbai.chainId]: `https://polygon-mumbai.g.alchemy.com/v2/QWBjR1zQlh9_j3wnnDHctBnHmn-Obao3`,
    [BSCTestnet.chainId]: `https://data-seed-prebsc-2-s1.binance.org:8545/`,
    [FantomTestnet.chainId]: `https://xapi.testnet.fantom.network/lachesis/`,
  },
  noMetamaskDeactivate: true,
}
