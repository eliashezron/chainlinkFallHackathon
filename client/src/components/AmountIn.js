import React, { useState, useRef } from "react"
import { chevronDown } from "../assets"
import { useOnClickOutside } from "../utils"
import styles from "../styles"
import tokens from "../utils/tokenname.json"
import { handlePriceFeed } from "../utils/pricefeed"

const AmountIn = ({ value, onChange, onChain, inUsd, onToken, taddress }) => {
  const [showList, setShowList] = useState(false)
  const [activeToken, setActiveToken] = useState("Select")
  const [activeChainId, setactiveChainId] = useState("")

  const ref = useRef()
  useOnClickOutside(ref, () => setShowList(false))

  const chainid = async () => {
    const chainId = await window.ethereum.request({ method: "eth_chainId" })
    const chainid = parseInt(chainId, 16)
    setactiveChainId(chainid)
    setShowList(!showList)
  }

  return (
    <div className={styles.amountContainer}>
      <input
        placeholder='0.0'
        type='number'
        value={value}
        disabled={false}
        onChange={(e) =>
          typeof onChange === "function" && onChange(e.target.value)
        }
        className={styles.amountInput}
      />

      <div className='relative' onClick={async () => await chainid()}>
        <button className={styles.currencyButton}>
          {activeToken}
          <img
            src={chevronDown}
            alt='cheveron-down'
            className={`w-4 h-4 object-contain ml-2 ${
              showList ? "rotate-180" : "rotate-0"
            }`}
          />
        </button>

        {showList && (
          <ul ref={ref} className={styles.currencyList}>
            {tokens[activeChainId].map(
              ({ tokenName, pricefeed, add }, index) => (
                <li
                  key={index}
                  className={`${styles.currencyListItem} ${
                    activeToken === tokenName ? "bg-site-dim2" : ""
                  } cursor-pointer`}
                  onClick={async () => {
                    setActiveToken(tokenName)
                    onToken(tokenName)
                    taddress(add)
                    if (typeof onSelect === "function") onChain(activeChainId)
                    const z = await handlePriceFeed(pricefeed)
                    inUsd(z)
                    console.log(z)
                    setShowList(false)
                  }}
                >
                  {tokenName}
                </li>
              )
            )}
          </ul>
        )}
      </div>
    </div>
  )
}

export default AmountIn
