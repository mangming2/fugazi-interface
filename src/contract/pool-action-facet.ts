import { POOL_ACTION_FACET_ABI } from "../abi/pool-action-facet";
import { POOL_REGISTRY_FACET_ABI } from "../abi/pool-registry-facet";
import { VIEWER_ABI } from "../abi/viewer";
import { FhenixClient, EncryptionTypes, EncryptedUint32 } from "fhenixjs";
import { BrowserProvider, ethers } from "ethers";
import { useState } from "react";
import {
  DIAMOND_ADDRESS,
  FUGAZI_ADDRESS,
  USD_ADDRESS,
} from "../assets/address";
import { executeContractCall, getProviderAndSigner } from "./util";

export const usePoolActionFacet = () => {
  const [isPending, setIsPending] = useState(false);

  const provider = new BrowserProvider(window.ethereum);
  const client = new FhenixClient({ provider });

  const submitSwapOrder = async (typedAmount: number, inputToken: string) => {
    return executeContractCall(setIsPending, async () => {
      const { signer } = await getProviderAndSigner();
      let poolId;
      let inputTokenAddress;
      let outputTokenAddress;
      const registryContract = new ethers.Contract(
        DIAMOND_ADDRESS,
        POOL_REGISTRY_FACET_ABI,
        signer
      );
      poolId = await registryContract.getPoolId(FUGAZI_ADDRESS, USD_ADDRESS);

      await executeContractCall(setIsPending, async () => {
        const actionContract = new ethers.Contract(
          DIAMOND_ADDRESS,
          POOL_ACTION_FACET_ABI,
          signer
        );
        if (inputToken === "FGZ") {
          inputTokenAddress = FUGAZI_ADDRESS;
          outputTokenAddress = USD_ADDRESS;
        } else {
          inputTokenAddress = USD_ADDRESS;
          outputTokenAddress = FUGAZI_ADDRESS;
        }
        const amountIn = typedAmount;
        const inputAmount =
          inputTokenAddress < outputTokenAddress // is inputToken == tokenX?
            ? (2 << 30) * 0 + (amountIn << 15)
            : (2 << 30) * 0 + amountIn;

        const encryptedAmountIn = await client.encrypt(
          inputAmount,
          EncryptionTypes.uint32
        );

        const result = await actionContract.submitOrder(
          poolId,
          encryptedAmountIn
        );
        console.log("swap order result", result);
        return result;
      });
    });
  };

  const settleSwapBatch = async (poolId: string) => {
    return executeContractCall(setIsPending, async () => {
      const { signer } = await getProviderAndSigner();
      const actionContract = new ethers.Contract(
        DIAMOND_ADDRESS,
        POOL_ACTION_FACET_ABI,
        signer
      );
      const result = await actionContract.settleBatch(poolId);
      console.log("settle order result", result);
      return result;
    });
  };

  const claimOrder = async (poolId: string, epoch: string) => {
    const { signer } = await getProviderAndSigner();
    let unlaimedOrdersLength;
    let unclaimedOrder;
    const actionContract = new ethers.Contract(
      DIAMOND_ADDRESS,
      POOL_ACTION_FACET_ABI,
      signer
    );
    const viewerContract = new ethers.Contract(
      DIAMOND_ADDRESS,
      VIEWER_ABI,
      signer
    );

    setIsPending(true);
    try {
      unlaimedOrdersLength = Number(
        await viewerContract.getUnclaimedOrdersLength()
      );
      console.log("unlaimedOrdersLength", unlaimedOrdersLength);
      unclaimedOrder = await viewerContract.getUnclaimedOrder(
        unlaimedOrdersLength - 1
      );
      console.log("unclaimedOrder", unclaimedOrder);
    } catch (error) {
      console.error("Error in get unclaimed order", error);
      return "error";
    } finally {
      setIsPending(false);
    }

    setIsPending(true);
    try {
      const result = await actionContract.claim(
        //unclaimedOrder[0],
        //unclaimedOrder[1],
        poolId,
        epoch
      );
      console.log("claim order result", result);
      return result;
    } catch (error) {
      console.error(" Claim Error", error);
      return "error";
    } finally {
      setIsPending(false);
    }
  };

  const addLiquidity = async (
    typedAmount0: number,
    inputToken0: string,
    typedAmount1: number
  ) => {
    const { signer } = await getProviderAndSigner();
    let poolId;
    let inputTokenAddress;
    let outputTokenAddress;
    const registryContract = new ethers.Contract(
      DIAMOND_ADDRESS,
      POOL_REGISTRY_FACET_ABI,
      signer
    );
    setIsPending(true);
    try {
      poolId = await registryContract.getPoolId(FUGAZI_ADDRESS, USD_ADDRESS);
      console.log("poolId", poolId);
    } catch (error) {
      console.error("Error", error);
      return "error";
    } finally {
      setIsPending(false);
    }

    const actionContract = new ethers.Contract(
      DIAMOND_ADDRESS,
      POOL_ACTION_FACET_ABI,
      signer
    );
    if (inputToken0 === "FGZ") {
      inputTokenAddress = FUGAZI_ADDRESS;
      outputTokenAddress = USD_ADDRESS;
    } else {
      inputTokenAddress = USD_ADDRESS;
      outputTokenAddress = FUGAZI_ADDRESS;
    }
    const amount0 = typedAmount0;
    const amount1 = typedAmount1;

    const inputAmount =
      inputTokenAddress < outputTokenAddress
        ? (amount0 << 15) + amount1 + 1073741824
        : (amount1 << 15) + amount0 + 1073741824;
    const encryptedAmountIn = await client.encrypt(
      inputAmount,
      EncryptionTypes.uint32
    );

    setIsPending(true);
    try {
      const result = await actionContract.submitOrder(
        poolId,
        encryptedAmountIn
      );
      console.log("swap order result", result);
      return result;
    } catch (error) {
      console.error("Error", error);
      return "error";
    } finally {
      setIsPending(false);
    }
  };

  const removeLiquidity = async (
    tokenAddress1: string,
    tokenAddress2: string
  ) => {
    const { signer } = await getProviderAndSigner();

    const registryContract = new ethers.Contract(
      DIAMOND_ADDRESS,
      POOL_REGISTRY_FACET_ABI,
      signer
    );

    const actionContract = new ethers.Contract(
      DIAMOND_ADDRESS,
      POOL_ACTION_FACET_ABI,
      signer
    );
    setIsPending(true);
    try {
      const poolId = await registryContract.getPoolId(
        tokenAddress1,
        tokenAddress2
      );

      const encrypted: EncryptedUint32 = await client.encrypt(
        100,
        EncryptionTypes.uint32
      );

      const result = await actionContract.removeLiquidity(poolId, encrypted);
      console.log("remove liquidity result", result);
      return result;
    } catch (error) {
      console.error("Remove Liquidity Error", error);
      return "error";
    } finally {
      setIsPending(false);
    }
  };

  return {
    isPending,
    submitSwapOrder,
    settleSwapBatch,
    claimOrder,
    addLiquidity,
    removeLiquidity,
  };
};
