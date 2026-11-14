import { copyFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dest = join(root, 'node_modules/react-native-razorpay/android/src');
if (!existsSync(dest)) process.exit(0);

const files = [
  ['patches/razorpay/main/RazorpayModuleImpl.java', 'main/java/com/razorpay/rn/RazorpayModuleImpl.java'],
  ['patches/razorpay/main/Utils.java', 'main/java/com/razorpay/rn/Utils.java'],
  ['patches/razorpay/newarch/RazorpayModule.java', 'newarch/java/com/razorpay/rn/RazorpayModule.java'],
  ['patches/razorpay/oldarch/RazorpayModule.java', 'oldarch/java/com/razorpay/rn/RazorpayModule.java'],
];

for (const [from, to] of files) {
  copyFileSync(join(root, from), join(dest, to));
}
