import { signMetaTxRequest } from "./signer"
import createInstance from "../hooks/useContract"
import addresses from "../contracts/contractAddresses.json"
import minimalForwarderAbi from "../contracts/minimalForwarder.json"
import cashOutAbi from "../contracts/CashOutPolygon.json"
import tokenAbi from "../contracts/token.json"
import axios from "axios"

export async function approve(amount, tokenAddress, provider) {
  const signer = provider.getSigner()
  const token = createInstance(tokenAddress, tokenAbi, signer)
  const tx = await token.approve(addresses.CashOutPolygon, amount)
  tx.wait(1)
  return tx
}

async function sendMetaTx(
  tokenAddress,
  amount,
  phoneNumber,
  provider,
  intocurrency,
  currency
) {
  const POLYGON_CASHOUT_WEBHOOK_URL =
    "https://api.defender.openzeppelin.com/autotasks/88bd7556-ef38-4717-aa00-9db30f904c56/runs/webhook/e43ccace-89ee-47fe-ba09-47f0b0e551bc/RTgvHeNiMapberzkjhH3sU"
  const url = POLYGON_CASHOUT_WEBHOOK_URL
  const cashOut = createInstance(addresses.CashOutPolygon, cashOutAbi, provider)
  const token = createInstance(tokenAddress, tokenAbi, provider)
  const forwarder = createInstance(
    addresses.MinimalForwarder,
    minimalForwarderAbi,
    provider
  )
  const signer = await provider.getSigner()
  const from = await signer.getAddress()
  const allowance = await token.allowance(from, addresses.CashOutPolygon)
  if (amount < allowance) throw new Error(`Insufficient Allowance`)
  const data = cashOut.interface.encodeFunctionData("depositToken", [
    tokenAddress,
    amount,
  ])
  const params = {
    account_bank: "MPS", //This is the recipient bank code. Get list here :https://developer.flutterwave.com/v3.0/reference#get-all-banks
    account_number: phoneNumber, //256779177900
    amount: intocurrency, // input the converted amount here
    currency: currency, // depends on the country currency
    reference: "transfer-" + Date.now(), //This is a merchant's unique reference for the transfer, it can be used to query for the status of the transfer
    debit_currency: "UGX",
    beneficiary_name: "cashout",
    callback_url: "https://webhook.site/865479d1-cf68-48b0-b26f-b0d33c0936b4",
  }

  const request = await signMetaTxRequest(
    signer.provider,
    forwarder,
    {
      to: addresses.CashOutPolygon,
      from,
      data,
    },
    params
  )
  return fetch(url, {
    method: "POST",
    body: JSON.stringify(request),
    headers: { "Content-Type": "application/json" },
  })
    .then(async (res) => {
      try {
        if (res.status !== 200) throw new Error("error in transaction")
        // transaction to intiate payment of fiat funds
        const config = { headers: { "Content-Type": "application/json" } }
        const { data } = await axios.post(
          "/api/cashout",
          request.params,
          config
        )
        console.log(data)
      } catch (error) {
        console.log(error)
      }
    })
    .catch((error) => console.log(error))
}

export async function depositToken(
  tokenAddress,
  amount,
  phoneNumber,
  provider,
  intocurrency,
  currency
) {
  if (!amount) throw new Error(`amount cannot be empty`)
  if (!phoneNumber) throw new Error(`phoneNumber cannot be empty`)
  if (!window.ethereum) throw new Error(`User wallet not found`)
  await window.ethereum.enable()
  const userNetwork = await provider.getNetwork()
  if (userNetwork.chainId !== 80001)
    throw new Error(`Please switch to Polygon Mumbai network`)
  return sendMetaTx(
    tokenAddress,
    amount,
    phoneNumber,
    provider,
    intocurrency,
    currency
  )
}
