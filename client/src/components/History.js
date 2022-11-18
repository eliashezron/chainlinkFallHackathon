import React, { useState, useRef } from "react"
//import {handleNetworkSwitch} from "../utils/switchnetwork";
import { chevronDown, bell } from "../assets"
import { useOnClickOutside } from "../utils"
import styles from "../styles"
import axios from "axios"
const History = ({ address, chainId, caddress }) => {
  const [data, setData] = useState([])
  const apiKey = "ckey_e3045fc664a34784bb369d7a47a"
  const tx = `https://api.covalenthq.com/v1/${chainId}/address/${address}/transfers_v2/?contract-address=${caddress}`
  const auth = {
    auth: {
      username: apiKey,
    },
  }
  const getHistory = () => {
    axios.get(tx, auth).then((res) => {
      setData(res.data.data.items)
    })
  }
  const [showList, setShowList] = useState(false)
  // eslint-disable-next-line
  const [clickTokens, setclickTokens] = useState(false)
  // eslint-disable-next-line
  const [activeToken, setActiveToken] = useState("Select")
  // eslint-disable-next-line
  const [activeChainId, setactiveChainId] = useState("")

  const ref = useRef()
  useOnClickOutside(ref, () => setShowList(false))

  const chainid = async () => {
    const chainId = await window.ethereum.request({ method: "eth_chainId" })
    const chainid = parseInt(chainId, 16)
    setactiveChainId(chainid)
    setShowList(!showList)
    getHistory()
  }
  console.log(data)

  return (
    <div className='relative' onClick={async () => await chainid()}>
      <button className={styles.currencyButton}>
        <img
          src={bell}
          alt='cheveron-down'
          className={`w-5 h-5 object-contain `}
        />
      </button>

      {showList && (
        <ul ref={ref} className={styles.currencyList}>
          {data.map(({ value, block_signed_at }, index) => (
            <li
              key={index}
              className={`${styles.currencyListItem} "bg-site-dim2" `}
            >
              {block_signed_at}
              <img
                src={chevronDown}
                alt='cheveron-down'
                className={`w-4 h-4 object-contain ml-2 ${
                  clickTokens ? "rotate-180" : "rotate-0"
                }`}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default History
