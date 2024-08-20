import { useState } from "react";
import { ethers } from "ethers";
import { DISTRIBUTOR_ABI } from "../abi/distributor";
import { executeContractCall, getProviderAndSigner } from "./util";

export const useDistributor = () => {
  const distributorAddress = "0x27c3C020FD2A88b50Ae66292a4119943cBBE3c92";
  const [isPending, setIsPending] = useState(false);

  const claimTestToken = async (tokenAddress: string) => {
    return executeContractCall(setIsPending, async () => {
      const { signer } = await getProviderAndSigner();
      const contract = new ethers.Contract(
        distributorAddress,
        DISTRIBUTOR_ABI,
        signer
      );
      const result = await contract.claim(tokenAddress);
      console.log("result", `claim`, result);
      return result;
    });
  };

  return {
    claimTestToken,
    isPending,
  };
};
