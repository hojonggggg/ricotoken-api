import BigNumber from 'bignumber.js';

export const _ricoPrice = () => {
  const ricoPrice = 1;
  return ricoPrice;
}

export const _usdtPrice = () => {
  const usdtPrice = 0.01;
  return usdtPrice;
}

export const calcPrice = (fiat, amount) => {
  const ricoPrice = _ricoPrice();
  const usdtPrice = _usdtPrice();

  if (fiat === 'RICO') {
    return amount * ricoPrice;
  } else if (fiat === 'USDT') {
    return amount * usdtPrice;
  }
}

export const convertToDecimal18 = (amount) => {
  const _decimal = 18;
  const factor = new BigNumber(10).pow(_decimal);
  //const result = new BigNumber(amount).multipliedBy(factor);
  const result = new BigNumber(amount).times(factor);
  return result.toFixed();
}

export const stringToBignumber = (amount) => {
  return new BigNumber(amount);
}