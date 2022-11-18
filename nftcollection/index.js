// import dependencies
const console = require("console")
const dotenv = require("dotenv")
const mime = require("mime")
dotenv.config() // setup dotenv
const { compileData } = require("./src/createMetadata")

// canvas for image compile
const { createCanvas } = require("canvas")

// import config
const {
  layers,
  width,
  height,
  editionSize,
  startEditionFrom,
  rarityWeights,
} = require("./input/config.js")

// import metadata
// const { compileMetadata } = require("./src/metadata")

// import for saving files
const { createFile } = require("./src/filesystem")

// setup canvas
const canvas = createCanvas(width, height)
const ctx = canvas.getContext("2d")

// Create generative art by using the canvas api
const startCreating = async () => {
  console.log("##################")
  console.log("# Generative Art #")
  console.log("# - Generating your NFT collection")
  console.log("##################")

  // image data collection
  let imageDataArray = []

  // create NFTs from startEditionFrom to editionSize
  let editionCount = startEditionFrom

  while (editionCount <= editionSize) {
    console.log("-----------------")
    console.log("Creating %d of %d", editionCount, editionSize)

    const handleFinal = async () => {
      // create image files and return object array of created images
      ;[...imageDataArray] = await createFile(
        canvas,
        ctx,
        layers,
        width,
        height,
        editionCount,
        editionSize,
        rarityWeights,
        imageDataArray
      )
    }

    await handleFinal()
    // iterate
    editionCount++
  }
  await compileData(editionSize, imageDataArray)

  console.log()
  console.log("#########################################")
  console.log("--PUFF PUFF---")
  console.log("#########################################")
  console.log()
}

// Initiate code

//metadata cid = bafybeiezcxszxx5huhbictzlro3wuc23awklzn6boed5enk2lylypjrbie
// image cid = bafybeicrxzcls3jthxho6hwqctuygj46cldfo7cvkgyrgbi7s53uxcknby
startCreating()
