import sss from "shamirs-secret-sharing";

const secret = Buffer.from(0);
const shares = sss.split(secret, { shares: 10, threshold: 4 });
const recovered = sss.combine(shares.slice(3, 7));

console.log(recovered.toString()); // 'secret key'
