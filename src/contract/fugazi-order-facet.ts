import { FUGAZI_ORDER_FACET_ABI } from "../abi/fugazi-order-facet";
import { POOL_REGISTRY_FACET_ABI } from "../abi/pool-registry-facet";

import { VIEWER_ABI } from "../abi/viewer";
import {
  FhenixClient,
  EncryptionTypes,
  EncryptedUint32,
  getPermit,
} from "fhenixjs";
import { BrowserProvider, ethers } from "ethers";
import { useState } from "react";
import {
  CORE_ADDRESS,
  EUR_ADDRESS,
  FUGAZI_ADDRESS,
  USD_ADDRESS,
} from "../assets/address";
import { executeContractCall, getProviderAndSigner } from "./util";

export const useFugaziOrderFacetContract = () => {
  const [isPending, setIsPending] = useState(false);
  const provider = new BrowserProvider(window.ethereum);
  const client = new FhenixClient({ provider });

  const submitSwapOrder = async (
    typedAmount: number,
    inputToken: string,
    outputToken: string,
    noiseAmplitude?: number
  ) => {
    return executeContractCall(setIsPending, async () => {
      const { signer } = await getProviderAndSigner();
      let poolId;
      let inputTokenAddress;
      let outputTokenAddress;
      switch (inputToken) {
        case "FGZ":
          inputTokenAddress = FUGAZI_ADDRESS;
          break;
        case "USD":
          inputTokenAddress = USD_ADDRESS;
          break;
        case "EUR":
          inputTokenAddress = EUR_ADDRESS;
          break;
      }
      switch (outputToken) {
        case "FGZ":
          outputTokenAddress = FUGAZI_ADDRESS;
          break;
        case "USD":
          outputTokenAddress = USD_ADDRESS;
          break;
        case "EUR":
          outputTokenAddress = EUR_ADDRESS;
          break;
      }

      const viewerContract = new ethers.Contract(
        CORE_ADDRESS,
        VIEWER_ABI,
        signer
      );
      poolId = await viewerContract.getPoolId(
        inputTokenAddress,
        outputTokenAddress
      );

      await executeContractCall(setIsPending, async () => {
        const actionContract = new ethers.Contract(
          CORE_ADDRESS,
          FUGAZI_ORDER_FACET_ABI,
          signer
        );

        const amountIn = typedAmount;
        let inputAmount =
          inputTokenAddress < outputTokenAddress // is inputToken == tokenX?
            ? (2 << 30) * 0 + (amountIn << 15)
            : (2 << 30) * 0 + amountIn;

        const payPrivacyFeeInX =
          inputTokenAddress < outputTokenAddress ? true : false;

        inputAmount = payPrivacyFeeInX
          ? inputAmount + (noiseAmplitude << 32)
          : inputAmount + 2147483648 + (noiseAmplitude << 32);

        const encryptedAmountIn = await client.encrypt(
          inputAmount,
          EncryptionTypes.uint64
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

  const addLiquidity = async (
    typedAmount0: number,
    inputToken0: string,
    typedAmount1: number,
    inputToken1: string,
    noiseAmplitude?: number
  ) => {
    const { signer } = await getProviderAndSigner();
    let poolId;
    let inputTokenAddress;
    let outputTokenAddress;
    switch (inputToken0) {
      case "FGZ":
        inputTokenAddress = FUGAZI_ADDRESS;
        break;
      case "USD":
        inputTokenAddress = USD_ADDRESS;
        break;
      case "EUR":
        inputTokenAddress = EUR_ADDRESS;
        break;
    }
    switch (inputToken1) {
      case "FGZ":
        outputTokenAddress = FUGAZI_ADDRESS;
        break;
      case "USD":
        outputTokenAddress = USD_ADDRESS;
        break;
      case "EUR":
        outputTokenAddress = EUR_ADDRESS;
        break;
    }

    const viewerContract = new ethers.Contract(
      CORE_ADDRESS,
      VIEWER_ABI,
      signer
    );
    setIsPending(true);
    try {
      const permit = await getPermit(CORE_ADDRESS, provider);
      client.storePermit(permit);
      poolId = await viewerContract.getPoolId(
        inputTokenAddress,
        outputTokenAddress,
        permit
      );
      console.log("poolId", poolId);
    } catch (error) {
      console.error("Error", error);
      return "error";
    } finally {
      setIsPending(false);
    }

    const actionContract = new ethers.Contract(
      CORE_ADDRESS,
      FUGAZI_ORDER_FACET_ABI,
      signer
    );

    const amount0 = typedAmount0;
    const amount1 = typedAmount1;

    let inputAmount =
      inputTokenAddress < outputTokenAddress
        ? (amount0 << 15) + amount1 + 1073741824
        : (amount1 << 15) + amount0 + 1073741824;

    const payPrivacyFeeInX =
      inputTokenAddress < outputTokenAddress ? true : false;

    inputAmount = payPrivacyFeeInX
      ? inputAmount + (noiseAmplitude << 32)
      : inputAmount + 2147483648 + (noiseAmplitude << 32);

    const encryptedAmountIn = await client.encrypt(
      inputAmount,
      EncryptionTypes.uint64
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

    const viewerContract = new ethers.Contract(
      CORE_ADDRESS,
      VIEWER_ABI,
      signer
    );

    const actionContract = new ethers.Contract(
      CORE_ADDRESS,
      FUGAZI_ORDER_FACET_ABI,
      signer
    );
    setIsPending(true);
    try {
      const permit = await getPermit(CORE_ADDRESS, provider);
      client.storePermit(permit);

      const poolId = await viewerContract.getPoolId(
        tokenAddress1,
        tokenAddress2,
        permit
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

  return { isPending, submitSwapOrder, addLiquidity, removeLiquidity };
};
