'use client'

import Head from 'next/head'
import Script from 'next/script'
import { useState, useEffect, useCallback } from 'react';

import { ConnectButton, useConnection, useActiveAddress, usePermissions, useWalletNames} from "arweave-wallet-kit";

import {AoTokenBalanceDryRun, GameOver, GameStart, FinishTask} from "../utils/Token";

const processId = "2RLwmjFijKkoRko-9Mr6aJBQFRaV1OB3Q8IeOFNuqRI"

export default function Home() {
  const [startLogin, setStartLogin] = useState(false);
  const [loging, setLoging] = useState(false);
  const [randoms, setRandoms] = useState<any[]>([]);
  const { connected, connect, disconnect } = useConnection();
  const address = useActiveAddress();
  const permissions = usePermissions();

  const [loged, setLoged] = useState(false);
  const selfBtn = <ConnectButton
    profileModal={false}
    showBalance={true}
  />;

  const handleGameLogin = useCallback(()=>{
    console.log("login???")
    setStartLogin(true)
  }, [setStartLogin, setLoging]);

  const handleGameBegin = useCallback(()=>{
    const ret = GameStart(processId, (globalThis as any).arweaveWallet);
    ret.then(ret => {
      const tags = ret?.msg[0].Tags;
      for (let index = 0; index < tags.length; index++) {
        const element = tags[index];
        if (element.name == "Randoms") {
          // let arr = JSON.parse(element.value);
          // console.log(`game start: ${element.value}`);
          (window as any).unityInstance.SendMessage("SigninManager", "OnGameStart", element.value)
          break;
        }
      }
    });
  }, [randoms]);

  const handleGameOver = useCallback((evt : any)=>{
    const score = evt.detail.score;
    if (score > 0) {
      GameOver(processId, (globalThis as any).arweaveWallet, score, evt.detail.checkSum);
      syncBalance();
    }
  }, [randoms]);

  function handleLoginRet() {
    if (connected && !loging) {
      var nick = `${address?.substr(0, 3)}...${address?.substr(-5)}`;
      console.log("sign In:" + nick);
      console.log(permissions);
      setLoging(true);
      (window as any).unityInstance.SendMessage("SigninManager", "OnPlatformLoginMsg", JSON.stringify({id:address, username:nick, channel:"ao"}))
      syncBalance();
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
  }, []);

  const handleAddScore = useCallback((evt : any)=>{
    const taskId = evt.detail.taskId;
    if (taskId > 0) {
      FinishTask(processId, (globalThis as any).arweaveWallet, taskId);
      syncBalance();
    }
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
  }, [handleGameOver])

  useEffect(()=>{
    window.addEventListener("FinishTask", handleAddScore);
    return ()=> {
      window.removeEventListener("FinishTask", handleAddScore);
    };
  }, [handleAddScore])

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
    <div id="game-container">
      <canvas id="unity-canvas"></canvas>
      <div id="loaderContainer">
        <img src="./TemplateData/03.gif" id="logo"/>
        <img src="./TemplateData/loading.gif" id="loading"/>
        <div id="unity-loading-bar">
          <div id="unity-webgl-logo"></div>
          <div id="unity-progress-bar-empty">
            <div id="unity-progress-bar-full" />
          </div>
        </div>
      </div>
    </div>
    { startLogin  && !loged && <LoginForm/>}
    <div className='fixed-center-container'>
      { startLogin && !loged && selfBtn}
    </div>
    <Script strategy='lazyOnload' id="game-script">
      {`
      var canvas = document.querySelector("#unity-canvas");
      var progressBarFull = document.querySelector("#unity-progress-bar-full");

      var defaultHeight = 1280;
      var defaultWidth = 720;
      var h = defaultHeight;
      var w = defaultWidth;

      // Shows a temporary message banner/ribbon for a few seconds, or
      // a permanent error message on top of the canvas if type=='error'.
      // If type=='warning', a yellow highlight color is used.
      // Modify or remove this function to customize the visually presented
      // way that non-critical warnings and error messages are presented to the
      // user.

      function closeLoading() {
        var loaderContainer = document.getElementById('loaderContainer');
        if (loaderContainer)
          loaderContainer.remove();
      }

      var buildUrl = "Build";
      var loaderUrl = buildUrl + "/8b13ac280e9fffae9d25d21ee297d34d.loader.js";
      var config = {
        dataUrl: buildUrl + "/aba9b4a8aed4b8f51c3079e8a9b3569d.data.unityweb",
        frameworkUrl: buildUrl + "/bcb2ba944e2cea6dd52104a6c44eae13.framework.js.unityweb",
        codeUrl: buildUrl + "/472390ed8ebd1ebd3a18bc1314dd6313.wasm.unityweb",
        cacheControl: function(url) {
          // Caching enabled for .data and .bundle files. 
          // Revalidate if file is up to date before loading from cache
          if (url.match(/\.data/) || url.match(/\.unityweb/) || url.match(/\.ab/) || url.match(/\.bundle/)) {
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
        streamingAssetsUrl: "StreamingAssets",
        companyName: "DefaultCompany",
        productName: "puzzlegame_telegram",
        productVersion: "1.0",
        // showBanner: unityShowBanner,
      };

      // By default Unity keeps WebGL canvas render target size matched with
      // the DOM size of the canvas element (scaled by window.devicePixelRatio)
      // Set this to false if you want to decouple this synchronization from
      // happening inside the engine, and you would instead like to size up
      // the canvas DOM size and WebGL render target sizes yourself.
      // config.matchWebGLToCanvasSize = false;

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
      
      var script = document.createElement("script");
      script.src = loaderUrl;
      script.onload = () => {
        createUnityInstance(canvas, config, (progress) => {
          progressBarFull.style.width = 100 * progress + "%";
        }).then((unityInstance) => {
          window.unityInstance = unityInstance;
          setTimeout(() => {
            closeLoading();
          }, 2000);
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
