pragma solidity =0.6.6;

import "@openzeppelin/contracts/access/Ownable";

import './UniswapV2Library.sol';
import './interfaces/IUniswapV2Router02.sol';
import './interfaces/IUniswapV2Pair.sol';
import './interfaces/IERC20.sol';

contract FlashLoaner is Ownable {
  address public factory;
  uint constant deadline = 10 days;
  IUniswapV2Router02 public bakeryRouter;

  constructor(address _factory, address _bakeryRouter) public {
    factory = _factory;
    bakeryRouter = IUniswapV2Router02(_bakeryRouter);
  }

    function changeFactory(address _factory) onlyOwner view public {
        factory = _factory;
    }

    function changeRouter(address _bakeryRouter) onlyOwner view public {
        bakeryRouter = IUniswapV2Router02(_bakeryRouter);
    }

  function pancakeCall(address _sender, uint _amount0, uint _amount1, bytes calldata _data) external {
      address[] memory path = new address[](2);
      uint amountToken = _amount0 == 0 ? _amount1 : _amount0;

      address token0 = IUniswapV2Pair(msg.sender).token0();
      address token1 = IUniswapV2Pair(msg.sender).token1();
      bool aToB;
      uint256 amountIn;
      {
          (uint256 reserveA, uint256 reserveB) = UniswapV2Library.getReserves(factory, tokenA, tokenB);
          (aToB, amountIn) = UniswapV2LiquidityMathLibrary.computeProfitMaximizingTrade(
              truePriceTokenA, truePriceTokenB,
              reserveA, reserveB
          );
      }
      require(msg.sender == UniswapV2Library.pairFor(factory, token0, token1), "Unauthorized");
      require(_amount0 == 0 || _amount1 == 0);

      path[0] = aToB ? token1 : token0;
      path[1] = aToB ? token0 : token1;

      IERC20 token = IERC20(_amount0 == 0 ? token1 : token0);

      token.approve(address(bakeryRouter), amountToken);

      // no need for require() check, if amount required is not sent bakeryRouter will revert
      uint amountRequired = UniswapV2Library.getAmountsIn(factory, amountToken, path)[0];
      uint amountReceived = bakeryRouter.swapExactTokensForTokens(amountToken, amountRequired, path, msg.sender, deadline)[1];

      token.transfer(msg.sender, amountRequired); // return tokens to v2 pair
      token.transfer(_sender, amountReceived - amountRequired); // keep the rest
  }
}
