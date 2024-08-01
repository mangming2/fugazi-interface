import { useEffect, useState } from "react";
import { Header } from "../../components/header";
import tw from "twin.macro";
import claim1 from "../../assets/claim-1.png";
import Loading from "../../components/loading";
import { useFugazi } from "../../contract/fugazi";
import { useViewer } from "../../contract/viewer";
import { usePoolActionFacet } from "../../contract/pool-action-facet";
import { FUGAZI_ADDRESS, USD_ADDRESS } from "../../assets/address";
import { useAccountContract } from "../../contract/account";
import usdLogo from "../../assets/usd.png";
import fgzLogo from "../../assets/logo.png";
import styled from "@emotion/styled";

const DashBoard = () => {
  const [balance, setBalance] = useState(0);
  const [depositBalance, setDepositBalance] = useState(0);
  const [withdrawAmount, setWithdrawAmount] = useState<string>("");
  const [depositAmount, setDepositAmount] = useState<string>("");
  const [canSettle, setCanSettle] = useState(true);
  const [tokenName, setTokenName] = useState<string>("FGZ");
  const [tokenAddress, setTokenAddress] = useState<string>(FUGAZI_ADDRESS);
  const [lpBalance, setLpBalance] = useState(0);

  const { isPending: isPendingFugazi, getBalanceOfEncryptedFugazi } =
    useFugazi();

  const {
    isPending: isPendingViewer,
    getViewerDepositBalance,
    getViewerLpBalance,
  } = useViewer();

  const { isPending: isPendingAction, claimOrder } = usePoolActionFacet();

  const {
    isPending: isPendingAccount,
    withdraw,
    deposit,
  } = useAccountContract();

  const { isPending: isPendingGetPoolId, settleSwapBatch } =
    usePoolActionFacet();

  const handleGetBalanceOfEncryptedToken = async () => {
    const result = await getBalanceOfEncryptedFugazi({
      tokenAddress: tokenAddress,
    });
    setBalance(Number(result));
  };

  const handleGetViewerDepositTokenBalance = async () => {
    const result = await getViewerDepositBalance(tokenAddress);
    setDepositBalance(Number(result));
  };

  const handleClaimOrder = async () => {
    const result = await claimOrder();
    console.log("Claim Order", result);
  };

  const handleWithdrawAmount = (e: React.ChangeEvent<HTMLInputElement>) => {
    setWithdrawAmount(e.target.value);
  };

  const handleSettle = async () => {
    const result = await settleSwapBatch();
    console.log("result", result);
  };

  const handleDepositAmount = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDepositAmount(e.target.value);
  };

  const handleWithdraw = async () => {
    const result = await withdraw(Number(withdrawAmount));
    console.log("Withdraw", result);
  };

  const handleDeposit = async () => {
    const result = await deposit(Number(depositAmount));
    console.log("Deposit", result);
  };

  const handleGetLpBalance = async () => {
    const result = await getViewerLpBalance();
    setLpBalance(Number(result));
  };

  useEffect(() => {
    handleGetBalanceOfEncryptedToken();
    handleGetViewerDepositTokenBalance();
    handleGetLpBalance();
  }, [tokenAddress]);

  const dummyLiquidity = [
    {
      token1: "FGZ",
      token2: "USD",
      token1Logo: fgzLogo,
      token2Logo: usdLogo,
      amount: 0,
    },
  ];

  const dummyOrders = [
    {
      Pair: "FGZ-USD",
      Epoch: 1,
      Time: "2021-01-01 12:00:00",
    },
    {
      Pair: "FGZ-USD",
      Epoch: 2,
      Time: "2021-01-01 12:00:00",
    },
  ];

  return (
    <Wrapper>
      {isPendingFugazi ||
        isPendingViewer ||
        isPendingAction ||
        isPendingGetPoolId ||
        (isPendingAccount && <Loading />)}

      <Header />
      <Container>
        {/* <BalanceWrapper>
          <TextWrapper>
            <BalanceDescription>
              <ContentTitle>Check My Balance at FuGazi</ContentTitle>
              <ContentSubTitle>
                FuGazi is a service that allows you to swap tokens on the Helium
                network.
              </ContentSubTitle>
            </BalanceDescription>

            <BalanceButtonWrapper>
              <StyledButton onClick={handleGetBalanceOfEncryptedFugazi}>
                Check My Balance at Account
              </StyledButton>

              <MyBalance>My Balance : {balance}</MyBalance>
            </BalanceButtonWrapper>

            <BalanceButtonWrapper>
              <StyledButton onClick={handleGetViewerDepositFugaziBalance}>
                Check My FGZ Balance at Deposit
              </StyledButton>

              <MyBalance>My Balance : {depositBalance}</MyBalance>
            </BalanceButtonWrapper>

            <BalanceButtonWrapper>
              <StyledButton onClick={handleGetViewerDepositUsdBalance}>
                Check My USD Balance at Deposit
              </StyledButton>
              <MyBalance>My Balance : {usdBalance}</MyBalance>
            </BalanceButtonWrapper>
          </TextWrapper>
          <ClaimImageWrapper>
            <ClaimImage src={claim1} alt="claim" />
            <ClaimButton onClick={handleClaimOrder}>Claim</ClaimButton>
          </ClaimImageWrapper>
        </BalanceWrapper> */}

        <ContentWrapper>
          <ContentTitle>Token Balance</ContentTitle>
          <TokenBalanceContainer>
            <TokenSelect
              value={tokenName}
              onChange={(e) => {
                setTokenAddress(
                  e.target.value === "FGZ" ? FUGAZI_ADDRESS : USD_ADDRESS
                );
                setTokenName(e.target.value);
              }}
            >
              <TokenSelectOption value="FGZ">FGZ</TokenSelectOption>
              <TokenSelectOption value="USD">USD</TokenSelectOption>
            </TokenSelect>
            <TokenBalanceText>My Balance : {balance}</TokenBalanceText>
            <TokenBalanceText>
              Deposit Balance : {depositBalance}
            </TokenBalanceText>

            <WithdrawInputWrapper>
              <StyledInput
                type="text"
                value={withdrawAmount}
                onChange={handleWithdrawAmount}
                placeholder={`Withdraw ${tokenName} Amount`}
              />
              <TokenBalanceButton
                disabled={withdrawAmount === ""}
                onClick={handleWithdraw}
              >
                Withdraw {tokenName} from Deposit
              </TokenBalanceButton>
            </WithdrawInputWrapper>
            <WithdrawInputWrapper>
              <StyledInput
                type="text"
                value={depositAmount}
                onChange={handleDepositAmount}
                placeholder={`Deposit ${tokenName} Amount`}
              />
              <TokenBalanceButton
                disabled={depositAmount === ""}
                onClick={handleDeposit}
              >
                Deposit {tokenName} to Deposit
              </TokenBalanceButton>
            </WithdrawInputWrapper>
          </TokenBalanceContainer>
        </ContentWrapper>

        <LiquidityWrapper>
          <ContentTitle>LP Balances</ContentTitle>

          {dummyLiquidity.map((liquidity, index) => (
            <Liquidity key={index}>
              <LiquidityPair>
                <TokenLogo src={liquidity.token1Logo} alt="token-logo" />
                <TokenLogo src={liquidity.token2Logo} alt="token-logo" />
              </LiquidityPair>
              <LiquidityTitle>
                {liquidity.token1} - {liquidity.token2}
              </LiquidityTitle>
              <LiquidityAmount>LP Token Balance : {lpBalance}</LiquidityAmount>

              <WithdrawButton>Remove Liquidity</WithdrawButton>
            </Liquidity>
          ))}
        </LiquidityWrapper>

        <ContentWrapper>
          <ContentTitle>UnClaimed Orders</ContentTitle>
          <ContentSubTitle>
            FuGazi is a service that allows you to swap tokens on the Helium
            network.
          </ContentSubTitle>
          {dummyOrders.map((order, index) => (
            <Order key={index}>
              <OrderText>Pair : {order.Pair}</OrderText>
              <OrderText>Epoch : {order.Epoch}</OrderText>
              <OrderText>Time : {order.Time}</OrderText>
              <OrderButton disabled={canSettle} onClick={handleSettle}>
                {canSettle ? "Settle" : "Can't settle yet"}
              </OrderButton>
              <OrderButton>Claim</OrderButton>
            </Order>
          ))}
        </ContentWrapper>
      </Container>
    </Wrapper>
  );
};

