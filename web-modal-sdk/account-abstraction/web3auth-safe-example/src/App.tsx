import { useEffect, useState } from "react";
import { SafeAuthPack, SafeAuthConfig, SafeAuthInitOptions } from "@safe-global/auth-kit";
import Safe, { EthersAdapter, SafeFactory } from "@safe-global/protocol-kit";
import { ethers } from "ethers";

import "./App.css";
import RPC from "./web3RPC"; // for using web3.js
//import RPC from "./ethersRPC"; // for using ethers.js

function App() {
  const [safeAuth, setSafeAuth] = useState<SafeAuthPack>();
  const [safeAuthSignInResponse, setSafeAuthSignInResponse] = useState<any | null>(null);
  const [userInfo, setUserInfo] = useState<any>();
  const [provider, setProvider] = useState<any | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        const safeAuthConfig: SafeAuthConfig = {
          txServiceUrl: "https://safe-transaction-goerli.safe.global", //'https://safe-transaction-mainnet.safe.global',
        };

        const safeAuthInitOptions: SafeAuthInitOptions = {
          showWidgetButton: false,
          chainConfig: {
            blockExplorerUrl: "https://goerli.etherscan.io",
            chainId: "0x5",
            displayName: "Ethereum Goerli",
            logo: "eth.svg",
            rpcTarget: "https://rpc.ankr.com/eth_goerli",
            ticker: "ETH",
            tickerName: "Ethereum",
          },
        };

        const safeAuthPack = new SafeAuthPack(safeAuthConfig);
        await safeAuthPack.init(safeAuthInitOptions);

        setSafeAuth(safeAuthPack);
      } catch (error) {
        console.error(error);
      }
    };

    init();
  }, []);

  const login = async () => {
    if (!safeAuth) {
      uiConsole("safeAuth not initialized yet");
      return;
    }
    const signInInfo = await safeAuth.signIn();
    console.log("SIGN IN RESPONSE: ", signInInfo);

    const userInfo = await safeAuth.getUserInfo();
    console.log("USER INFO: ", userInfo);

    setSafeAuthSignInResponse(signInInfo);
    setUserInfo(userInfo || undefined);
    setProvider(safeAuth.getProvider());
  };

  const logout = async () => {
    if (!safeAuth) {
      uiConsole("safeAuth not initialized yet");
      return;
    }
    await safeAuth.signOut();
    setProvider(null);
    setSafeAuthSignInResponse(null);
  };

  const createSafe = async () => {
    // Currently, createSafe is not supported by SafeAuthKit.
    const provider = new ethers.providers.Web3Provider(safeAuth?.getProvider() as any);
    const signer = provider.getSigner();
    // const ethAdapter = new EthersAdapter({ ethers, signerOrProvider: signer || provider });
    // const safeFactory = await SafeFactory.create({ ethAdapter });
    // const safe: Safe = await safeFactory.deploySafe({ safeAccountConfig: { threshold: 1, owners: [safeAuthSignInResponse?.eoa as string] } });
    // console.log("SAFE Created!", await safe.getAddress());
    // uiConsole("SAFE Created!", await safe.getAddress());
  };

  const getChainId = async () => {
    if (!provider) {
      uiConsole("provider not initialized yet");
      return;
    }
    const rpc = new RPC(provider);
    const chainId = await rpc.getChainId();
    uiConsole(chainId);
  };

  const getAccounts = async () => {
    if (!provider) {
      uiConsole("provider not initialized yet");
      return;
    }
    const rpc = new RPC(provider);
    const address = await rpc.getAccounts();
    uiConsole(address);
  };

  const getBalance = async () => {
    if (!provider) {
      uiConsole("provider not initialized yet");
      return;
    }
    const rpc = new RPC(provider);
    const balance = await rpc.getBalance();
    uiConsole(balance);
  };

  const sendTransaction = async () => {
    if (!provider) {
      uiConsole("provider not initialized yet");
      return;
    }
    const rpc = new RPC(provider);
    const receipt = await rpc.sendTransaction();
    uiConsole(receipt);
  };

  const signMessage = async () => {
    if (!provider) {
      uiConsole("provider not initialized yet");
      return;
    }
    const rpc = new RPC(provider);
    const signedMessage = await rpc.signMessage();
    uiConsole(signedMessage);
  };

  function uiConsole(...args: any[]): void {
    const el = document.querySelector("#console>p");
    if (el) {
      el.innerHTML = JSON.stringify(args || {}, null, 2);
    }
  }

  const loggedInView = (
    <>
      <div className="flex-container">
        {!safeAuthSignInResponse?.safes?.length ? (
          <div>
            <button onClick={createSafe} className="card">
              Create Safe
            </button>
          </div>
        ) : (
          <>
            <div>
              <button onClick={getChainId} className="card">
                Get Chain ID
              </button>
            </div>
            <div>
              <button onClick={getAccounts} className="card">
                Get Accounts
              </button>
            </div>
            <div>
              <button onClick={getBalance} className="card">
                Get Balance
              </button>
            </div>
            <div>
              <button onClick={signMessage} className="card">
                Sign Message
              </button>
            </div>
            <div>
              <button onClick={sendTransaction} className="card">
                Send Transaction
              </button>
            </div>
            <div>
              <button onClick={logout} className="card">
                Log Out
              </button>
            </div>
          </>
        )}
      </div>
      <div id="console" style={{ whiteSpace: "pre-line" }}>
        <p style={{ whiteSpace: "pre-line" }}></p>
      </div>
    </>
  );

  const unloggedInView = (
    <button onClick={login} className="card">
      Login
    </button>
  );

  return (
    <div className="container">
      <h1 className="title">
        <a target="_blank" href="https://web3auth.io/docs/sdk/pnp/web/modal" rel="noreferrer">
          Web3Auth{" "}
        </a>
        &{" "}
        <a target="_blank" href="https://docs.safe.global/learn/safe-core/safe-core-account-abstraction-sdk/auth-kit" rel="noreferrer">
          Safe Auth Kit
        </a>{" "}
        Example
      </h1>

      <div className="grid">{provider ? loggedInView : unloggedInView}</div>

      <div className="grid">{provider ? userInfo?.name ? <p>Welcome {userInfo?.name}!</p> : null : null} </div>
      <div className="grid">{provider ? safeAuthSignInResponse?.eoa ? <p>Your EOA: {safeAuthSignInResponse?.eoa}</p> : null : null} </div>
      <div className="grid">
        {provider ? (
          safeAuthSignInResponse?.safes?.length ? (
            <>
              <p>Your Safe Accounts</p>
              {safeAuthSignInResponse?.safes?.map((safe: any, index: any) => (
                <p key={index}>
                  Safe[{index}]: {safe}
                </p>
              ))}
            </>
          ) : (
            <>
              <p>No Available Safes, Please create one by clicking the above button. </p>
              <p> Note: You should have some goerli ETH in your account.</p>
              <p>Please be patient, it takes time to create the SAFE!, depending upon network congestion.</p>
            </>
          )
        ) : null}
      </div>

      <footer className="footer">
        <a
          href="https://github.com/Web3Auth/web3auth-pnp-examples/tree/main/web-modal-sdk/account-abstraction/web3auth-safe-example"
          target="_blank"
          rel="noopener noreferrer"
        >
          Source code
        </a>
      </footer>
    </div>
  );
}

export default App;
