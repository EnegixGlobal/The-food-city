function generateOrderId() {
  const prefix = "FOODCITY";
  const randomNumber = Math.floor(10000000 + Math.random() * 90000000); // 8-digit random number
  return `${prefix}${randomNumber}`;
}
export default generateOrderId;
