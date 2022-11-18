import { signMetaTxRequest } from "./signer"
import { ethers } from "ethers"
import createInstance from "../hooks/useContract"
import addresses from "../contracts/addresses.json"
import minimalForwarderAbi from "../contracts/minimalForwarder.json"
import cashOutAbi from "../contracts/cashOut.json"
import tokenAbi from "../contracts/token.json"
import Flutterwave from "flutterwave-node-v3"

const { FLW_PUBLIC_KEY: publicKey, FLW_SECRET_KEY: secretKey } = process.env

const flw = new Flutterwave(publicKey, secretKey)

async function sendTx(
  networkHandler,
  provider,
  signer,
  tokenAddress,
  amount,
  phoneNumber,
  intocurrency,
  currency
) {
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
  const cashOut = createInstance(
    addresses[networkHandler].CashOut,
    cashOutAbi,
    provider
  )
  await cashOut.connect(signer).depositToken(tokenAddress, amount)
  const { data } = await flw.Transfer.initiate(params)
  return data
}

export async function approve(amount, networkHandler, cashOutToken) {
  const provider = new ethers.providers.Web3Provider(window.ethereum)
  const signer = provider.getSigner()
  const token = createInstance(
    addresses[networkHandler].Token[cashOutToken],
    tokenAbi,
    signer
  )
  const balance = await token.balanceOf(signer.getAddress())
  if (balance < amount) throw new Error("Insufficiant Balance")
  const tx = await token.approve(addresses[networkHandler].CashOut, amount)
  //console.log(tx)

  return tx
}
export async function getBalance(provider, address) {
  const token = createInstance(
    "0x91A794303F6A1D18Ae03ec689983568D76121E00",
    tokenAbi,
    provider
  )
  const tx = await token.balanceOf(address)
  return tx
}

async function sendMetaTx(
  amount,
  phoneNumber,
  provider,
  intocurrency,
  currency,
  networkHandler,
  cashOutToken
) {
  const cashOut = createInstance(
    addresses[networkHandler].CashOut,
    cashOutAbi,
    provider
  )
  const token = createInstance(
    addresses[networkHandler].Token[cashOutToken],
    tokenAbi,
    provider
  )
  console.log(addresses[networkHandler].Token[cashOutToken])
  const forwarder = createInstance(
    addresses[networkHandler].MinimalForwarder,
    minimalForwarderAbi,
    provider
  )

  const signer = provider.getSigner()
  const from = await signer.getAddress()
  const allowance = await token.allowance(from, cashOut.address)
  if (amount < allowance) throw new Error(`Insufficient Allowance`)
  const data = cashOut.interface.encodeFunctionData("depositToken", [
    addresses[networkHandler].Token[cashOutToken],
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

  //const from = await signer.getAddress()
  const to = addresses[networkHandler].CashOut
  const request = await signMetaTxRequest(
    signer.provider,
    forwarder,
    {
      to,
      from,
      data,
    },
    params
  )
  console.log("this is the string version", JSON.stringify(request))
  console.log("this is the non-string version", request)

  return fetch(addresses[networkHandler].URL, {
    method: "POST",
    body: JSON.stringify(request),
    headers: { "Content-Type": "application/json" },
  })
    .then(async (res) => {
      try {
        console.log(res)
        const { data } = await flw.Transfer.initiate(request.params)
        console.log(data)
      } catch (error) {
        console.log(error)
      }
    })
    .catch((error) => console.log(error))
    .finally(() => console.log("done"))
}
export async function depositToken(
  amount,
  phoneNumber,
  provider,
  intocurrency,
  currency,
  networkHandler,
  cashOutToken
) {
  if (!amount) throw new Error(`amount cannot be empty`)
  if (!phoneNumber) throw new Error(`phoneNumber cannot be empty`)
  if (!window.ethereum) throw new Error(`User wallet not found`)
  await window.ethereum.enable()
  const userNetwork = await provider.getNetwork()
  console.log(userNetwork.chainId)
  const providers = new ethers.providers.Web3Provider(window.ethereum)
  const signer = providers.getSigner()
  // const signer = provider.getSigner()
  const from = await signer.getAddress()
  const balance = await provider.getBalance(from)
  const canSendTx = balance.gt(1e15)
  if (canSendTx)
    return sendTx(
      networkHandler,
      providers,
      signer,
      addresses[networkHandler].Token[cashOutToken],
      amount,
      phoneNumber,
      intocurrency,
      currency
    )
  return sendMetaTx(
    amount,
    phoneNumber,
    provider,
    intocurrency,
    currency,
    networkHandler,
    cashOutToken
  )
}
