import { PinataSDK } from 'pinata-web3'
import fs from 'fs'
import path from 'path'
import { tmpdir } from 'os'

const pinata = new PinataSDK({
    pinataJwt: process.env.PINATA_JWT,
})

export async function uploadJSONToIPFS(jsonMetadata: object): Promise<string> {
    const { IpfsHash } = await pinata.upload.json(jsonMetadata)
    return IpfsHash
}

export async function uploadFileToIPFS(filePath: string, fileName: string, fileType: string): Promise<string> {
    try {
        const fileData = fs.readFileSync(filePath)
        
        const blob = new Blob([fileData])
        const file = new File([blob], fileName, { type: fileType })
        
        const { IpfsHash } = await pinata.upload.file(file)
        
        if (filePath.includes(path.join(tmpdir()))) {
            fs.unlinkSync(filePath)
        }
        
        return IpfsHash
    } catch (error) {
        console.error('Error uploading file to IPFS:', error)
        throw new Error(`Failed to upload file to IPFS: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
}