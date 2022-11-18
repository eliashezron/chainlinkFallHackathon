import { signMetaTxRequest } from "./signer"
import createInstance from "../hooks/useContract"
import addresses from "../contracts/addresses.json"
import minimalForwarderAbi from "../contracts/minimalForwarder.json"
import cashOutAbi from "../contracts/cashOut.json"
import tokenAbi from "../contracts/token.json"
import axios from "axios"

export async function approve(amount, provider, networkHandler, cashOutToken) {
  const signer = provider.getSigner()
  const token = createInstance(
    addresses[networkHandler].Token[cashOutToken],
    tokenAbi,
    signer
  )
  const tx = await token.approve(addresses[networkHandler].CashOut, amount)
  tx.wait(1)
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
    phoneNumber, //256779177900
    intocurrency, // input the converted amount here
    currency, // depends on the country currency
  }
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
  return fetch(addresses[networkHandler].URL, {
    method: "POST",
    body: JSON.stringify(request),
    headers: { "Content-Type": "application/json" },
  })
    .then(async (res) => {
      console.log(res)
      try {
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
