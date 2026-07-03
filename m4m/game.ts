// @ts-ignore
import { ERC721__factory } from './typechain-types/factories/ERC721__factory';
// @ts-ignore
import { ERC1155Upgradeable__factory } from './typechain-types/factories/ERC1155Upgradeable__factory';
// @ts-ignore
import { M4mBaggageWithoutRole__factory } from './typechain-types/factories/M4mBaggageWithoutRole__factory';
// @ts-ignore
import { M4mBaggageWithoutRole } from './typechain-types/M4mBaggageWithoutRole';
// @ts-ignore
import { M4mComponentV2 } from './typechain-types/M4mComponentV2';
import { Contract, ethers } from "ethers";

/**provider: any, type: "erc721" | "erc1155",userAddr: string,nftContract: string,targetContract: string**/
export const isApprovalForAll =  async (provider, type, userAddr, nftContract, targetContract) => {
    if (!provider) throw new Error("Missing Reown AppKit provider");
    const browserProvider = new ethers.BrowserProvider(provider);
    console.log('isApprovalForAll provider', browserProvider);
    const signer = await browserProvider.getSigner();
    console.log('isApprovalForAll getSigner', signer);
    let nft = new Contract(nftContract, type === "erc721" ? ERC721__factory.abi : ERC1155Upgradeable__factory.abi, signer) as unknown as M4mComponentV2;
    console.log('isApprovalForAll nft', nft);
    let tx = await nft.isApprovedForAll(userAddr, targetContract);
    return tx; // returns boolean
}

/**provider: any,type: "erc721" | "erc1155", address: string, nftContract: string,targetContract: string**/
export const setApprovalForAll = async (provider, type, address, nftContract, targetContract) => {
    if (!provider) throw new Error("Missing Reown AppKit provider");
    const browserProvider = new ethers.BrowserProvider(provider);
    const signer = await browserProvider.getSigner();
    const nft = new Contract(
        nftContract,
        type === "erc721" ? ERC721__factory.abi : ERC1155Upgradeable__factory.abi,
        signer
    );
    console.log('setApprovalForAll nft', nft);
    const tx = await nft.setApprovalForAll(targetContract, true);
    const res = await tx.wait();
    return res;
};

/** Get user signature hash
 * owner: string, m4mNFTId: number, gameId: number,uuid: string,lootIds: number[], lootAmounts: number[],lostIds: number[],lostAmounts: number[]
 * **/
export const getOperatorSig = async (owner, m4mNFTId, gameId, uuid, lootIds, lootAmounts, lostIds, lostAmounts) => {
    return ethers.solidityPackedKeccak256(['bytes'],
        [ethers.solidityPacked(['address', 'uint', 'uint', 'string', 'uint[1]', 'uint[1]', 'uint[4]', 'uint[4]'],
            [owner, m4mNFTId, gameId, uuid, lootIds, lootAmounts, lostIds, lostAmounts])]);
};

/** mint custom game signature
 * params:{tokenId: number;prepare: boolean;name: string;symbol: string;amount: number;}[], m4mNFTId:string, gameId:number, nonce:number | string
**/
export const getGameSignerHash = async(params, m4mNFTId, gameId, nonce) => {
    let paramsHashes = [];
    for (const param of params) {
        paramsHashes.push(ethers.solidityPackedKeccak256(['bytes'],
            [ethers.solidityPacked(['uint', 'bool', 'string', 'string', 'uint'],
                [param.tokenId, param.prepare, param.name, param.symbol, param.amount])]));
    }
    console.log('paramsHashes', paramsHashes);
    let hash = ethers.solidityPackedKeccak256(['bytes'],
        [ethers.solidityPacked(['uint', 'uint', 'uint', `bytes32[${params.length}]`],
            [m4mNFTId, gameId, nonce, paramsHashes])]);
    console.log('hash', hash);
    return hash;
};

/** unlock component custom game signature
 *  provider:any, targetContract:string, m4m_token_id:string, nonce:number | string, gameId:number, out_component_ids
 * **/
export const getUnlockGameSignerHash = async(m4m_token_id, gameId, nonce, loot_ids, loot_amounts, lost_ids, lost_amounts) => {
    console.log('m4m_token_id', m4m_token_id);
    console.log('nonce', nonce);
    console.log('gameId', gameId);
    console.log('loot_ids', loot_ids);
    console.log('loot_amounts', loot_amounts);
    const lootLength = loot_ids.length;
    const lostLength = lost_ids.length;
    const hash = ethers.solidityPackedKeccak256([ 'bytes' ],
        [ ethers.solidityPacked([ 'uint', 'uint', 'uint', `uint[${lootLength}]`,
                `uint[${lootLength}]`, `uint[${lostLength}]`, `uint[${lostLength}]` ],
            [ m4m_token_id, gameId, nonce, loot_ids, loot_amounts, lost_ids, lost_amounts ]) ]);
    console.log('hash', hash);
    return hash;
};

/** custom game signature
 * signHash:string, KEY:string
 * **/
export const getLocalGameSignerSig = async(signHash, KEY) => {
    let gameSigningKey = new ethers.SigningKey('0x' + KEY);
    return gameSigningKey.sign(signHash).serialized;
};

