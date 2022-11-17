// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

contract NFTMania is ERC721, Ownable {
    using Counters for Counters.Counter;
    string public _baseURL;
    uint public mintPrice;

    Counters.Counter private _tokenIdCounter;

    constructor(
    ) ERC721("NFTMANIA", "NFTM") {
    
    }

    function Mint() external payable {
        uint256 tokenId = _tokenIdCounter.current();
        _mint(msg.sender, tokenId);
        _tokenIdCounter.increment();
        
    }
    function setBaseURL(string memory baseURI) public onlyOwner {
    _baseURL = baseURI;
    }
    function _baseURI() internal view override returns (string memory) {
    return _baseURL;
    }
    function setPrice(uint256 _price) public onlyOwner {
    mintPrice = _price;
    }

    function withdraw() external onlyOwner {
    uint balance = address(this).balance;
    payable(owner()).transfer(balance);
    }
}