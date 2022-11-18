import React from "react"
import ReactDOM from "react-dom"
import { DAppProvider } from "@usedapp/core"
import { MoralisProvider } from "react-moralis"
import App from "./App"
import { DAPP_CONFIG } from "./config"
import "./index.css"

ReactDOM.render(
  <React.StrictMode>
    <DAppProvider config={DAPP_CONFIG}>
      <MoralisProvider
        appId='X33OubUzO2T2obtS3DOK60VtTice1x7drFuQAU15'
        serverUrl='https://pwud8tj3yjel.usemoralis.com:2053/server'
      >
        <App />
      </MoralisProvider>
    </DAppProvider>
  </React.StrictMode>,
  document.getElementById("root")
)
