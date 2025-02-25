# v8p.me

a basic file uploading service featuring client-side encryption and decryption under 1gb of memory usage

### usage

while i'm working on a docker implementation, here is a (probably not production-safe) example.

```bash
git clone https://github.com/vaporii/v8p.me
cd v8p.me
mv .env.example .env
npm i
npm run build
node -r dotenv/config build
```