const Wrapper = tw.div`
  flex flex-col 
`;

const Container = tw.div`
  flex items-center justify-center flex-col
  p-48 gap-24
`;

const BalanceWrapper = tw.div`
  flex gap-8 p-16 w-800
  bg-green-1
`;

const TextWrapper = tw.div`
  flex flex-col gap-16 justify-center
`;

const BalanceDescription = tw.div`
  flex flex-col gap-16
`;

interface TokenBalanceButtonProps {
  disabled?: boolean;
}

const TokenBalanceButton = styled.button<TokenBalanceButtonProps>(
  ({ disabled }) => [
    tw`
  bg-green-2 hover:bg-green-3 text-white font-xl-m h-48 w-300
  px-16 py-2 rounded-md 
  border-solid border-2 border-green-3 cursor-pointer
`,
    disabled &&
      tw`bg-green-1 hover:bg-green-1 cursor-not-allowed text-gray-400`,
  ]
);

const MyBalance = tw.div`
  font-l-m
`;

const BalanceButtonWrapper = tw.div`
  flex items-center gap-8
`;

const TokenBalanceContainer = tw.div`
  flex flex-col items-center justify-between p-8 gap-8 bg-green-2
`;

const TokenSelect = tw.select`
  bg-green-2
  border-solid border-2 border-green-3
  focus:(border-solid border-2 border-green-3)
  focus-visible:outline-none
  font-xl-m text-green-7
  placeholder:(text-green-1)
`;

