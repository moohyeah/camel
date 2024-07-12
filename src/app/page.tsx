'use client'

import Head from 'next/head'
import Script from 'next/script'
import { useState, useEffect, useCallback } from 'react';

import { ConnectButton, useConnection, useActiveAddress} from "arweave-wallet-kit";

import {AoTokenBalanceDryRun, AoTokenMint, GameOver, GameStart} from "../utils/Token";

const processId = "2RLwmjFijKkoRko-9Mr6aJBQFRaV1OB3Q8IeOFNuqRI"

export default function Home() {
  const [startLogin, setStartLogin] = useState(false);
  const [loging, setLoging] = useState(false);
  const { connected, connect, disconnect } = useConnection();
  const address = useActiveAddress();
  const [loged, setLoged] = useState(false);
  const selfBtn = <ConnectButton
    profileModal={false}
    showBalance={true}
  />;

  const handleGameLogin = useCallback(()=>{
    setStartLogin(true)
  }, [setStartLogin, setLoging]);

  const handleGameBegin = useCallback(()=>{
    if (address) {
      GameStart(processId, address);
    }
  }, [address]);

  const handleAddScore = useCallback((evt : any)=>{
    const score = evt.score;
    if (score > 0) {
      AoTokenMint((globalThis as any).arweaveWallet, processId, score);
      syncBalance();
    }
  }, []);

  const handleGameOver = useCallback((evt : any)=>{
    const score = evt.score;
    if (score > 0 && address) {
      console.log("dddd" + score);
      GameOver(processId, address, score);
      syncBalance();
    }
  }, [address]);

function testOver() {
  if (address) {
    GameOver(processId, address, 100);
  }
}

  function handleLoginRet() {
    if (connected && !loging) {
      
      var nick = address?.substr(0, 3) + "..." + address?.substr(-5);
      console.log("sign In:" + nick);
      setLoging(true);
      (window as any).unityInstance.SendMessage("SigninManager", "OnPlatformLoginMsg", JSON.stringify({id:address, username:nick}))
      syncBalance();
      // setLoged(true);
      setTimeout(() => {
        setLoged(true);
      }, 3000)
    } 
  }

  async function syncBalance() {
    if (address) {
      const AoDryRunBalance = await AoTokenBalanceDryRun(processId, address);
      const intVal = parseInt(AoDryRunBalance);
      (window as any).unityInstance.SendMessage("SigninManager", "OnScoreChanged", intVal)
      console.log(typeof(AoDryRunBalance) + "," + AoDryRunBalance);
    }
  }

  function LoginForm({}){
    useEffect(()=> {
      if(connected && !loged && address!= null && !loging) {
        console.log("===loged:" + address);
        handleLoginRet();
      }   
    })
    
    if(loged) {
      return (
        <div>
        </div>
      );
    } else {
      return (
        <div className='modal'>
        </div>
      );
    }
  }
  
  const handleGameLogout = useCallback(()=>{
    disconnect();
    // signOut();
  }, []);

  useEffect(()=>{
    window.addEventListener("GameLogout", handleGameLogout);
    return ()=> {
      window.removeEventListener("GameLogout", handleGameLogout);
    };
  }, [handleGameLogout])

  useEffect(()=>{
    window.addEventListener("GameLogin", handleGameLogin);
    return ()=> {
      window.removeEventListener("GameLogin", handleGameLogin);
    };
  }, [handleGameLogin])

  useEffect(()=>{
    window.addEventListener("GameBegin", handleGameBegin);
    return ()=> {
      window.removeEventListener("GameBegin", handleGameBegin);
    };
  }, [handleGameLogin])

  useEffect(()=>{
    window.addEventListener("GameOver", handleGameOver);
    return ()=> {
      window.removeEventListener("GameOver", handleGameOver);
    };
  }, [handleGameLogin])

  return (
    <>
    <Head>
      <meta charSet="utf-8" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      <meta name="format-detection" content="telephone=no" />

      <meta name="renderer" content="webkit"/>
      <meta name="force-rendering" content="webkit"/>
      <meta httpEquiv="X-UA-Compatible" content="IE=edge,chrome=1"/>
      <meta name="msapplication-tap-highlight" content="no" />
      <meta name="full-screen" content="yes"/>
      <meta name="x5-fullscreen" content="true"/>
      <meta name="360-fullscreen" content="true"/>
      <link rel="shortcut icon" href="TemplateData/favicon.ico" />
    </Head>
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        height: '100%',
        width: '100%',
      }}
    >
      <canvas id="unity-canvas"></canvas>
      <div id="unity-loading-bar">
        <div id="unity-logo"></div>
        <div id="unity-progress-bar-empty">
          <div id="unity-progress-bar-full"></div>
        </div>
      </div>
      <div id="unity-warning"> </div>
      <div id="unity-footer" style= {{display : "none"}}>
        <div id="unity-webgl-logo"></div>
        <div id="unity-fullscreen-button"></div>
        <div id="unity-build-title">puzzlegame_telegram</div>
      </div>
    </div>
    { startLogin  && !loged && <LoginForm/>}
    <div className='fixed-center-container'>
      { startLogin && !loged && selfBtn}
    </div>

    <button onClick={handleGameBegin}>testBegin</button>
    <button onClick={testOver}>testOver</button>
    
    <Script strategy='lazyOnload' id="game-script">
      {`
      var container = document.querySelector("#unity-container");
      var canvas = document.querySelector("#unity-canvas");
      var loadingBar = document.querySelector("#unity-loading-bar");
      var progressBarFull = document.querySelector("#unity-progress-bar-full");
      var fullscreenButton = document.querySelector("#unity-fullscreen-button");
      var warningBanner = document.querySelector("#unity-warning");
      var defaultHeight = 1280;
      var defaultWidth = 720;
      var h = defaultHeight;
      var w = defaultWidth;

      function unityShowBanner(msg, type) {
        function updateBannerVisibility() {
          warningBanner.style.display = warningBanner.children.length ? 'block' : 'none';
        }
        var div = document.createElement('div');
        div.innerHTML = msg;
        warningBanner.appendChild(div);
        if (type == 'error') div.style = 'background: red; padding: 10px;';
        else {
          if (type == 'warning') div.style = 'background: yellow; padding: 10px;';
          setTimeout(function() {
            warningBanner.removeChild(div);
            updateBannerVisibility();
          }, 5000);
        }
        updateBannerVisibility();
      }

      // var buildUrl = "https://api.zkfairy.com/weblib";
      var buildUrl = "Build";
      var loaderUrl = buildUrl + "/wb.loader.js";
      var config = {
        dataUrl: buildUrl + "/6b1fe16f976a5c089c275f560f3fcfbb.data.unityweb",
        frameworkUrl: buildUrl + "/1fb7782eedaaf444975d4ea0667139d0.js.unityweb",
        codeUrl: buildUrl + "/889d95573f823ae487b3b16040d8e804.wasm.unityweb",
        streamingAssetsUrl: "StreamingAssets",
        companyName: "DefaultCompany",
        productName: "puzzlegame_telegram",
        productVersion: "1.0",
        showBanner: unityShowBanner,
        cacheControl: function(url) {
          // Caching enabled for .data and .bundle files. 
          // Revalidate if file is up to date before loading from cache
          if (url.match(/\.data/) || url.match(/\.unityweb/) || url.match(/\.bundle/)) {
            return "must-revalidate";
          }
  
          // Caching enabled for .mp4 and .custom files
          // Load file from cache without revalidation.
          if (url.match(/\.mp4/) || url.match(/\.custom/)) {
            return "immutable";
          }
  
          // Disable explicit caching for all other files.
          // Note: the default browser cache may cache them anyway.
          return "no-store";
        },
      };

      if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
        h = window.innerHeight;
        w = window.innerWidth;
        // Mobile device style: fill the whole browser client area with the game canvas:
    
        // To lower canvas resolution on mobile devices to gain some
        // performance, uncomment the following line:
        // config.devicePixelRatio = 1;
    
        // unityShowBanner('WebGL builds are not supported on mobile devices.');
      } else {
        // Desktop style: Render the game canvas in a window that can be maximized to fullscreen:
        var height = window.innerHeight;
        var width = window.innerWidth;
       
    
        if(width < height * defaultWidth / defaultHeight) {
          h = width * defaultHeight / defaultWidth;
          w = width;
        }
        else {
          h = height;
          w = height * defaultWidth / defaultHeight;
        }
      }
      var canvas = document.querySelector("#unity-canvas");
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";

      loadingBar.style.display = "block";

      var script = document.createElement("script");
      script.src = loaderUrl;
      script.onload = () => {
        createUnityInstance(canvas, config, (progress) => {
          progressBarFull.style.width = 100 * progress + "%";
        }).then((unityInstance) => {
          window.unityInstance = unityInstance
          loadingBar.style.display = "none";
          fullscreenButton.onclick = () => {
            unityInstance.SetFullscreen(1);
          };
        }).catch((message) => {
          alert(message);
        });
      };
      document.body.appendChild(script);
      `}
    </Script>
    </>
  );
}
