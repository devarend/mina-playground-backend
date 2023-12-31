export const zkAppTemplate = {
  'babel*config*cjs': {
    file: {
      contents:
        "module.exports = {\n  presets: [['@babel/preset-env', { targets: { node: 'current' } }]],\n};\n",
    },
  },
  'config*json': {
    file: { contents: '{\n  "version": 1,\n  "deployAliases": {}\n}\n' },
  },
  'jest-resolver*cjs': {
    file: {
      contents:
        "module.exports = (request, options) => {\n  return options.defaultResolver(request, {\n    ...options,\n    packageFilter: (pkg) => {\n      // When importing snarkyjs, we specify the Node ESM import as Jest by default imports the web version\n      if (pkg.name === 'snarkyjs') {\n        return {\n          ...pkg,\n          main: pkg.exports.node.import,\n        };\n      }\n      if (pkg.name === 'node-fetch') {\n        return { ...pkg, main: pkg.main };\n      }\n      return {\n        ...pkg,\n        main: pkg.module || pkg.main,\n      };\n    },\n  });\n};\n",
    },
  },
  'jest*config*js': {
    file: {
      contents:
        "/** @type {import('@ts-jest/dist/types').InitialOptionsTsJest} */\nexport default {\n  verbose: true,\n  preset: 'ts-jest/presets/default-esm',\n  testEnvironment: 'node',\n  globals: {\n    'ts-jest': {\n      useESM: true,\n    },\n  },\n  testTimeout: 1_000_000,\n  transform: {\n    '^.+\\\\.(t)s$': 'ts-jest',\n    '^.+\\\\.(j)s$': 'babel-jest',\n  },\n  resolver: '<rootDir>/jest-resolver.cjs',\n  transformIgnorePatterns: [\n    '<rootDir>/node_modules/(?!(tslib|snarkyjs/node_modules/tslib))',\n  ],\n  modulePathIgnorePatterns: ['<rootDir>/build/'],\n  moduleNameMapper: {\n    '^(\\\\.{1,2}/.+)\\\\.js$': '$1',\n  },\n};\n",
    },
  },
  'package*json': {
    file: {
      contents:
        '{\n  "name": "package-name",\n  "version": "0.1.0",\n  "description": "",\n  "author": "",\n  "license": "Apache-2.0",\n  "keywords": [\n    "mina-zkapp",\n    "mina-zk-app",\n    "mina-dapp",\n    "zkapp"\n  ],\n  "type": "module",\n  "main": "build/src/index.js",\n  "types": "build/src/index.d.ts",\n  "scripts": {\n    "build": "tsc",\n    "buildw": "tsc --watch",\n    "coverage": "node --experimental-vm-modules --experimental-wasm-threads node_modules/jest/bin/jest.js --coverage",\n    "format": "prettier --write --ignore-unknown **/*",\n    "test": "node --experimental-vm-modules --experimental-wasm-threads node_modules/jest/bin/jest.js",\n    "testw": "node --experimental-vm-modules --experimental-wasm-threads node_modules/jest/bin/jest.js --watchAll",\n    "lint": "npx eslint src/* --fix"\n  },\n  "lint-staged": {\n    "**/*": [\n      "eslint src/* --fix",\n      "prettier --write --ignore-unknown"\n    ]\n  },\n  "devDependencies": {\n    "@babel/preset-env": "^7.16.4",\n    "@babel/preset-typescript": "^7.16.0",\n    "@types/jest": "^27.0.3",\n    "@typescript-eslint/eslint-plugin": "^5.5.0",\n    "@typescript-eslint/parser": "^5.5.0",\n    "eslint": "^8.7.0",\n    "eslint-plugin-snarkyjs": "^0.1.0",\n    "jest": "^27.3.1",\n    "lint-staged": "^11.0.1",\n    "prettier": "^2.3.2",\n    "ts-jest": "^27.0.7",\n    "typescript": "^4.7.2"\n  },\n  "dependencies": {\n    "snarkyjs": "0.10.*"\n  }\n}\n',
    },
  },
  src: {
    directory: {
      'Add*test*ts': {
        file: {
          contents:
            "import { Add } from './Add';\nimport { Field, Mina, PrivateKey, PublicKey, AccountUpdate } from 'snarkyjs';\n\n/*\n * This file specifies how to test the `Add` example smart contract. It is safe to delete this file and replace\n * with your own tests.\n *\n * See https://docs.minaprotocol.com/zkapps for more info.\n */\n\nlet proofsEnabled = false;\n\ndescribe('Add', () => {\n  let deployerAccount: PublicKey,\n    deployerKey: PrivateKey,\n    senderAccount: PublicKey,\n    senderKey: PrivateKey,\n    zkAppAddress: PublicKey,\n    zkAppPrivateKey: PrivateKey,\n    zkApp: Add;\n\n  beforeAll(async () => {\n    if (proofsEnabled) await Add.compile();\n  });\n\n  beforeEach(() => {\n    const Local = Mina.LocalBlockchain({ proofsEnabled });\n    Mina.setActiveInstance(Local);\n    ({ privateKey: deployerKey, publicKey: deployerAccount } =\n      Local.testAccounts[0]);\n    ({ privateKey: senderKey, publicKey: senderAccount } =\n      Local.testAccounts[1]);\n    zkAppPrivateKey = PrivateKey.random();\n    zkAppAddress = zkAppPrivateKey.toPublicKey();\n    zkApp = new Add(zkAppAddress);\n  });\n\n  async function localDeploy() {\n    const txn = await Mina.transaction(deployerAccount, () => {\n      AccountUpdate.fundNewAccount(deployerAccount);\n      zkApp.deploy();\n    });\n    await txn.prove();\n    // this tx needs .sign(), because `deploy()` adds an account update that requires signature authorization\n    await txn.sign([deployerKey, zkAppPrivateKey]).send();\n  }\n\n  it('generates and deploys the `Add` smart contract', async () => {\n    await localDeploy();\n    const num = zkApp.num.get();\n    expect(num).toEqual(Field(1));\n  });\n\n  it('correctly updates the num state on the `Add` smart contract', async () => {\n    await localDeploy();\n\n    // update transaction\n    const txn = await Mina.transaction(senderAccount, () => {\n      zkApp.update();\n    });\n    await txn.prove();\n    await txn.sign([senderKey]).send();\n\n    const updatedNum = zkApp.num.get();\n    expect(updatedNum).toEqual(Field(3));\n  });\n});\n",
        },
      },
      'Add*ts': {
        file: {
          contents:
            "import { Field, SmartContract, state, State, method } from \"snarkyjs\";\n\n/**\n * Basic Example\n * See https://docs.minaprotocol.com/zkapps for more info.\n *\n * The Add contract initializes the state variable 'num' to be a Field(1) value by default when deployed.\n * When the 'update' method is called, the Add contract adds Field(2) to its 'num' contract state.\n *\n * This file is safe to delete and replace with your own contract.\n */\nexport class Add extends SmartContract {\n  @state(Field) num = State<Field>();\n\n  init() {\n    super.init();\n    this.num.set(Field(1));\n  }\n\n  @method update() {\n    const currentState = this.num.getAndAssertEquals();\n  }\n}\n",
        },
      },
      'index*ts': {
        file: {
          contents: "import { Add } from './Add.js';\n\nexport { Add };\n",
        },
      },
      'interact*ts': {
        file: {
          contents:
            "/**\n * This script can be used to interact with the Add contract, after deploying it.\n *\n * We call the update() method on the contract, create a proof and send it to the chain.\n * The endpoint that we interact with is read from your config.json.\n *\n * This simulates a user interacting with the zkApp from a browser, except that here, sending the transaction happens\n * from the script and we're using your pre-funded zkApp account to pay the transaction fee. In a real web app, the user's wallet\n * would send the transaction and pay the fee.\n *\n * To run locally:\n * Build the project: `$ npm run build`\n * Run with node:     `$ node build/src/interact.js <network>`.\n */\nimport { Mina, PrivateKey } from 'snarkyjs';\nimport fs from 'fs/promises';\nimport { Add } from './Add.js';\n\n// check command line arg\nlet network = process.argv[2];\nif (!network)\n  throw Error(`Missing <network> argument.\n\nUsage:\nnode build/src/interact.js <network>\n\nExample:\nnode build/src/interact.js berkeley\n`);\nError.stackTraceLimit = 1000;\n\n// parse config and private key from file\ntype Config = {\n  deployAliases: Record<string, { url: string; keyPath: string }>;\n};\nlet configJson: Config = JSON.parse(await fs.readFile('config.json', 'utf8'));\nlet config = configJson.deployAliases[network];\nlet key: { privateKey: string } = JSON.parse(\n  await fs.readFile(config.keyPath, 'utf8')\n);\nlet zkAppKey = PrivateKey.fromBase58(key.privateKey);\n\n// set up Mina instance and contract we interact with\nconst Network = Mina.Network(config.url);\nMina.setActiveInstance(Network);\nlet zkAppAddress = zkAppKey.toPublicKey();\nlet zkApp = new Add(zkAppAddress);\n\n// compile the contract to create prover keys\nconsole.log('compile the contract...');\nawait Add.compile();\n\n// call update() and send transaction\nconsole.log('build transaction and create proof...');\nlet tx = await Mina.transaction({ sender: zkAppAddress, fee: 0.1e9 }, () => {\n  zkApp.update();\n});\nawait tx.prove();\nconsole.log('send transaction...');\nlet sentTx = await tx.sign([zkAppKey]).send();\n\nif (sentTx.hash() !== undefined) {\n  console.log(`\nSuccess! Update transaction sent.\n\nYour smart contract state will be updated\nas soon as the transaction is included in a block:\nhttps://berkeley.minaexplorer.com/transaction/${sentTx.hash()}\n`);\n}\n",
        },
      },
    },
  },
  'tsconfig*json': {
    file: {
      contents:
        '{\n  "compilerOptions": {\n    "target": "es2020",\n    "module": "es2022",\n    "lib": ["dom", "esnext"],\n    "outDir": "./build",\n    "rootDir": ".",\n    "strict": true,\n    "strictPropertyInitialization": false, // to enable generic constructors, e.g. on CircuitValue\n    "skipLibCheck": true,\n    "forceConsistentCasingInFileNames": true,\n    "esModuleInterop": true,\n    "moduleResolution": "node",\n    "experimentalDecorators": true,\n    "emitDecoratorMetadata": true,\n    "allowJs": true,\n    "declaration": true,\n    "sourceMap": true,\n    "noFallthroughCasesInSwitch": true,\n    "allowSyntheticDefaultImports": true\n  },\n  "include": ["./src"]\n}\n',
    },
  },
};