/**provider: any,targetContract: string, m4mTokenId: number,nonce: number,params: {tokenId: number;prepare: boolean;name: string;symbol: string; amount: number;}[],
 *  operatorSig: string,gameSignerSig: string,overrides?: any**/
export const handleSettleNewLoots = async (provider, targetContract, m4mTokenId, nonce, params, operatorSig, gameSignerSig) => {
    if (!provider) throw new Error("Missing Reown AppKit provider");
    const browserProvider = new ethers.BrowserProvider(provider);
    const signer = await browserProvider.getSigner();
    const baggage = new Contract(targetContract, M4mBaggageWithoutRole__factory.abi, signer) as unknown as M4mBaggageWithoutRole;
    console.log('settleNewLoots baggage', baggage);
    console.log('settleNewLoots Parameters', 'm4mTokenId='+m4mTokenId, 'nonce='+nonce, 'params='+params, 'operatorSig='+Buffer.from(''), 'gameSignerSig='+gameSignerSig);
    console.log('settleNewLoots params', params);
    let tx = await baggage.settleNewLoots(m4mTokenId, nonce, params, Buffer.from(''), gameSignerSig);
    return await tx.wait();
};

/** lootIds represents equipment won by user, lostIds represents equipment lost by user. Setting them to the same values is equivalent to unlocking user's locked equipment. **/
export const handleUnlockComponents = async(provider, targetContract, m4mTokenId, nonce, lootIds, lootAmounts, lostIds, lostAmounts, operatorSig, gameSignerSig) => {
    if (!provider) throw new Error("Missing Reown AppKit provider");
    const browserProvider = new ethers.BrowserProvider(provider);
    console.log('m4mTokenId', m4mTokenId);
    console.log('nonce', nonce);
    console.log('lootIds', lootIds);
    console.log('lootAmounts', lootAmounts);
    console.log('lostIds', lostIds);
    console.log('lostAmounts', lostAmounts);
    console.log('operatorSig', operatorSig);
    console.log('gameSignerSig', gameSignerSig);
    console.log('targetContract', targetContract);
    console.log('provider', browserProvider);
    const signer = await browserProvider.getSigner();
    const baggage = new Contract(targetContract, M4mBaggageWithoutRole__factory.abi, signer) as unknown as M4mBaggageWithoutRole;
    console.log('handleUnlockComponents baggage', baggage);
    let tx = await baggage.settleLoots(m4mTokenId, nonce, lootIds, lootAmounts, lostIds, lostAmounts, operatorSig, gameSignerSig);
    return await tx.wait();
}

/**provider: any, targetContract: string, m4mTokenId: number, inComponentIds: number[], inAmounts: number[]**/
export const handleLockComponents = async(provider, targetContract, m4mTokenId, inComponentIds, inAmounts) => {
    console.log('targetContract', targetContract);
    console.log('m4mTokenId', m4mTokenId);
    console.log('inComponentIds', inComponentIds);
    console.log('inAmounts', inAmounts);
    if (!provider) throw new Error("Missing Reown AppKit provider");
    const browserProvider = new ethers.BrowserProvider(provider);
    const signer = await browserProvider.getSigner();
    const baggage = new Contract(targetContract, M4mBaggageWithoutRole__factory.abi, signer) as unknown as M4mBaggageWithoutRole;
    console.log('handleLockComponents baggage', baggage);
    let info = await baggage.lockedEmptyNFTs(m4mTokenId);
    console.log('handleLockComponents info', info);
    console.log('handleLockComponents info gameId',Number(info.gameId));
    console.log('handleLockComponents tx step');
    let tx = await baggage.appendLock(m4mTokenId, inComponentIds, inAmounts);
    console.log('handleLockComponents tx', tx);
    return await tx.wait();
}

/**provider: any, targetContract: string, m4mTokenId: number, gameId: number, inComponentIds: number[], inAmounts: number[]**/
export const handleLockRoleNFT = async(provider, targetContract, m4mTokenId, gameId, inComponentIds, inAmounts) => {
    console.log('targetContract', targetContract);
    console.log('m4mTokenId', m4mTokenId);
    console.log('gameId', gameId);
    console.log('inComponentIds', inComponentIds);
    console.log('inAmounts', inAmounts);
    if (!provider) throw new Error("Missing Reown AppKit provider");
    const browserProvider = new ethers.BrowserProvider(provider);
    const signer = await browserProvider.getSigner();
    const baggage = new Contract(targetContract, M4mBaggageWithoutRole__factory.abi, signer) as unknown as M4mBaggageWithoutRole;
    console.log('handleLockRoleNFT baggage', baggage);
    let info = await baggage.lockedEmptyNFTs(m4mTokenId);
    console.log('handleLockRoleNFT info', info);
    console.log('handleLockRoleNFT info gameId',Number(info.gameId));
    if(!!Number(info.gameId)){
        return {success:true};
    }else{
        console.log('handleLockRoleNFT tx step');
        let tx = await baggage.lockComponents(m4mTokenId, gameId, inComponentIds, inAmounts);
        console.log('handleLockRoleNFT tx', tx);
        return await tx.wait();
    }
}
