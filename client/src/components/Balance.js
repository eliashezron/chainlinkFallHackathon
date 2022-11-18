import React, { useState } from "react"
//import { formatUnits, parseUnits } from "ethers/lib/utils";
import { ethers } from "ethers"
import styles from "../styles"

const Balance = () => {
  const [bal, setbal] = useState("")
  const [canSendtx, setcantSendTx] = useState(false)

  async function getBalance() {
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const signer = provider.getSigner()
    let balance = await provider.getBalance(signer.getAddress())
    if (balance.gt(1e15)) setcantSendTx(true)
    // we use the code below to convert the balance from wei to eth
    balance = ethers.utils.formatEther(balance)

    setbal(balance)
  }
  getBalance()

  return (
    <div className={styles.balance}>
      <p className={styles.balanceText}>
        {bal ? (
          <>
            <span className={styles.balanceBold}>
              Balance:{bal.slice(0, 6)}{" "}
            </span>
            {canSendtx ? (
              <span className={styles.left}>can send tx</span>
            ) : (
              <span className={styles.left}>can sign tx</span>
            )}
          </>
        ) : (
          ""
        )}
      </p>
    </div>
  )
}

export default Balance
