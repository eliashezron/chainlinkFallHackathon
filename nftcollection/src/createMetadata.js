const fs = require("fs")
const { description, baseImageUri } = require("../input/config.js")
const { NFTStorage, File } = require("nft.storage")
const mime = require("mime")
const path = require("path")
const { filesFromPath } = require("files-from-path")
require("dotenv").config({ path: __dirname + "/.env" })
// write metadata locally to json files
const NFT_STORAGE_KEY = process.env.NFT_STORAGE_KEY
const client = new NFTStorage({ token: NFT_STORAGE_KEY })

const writeMetaData = (metadataList) => {
  fs.writeFileSync("./output/_metadata.json", JSON.stringify(metadataList))
}

// add metadata for individual nft edition
const generateMetadata = (dna, edition, attributesList, path) => {
  let dateTime = Date.now()
  let tempMetadata = {
    dna: dna.join(""),
    name: `CashOut puppies #${edition}`,
    description: description,
    image: path || baseImageUri,
    edition: edition,
    date: dateTime,
    attributes: attributesList,
  }
  return tempMetadata
}

const createMetadata = async (cid, editionSize, imageDataArray) => {
  const metadataList = [] // holds metadata for all NFTs (could be a session store of data)
  for (let i = 1; i < editionSize + 1; i++) {
    let filename = i.toString() + ".json"
    imageDataArray[i].filePath = `https://ipfs.io/ipfs/${cid}/${i}.png`
    // do something else here after firstFunction completes
    let nftMetadata = generateMetadata(
      imageDataArray[i].newDna,
      imageDataArray[i].editionCount,
      imageDataArray[i].attributesList,
      imageDataArray[i].filePath
    )
    metadataList.push(nftMetadata)

    // save locally as file
    fs.writeFileSync(
      `./output/metadata/${filename}`,
      JSON.stringify(metadataList.find((meta) => meta.edition == i))
    )
    // reads output folder for json files and then adds to IPFS object array
    // you'll probably want more sophisticated argument parsing in a real app
  }
}
const compileData = async (editionSize, imageDataArray) => {
  const files = filesFromPath("output/images", {
    pathPrefix: path.resolve("output/images"), // see the note about pathPrefix below
    hidden: true, // use the default of false if you want to ignore files that start with '.'
  })
  console.log(`storing file(s) from output/images`)
  const cid = await client.storeDirectory(files)
  console.log({ cid })
  const status = await client.status(cid)
  console.log(status)
  await createMetadata(cid, editionSize, imageDataArray)
  const metadatafiles = filesFromPath("output/metadata", {
    pathPrefix: path.resolve("output/metadata"), // see the note about pathPrefix below
    hidden: true, // use the default of false if you want to ignore files that start with '.'
  })
  console.log(`storing file(s) from output/metadata`)
  const cidMetadata = await client.storeDirectory(metadatafiles)
  console.log(cidMetadata)
  const statusUpload = await client.status(cidMetadata)
  console.log(statusUpload)
}

module.exports = {
  generateMetadata,
  writeMetaData,
  createMetadata,
  compileData,
}
