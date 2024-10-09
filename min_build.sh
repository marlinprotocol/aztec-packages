set -eu

docker build -t aztecprotocol/noir -f ./noir/Dockerfile.native ./noir
docker build -t aztecprotocol/avm-transpiler -f ./avm-transpiler/Dockerfile .

docker build -t aztecprotocol/barretenberg-wasm-linux-clang -f ./barretenberg/cpp/dockerfiles/Dockerfile.wasm-linux-clang ./barretenberg/cpp/
docker build -t aztecprotocol/bb.js -f ./barretenberg/ts/Dockerfile ./barretenberg/ts
docker build -t aztecprotocol/noir-packages -f noir/Dockerfile.packages ./noir

# little complex for l1-contracts
cd l1-contracts
forge install --no-commit
# Ensure libraries are at the correct version
git submodule update --init --recursive ./lib
cd ..

docker build -t aztecprotocol/l1-contracts -f l1-contracts/Dockerfile ./l1-contracts

cd l1-contracts
./bootstrap.sh clean
cd ..

# l1-contracts complete

docker build -t aztecprotocol/barretenberg-x86_64-linux-clang -f ./barretenberg/cpp/dockerfiles/Dockerfile.x86_64-linux-clang ./barretenberg/cpp
docker build -t aztecprotocol/noir-projects -f ./noir-projects/Dockerfile ./noir-projects
docker build -t aztecprotocol/yarn-project -f ./yarn-project/Dockerfile ./yarn-project
docker build -t aztecprotocol/aztec -f ./yarn-project/aztec/Dockerfile ./yarn-project/aztec