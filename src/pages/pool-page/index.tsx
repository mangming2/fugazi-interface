import { Header } from "../../components/header";
import tw from "twin.macro";
import { useState } from "react";
import { usePoolActionFacet } from "../../contract/pool-action-facet";
import Loading from "../../components/loading";
import styled from "@emotion/styled";
import { useFugaziOrderFacetContract } from "../../contract/fugazi-order-facet";

const PoolPage = () => {
  const [tokenXAmount, setTokenXAmount] = useState("");
  const [tokenXToken, setTokenXToken] = useState("FGZ");
  const [tokenYAmount, setTokenYAmount] = useState("");
  const [tokenYToken, setTokenYToken] = useState("USD");
  const [noiseLevel, setNoiseLevel] = useState<number>(0);

  const { isPending: isPendingGetPoolId } = usePoolActionFacet();

  const { isPending: isPendingAddLiquidity, addLiquidity } =
    useFugaziOrderFacetContract();

  const handleAddLiquidity = async () => {
    await addLiquidity(
      Number(tokenXAmount),
      tokenXToken,
      Number(tokenYAmount),
      tokenYToken,
      noiseLevel > 0 ? (noiseLevel / 200) * 2047 : 0
      //noiseLevel
    );
  };

  return (
    <Wrapper>
      {isPendingGetPoolId || (isPendingAddLiquidity && <Loading />)}
      <Header />
      <Container>
        <Title>Add Liquidity to Pool</Title>
        <Contents>
          <InputWrapper>
            <InputBox>
              <InputContainer>
                <InputTitle>Token X Amount</InputTitle>

                <InputDiv>
                  <StyledInput
                    type="text"
                    value={tokenXAmount}
                    onChange={(e) => setTokenXAmount(e.target.value)}
                    placeholder="Input amount"
                  />

                  <SelectedToken>{tokenXToken}</SelectedToken>
                  <TokenSelect
                    value={tokenXToken}
                    onChange={(e) => setTokenXToken(e.target.value)}
                  >
                    <TokenSelectOption value="FGZ">FGZ</TokenSelectOption>
                    <TokenSelectOption value="USD">USD</TokenSelectOption>
                    <TokenSelectOption value="EUR">EUR</TokenSelectOption>
                  </TokenSelect>
                </InputDiv>
              </InputContainer>
            </InputBox>

            <InputBox>
              <InputContainer>
                <InputTitle>Token Y Amount</InputTitle>

                <InputDiv>
                  <StyledInput
                    type="text"
                    value={tokenYAmount}
                    onChange={(e) => setTokenYAmount(e.target.value)}
                    placeholder="Input amount"
                  />

                  <SelectedToken>{tokenYToken}</SelectedToken>
                  <TokenSelect
                    value={tokenYToken}
                    onChange={(e) => setTokenYToken(e.target.value)}
                  >
                    <TokenSelectOption value="FGZ">FGZ</TokenSelectOption>
                    <TokenSelectOption value="USD">USD</TokenSelectOption>
                    <TokenSelectOption value="EUR">EUR</TokenSelectOption>
                  </TokenSelect>
                </InputDiv>
              </InputContainer>
            </InputBox>

            <NoiseContainer>
              <NoiseText>Noise</NoiseText>
              <Noise
                type="range"
                min="0"
                max="200"
                value={noiseLevel}
                onChange={(e) => setNoiseLevel(Number(e.target.value))}
              />
              <NoiseLevel>{noiseLevel}</NoiseLevel>
            </NoiseContainer>
          </InputWrapper>

          <StyledButton onClick={handleAddLiquidity}>
            Add Liquidity
          </StyledButton>
        </Contents>
      </Container>
    </Wrapper>
  );
};

const Wrapper = tw.div`
  flex flex-col h-screen
`;

const Container = tw.div`
  flex flex-col items-center p-48 gap-16
`;

const Title = tw.h1`
  text-2xl font-bold mb-4
`;

const Contents = tw.div`
  flex gap-64 items-center
`;

const InputWrapper = tw.div`
  flex flex-col gap-16 items-center
`;

const InputContainer = tw.div`
  flex flex-col gap-24 
`;

const InputDiv = tw.div`
  flex w-380 items-center justify-between
`;

const InputTitle = tw.div`
  font-xxl-b
`;

const InputBox = tw.div`
  flex items-center w-400 p-48
  border-solid border-5 border-green-3 rounded-lg p-2
  bg-green-1
`;

const StyledInput = tw.input`
  text-center w-250 h-60
  border-solid border-2 border-green-2
  bg-green-2
  focus:(border-solid border-2 border-green-3)
  focus-visible:outline-none
  font-xl-m text-green-7
  
`;

const TokenSelect = tw.select`
  bg-green-2
  border-solid border-2 border-green-2
  focus:(border-solid border-2 border-green-3)
  focus-visible:outline-none
  font-xl-m text-green-7
  placeholder:(text-green-1)
`;

const TokenSelectOption = tw.option`
  w-100 bg-green-2
`;

const SelectedToken = tw.div`
  flex font-xxl-l text-green-1 p-2
`;

const StyledButton = tw.button`
  bg-green-2 hover:bg-green-3 text-white font-xl-m h-48 w-200
  px-16 py-2 rounded-md 
  border-solid border-4 border-green-3 cursor-pointer
`;

const NoiseContainer = tw.div`
  flex items-center w-full gap-4 p-16 rounded-8
  bg-green-1 border-solid border-4 border-green-3
`;

const NoiseText = tw.div`
  flex font-xxl-l text-green-7 
`;

const Noise = styled.input`
  ${tw`h-10`}
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  background: ${tw`bg-green-2`};

  &::-webkit-slider-thumb {
    ${tw`bg-green-3`}
    width: 20px;
    height: 20px;
    border-radius: 50%;
    cursor: pointer;
    -webkit-appearance: none;
    appearance: none;
  }

  &::-moz-range-thumb {
    ${tw`bg-green-3`}
    width: 20px;
    height: 20px;
    border-radius: 50%;
    cursor: pointer;
  }
`;

const NoiseLevel = tw.div`
  flex font-xxl-l text-green-7 
`;

export default PoolPage;
function useFugaziOrderFacet(): { addLiquidity: any } {
  throw new Error("Function not implemented.");
}
