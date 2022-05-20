scp  -i ~/Documents/infos/kstore/1.pm -r build ubuntu@18.182.7.84:~/tradingroom/leochan/loopring-web/packages/webapp

# Generate CA private key 
openssl genrsa -out ca.key 2048 
# Generate CSR 
openssl req -new -key ca.key -out ca.csr
# Generate Self Signed certificate（CA 根证书）
openssl x509 -req -days 3650 -in ca.csr -signkey ca.key -out ca.crt

-config

# private key
openssl genrsa -des3 -out server.key 1024 
# generate csr
openssl req -new -key server.key -out server.csr
# generate certificate
openssl ca -in server.csr -out server.crt -cert ca.crt -keyfile ca.key

openssl genrsa -des3 -out client.key 1024 
openssl req -new -key client.key -out client.csr
openssl ca -in client.csr -out client.crt -cert ca.crt -keyfile ca.key

export OPENSSL_CONF=/usr/lib/ssl/openssl.cnf