const TokenSelectOption = tw.option`
  w-100 bg-green-2
`;

const SelectedToken = tw.div`
  flex font-xxl-l text-green-1 p-2 text-white
`;

const TokenBalanceText = tw.div`
  font-l-m text-white
`;

const WithdrawInputWrapper = tw.div`
  flex items-center gap-8
`;

const WithdrawInputLabel = tw.div`
  font-l-m
`;
const StyledInput = tw.input`
  text-center w-250 h-40
  border-solid border-2 border-green-3
  bg-green-2
  focus:(border-solid border-2 border-green-3)
  focus-visible:outline-none
  font-xl-m text-green-7
`;

const ClaimImageWrapper = tw.div`
  flex flex-col items-center gap-8
`;

const ClaimButton = tw.button`
  bg-green-2 hover:bg-green-3 text-white font-semibold h-36 w-150
  px-16 py-2 rounded-md 
  border-none
`;

const LiquidityWrapper = tw.div`
  flex flex-col gap-8 p-16 w-800
  bg-green-1
`;

const Liquidity = tw.div`
  flex items-center justify-between p-8 gap-8 bg-green-2
`;

const LiquidityPair = tw.div`
  flex items-center gap-8
`;

const TokenLogo = tw.img`
  w-30 h-30
`;

const LiquidityTitle = tw.div`
  font-l-m
`;

const WithdrawButton = tw.button`
  bg-green-2 hover:bg-green-3 text-white font-semibold h-36 w-150
  px-16 py-2 rounded-md 
  border-solid border-green-3 border-2
`;

const LiquidityAmount = tw.div`
  font-l-m
`;

const ContentWrapper = tw.div`
  flex flex-col gap-16 p-16 w-800
  bg-green-1
`;

const ContentTitle = tw.div`
  font-xxl-b
`;

const ContentSubTitle = tw.div`
  font-l-m 
`;

const ClaimWrapper = tw.div`
  flex w-700 bg-green-1 items-center justify-center
  gap-16 p-48
`;

const ClaimImage = tw.img`
  w-300 h-300
`;

const Order = tw.div`
  flex items-center justify-between p-8 gap-8 bg-green-2
`;
interface orderButtonInterface {
  disabled?: boolean;
}

const OrderButton = styled.button<orderButtonInterface>(({ disabled }) => [
  tw`
  bg-green-2 hover:bg-green-3 text-white font-xl-m h-36 w-150
  px-16 py-2 rounded-md 
  border-solid border-2 border-green-3 cursor-pointer
`,
  disabled && tw`bg-green-1 hover:bg-green-1 cursor-not-allowed text-gray-400`,
]);

const OrderText = tw.div`
  font-l-m
`;

const OrderEpoch = tw.div`
  font-l-m
`;

export default DashBoard;
